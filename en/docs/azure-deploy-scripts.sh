#!/bin/bash
# =============================================================================
# OpenClaw on Azure — Automated Deployment Script
# =============================================================================
# This script provisions all Azure resources needed to run OpenClaw in
# production on Azure Container Apps with Cosmos DB, Key Vault, and monitoring.
#
# Prerequisites:
#   - Azure CLI 2.60+ (logged in: `az login`)
#   - Bash 4+
#
# Usage:
#   chmod +x azure-deploy-scripts.sh
#   ./azure-deploy-scripts.sh
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration — edit these variables to match your environment
# ---------------------------------------------------------------------------
RESOURCE_GROUP="rg-openclaw-workshop"
LOCATION="eastus"
CONTAINER_APP_NAME="openclaw"
CONTAINER_APP_ENV="cae-openclaw"
COSMOS_ACCOUNT="cosmos-openclaw-$(openssl rand -hex 4)"
KEY_VAULT_NAME="kv-openclaw-$(openssl rand -hex 4)"
LOG_ANALYTICS="law-openclaw"
OPENCLAW_IMAGE="ghcr.io/anthropics/openclaw:latest"

# Azure OpenAI settings (update with your values)
AZURE_OPENAI_ENDPOINT="${AZURE_OPENAI_ENDPOINT:-https://your-resource.openai.azure.com/}"
AZURE_OPENAI_KEY="${AZURE_OPENAI_KEY:-your-api-key}"
AZURE_OPENAI_DEPLOYMENT="${AZURE_OPENAI_DEPLOYMENT:-gpt-4o}"

echo "========================================="
echo " OpenClaw on Azure — Deployment Starting"
echo "========================================="
echo "Resource Group : $RESOURCE_GROUP"
echo "Location       : $LOCATION"
echo "Cosmos Account : $COSMOS_ACCOUNT"
echo "Key Vault      : $KEY_VAULT_NAME"
echo ""

# ---------------------------------------------------------------------------
# Step 1: Create the Resource Group
# ---------------------------------------------------------------------------
echo "[1/8] Creating resource group..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output none

# ---------------------------------------------------------------------------
# Step 2: Create Log Analytics Workspace (for monitoring)
# ---------------------------------------------------------------------------
echo "[2/8] Creating Log Analytics workspace..."
az monitor log-analytics workspace create \
  --resource-group "$RESOURCE_GROUP" \
  --workspace-name "$LOG_ANALYTICS" \
  --location "$LOCATION" \
  --output none

LOG_ANALYTICS_ID=$(az monitor log-analytics workspace show \
  -g "$RESOURCE_GROUP" -n "$LOG_ANALYTICS" --query customerId -o tsv)
LOG_ANALYTICS_KEY=$(az monitor log-analytics workspace get-shared-keys \
  -g "$RESOURCE_GROUP" -n "$LOG_ANALYTICS" --query primarySharedKey -o tsv)

# ---------------------------------------------------------------------------
# Step 3: Create Key Vault and store secrets
# ---------------------------------------------------------------------------
echo "[3/8] Creating Key Vault and storing secrets..."
az keyvault create \
  --name "$KEY_VAULT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --output none

az keyvault secret set \
  --vault-name "$KEY_VAULT_NAME" \
  --name "azure-openai-key" \
  --value "$AZURE_OPENAI_KEY" \
  --output none

# ---------------------------------------------------------------------------
# Step 4: Create Cosmos DB (serverless — ideal for workshop/dev)
# ---------------------------------------------------------------------------
echo "[4/8] Creating Cosmos DB account (serverless)..."
az cosmosdb create \
  --name "$COSMOS_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --locations regionName="$LOCATION" failoverPriority=0 \
  --capabilities EnableServerless \
  --default-consistency-level Session \
  --output none

# Create database and container for agent state
az cosmosdb sql database create \
  --account-name "$COSMOS_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --name "openclaw" \
  --output none

az cosmosdb sql container create \
  --account-name "$COSMOS_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --database-name "openclaw" \
  --name "sessions" \
  --partition-key-path "/sessionId" \
  --output none

# Get connection string
COSMOS_CONN=$(az cosmosdb keys list \
  --name "$COSMOS_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --type connection-strings \
  --query "connectionStrings[0].connectionString" -o tsv)

# Store connection string in Key Vault
az keyvault secret set \
  --vault-name "$KEY_VAULT_NAME" \
  --name "cosmos-connection" \
  --value "$COSMOS_CONN" \
  --output none

# ---------------------------------------------------------------------------
# Step 5: Create Container Apps Environment
# ---------------------------------------------------------------------------
echo "[5/8] Creating Container Apps environment..."
az containerapp env create \
  --name "$CONTAINER_APP_ENV" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --logs-workspace-id "$LOG_ANALYTICS_ID" \
  --logs-workspace-key "$LOG_ANALYTICS_KEY" \
  --output none

# ---------------------------------------------------------------------------
# Step 6: Deploy OpenClaw Container App
# ---------------------------------------------------------------------------
echo "[6/8] Deploying OpenClaw container app..."
az containerapp create \
  --name "$CONTAINER_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$CONTAINER_APP_ENV" \
  --image "$OPENCLAW_IMAGE" \
  --target-port 8080 \
  --ingress external \
  --cpu 1.0 \
  --memory 2.0Gi \
  --min-replicas 0 \
  --max-replicas 10 \
  --scale-rule-name http-scaling \
  --scale-rule-type http \
  --scale-rule-http-concurrency 50 \
  --env-vars \
    "OPENAI_API_TYPE=azure" \
    "AZURE_OPENAI_ENDPOINT=$AZURE_OPENAI_ENDPOINT" \
    "AZURE_OPENAI_API_KEY=$AZURE_OPENAI_KEY" \
    "AZURE_OPENAI_DEPLOYMENT=$AZURE_OPENAI_DEPLOYMENT" \
    "COSMOS_CONNECTION=secretref:cosmos-conn" \
  --output none

# ---------------------------------------------------------------------------
# Step 7: Enable Managed Identity and grant permissions
# ---------------------------------------------------------------------------
echo "[7/8] Configuring Managed Identity..."
az containerapp identity assign \
  --name "$CONTAINER_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --system-assigned \
  --output none

PRINCIPAL_ID=$(az containerapp show \
  -n "$CONTAINER_APP_NAME" -g "$RESOURCE_GROUP" \
  --query identity.principalId -o tsv)

# Grant Key Vault read access
az keyvault set-policy \
  --name "$KEY_VAULT_NAME" \
  --object-id "$PRINCIPAL_ID" \
  --secret-permissions get list \
  --output none

# ---------------------------------------------------------------------------
# Step 8: Output deployment information
# ---------------------------------------------------------------------------
echo "[8/8] Retrieving deployment details..."

APP_FQDN=$(az containerapp show \
  -n "$CONTAINER_APP_NAME" -g "$RESOURCE_GROUP" \
  --query properties.configuration.ingress.fqdn -o tsv)

echo ""
echo "========================================="
echo " Deployment Complete!"
echo "========================================="
echo "OpenClaw URL    : https://$APP_FQDN"
echo "Resource Group  : $RESOURCE_GROUP"
echo "Cosmos DB       : $COSMOS_ACCOUNT"
echo "Key Vault       : $KEY_VAULT_NAME"
echo ""
echo "Test with:"
echo "  curl https://$APP_FQDN/health"
echo ""
echo "To clean up all resources:"
echo "  az group delete --name $RESOURCE_GROUP --yes --no-wait"
echo "========================================="
