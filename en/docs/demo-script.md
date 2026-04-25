# Facilitator Guide & Demo Script

## Before the Workshop

### Environment Checklist

- [ ] Azure subscription with Owner/Contributor role
- [ ] Azure CLI installed and logged in (`az login`)
- [ ] Azure OpenAI resource deployed with GPT-4o model
- [ ] Workshop VM provisioned (B4ms Ubuntu 22.04) — or use local machines
- [ ] OpenClaw repo cloned and dependencies installed
- [ ] Test the full demo flow at least once

### Room Setup

- Projector / screen share ready
- WiFi credentials shared with participants
- Azure Pass or subscription access confirmed for each participant

---

## Session 1: AI Agent vs LLM (30 min)

### Key Points to Cover

1. **LLM = Stateless text completion.** You send a prompt, you get a response. No memory, no tools, no autonomy.
2. **Agent = LLM + Tools + Memory + Planning loop.** The agent decides *what to do next* based on observations.
3. **The ReAct pattern:** Reason → Act → Observe → Repeat.
4. **Why agents matter:** They can break complex tasks into steps, call APIs, read files, write code, and self-correct.

### Demo 1: LLM vs Agent Side-by-Side (10 min)

```bash
# Plain LLM call — one-shot, no tools
curl https://YOUR_AOAI_ENDPOINT/openai/deployments/gpt-4o/chat/completions?api-version=2024-10-21 \
  -H "api-key: $AZURE_OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What is the current price of MSFT stock?"}]}'
# Result: The LLM cannot answer — it has no real-time data access.

# Agent call — OpenClaw with web_search tool
openclaw run --prompt "What is the current price of MSFT stock?" --tools web_search
# Result: Agent calls web_search, retrieves live data, returns an answer.
```

### Discussion Prompts

- "Where in your daily work could an agent save you time?"
- "What guardrails would you need before deploying an agent in production?"

---

## Session 2: Agent Work Scenarios (40 min)

### Scenario A: Code Review Agent (15 min)

Show OpenClaw reviewing a pull request:

```bash
openclaw run \
  --prompt "Review this Python file for bugs, security issues, and style problems." \
  --tools file_read,code_analysis \
  --input ./samples/buggy_code.py
```

Walk through the agent's reasoning trace. Highlight how it:
- Reads the file (tool call)
- Identifies issues (reasoning)
- Suggests fixes (output)

### Scenario B: Data Analysis Agent (15 min)

```bash
openclaw run \
  --prompt "Analyze this CSV. Show top 5 products by revenue and create a summary." \
  --tools file_read,python_exec \
  --input ./samples/sales_data.csv
```

### Scenario C: DevOps Agent (10 min)

```bash
openclaw run \
  --prompt "Check the health of my Azure resources in resource group 'rg-demo' and report any issues." \
  --tools azure_cli \
  --env AZURE_SUBSCRIPTION_ID=$SUB_ID
```

### Facilitation Tips

- Let participants try modifying prompts
- Encourage experimentation with different tool combinations
- Allocate 5 min for Q&A

---

## Session 3: OpenClaw Installation (30 min)

> Follow **openclaw-install-guide.md** step by step with participants.

### Pacing Guide

| Time | Step |
|------|------|
| 0–5 min | SSH into VM / open terminal |
| 5–15 min | Install Python, Node.js, dependencies |
| 15–25 min | Clone repo, configure `.env`, set API keys |
| 25–30 min | Run smoke test, troubleshoot |

### Common Issues

| Problem | Fix |
|---------|-----|
| `pip: command not found` | `sudo apt install python3-pip` |
| OpenAI 401 error | Check API key and endpoint in `.env` |
| Port 8080 not accessible | `sudo ufw allow 8080` or check NSG rules |
| Node.js version too old | Use `nvm install 20` |

---

## Session 4: OpenClaw on Azure Best Practices (20 min)

> Follow **azure-deployment-guide.md** as the reference.

### Key Talking Points

1. **Why Container Apps?** — Serverless containers, built-in auto-scaling, no cluster management.
2. **Security first** — Managed Identity (no API keys in code), Private Endpoints, Key Vault.
3. **Cost optimization** — Cosmos DB serverless for dev, autoscale RU for prod. Scale-to-zero on Container Apps.
4. **Observability** — Azure Monitor + Log Analytics. Set up alerts for agent failures.

### Live Demo: Deploy to Container Apps (10 min)

```bash
# Run the deployment script
chmod +x docs/azure-deploy-scripts.sh
./docs/azure-deploy-scripts.sh
```

Walk through each step as it executes. Explain the Bicep/CLI commands.

### Architecture Diagram (Draw on Whiteboard)

```
Users → Front Door (WAF) → Container Apps (OpenClaw)
                                ├── Azure OpenAI (GPT-4o)
                                ├── Cosmos DB (state/memory)
                                └── Key Vault (secrets)
                           Azure Monitor ← logs/metrics
```

---

## Wrap-up (5 min buffer)

- Recap the 4 sessions
- Share links: repo, docs, Azure free tier
- Remind participants to **delete workshop resources** to avoid charges
- Collect feedback (survey link or QR code)

```bash
# Cleanup command
az group delete --name rg-openclaw-workshop --yes --no-wait
```
