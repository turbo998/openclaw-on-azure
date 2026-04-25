#!/bin/bash
#===============================================================================
# OpenClaw on Azure - 一键部署脚本
# 用途：自动创建所有 Azure 资源用于 OpenClaw 生产环境部署
# 用法：chmod +x azure-deploy-scripts.sh && ./azure-deploy-scripts.sh
#===============================================================================

set -euo pipefail

#-------------------------------------------------------------------------------
# 配置变量（按需修改）
#-------------------------------------------------------------------------------
PREFIX="openclaw"
LOCATION="eastasia"
RG="${PREFIX}-rg"
VM_NAME="${PREFIX}-dev-vm"
VM_SIZE="Standard_B4ms"
VM_ADMIN="azureuser"
ACR_NAME="${PREFIX}acr$(date +%s | tail -c 6)"
ENV_NAME="${PREFIX}-env"
APP_NAME="${PREFIX}-api"
COSMOS_ACCOUNT="${PREFIX}-cosmos"
KV_NAME="${PREFIX}-kv-$(date +%s | tail -c 5)"
LAW_NAME="${PREFIX}-law"
VNET_NAME="${PREFIX}-vnet"
FD_PROFILE="${PREFIX}-fd"

echo "============================================"
echo "  OpenClaw on Azure 部署脚本"
echo "  资源组: $RG"
echo "  区域: $LOCATION"
echo "============================================"

#-------------------------------------------------------------------------------
# 1. 资源组
#-------------------------------------------------------------------------------
echo ""
echo ">>> [1/10] 创建资源组..."
az group create -n $RG -l $LOCATION -o none

#-------------------------------------------------------------------------------
# 2. 虚拟网络
#-------------------------------------------------------------------------------
echo ">>> [2/10] 创建虚拟网络..."
az network vnet create \
  -g $RG -n $VNET_NAME \
  --address-prefix 10.0.0.0/16 -o none

az network vnet subnet create \
  -g $RG --vnet-name $VNET_NAME \
  -n snet-vm --address-prefix 10.0.0.0/24 -o none

az network vnet subnet create \
  -g $RG --vnet-name $VNET_NAME \
  -n snet-apps --address-prefix 10.0.1.0/24 -o none

az network vnet subnet create \
  -g $RG --vnet-name $VNET_NAME \
  -n snet-private --address-prefix 10.0.2.0/24 \
  --disable-private-endpoint-network-policies true -o none

#-------------------------------------------------------------------------------
# 3. 开发 VM
#-------------------------------------------------------------------------------
echo ">>> [3/10] 创建开发 VM ($VM_SIZE)..."
az vm create \
  -g $RG -n $VM_NAME \
  --image Ubuntu2404 \
  --size $VM_SIZE \
  --admin-username $VM_ADMIN \
  --generate-ssh-keys \
  --vnet-name $VNET_NAME --subnet snet-vm \
  --public-ip-sku Standard \
  --os-disk-size-gb 128 \
  --storage-sku Premium_LRS \
  -o none

VM_IP=$(az vm show -d -g $RG -n $VM_NAME --query publicIps -o tsv)
echo "    VM IP: $VM_IP"

# 安装 OpenClaw 环境
echo "    配置 VM 环境..."
az vm run-command invoke \
  -g $RG -n $VM_NAME \
  --command-id RunShellScript \
  --scripts '
    apt update && apt install -y curl git build-essential python3 python3-pip
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    npm install -g @anthropic/openclaw
  ' -o none

#-------------------------------------------------------------------------------
# 4. Container Registry
#-------------------------------------------------------------------------------
echo ">>> [4/10] 创建 Container Registry..."
az acr create -g $RG -n $ACR_NAME --sku Basic --admin-enabled true -o none

#-------------------------------------------------------------------------------
# 5. Log Analytics + Container Apps 环境
#-------------------------------------------------------------------------------
echo ">>> [5/10] 创建 Log Analytics 工作区..."
az monitor log-analytics workspace create \
  -g $RG -n $LAW_NAME -l $LOCATION -o none

LAW_ID=$(az monitor log-analytics workspace show -g $RG -n $LAW_NAME --query customerId -o tsv)
LAW_KEY=$(az monitor log-analytics workspace get-shared-keys -g $RG -n $LAW_NAME --query primarySharedKey -o tsv)

