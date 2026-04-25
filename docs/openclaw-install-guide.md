# OpenClaw 安装与配置指南

> 🕐 预计用时：40 分钟 | 动手实验

---

## 1. 前置条件

开始之前，请确认以下环境已就绪：

| 项目 | 要求 |
|------|------|
| Azure VM | Ubuntu 24.04 LTS, **Standard_B4ms** (4 vCPU / 16 GB) |
| GitHub 账号 | 已开通 **GitHub Copilot** 订阅 |
| 微信客户端 | iOS **8.0.70+** 或 Android 最新版 |

确认 VM 可通过 SSH 访问：

```bash
ssh azureuser@<YOUR_VM_IP>
```

---

## 2. 安装 OpenClaw

### 2.1 一键安装

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

### 2.2 配置 PATH

安装脚本会提示你添加 PATH，执行：

```bash
echo 'export PATH="$HOME/.openclaw/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

验证安装：

```bash
openclaw --version
```

### 2.3 基础配置

```bash
# 设置为本地网关模式
openclaw config set gateway.mode local

# 设置默认模型
openclaw config set agents.defaults.model.primary 'github-copilot/gpt-5.4'
```

### 2.4 启动守护进程

```bash
openclaw daemon install && openclaw daemon start
```

检查状态：

```bash
openclaw daemon status
```

> ✅ 看到 `running` 即表示成功。

---

## 3. 认证 GitHub Copilot

### 3.1 启动设备码认证

```bash
openclaw models auth login-github-copilot
```

终端会输出类似信息：

```
请访问 https://github.com/login/device
输入代码: ABCD-1234
```

### 3.2 完成认证

1. 在浏览器打开 `https://github.com/login/device`
2. 输入终端显示的设备码
3. 点击 **Authorize** 授权
4. 回到终端，等待认证完成

### 3.3 设置默认模型

```bash
openclaw models set github-copilot/gpt-5.4
```

验证：

```bash
openclaw models list
```

> ✅ 应看到 `github-copilot/gpt-5.4` 标记为 `active`。

---

## 4. HTTPS 访问（Caddy 方案）

微信要求 HTTPS 连接，我们用 Caddy 做反向代理。

### 4.1 安装 Caddy

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

### 4.2 生成自签名证书

```bash
mkdir -p ~/certs
openssl req -x509 -newkey rsa:4096 -sha256 -days 365 -nodes \
  -keyout ~/certs/key.pem -out ~/certs/cert.pem \
  -subj "/CN=$(hostname -I | awk '{print $1}')"
```

### 4.3 配置 Caddyfile

```bash
sudo tee /etc/caddy/Caddyfile > /dev/null <<'EOF'
{
    auto_https off
}

:443 {
    tls /home/azureuser/certs/cert.pem /home/azureuser/certs/key.pem
    reverse_proxy localhost:5800
}
EOF
```

重启 Caddy：

```bash
sudo systemctl restart caddy
```

### 4.4 绑定 LAN 访问

```bash
openclaw config set gateway.bind lan
openclaw daemon restart
```

> ⚠️ 确保 Azure NSG 已放行 **443** 端口。

---

## 5. 连接微信

### 5.1 安装微信插件

```bash
openclaw plugins install '@tencent-weixin/openclaw-weixin'
```

### 5.2 启用插件

```bash
openclaw config set plugins.entries.openclaw-weixin.enabled true
```

### 5.3 扫码登录

```bash
openclaw channels login --channel openclaw-weixin
```

终端会显示一个二维码。

**扫码技巧：**

- 📱 用微信「扫一扫」扫描终端二维码
- 如果终端二维码显示不清晰，放大终端窗口或缩小字体
- 二维码有效期约 **60 秒**，过期后按回车刷新
- 扫码后在手机上点击 **确认登录**

---

## 6. 验证测试

### 6.1 检查通道状态

```bash
openclaw channels list
```

> ✅ `openclaw-weixin` 状态应为 `connected`。

### 6.2 发送测试消息

1. 打开微信，找到 **文件传输助手** 或任意好友对话
2. 向已登录的微信账号发送：`你好`
3. 如果收到 AI 回复，说明配置成功 🎉

也可以用命令行测试：

```bash
openclaw chat "你好，请做个自我介绍"
```

---

## 7. 常见问题排查

### `openclaw: command not found`

PATH 未生效，执行：

```bash
source ~/.bashrc
# 或手动指定
~/.openclaw/bin/openclaw --version
```

### 二维码过期

```bash
# 重新登录即可
openclaw channels login --channel openclaw-weixin
```

> 💡 提前放大终端窗口，准备好微信扫一扫再执行命令。

### 502 Bad Gateway

Caddy 无法连接 OpenClaw 后端：

```bash
# 检查守护进程是否运行
openclaw daemon status

# 查看日志
openclaw daemon logs --tail 50

# 重启
openclaw daemon restart
```

确认端口 5800 在监听：

```bash
ss -tlnp | grep 5800
```

### disconnected 1006 (WebSocket 断开)

通常是网络不稳定或微信长连接超时：

```bash
# 查看通道状态
openclaw channels list

# 重新登录
openclaw channels login --channel openclaw-weixin
```

如果频繁断开，检查 Azure VM 的网络安全组规则，确保出站连接不受限。

---

> 🎓 安装完成！如有问题请举手示意讲师。
