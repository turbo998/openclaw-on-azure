# OpenClaw on Azure — AI Agent Hands-on Workshop (2 Hours)

## Overview

This workshop guides participants through understanding AI agents, exploring real-world agent scenarios, and deploying the **OpenClaw** AI agent framework on Microsoft Azure with production-grade best practices.

**Duration:** 2 hours  
**Level:** Intermediate  
**Prerequisites:** Basic Azure knowledge, terminal/CLI familiarity, an active Azure subscription

## Agenda

| # | Session | Duration | Description |
|---|---------|----------|-------------|
| 1 | **AI Agent vs LLM** | 30 min | What makes an agent different from a plain LLM call? Tool use, memory, planning, and the ReAct loop. |
| 2 | **Agent Work Scenarios** | 40 min | Real-world use cases: code generation, data analysis, customer service, DevOps automation. Live demos with OpenClaw. |
| 3 | **OpenClaw Installation** | 30 min | Hands-on: install OpenClaw locally and on an Azure VM (B4ms Ubuntu 22.04). |
| 4 | **OpenClaw on Azure Best Practices** | 20 min | Production architecture: Container Apps, Cosmos DB, Key Vault, Front Door, Managed Identity, monitoring & cost optimization. |

## Azure Services Used

| Service | Purpose | SKU / Tier |
|---------|---------|------------|
| Azure VM | Dev/workshop sandbox | Standard_B4ms, Ubuntu 22.04 |
| Azure Container Apps | Production hosting | Consumption plan |
| Azure OpenAI | LLM backend | GPT-4o / GPT-4o-mini |
| Azure Cosmos DB | Agent memory & state | Serverless / 400-1000 RU/s |
| Azure Key Vault | Secrets management | Standard |
| Azure Front Door | Global load balancing & WAF | Standard |
| Azure Monitor | Observability | Log Analytics workspace |

## Estimated Cost

| Scenario | Monthly Estimate |
|----------|-----------------|
| Workshop (single VM, 8 hrs) | ~$2–5 |
| Dev/Test (Container Apps + Cosmos DB serverless) | ~$30–60 |
| Production (multi-region, auto-scale) | ~$200–500 |

> 💡 **Tip:** Delete workshop resources immediately after the session to avoid unexpected charges.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/anthropics/openclaw-workshop.git
cd openclaw-workshop

# Follow the installation guide
cat en/docs/openclaw-install-guide.md
```

## Repository Structure

```
en/
├── README.md                          # This file
└── docs/
    ├── demo-script.md                 # Facilitator guide & demo script
    ├── openclaw-install-guide.md      # Step-by-step installation
    ├── azure-deployment-guide.md      # Azure best practices
    └── azure-deploy-scripts.sh        # Deployment automation script
```

## Contributing

Issues and PRs welcome. Please keep documentation bilingual (Chinese + English).

## License

MIT
