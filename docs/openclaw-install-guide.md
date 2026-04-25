# OpenClaw 安装指南

> 本指南适用于在 Azure VM 上安装和配置 OpenClaw Agent 环境。

---

## 目录

1. [Azure VM 环境准备](#1-azure-vm-环境准备)
2. [安装 OpenClaw](#2-安装-openclaw)
3. [GitHub Copilot 认证配置](#3-github-copilot-认证配置)
4. [微信集成配置](#4-微信集成配置)
5. [基础 Agent 操作](#5-基础-agent-操作)
6. [故障排查](#6-故障排查)

---

## 1. Azure VM 环境准备

### 1.1 创建 VM

```bash
# 登录 Azure
az login

# 创建资源组
az group create --name rg-openclaw-workshop --location eastasia

# 创建 VM（推荐 B4ms：4核16G）
az vm create \
  --resource-group rg-openclaw-workshop \
  --name vm-openclaw-dev \
  --image Ubuntu2404 \
  --size Standard_B4ms \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard

# 开放 SSH 端口
az vm open-port --resource-group rg-openclaw-workshop --name vm-openclaw-dev --port 22
```

### 1.2 连接 VM

```bash
# 获取 VM 公网 IP
az vm show -d -g rg-openclaw-workshop -n vm-openclaw-dev --query publicIps -o tsv

# SSH 连接
ssh azureuser@<YOUR_VM_IP>
```

### 1.3 系统环境配置

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础依赖
sudo apt install -y curl git build-essential

# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证
node --version   # 应输出 v20.x.x
npm --version    # 应输出 10.x.x

# 安装 Python 3.11+（部分功能需要）
sudo apt install -y python3 python3-pip python3-venv
```

---

## 2. 安装 OpenClaw

### 2.1 NPM 全局安装

```bash
# 安装 OpenClaw CLI
sudo npm install -g @anthropic/openclaw

# 验证安装
openclaw --version
```

### 2.2 从源码安装（可选）

```bash
git clone https://github.com/anthropic/openclaw.git
cd openclaw
npm install
npm run build
npm link
```

### 2.3 初始化配置

```bash
# 初始化配置目录
openclaw init

# 配置文件位于 ~/.openclaw/config.yaml
cat ~/.openclaw/config.yaml
```

默认配置示例：

```yaml
# ~/.openclaw/config.yaml
model:
  provider: github-copilot  # 或 azure-openai, anthropic
  name: claude-sonnet-4-20250514
tools:
  terminal: true
  file_operations: true
  web_search: true
logging:
  level: info
  path: ~/.openclaw/logs/
```

---

## 3. GitHub Copilot 认证配置

### 3.1 前置条件

- 有效的 GitHub 账号
- 已订阅 GitHub Copilot（Individual 或 Business）

### 3.2 认证步骤

```bash
# 方式一：交互式登录（推荐）
openclaw auth login --provider github-copilot
# 按提示在浏览器中完成 OAuth 授权

# 方式二：使用 Token
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"
openclaw auth login --provider github-copilot --token $GITHUB_TOKEN

# 验证认证状态
openclaw auth status
```

预期输出：
```
✅ Provider: GitHub Copilot
✅ Status: Authenticated
✅ Model: claude-sonnet-4-20250514
✅ Expires: 2026-05-25T14:00:00Z
```

### 3.3 使用 Azure OpenAI（替代方案）

```bash
# 配置 Azure OpenAI
export AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"
export AZURE_OPENAI_API_KEY="your-api-key"
export AZURE_OPENAI_DEPLOYMENT="gpt-4o"

openclaw auth login --provider azure-openai
```

---

## 4. 微信集成配置

### 4.1 安装微信 Bot 组件

```bash
# 安装 wechaty 依赖
npm install -g wechaty wechaty-puppet-wechat

# 安装 OpenClaw 微信插件
openclaw plugin install wechat-bridge
```

### 4.2 配置微信桥接

```yaml
# 在 ~/.openclaw/config.yaml 中添加
wechat:
  enabled: true
  puppet: wechaty-puppet-wechat
  allowed_users:
    - "微信好友备注名1"
    - "微信好友备注名2"
  allowed_groups:
    - "技术团队群"
  auto_reply: true
  max_context_messages: 20
```

### 4.3 启动微信桥接

```bash
# 启动微信桥接服务
openclaw wechat start

# 扫描终端二维码完成微信登录
# 登录成功后，在微信中发送消息即可与 Agent 交互
```

### 4.4 微信交互示例

在微信中发送：
```
@OpenClaw 帮我查看服务器 CPU 使用率
```

Agent 会自动执行命令并返回结果。

---

## 5. 基础 Agent 操作

### 5.1 交互模式

```bash
# 启动交互式会话
openclaw chat

# 单次任务模式
openclaw chat "创建一个 Flask API 项目结构"

# 指定工作目录
openclaw chat --workdir /home/azureuser/projects "分析这个项目的代码结构"
```

### 5.2 常用操作示例

```bash
# 文件操作
openclaw chat "读取 config.yaml 并解释每个配置项"

# 代码生成
openclaw chat "用 Python 写一个 Azure Blob Storage 上传工具"

# 代码审查
openclaw chat "审查 src/ 目录下的代码，找出安全问题"

# 系统管理
openclaw chat "检查磁盘使用情况，如果超过80%则清理日志文件"

# 研究任务
openclaw chat "调研 Azure Container Apps 的最新功能，生成报告"
```

### 5.3 会话管理

```bash
# 查看历史会话
openclaw sessions list

# 恢复上次会话
openclaw sessions resume <session-id>

# 导出会话记录
openclaw sessions export <session-id> --format markdown -o session.md
```

---

## 6. 故障排查

### 问题 1: 安装失败 — npm 权限错误

```bash
# 症状：EACCES permission denied
# 解决：
sudo chown -R $(whoami) ~/.npm
npm install -g @anthropic/openclaw
```

### 问题 2: 认证失败

```bash
# 症状：Authentication failed
# 排查步骤：
openclaw auth status          # 检查认证状态
openclaw auth logout          # 清除旧认证
openclaw auth login --provider github-copilot  # 重新认证

# 检查 Token 是否过期
curl -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user
```

### 问题 3: Agent 响应超时

```bash
# 症状：Request timeout
# 解决方案：
# 1. 检查网络连接
curl -v https://api.githubcopilot.com

# 2. 增加超时时间
openclaw config set timeout 120

# 3. 检查代理配置
export HTTPS_PROXY=http://proxy:port
```

### 问题 4: 微信登录失败

```bash
# 症状：QR Code 扫描后无反应
# 解决方案：
# 1. 确认使用个人微信号（非企业微信）
# 2. 清除缓存
rm -rf ~/.wechaty/

# 3. 重启服务
openclaw wechat stop
openclaw wechat start
```

### 问题 5: Node.js 版本不兼容

```bash
# 症状：SyntaxError: Unexpected token
# 解决：升级到 Node.js 20+
sudo n install 20
# 或使用 nvm
nvm install 20
nvm use 20
```

### 日志查看

```bash
# 查看 Agent 日志
tail -f ~/.openclaw/logs/agent.log

# 查看微信桥接日志
tail -f ~/.openclaw/logs/wechat.log

# 调试模式启动
openclaw chat --debug "测试任务"
```

---

## 快速检查清单

```bash
# 一键环境检查脚本
echo "=== 环境检查 ==="
echo "Node.js: $(node --version 2>/dev/null || echo '未安装')"
echo "npm: $(npm --version 2>/dev/null || echo '未安装')"
echo "OpenClaw: $(openclaw --version 2>/dev/null || echo '未安装')"
echo "认证状态: $(openclaw auth status 2>/dev/null || echo '未配置')"
echo "磁盘空间: $(df -h / | tail -1 | awk '{print $4}') 可用"
echo "内存: $(free -h | grep Mem | awk '{print $7}') 可用"
```
