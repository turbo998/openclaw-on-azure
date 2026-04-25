# OpenClaw on Azure Workshop 演示脚本

> **总时长**: 2小时 | **目标受众**: 技术团队 | **讲师人数**: 1-2人

---

## Session 1: AI Agent vs LLM 深度分析（30分钟）

### 🎯 讲师说明
本环节目标是让学员理解 Agent 与普通 LLM 的本质区别。通过现场对比演示，直观展示 Agent 的自主决策、工具调用和多步推理能力。

### ⏱ 时间分配
| 环节 | 时间 |
|------|------|
| 概念讲解 | 8分钟 |
| 现场演示对比 | 12分钟 |
| 架构图解读 | 5分钟 |
| 小组讨论 | 5分钟 |

### 📋 演示步骤

**Demo 1: ChatGPT vs Agent — 代码调试场景**

1. 打开 ChatGPT，粘贴一段有 bug 的 Python 代码，观察其只给出文字建议
2. 切换到 OpenClaw Agent 终端，给出相同任务
3. 展示 Agent 自动：读取文件 → 定位问题 → 修改代码 → 运行测试 → 验证修复

```bash
# Agent 演示命令
openclaw chat "请帮我调试 /tmp/demo/buggy.py 中的错误并修复"
```

**Demo 2: 架构对比图**

展示幻灯片中的架构图：
- LLM: 用户 → 提示词 → 模型 → 文本输出
- Agent: 用户 → 规划器 → 工具链（代码执行/文件操作/API调用/搜索）→ 验证 → 反馈循环

**Demo 3: 小组讨论**

提问："在你的日常工作中，哪些场景适合用 Agent 而不是单纯的 ChatGPT？"
- 每组3-4人，讨论3分钟，每组分享1个场景

### ✅ 预期效果
- 学员能清楚表述 Agent 与 LLM 的3个核心区别（工具使用、自主规划、反馈循环）
- 学员对 Agent 的实际能力有直观认知

### ⚠️ 注意事项
- 提前准备好 buggy.py 示例文件并测试通过
- 确保网络环境正常，ChatGPT 和 Agent 都能访问
- 如果 Agent 响应较慢，可播放预录视频作为 backup
- 控制讨论时间，避免超时

---

## Session 2: Agent 日常工作场景（40分钟）

### 🎯 讲师说明
展示 Agent 在四个真实工作场景中的应用，每个场景包含现场演示。重点让学员感受 Agent 的实用价值。

### ⏱ 时间分配
| 环节 | 时间 |
|------|------|
| 代码审查演示 | 10分钟 |
| 研究自动化演示 | 10分钟 |
| DevOps 自动化演示 | 10分钟 |
| 微信集成演示 | 10分钟 |

### 📋 演示步骤

**场景 1: 代码审查（Code Review）**

```bash
# 让 Agent 审查一个 Pull Request
openclaw chat "请审查 /tmp/demo/pr-example/ 目录下的代码变更，
关注安全漏洞、性能问题和代码规范"
```

演示要点：
1. Agent 自动遍历变更文件
2. 逐文件分析，标注问题行号
3. 给出具体修改建议和严重等级
4. 生成结构化审查报告

**场景 2: 研究自动化**

```bash
# 让 Agent 调研技术方案
openclaw chat "请调研 Azure Container Apps vs Azure Kubernetes Service 的优劣对比，
生成一份决策矩阵，保存到 /tmp/demo/research-output.md"
```

演示要点：
1. Agent 搜索最新文档和案例
2. 整理对比维度（成本、复杂度、扩展性等）
3. 输出结构化 Markdown 报告

**场景 3: DevOps 自动化**

```bash
# 让 Agent 编写 CI/CD 配置
openclaw chat "为一个 Node.js 项目创建 GitHub Actions workflow，
包含 lint、test、build 和部署到 Azure Container Apps 的步骤"
```

演示要点：
1. Agent 分析项目结构
2. 生成完整的 YAML 配置
3. 添加必要的环境变量和密钥引用

**场景 4: 微信集成**

```bash
# 展示通过微信与 Agent 交互
# 在微信中发送消息，展示 Agent 实时响应
```

演示要点：
1. 展示微信中发送任务指令
2. Agent 接收并执行（如查询服务器状态、生成报告）
3. 结果通过微信返回
4. 展示多媒体能力（发送图片、文件）

### ✅ 预期效果
- 学员看到 Agent 在4个真实场景中的完整工作流
- 激发学员思考自己团队的应用场景

### ⚠️ 注意事项
- 每个演示提前彩排，确保在时间内完成
- 准备好离线备选方案（预录屏幕）
- 微信演示需要提前配置好 bot，确认在线状态
- 代码审查演示用简单但典型的示例（SQL注入、未处理异常等）

---

