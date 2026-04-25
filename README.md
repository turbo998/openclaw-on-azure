# 🤖 OpenClaw on Azure Workshop

> AI Agent 实战工作坊 — 在 Azure 上部署和使用 OpenClaw 智能体

## 📌 概览

| 项目 | 说明 |
|------|------|
| **时长** | 2小时 |
| **受众** | 技术团队（开发、运维、架构师） |
| **前置要求** | Azure 账号、GitHub 账号、基础命令行经验 |
| **目标** | 理解 AI Agent，掌握 OpenClaw 安装与 Azure 生产部署 |

## 📂 仓库结构

```
agent-workshop/
├── README.md                              # 本文件
└── docs/
    ├── demo-script.md                     # 讲师演示脚本（2小时完整流程）
    ├── openclaw-install-guide.md          # OpenClaw 安装与配置指南
    ├── azure-deployment-guide.md          # Azure 生产部署最佳实践
    └── azure-deploy-scripts.sh            # Azure 资源一键部署脚本
```

## 🎯 Workshop 议程

| 时间 | 环节 | 内容 |
|------|------|------|
| 0:00-0:30 | Session 1 | AI Agent vs LLM 深度分析、现场对比演示、小组讨论 |
| 0:30-1:10 | Session 2 | Agent 日常场景：代码审查、研究自动化、DevOps、微信集成 |
| 1:10-1:40 | Session 3 | OpenClaw 安装实操 Hands-on Lab |
| 1:40-2:00 | Session 4 | OpenClaw on Azure 最佳实践、架构与成本优化 |

## 🚀 快速开始

### 讲师准备

```bash
# 1. 克隆仓库
git clone <repo-url> && cd agent-workshop

# 2. 部署学员 VM 环境
chmod +x docs/azure-deploy-scripts.sh
./docs/azure-deploy-scripts.sh

# 3. 按 docs/demo-script.md 进行彩排
```

### 学员操作

```bash
# 1. 连接分配的 Azure VM
ssh azureuser@<your-vm-ip>

# 2. 按 docs/openclaw-install-guide.md 完成安装

# 3. 开始使用
openclaw chat "你好，请介绍你的能力"
```

## 📖 文档说明

| 文档 | 用途 | 受众 |
|------|------|------|
| [演示脚本](docs/demo-script.md) | 完整的2小时 Workshop 引导脚本 | 讲师 |
| [安装指南](docs/openclaw-install-guide.md) | VM 环境准备、安装、认证、微信集成 | 学员 |
| [Azure 部署指南](docs/azure-deployment-guide.md) | 生产环境架构、Bicep 模板、安全与扩展 | 架构师/运维 |
| [部署脚本](docs/azure-deploy-scripts.sh) | 一键创建所有 Azure 资源 | 运维/讲师 |

## ⚙️ 技术栈

- **Agent 框架**: OpenClaw
- **云平台**: Microsoft Azure
- **核心服务**: Azure VM、Container Apps、Cosmos DB、Key Vault、Front Door、Azure Monitor
- **AI 模型**: GitHub Copilot / Azure OpenAI (GPT-4o, Claude)
- **集成**: WeChat (微信)

## 📝 License

MIT
