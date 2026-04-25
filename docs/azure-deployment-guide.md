# OpenClaw on Azure 最佳部署方案

> 本指南详细介绍如何在 Azure 上部署生产级 OpenClaw Agent 服务。

---

## 目录

1. [架构概览](#1-架构概览)
2. [Azure 服务组件](#2-azure-服务组件)
3. [开发环境部署（Azure VM）](#3-开发环境部署azure-vm)
4. [生产环境部署（Container Apps）](#4-生产环境部署container-apps)
5. [Bicep 模板](#5-bicep-模板)
6. [成本估算](#6-成本估算)
7. [安全最佳实践](#7-安全最佳实践)
8. [扩展策略](#8-扩展策略)

---

## 1. 架构概览

### 开发环境
```
开发者 → SSH → Azure VM (B4ms)
                 ├── OpenClaw CLI
                 ├── GitHub Copilot Auth
                 └── 本地文件系统
```

### 生产环境
```
用户请求
   ↓
Azure Front Door (CDN + WAF)
   ↓
Azure Container Apps (OpenClaw 服务)
   ├── Revision 1 (active)
   ├── Revision 2 (canary)
   └── 自动缩放 (0-10 replicas)
   ↓
   ├── Azure OpenAI Service (LLM 推理)
   ├── Cosmos DB (会话存储 + 历史记录)
   ├── Key Vault (密钥和证书管理)
   └── Azure Monitor (日志 + 指标 + 告警)
```

---

## 2. Azure 服务组件

| 服务 | 用途 | SKU/配置 | 月成本估算 (CNY) |
|------|------|----------|------------------|
| Azure VM | 开发环境 | Standard_B4ms (4C/16G) | ¥550 |
| Container Apps | 生产运行时 | Consumption plan | ¥200-2000 |
| Azure OpenAI | LLM 推理 | GPT-4o / Claude | ¥500-5000 |
| Cosmos DB | 会话存储 | Serverless | ¥50-500 |
| Key Vault | 密钥管理 | Standard | ¥5 |
| Front Door | CDN/WAF | Standard | ¥200 |
| Azure Monitor | 可观测性 | Log Analytics | ¥100 |
| Container Registry | 镜像存储 | Basic | ¥35 |

---

## 3. 开发环境部署（Azure VM）

```bash
# 设置变量
RESOURCE_GROUP="rg-openclaw-dev"
LOCATION="eastasia"
VM_NAME="vm-openclaw-dev"

# 创建资源组
az group create -n $RESOURCE_GROUP -l $LOCATION

# 创建 VM
az vm create \
  -g $RESOURCE_GROUP \
  -n $VM_NAME \
  --image Ubuntu2404 \
  --size Standard_B4ms \
  --admin-username azureuser \
  --generate-ssh-keys \
  --os-disk-size-gb 128 \
  --storage-sku Premium_LRS

# 安装扩展（自动配置环境）
az vm run-command invoke \
  -g $RESOURCE_GROUP -n $VM_NAME \
  --command-id RunShellScript \
  --scripts '
    apt update && apt install -y nodejs npm git python3 python3-pip
    npm install -g @anthropic/openclaw
  '
```

---

## 4. 生产环境部署（Container Apps）

### 4.1 准备容器镜像

```dockerfile
# Dockerfile
FROM node:20-slim
WORKDIR /app
RUN npm install -g @anthropic/openclaw
COPY config/ /root/.openclaw/
COPY server.js .
EXPOSE 8080
CMD ["node", "server.js"]
```

### 4.2 部署 Container Apps 环境

```bash
# 变量
RG="rg-openclaw-prod"
LOCATION="eastasia"
ENV_NAME="openclaw-env"
APP_NAME="openclaw-api"
ACR_NAME="acropenclaw$(date +%s)"

# 创建资源组
az group create -n $RG -l $LOCATION

# 创建 Container Registry
az acr create -g $RG -n $ACR_NAME --sku Basic --admin-enabled true

# 构建并推送镜像
az acr build -r $ACR_NAME -t openclaw-api:latest .

# 创建 Container Apps 环境
az containerapp env create \
  -g $RG -n $ENV_NAME -l $LOCATION

# 部署应用
ACR_PASSWORD=$(az acr credential show -n $ACR_NAME --query "passwords[0].value" -o tsv)

az containerapp create \
  -g $RG -n $APP_NAME \
  --environment $ENV_NAME \
  --image "${ACR_NAME}.azurecr.io/openclaw-api:latest" \
  --registry-server "${ACR_NAME}.azurecr.io" \
  --registry-username $ACR_NAME \
  --registry-password $ACR_PASSWORD \
  --target-port 8080 \
  --ingress external \
  --cpu 2 --memory 4Gi \
  --min-replicas 0 \
  --max-replicas 10 \
  --scale-rule-name http-scaling \
  --scale-rule-type http \
  --scale-rule-http-concurrency 10
```

### 4.3 配置 Cosmos DB

```bash
COSMOS_ACCOUNT="cosmos-openclaw"

# 创建 Cosmos DB（Serverless）
az cosmosdb create \
  -g $RG -n $COSMOS_ACCOUNT \
  --kind GlobalDocumentDB \
  --capabilities EnableServerless \
  --default-consistency-level Session

# 创建数据库和容器
az cosmosdb sql database create \
  -g $RG -a $COSMOS_ACCOUNT -n openclaw

az cosmosdb sql container create \
  -g $RG -a $COSMOS_ACCOUNT -d openclaw \
  -n sessions -p /userId \
  --max-throughput 1000
```

### 4.4 配置 Key Vault

```bash
KV_NAME="kv-openclaw"

az keyvault create -g $RG -n $KV_NAME -l $LOCATION

# 存储密钥
az keyvault secret set --vault-name $KV_NAME -n github-token --value "ghp_xxx"
az keyvault secret set --vault-name $KV_NAME -n cosmos-connection --value "$(az cosmosdb keys list -g $RG -n $COSMOS_ACCOUNT --type connection-strings --query 'connectionStrings[0].connectionString' -o tsv)"
az keyvault secret set --vault-name $KV_NAME -n azure-openai-key --value "your-key"
```

### 4.5 配置 Front Door

```bash
az afd profile create \
  -g $RG --profile-name fd-openclaw --sku Standard_AzureFrontDoor

az afd endpoint create \
  -g $RG --profile-name fd-openclaw --endpoint-name openclaw-api

# 配置 WAF 策略
az network front-door waf-policy create \
  -g $RG -n wafopenclaw --mode Prevention \
  --sku Standard_AzureFrontDoor
```

### 4.6 配置 Azure Monitor

```bash
# 创建 Log Analytics 工作区
az monitor log-analytics workspace create \
  -g $RG -n law-openclaw -l $LOCATION

# 启用容器应用诊断
az monitor diagnostic-settings create \
  --name openclaw-diag \
  --resource $(az containerapp show -g $RG -n $APP_NAME --query id -o tsv) \
  --workspace $(az monitor log-analytics workspace show -g $RG -n law-openclaw --query id -o tsv) \
  --logs '[{"category":"ContainerAppConsoleLogs","enabled":true}]' \
  --metrics '[{"category":"AllMetrics","enabled":true}]'
```

---

## 5. Bicep 模板

```bicep
// main.bicep - OpenClaw 基础设施
targetScope = 'resourceGroup'

param location string = resourceGroup().location
param envName string = 'openclaw'

// Container Apps 环境
resource containerAppEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: '${envName}-env'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// Container App
resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: '${envName}-api'
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8080
      }
      secrets: [
        {
          name: 'cosmos-connection'
          keyVaultUrl: '${keyVault.properties.vaultUri}secrets/cosmos-connection'
          identity: 'system'
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'openclaw-api'
          image: 'acropenclaw.azurecr.io/openclaw-api:latest'
          resources: {
            cpu: json('2')
            memory: '4Gi'
          }
          env: [
            {
              name: 'COSMOS_CONNECTION'
              secretRef: 'cosmos-connection'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 10
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
    }
  }
}

// Cosmos DB
resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: '${envName}-cosmos'
  location: location
  properties: {
    databaseAccountOfferType: 'Standard'
    capabilities: [
      { name: 'EnableServerless' }
    ]
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
      }
    ]
  }
}

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: '${envName}-kv'
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
  }
}

// Log Analytics
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${envName}-law'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

output containerAppUrl string = containerApp.properties.configuration.ingress.fqdn
output cosmosEndpoint string = cosmosAccount.properties.documentEndpoint
```

部署 Bicep：
```bash
az deployment group create \
  -g rg-openclaw-prod \
  --template-file main.bicep \
  --parameters envName=openclaw
```

---

## 6. 成本估算

### 小团队方案（5人以下）

| 资源 | 配置 | 月成本 (CNY) |
|------|------|-------------|
| VM (开发) | B4ms × 1 | ¥550 |
| Container Apps | 2 vCPU, 4Gi, 按需 | ¥300 |
| Cosmos DB | Serverless, ~10K RU | ¥80 |
| Key Vault | Standard | ¥5 |
| ACR | Basic | ¥35 |
| Monitor | 5GB/月 | ¥50 |
| **合计** | | **¥1,020** |

### 中型团队方案（5-20人）

| 资源 | 配置 | 月成本 (CNY) |
|------|------|-------------|
| VM (开发) | B4ms × 3 | ¥1,650 |
| Container Apps | 4 vCPU, 8Gi, 多副本 | ¥800 |
| Cosmos DB | Serverless, ~100K RU | ¥300 |
| Front Door | Standard | ¥200 |
| Key Vault | Standard | ¥5 |
| ACR | Standard | ¥140 |
| Monitor | 20GB/月 | ¥200 |
| **合计** | | **¥3,295** |

### 成本优化建议

1. **Spot VM**: 开发测试使用 Spot 实例，节省60-70%
2. **自动关机**: 开发 VM 设置自动关机（晚8点-早8点），节省50%
3. **Container Apps 缩放到0**: 无流量时零计算成本
4. **Cosmos DB Serverless**: 低频使用比预配吞吐量便宜90%+
5. **预留实例**: 稳定工作负载购买1年/3年预留，节省30-60%

---

## 7. 安全最佳实践

### 7.1 Managed Identity

```bash
# Container App 启用系统托管标识
az containerapp identity assign -g $RG -n $APP_NAME --system-assigned

# 授权访问 Key Vault
IDENTITY_PRINCIPAL=$(az containerapp show -g $RG -n $APP_NAME --query identity.principalId -o tsv)

az role assignment create \
  --role "Key Vault Secrets User" \
  --assignee $IDENTITY_PRINCIPAL \
  --scope $(az keyvault show -g $RG -n $KV_NAME --query id -o tsv)

# 授权访问 Cosmos DB
az role assignment create \
  --role "Cosmos DB Built-in Data Contributor" \
  --assignee $IDENTITY_PRINCIPAL \
  --scope $(az cosmosdb show -g $RG -n $COSMOS_ACCOUNT --query id -o tsv)
```

### 7.2 Private Endpoints

```bash
# 为 Cosmos DB 创建 Private Endpoint
az network private-endpoint create \
  -g $RG -n pe-cosmos \
  --vnet-name vnet-openclaw --subnet snet-private \
  --private-connection-resource-id $(az cosmosdb show -g $RG -n $COSMOS_ACCOUNT --query id -o tsv) \
  --group-id Sql \
  --connection-name cosmos-connection

# 为 Key Vault 创建 Private Endpoint
az network private-endpoint create \
  -g $RG -n pe-keyvault \
  --vnet-name vnet-openclaw --subnet snet-private \
  --private-connection-resource-id $(az keyvault show -g $RG -n $KV_NAME --query id -o tsv) \
  --group-id vault \
  --connection-name keyvault-connection
```

### 7.3 网络隔离

```bash
# 创建 VNet
az network vnet create \
  -g $RG -n vnet-openclaw \
  --address-prefix 10.0.0.0/16

# 创建子网
az network vnet subnet create \
  -g $RG --vnet-name vnet-openclaw \
  -n snet-apps --address-prefix 10.0.1.0/24

az network vnet subnet create \
  -g $RG --vnet-name vnet-openclaw \
  -n snet-private --address-prefix 10.0.2.0/24 \
  --disable-private-endpoint-network-policies true
```

### 7.4 安全检查清单

- [x] 所有密钥存储在 Key Vault，不硬编码
- [x] 使用 Managed Identity 替代密钥认证
- [x] 后端服务通过 Private Endpoint 访问
- [x] Front Door 启用 WAF 防护
- [x] Container Apps 禁止直接公网访问（仅通过 Front Door）
- [x] 启用 Azure Defender for Cloud
- [x] 日志审计发送到 Log Analytics
- [x] 定期轮换密钥（Key Vault 自动轮换）

---

## 8. 扩展策略

### 水平扩展

Container Apps 基于 HTTP 并发自动扩展：

```bash
az containerapp update -g $RG -n $APP_NAME \
  --min-replicas 1 \
  --max-replicas 20 \
  --scale-rule-name http-rule \
  --scale-rule-type http \
  --scale-rule-http-concurrency 5
```

### 基于自定义指标扩展

```bash
# 基于 Cosmos DB RU 使用率扩展
az containerapp update -g $RG -n $APP_NAME \
  --scale-rule-name cosmos-rule \
  --scale-rule-type azure-queue \
  --scale-rule-metadata "queueName=openclaw-tasks" "queueLength=5" \
  --scale-rule-auth "connection=cosmos-connection"
```

### 多区域部署

对于全球用户，可通过 Front Door 实现多区域流量分发：

```
Front Door
├── East Asia (主) → Container Apps (eastasia)
├── Southeast Asia (备) → Container Apps (southeastasia)
└── 自动故障转移
```

### 性能优化建议

1. **连接池**: Cosmos DB 使用持久连接，避免每次请求新建连接
2. **缓存**: 使用 Azure Cache for Redis 缓存常用会话数据
3. **异步处理**: 长时间任务使用 Azure Queue + Container Apps Jobs
4. **CDN 加速**: 静态资源通过 Front Door CDN 分发
