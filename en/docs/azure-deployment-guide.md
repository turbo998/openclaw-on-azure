# Azure Deployment Best Practices for OpenClaw

## Architecture Overview

```
                    ┌─────────────┐
                    │  Azure Front │
    Users ─────────▶│    Door      │──── WAF policies
                    │  (CDN+LB)   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Container  │  ◄── Managed Identity
                    │    Apps     │  ◄── Auto-scale 0–10
                    │  (OpenClaw) │
                    └──┬───┬───┬──┘
                       │   │   │
              ┌────────┘   │   └────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  Azure   │ │ Cosmos   │ │   Key    │
        │  OpenAI  │ │   DB     │ │  Vault   │
        │ (GPT-4o) │ │ (State)  │ │(Secrets) │
        └──────────┘ └──────────┘ └──────────┘

              Azure Monitor (Log Analytics)
```

## 1. Container Apps Deployment

### Why Container Apps?

- **Serverless containers** — no Kubernetes cluster to manage
- **Scale to zero** — pay nothing when idle
- **Built-in ingress** — HTTPS, custom domains, traffic splitting
- **KEDA auto-scaling** — scale on HTTP requests, queue length, or custom metrics

### Bicep Template

```bicep
resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: 'openclaw'
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    environmentId: containerAppEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8080
        transport: 'http'
        traffic: [
          { latestRevision: true, weight: 100 }
        ]
      }
      secrets: [
        {
          name: 'aoai-key'
          keyVaultUrl: '${keyVault.properties.vaultUri}secrets/azure-openai-key'
          identity: 'system'
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'openclaw'
          image: 'ghcr.io/anthropics/openclaw:latest'
          resources: {
            cpu: json('1.0')
            memory: '2Gi'
          }
          env: [
            { name: 'OPENAI_API_TYPE', value: 'azure' }
            { name: 'AZURE_OPENAI_ENDPOINT', value: aoaiEndpoint }
            { name: 'AZURE_OPENAI_API_KEY', secretRef: 'aoai-key' }
            { name: 'AZURE_OPENAI_DEPLOYMENT', value: 'gpt-4o' }
            { name: 'COSMOS_CONNECTION', secretRef: 'cosmos-conn' }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 10
        rules: [
          {
            name: 'http-scaling'
            http: { metadata: { concurrentRequests: '50' } }
          }
        ]
      }
    }
  }
}
```

## 2. Security

### Managed Identity (Zero Secrets in Code)

```bash
# Get the Container App's identity principal ID
PRINCIPAL_ID=$(az containerapp show -n openclaw -g rg-openclaw \
  --query identity.principalId -o tsv)

# Grant Key Vault access
az keyvault set-policy --name kv-openclaw \
  --object-id $PRINCIPAL_ID \
  --secret-permissions get list

# Grant Cosmos DB access
az cosmosdb sql role assignment create \
  --account-name cosmos-openclaw \
  --resource-group rg-openclaw \
  --role-definition-name "Cosmos DB Built-in Data Contributor" \
  --principal-id $PRINCIPAL_ID \
  --scope "/"
```

### Private Endpoints

Keep backend services off the public internet:

```bash
# Create private endpoint for Cosmos DB
az network private-endpoint create \
  --name pe-cosmos \
  --resource-group rg-openclaw \
  --vnet-name vnet-openclaw \
  --subnet snet-private \
  --private-connection-resource-id $(az cosmosdb show -n cosmos-openclaw -g rg-openclaw --query id -o tsv) \
  --group-id Sql \
  --connection-name cosmos-connection
```

### Key Vault for Secrets

```bash
az keyvault create --name kv-openclaw --resource-group rg-openclaw --location eastus
az keyvault secret set --vault-name kv-openclaw --name azure-openai-key --value "<your-key>"
```

## 3. Cosmos DB — State & Memory

### Choosing the Right Tier

| Scenario | Tier | RU/s | Monthly Cost |
|----------|------|------|-------------|
| Workshop / Dev | Serverless | Pay-per-request | ~$1–5 |
| Small production | Autoscale | 400–4000 | ~$25–100 |
| High traffic | Autoscale | 4000–40000 | ~$100–1000 |

### RU Optimization Tips

1. **Use partition keys wisely** — partition by `agentId` or `sessionId`
2. **Index only what you query** — customize indexing policy to exclude unused paths
3. **Use point reads** — `ReadItem` by ID + partition key costs only 1 RU
4. **Enable TTL** — auto-delete old agent sessions to save storage

```bicep
resource cosmosDb 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = {
  name: 'cosmos-openclaw'
  location: location
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [{ locationName: location, failoverPriority: 0 }]
    capabilities: [{ name: 'EnableServerless' }]  // Use for dev/workshop
  }
}
```

## 4. Observability

### Azure Monitor Setup

```bash
# Create Log Analytics workspace
az monitor log-analytics workspace create \
  --resource-group rg-openclaw \
  --workspace-name law-openclaw

# Enable diagnostics on Container Apps
az monitor diagnostic-settings create \
  --name diag-openclaw \
  --resource $(az containerapp show -n openclaw -g rg-openclaw --query id -o tsv) \
  --workspace $(az monitor log-analytics workspace show -g rg-openclaw -n law-openclaw --query id -o tsv) \
  --logs '[{"category":"ContainerAppConsoleLogs","enabled":true},{"category":"ContainerAppSystemLogs","enabled":true}]'
```

### Useful KQL Queries

```kql
// Agent error rate over the last hour
ContainerAppConsoleLogs_CL
| where TimeGenerated > ago(1h)
| where Log_s contains "ERROR"
| summarize ErrorCount = count() by bin(TimeGenerated, 5m)
| render timechart

// Average response time per agent task
ContainerAppConsoleLogs_CL
| where Log_s contains "task_completed"
| extend Duration = extract("duration=([0-9.]+)", 1, Log_s)
| summarize avg(todouble(Duration)) by bin(TimeGenerated, 10m)
```

## 5. Front Door (Production)

```bash
az afd profile create --profile-name fd-openclaw \
  --resource-group rg-openclaw --sku Standard_AzureFrontDoor

az afd endpoint create --endpoint-name openclaw \
  --profile-name fd-openclaw --resource-group rg-openclaw

# Add origin (Container Apps FQDN)
az afd origin-group create --origin-group-name og-openclaw \
  --profile-name fd-openclaw --resource-group rg-openclaw \
  --probe-request-type GET --probe-protocol Https --probe-path /health

az afd origin create --origin-name origin-capp \
  --origin-group-name og-openclaw \
  --profile-name fd-openclaw --resource-group rg-openclaw \
  --host-name openclaw.happyfield-abc123.eastus.azurecontainerapps.io \
  --origin-host-header openclaw.happyfield-abc123.eastus.azurecontainerapps.io \
  --http-port 80 --https-port 443
```

## 6. Cost Summary

| Component | Dev/Workshop | Production |
|-----------|-------------|------------|
| Container Apps | $0 (scale to zero) | $30–150/mo |
| Azure OpenAI (GPT-4o) | $5–20/mo | $50–500/mo |
| Cosmos DB | $1–5/mo (serverless) | $25–200/mo |
| Key Vault | $0.03/10K ops | $0.03/10K ops |
| Front Door | — | $35+/mo |
| Azure Monitor | $2–5/mo | $10–50/mo |
| **Total** | **~$10–30/mo** | **~$150–900/mo** |

> 💡 Use `az cost management` or the Azure Pricing Calculator for precise estimates based on your usage patterns.