## Session 3: OpenClaw 安装实操（30分钟）

### 🎯 讲师说明
带领学员在 Azure VM 上完成 OpenClaw 的安装和基本配置。这是动手环节，需要逐步引导。

### ⏱ 时间分配
| 环节 | 时间 |
|------|------|
| 环境检查 | 3分钟 |
| 安装 OpenClaw | 10分钟 |
| 配置认证 | 7分钟 |
| 基础操作练习 | 7分钟 |
| 问题排查 | 3分钟 |

### 📋 演示步骤

**步骤 1: 连接 Azure VM**
```bash
# 学员使用提供的 SSH 密钥连接
ssh -i ~/.ssh/workshop-key azureuser@<vm-ip>
```

**步骤 2: 安装 OpenClaw**
```bash
# 安装依赖
sudo apt update && sudo apt install -y nodejs npm git

# 安装 OpenClaw
npm install -g @anthropic/openclaw

# 验证安装
openclaw --version
```

**步骤 3: 配置 GitHub Copilot 认证**
```bash
# 登录 GitHub Copilot
openclaw auth login --provider github-copilot

# 验证认证状态
openclaw auth status
```

**步骤 4: 基础操作练习**
```bash
# 第一次对话
openclaw chat "你好，请介绍你的能力"

# 文件操作
openclaw chat "创建一个 hello.py 文件，内容为打印当前时间"

# 多步任务
openclaw chat "读取 hello.py，添加错误处理，然后运行它"
```

### ✅ 预期效果
- 100% 学员完成安装并成功执行至少一次 Agent 对话
- 学员掌握基本的命令行交互方式

### ⚠️ 注意事项
- 提前为每位学员准备好 VM（建议用 ARM 模板批量部署）
- 准备一份 IP 地址和凭据清单
- 安排1-2名助教巡场帮助遇到问题的学员
- 常见问题准备：网络超时、权限不足、Node.js 版本不兼容
- 如果学员进度不一，让快的学员尝试高级操作

---

## Session 4: OpenClaw on Azure 最佳实践（20分钟）

### 🎯 讲师说明
介绍生产环境部署方案，包括架构设计、成本优化和安全实践。本环节以讲解为主，配合架构图。

### ⏱ 时间分配
| 环节 | 时间 |
|------|------|
| 架构全景 | 7分钟 |
| 部署方案对比 | 5分钟 |
| 成本优化 | 4分钟 |
| Q&A | 4分钟 |

### 📋 演示步骤

**架构全景展示**

展示架构图，讲解各组件：
```
用户 → Front Door (CDN/WAF)
        ↓
    Container Apps (OpenClaw 服务)
        ↓
    ┌───────────┬──────────────┬─────────────┐
    │ Azure     │ Cosmos DB    │ Key Vault   │
    │ OpenAI    │ (会话存储)   │ (密钥管理)  │
    └───────────┴──────────────┴─────────────┘
        ↓
    Azure Monitor (可观测性)
```

**部署方案对比**

| 方案 | 适用场景 | 月成本估算 |
|------|----------|-----------|
| 单VM开发 | 个人/小团队开发 | ¥500-800 |
| Container Apps | 团队协作/生产 | ¥1500-3000 |
| AKS 集群 | 大规模企业 | ¥5000+ |

**成本优化要点**
1. 使用 Azure Spot VM 做开发测试（节省70%）
2. Cosmos DB 使用 Serverless 模式（按需付费）
3. Container Apps 自动缩放到0（无流量零成本）
4. Azure OpenAI PTU 预留实例（高频使用场景）

**安全最佳实践**
1. Managed Identity 替代密钥认证
2. Private Endpoints 保护后端服务
3. Key Vault 统一管理所有密钥
4. Azure Policy 强制合规

### ✅ 预期效果
- 学员理解生产级部署架构
- 能根据团队规模选择合适方案
- 了解成本优化策略

### ⚠️ 注意事项
- 架构图提前打印或投屏
- 成本数据以最新 Azure 定价为准，演示前更新
- Q&A 时间灵活，可延长至休息时间
- 提供 azure-deployment-guide.md 作为课后参考资料

---

## 📦 课前准备清单

- [ ] Azure 订阅就绪，每学员一台 VM 已部署
- [ ] 示例代码仓库已推送至 GitHub
- [ ] 所有演示脚本已在相同环境跑通
- [ ] 备用演示视频已录制
- [ ] 微信 Bot 已配置并测试
- [ ] 学员凭据清单已打印
- [ ] 网络环境已测试（翻墙/代理配置）
- [ ] 幻灯片/架构图已就绪

## 🔗 配套资料

- [安装指南](openclaw-install-guide.md)
- [Azure 部署指南](azure-deployment-guide.md)
- [部署脚本](azure-deploy-scripts.sh)