echo ">>> [6/10] 创建 Container Apps 环境..."
az containerapp env create \
  -g $RG -n $ENV_NAME -l $LOCATION \
  --logs-workspace-id $LAW_ID \
  --logs-workspace-key $LAW_KEY \
  -o none

#-------------------------------------------------------------------------------
# 6. Cosmos DB
#-------------------------------------------------------------------------------
echo ">>> [7/10] 创建 Cosmos DB (Serverless)..."
az cosmosdb create \
  -g $RG -n $COSMOS_ACCOUNT \
  --kind GlobalDocumentDB \
  --capabilities EnableServerless \
  --default-consistency-level Session \
  -o none

az cosmosdb sql database create \
  -g $RG -a $COSMOS_ACCOUNT -n openclaw -o none

az cosmosdb sql container create \
  -g $RG -a $COSMOS_ACCOUNT -d openclaw \
  -n sessions -p /userId -o none

#-------------------------------------------------------------------------------
# 7. Key Vault
#-------------------------------------------------------------------------------
echo ">>> [8/10] 创建 Key Vault..."
az keyvault create -g $RG -n $KV_NAME -l $LOCATION --enable-rbac-authorization true -o none

# 存储 Cosmos DB 连接字符串
COSMOS_CONN=$(az cosmosdb keys list -g $RG -n $COSMOS_ACCOUNT --type connection-strings --query 'connectionStrings[0].connectionString' -o tsv)
az keyvault secret set --vault-name $KV_NAME -n cosmos-connection --value "$COSMOS_CONN" -o none

#-------------------------------------------------------------------------------
# 8. Container App（占位，需先推送镜像）
#-------------------------------------------------------------------------------
echo ">>> [9/10] 创建 Container App (初始占位镜像)..."
az containerapp create \
  -g $RG -n $APP_NAME \
  --environment $ENV_NAME \
  --image mcr.microsoft.com/k8se/quickstart:latest \
  --target-port 80 \
  --ingress external \
  --cpu 2 --memory 4Gi \
  --min-replicas 0 \
  --max-replicas 10 \
  -o none

# 启用系统托管标识
az containerapp identity assign -g $RG -n $APP_NAME --system-assigned -o none

APP_PRINCIPAL=$(az containerapp show -g $RG -n $APP_NAME --query identity.principalId -o tsv)
APP_URL=$(az containerapp show -g $RG -n $APP_NAME --query properties.configuration.ingress.fqdn -o tsv)

# 授权访问 Key Vault
az role assignment create \
  --role "Key Vault Secrets User" \
  --assignee $APP_PRINCIPAL \
  --scope $(az keyvault show -g $RG -n $KV_NAME --query id -o tsv) -o none 2>/dev/null || true

#-------------------------------------------------------------------------------
# 9. Front Door
#-------------------------------------------------------------------------------
echo ">>> [10/10] 创建 Front Door..."
az afd profile create \
  -g $RG --profile-name $FD_PROFILE \
  --sku Standard_AzureFrontDoor -o none

az afd endpoint create \
  -g $RG --profile-name $FD_PROFILE \
  --endpoint-name ${PREFIX}-endpoint -o none

#-------------------------------------------------------------------------------
# 完成
#-------------------------------------------------------------------------------
echo ""
echo "============================================"
echo "  ✅ 部署完成！"
echo "============================================"
echo ""
echo "资源清单："
echo "  资源组:         $RG"
echo "  开发 VM:        ssh ${VM_ADMIN}@${VM_IP}"
echo "  Container App:  https://${APP_URL}"
echo "  Cosmos DB:      ${COSMOS_ACCOUNT}.documents.azure.com"
echo "  Key Vault:      ${KV_NAME}.vault.azure.net"
echo "  ACR:            ${ACR_NAME}.azurecr.io"
echo "  Front Door:     ${PREFIX}-endpoint.azurefd.net"
echo ""
echo "下一步："
echo "  1. 构建并推送 OpenClaw 镜像: az acr build -r $ACR_NAME -t openclaw-api:latest ."
echo "  2. 更新 Container App 镜像: az containerapp update -g $RG -n $APP_NAME --image ${ACR_NAME}.azurecr.io/openclaw-api:latest"
echo "  3. 在 Key Vault 中添加 GitHub Token: az keyvault secret set --vault-name $KV_NAME -n github-token --value 'ghp_xxx'"
echo ""
echo "清理资源（慎用）："
echo "  az group delete -n $RG --yes --no-wait"
