# AI Agent Workshop

> 🤖 一个 2 小时的 AI Agent 动手实践工作坊

## 概述

本 Workshop 共 **2 小时**，分为 **3 个 Session**：

| Session | 主题 | 时长 |
|---------|------|------|
| Session 1 | AI Agent 基础概念与架构 | ~30 min |
| Session 2 | 动手构建你的第一个 Agent | ~50 min |
| Session 3 | 高级技巧与实战演练 | ~40 min |

## 目录结构

```
agent-workshop/
├── README.md          # 本文件
├── slides/            # 演示幻灯片
│   ├── session1.pdf
│   ├── session2.pdf
│   └── session3.pdf
├── docs/              # 详细文档与参考资料
│   ├── setup.md       # 环境配置指南
│   ├── session1.md    # Session 1 讲义
│   ├── session2.md    # Session 2 讲义
│   └── session3.md    # Session 3 讲义
└── examples/          # 示例代码
```

## 前置要求

开始之前，请确保你已准备好以下环境：

### 1. Azure VM

- 已分配的 Azure 虚拟机（Ubuntu）
- SSH 访问权限
- 确认可以正常连接：`ssh azureuser@<your-vm-ip>`

### 2. GitHub Copilot

- 已激活的 GitHub Copilot 许可证
- VS Code 或 JetBrains IDE 中已安装 GitHub Copilot 插件
- 确认 Copilot Chat 功能可用

### 3. 微信 (WeChat)

- 用于接收 Workshop 通知和实时互动
- 请扫码加入 Workshop 交流群

## 使用方法

### 克隆仓库

```bash
git clone https://github.com/your-org/agent-workshop.git
cd agent-workshop
```

### 查看幻灯片

幻灯片位于 `slides/` 目录，可直接打开 PDF 文件。

### 跟随文档操作

```bash
# 查看环境配置指南
cat docs/setup.md

# 按 Session 顺序阅读讲义
cat docs/session1.md
cat docs/session2.md
cat docs/session3.md
```

### 运行示例

```bash
cd examples/
# 按照各 Session 讲义中的说明运行
```

## 常见问题

- **无法连接 Azure VM？** 检查 NSG 规则是否开放了 SSH 端口。
- **Copilot 无响应？** 确认插件版本为最新，并重新登录 GitHub 账号。

## License

MIT License. 详见 [LICENSE](LICENSE) 文件。
