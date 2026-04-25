# OpenClaw Installation Guide

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Python | 3.11+ |
| Node.js | 20 LTS+ |
| Git | 2.x |
| Azure CLI | 2.60+ (for Azure OpenAI) |

## Option A: Install on Azure VM (Recommended for Workshop)

### 1. Provision the VM

```bash
# Create resource group and VM
az group create --name rg-openclaw-workshop --location eastus

az vm create \
  --resource-group rg-openclaw-workshop \
  --name vm-openclaw \
  --image Ubuntu2204 \
  --size Standard_B4ms \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard

# Open port 8080 for the OpenClaw web UI
az vm open-port --resource-group rg-openclaw-workshop --name vm-openclaw --port 8080
```

### 2. SSH into the VM

```bash
ssh azureuser@$(az vm show -g rg-openclaw-workshop -n vm-openclaw -d --query publicIps -o tsv)
```

### 3. Install System Dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3.11 python3.11-venv python3-pip git curl build-essential

# Install Node.js 20 via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
```

### 4. Clone and Set Up OpenClaw

```bash
git clone https://github.com/anthropics/openclaw.git
cd openclaw

# Create virtual environment
python3.11 -m venv .venv
source .venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -e ".[all]"

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 5. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Azure OpenAI credentials:

```ini
# Azure OpenAI Configuration
OPENAI_API_TYPE=azure
AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com/
AZURE_OPENAI_API_KEY=<your-api-key>
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-10-21

# Server Configuration
HOST=0.0.0.0
PORT=8080
LOG_LEVEL=info
```

### 6. Run OpenClaw

```bash
# Start the server
openclaw serve

# Or run in background
nohup openclaw serve > openclaw.log 2>&1 &
```

Open your browser: `http://<VM_PUBLIC_IP>:8080`

### 7. Smoke Test

```bash
# Quick CLI test
openclaw run --prompt "Hello! List 3 benefits of AI agents." --tools none

# Expected: A structured response listing 3 benefits
```

---

## Option B: Install Locally (macOS/Linux)

Same as steps 3–7 above, but skip the VM provisioning. On macOS, replace `apt` with `brew`:

```bash
brew install python@3.11 node@20 git
```

---

## Option C: Docker (Fastest)

```bash
# Pull and run
docker run -d \
  --name openclaw \
  -p 8080:8080 \
  -e OPENAI_API_TYPE=azure \
  -e AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com/ \
  -e AZURE_OPENAI_API_KEY=<your-api-key> \
  -e AZURE_OPENAI_DEPLOYMENT=gpt-4o \
  ghcr.io/anthropics/openclaw:latest

# Verify
curl http://localhost:8080/health
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError` | Ensure virtualenv is activated: `source .venv/bin/activate` |
| Connection refused on 8080 | Check `HOST=0.0.0.0` in `.env`; check Azure NSG / `ufw` rules |
| Azure OpenAI 401 | Verify API key; check the deployment name matches your model |
| `npm ERR!` during frontend build | Delete `node_modules` and retry: `rm -rf node_modules && npm install` |
| Slow response times | Use a region close to your Azure OpenAI resource; consider GPT-4o-mini for faster responses |
