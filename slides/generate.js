const pptxgen = require("pptxgenjs");
const fs = require("fs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";

const C = { primary: "065A82", secondary: "1C7293", accent: "02C39A", dark: "0B1829", light: "F0F4F8", white: "FFFFFF" };
const bgDark = { fill: C.dark };
const bgLight = { fill: C.light };
const darkText = { color: C.dark };
const lightText = { color: C.white };

function addSlide(bg, notes) {
  const s = pres.addSlide();
  s.background = bg;
  if (notes) s.addNotes(notes);
  // accent bar at bottom
  s.addShape(pres.ShapeType ? pres.ShapeType.rect : "rect", { x: 0, y: 7.0, w: 13.33, h: 0.15, fill: { color: C.accent } });
  return s;
}

// Slide 1 - Title
let s = addSlide(bgDark, "欢迎各位参加 OpenClaw on Azure 实战工作坊，本次工作坊共2小时，涵盖AI Agent概念、实战场景、安装实操和Azure最佳实践。");
s.addText("OpenClaw on Azure", { x: 1, y: 1.8, w: 11, h: 1.5, fontSize: 48, bold: true, color: C.white, align: "center" });
s.addText("AI Agent 实战工作坊 | 2小时", { x: 1, y: 3.3, w: 11, h: 0.8, fontSize: 24, color: C.accent, align: "center" });
s.addText("🤖  🚀  ☁️", { x: 1, y: 4.3, w: 11, h: 0.8, fontSize: 36, align: "center", color: C.white });
s.addShape("rect", { x: 4, y: 5.3, w: 5.33, h: 0.05, fill: { color: C.accent } });
s.addText("动手实践 · 深度学习 · 即学即用", { x: 1, y: 5.5, w: 11, h: 0.6, fontSize: 16, color: C.secondary, align: "center", italic: true });

// Slide 2 - Agenda
s = addSlide(bgLight, "本页介绍工作坊的完整议程，共四个环节，请大家合理安排时间。");
s.addText("📋 工作坊议程", { x: 0.8, y: 0.3, w: 11, h: 0.8, fontSize: 32, bold: true, color: C.primary });
const agenda = [
  ["Session 1", "30分钟", "🧠 AI Agent vs LLM - 概念与架构对比"],
  ["Session 2", "40分钟", "💼 Agent 日常工作场景 - 代码审查、研究、自动化"],
  ["Session 3", "30分钟", "🔧 OpenClaw 安装与动手实验"],
  ["Session 4", "20分钟", "☁️ OpenClaw on Azure 最佳实践"],
];
const rows = [
  [{ text: "环节", options: { bold: true, color: C.white, fill: { color: C.primary } } },
   { text: "时长", options: { bold: true, color: C.white, fill: { color: C.primary } } },
   { text: "内容", options: { bold: true, color: C.white, fill: { color: C.primary } } }],
  ...agenda.map((r, i) => r.map(c => ({ text: c, options: { fill: { color: i % 2 === 0 ? "E8F0F8" : C.white } } })))
];
s.addTable(rows, { x: 0.8, y: 1.4, w: 11.5, colW: [1.8, 1.5, 8.2], fontSize: 16, border: { type: "solid", pt: 0.5, color: "CCCCCC" }, rowH: 0.7 });

// Slide 3 - What is LLM
s = addSlide(bgDark, "介绍大语言模型的基本概念，帮助学员理解LLM的能力边界。");
s.addText("🧠 Session 1: 什么是大语言模型 (LLM)?", { x: 0.8, y: 0.3, w: 11, h: 0.8, fontSize: 28, bold: true, ...lightText });
s.addText([
  { text: "核心特点\n", options: { fontSize: 20, bold: true, color: C.accent } },
  { text: "• 基于 Transformer 架构的深度学习模型\n• 通过海量文本数据训练\n• 擅长文本生成、理解、翻译、摘要\n• 单次请求-响应模式\n\n", options: { fontSize: 16, ...lightText } },
  { text: "📊 关键数据\n", options: { fontSize: 20, bold: true, color: C.accent } },
  { text: "GPT-4: 1.8万亿参数 | 训练数据: 13万亿 tokens", options: { fontSize: 18, bold: true, ...lightText } },
], { x: 0.8, y: 1.3, w: 11, h: 5, valign: "top" });

// Slide 4 - What is AI Agent
s = addSlide(bgLight, "介绍AI Agent的概念，强调与LLM的本质区别：自主性、工具使用、记忆。");
s.addText("🤖 什么是 AI Agent?", { x: 0.8, y: 0.3, w: 11, h: 0.8, fontSize: 28, bold: true, color: C.primary });
s.addText([
  { text: "AI Agent = LLM + 工具 + 记忆 + 规划\n\n", options: { fontSize: 22, bold: true, color: C.secondary } },
  { text: "🔧 工具调用", options: { fontSize: 18, bold: true, color: C.primary } },
  { text: " — 执行代码、调用API、操作文件\n", options: { fontSize: 16, color: C.dark } },
  { text: "🧠 记忆系统", options: { fontSize: 18, bold: true, color: C.primary } },
  { text: " — 短期/长期记忆，上下文管理\n", options: { fontSize: 16, color: C.dark } },
  { text: "📋 任务规划", options: { fontSize: 18, bold: true, color: C.primary } },
  { text: " — 分解复杂任务，自主决策\n", options: { fontSize: 16, color: C.dark } },
  { text: "🔄 自主循环", options: { fontSize: 18, bold: true, color: C.primary } },
  { text: " — 观察→思考→行动→反馈", options: { fontSize: 16, color: C.dark } },
], { x: 0.8, y: 1.3, w: 11, h: 5, valign: "top" });

// Slide 5 - Comparison Table
s = addSlide(bgDark, "通过对比表格，让学员清晰理解LLM和AI Agent的核心差异。");
s.addText("⚖️ LLM vs AI Agent 对比", { x: 0.8, y: 0.3, w: 11, h: 0.8, fontSize: 28, bold: true, ...lightText });
const cmpHeader = [
  { text: "维度", options: { bold: true, color: C.white, fill: { color: C.primary } } },
  { text: "LLM", options: { bold: true, color: C.white, fill: { color: C.primary } } },
  { text: "AI Agent", options: { bold: true, color: C.white, fill: { color: C.primary } } },
];
const cmpData = [
  ["交互模式", "单轮问答", "多轮自主循环"],
  ["工具使用", "❌ 无", "✅ 丰富工具链"],
  ["记忆能力", "仅上下文窗口", "短期+长期记忆"],
  ["任务规划", "❌ 无", "✅ 自动分解任务"],
  ["执行能力", "仅文本输出", "代码执行、文件操作"],
  ["适用场景", "问答、翻译", "复杂工作流自动化"],
];
const cmpRows = [cmpHeader, ...cmpData.map((r, i) => r.map(c => ({ text: c, options: { fill: { color: i % 2 === 0 ? "1A2A3A" : "0F1F2F" }, color: C.white } })))];
s.addTable(cmpRows, { x: 0.8, y: 1.3, w: 11.5, colW: [2.5, 4, 5], fontSize: 15, border: { type: "solid", pt: 0.5, color: "334455" }, rowH: 0.6 });

// Slide 6 - Agent Architecture
s = addSlide(bgLight, "展示AI Agent的典型架构图，帮助学员理解各组件之间的关系。");
s.addText("🏗️ AI Agent 架构", { x: 0.8, y: 0.3, w: 11, h: 0.8, fontSize: 28, bold: true, color: C.primary });
const boxes = [
  { label: "🧠 LLM 核心", x: 4.5, y: 1.5, color: C.primary },
  { label: "🔧 工具层", x: 1, y: 3.2, color: C.secondary },
  { label: "💾 记忆层", x: 4.5, y: 3.2, color: C.secondary },
  { label: "📋 规划层", x: 8, y: 3.2, color: C.secondary },
  { label: "🌐 外部环境", x: 4.5, y: 5, color: C.accent },
];
boxes.forEach(b => {
  s.addShape("roundRect", { x: b.x, y: b.y, w: 3.5, h: 1, fill: { color: b.color }, rectRadius: 0.15 });
  s.addText(b.label, { x: b.x, y: b.y, w: 3.5, h: 1, fontSize: 16, bold: true, color: C.white, align: "center", valign: "middle" });
});

// Slide 7 - Discussion
s = addSlide(bgDark, "引导学员讨论，鼓励分享自己对AI Agent的理解和期望。");
s.addText("💬 讨论环节", { x: 0.8, y: 0.3, w: 11, h: 0.8, fontSize: 28, bold: true, ...lightText });
s.addText([
  { text: "思考题:\n\n", options: { fontSize: 22, bold: true, color: C.accent } },
  { text: "1️⃣  你日常工作中哪些任务可以交给 AI Agent？\n\n", options: { fontSize: 18, ...lightText } },
  { text: "2️⃣  AI Agent 的自主性带来哪些风险？如何管控？\n\n", options: { fontSize: 18, ...lightText } },
  { text: "3️⃣  Agent 和传统自动化脚本有什么本质区别？\n\n", options: { fontSize: 18, ...lightText } },
  { text: "⏱️ 5分钟小组讨论", options: { fontSize: 20, bold: true, color: C.accent } },
], { x: 0.8, y: 1.3, w: 11, h: 5, valign: "top" });

// Slide 8 - Session 2 Title
s = addSlide(bgLight, "进入第二环节，展示AI Agent在日常工作中的实际应用场景。");
s.addText("💼 Session 2", { x: 1, y: 1.5, w: 11, h: 1, fontSize: 24, color: C.secondary, align: "center" });
s.addText("Agent 日常工作场景", { x: 1, y: 2.5, w: 11, h: 1.2, fontSize: 40, bold: true, color: C.primary, align: "center" });
s.addText("代码审查 · 研究分析 · 自动化运维", { x: 1, y: 3.8, w: 11, h: 0.8, fontSize: 20, color: C.secondary, align: "center" });
s.addText("⏱️ 40 分钟", { x: 1, y: 5, w: 11, h: 0.6, fontSize: 18, color: C.accent, align: "center", bold: true });

// Slide 9 - Code Review
s = addSlide(bgDark, "展示Agent如何自动进行代码审查，包括安全漏洞检测、代码风格检查等。");
s.addText("🔍 场景一: 智能代码审查", { x: 0.8, y: 0.3, w: 11, h: 0.8, fontSize: 28, bold: true, ...lightText });
// Two columns
s.addText([
  { text: "Agent 能做什么?\n\n", options: { fontSize: 18, bold: true, color: C.accent } },
  { text: "✅ 自动检测安全漏洞\n✅ 代码风格一致性检查\n✅ 性能瓶颈识别\n✅ 生成修复建议 PR\n✅ 上下文理解整个代码库", options: { fontSize: 15, ...lightText } },
], { x: 0.5, y: 1.3, w: 5.5, h: 4.5, valign: "top" });
s.addText([
  { text: "📊 效率提升\n\n", options: { fontSize: 18, bold: true, color: C.accent } },
  { text: "代码审查时间减少 ", options: { fontSize: 16, ...lightText } },
  { text: "60%\n\n", options: { fontSize: 28, bold: true, color: C.accent } },
  { text: "Bug 检出率提升 ", options: { fontSize: 16, ...lightText } },
  { text: "40%\n\n", options: { fontSize: 28, bold: true, color: C.accent } },
  { text: "开发者满意度 ", options: { fontSize: 16, ...lightText } },
  { text: "92%", options: { fontSize: 28, bold: true, color: C.accent } },
], { x: 6.8, y: 1.3, w: 5.5, h: 4.5, valign: "top" });

// Slide 10 - Research
s = addSlide(bgLight, "展示Agent在技术调研和信息收集方面的应用。");
s.addText("🔬 场景二: 智能研究分析", { x: 0.8, y: 0.3, w: 11, h: 0.8, fontSize: 28, bold: true, color: C.primary });
s.addText([
  { text: "• 自动搜索并汇总技术文档\n", options: { fontSize: 16, color: C.dark } },
  { text: "• 对比多种技术方案的优劣\n", options: { fontSize: 16, color: C.dark } },
  { text: "• 生成结构化调研报告\n", options: { fontSize: 16, color: C.dark } },
  { text: "• 持续跟踪技术趋势变化\n", options: { fontSize: 16, color: C.dark } },
  { text: "• 多源信息交叉验证\n\n", options: { fontSize: 16, color: C.dark } },
  { text: "💡 示例: 调研 \"Rust vs Go 在微服务中的选择\"\n", options: { fontSize: 16, bold: true, color: C.secondary } },
  { text: "Agent 自动阅读 50+ 篇文章，生成 10 页对比报告", options: { fontSize: 15, italic: true, color: C.secondary } },
], { x: 0.8, y: 1.5, w: 11, h: 4.5, valign: "top" });

// Slide 11 - Automation
s = addSlide(bgDark, "展示Agent在运维自动化方面的实际应用案例。");
s.addText("⚡ 场景三: 自动化运维", { x: 0.8, y: 0.3, w: 11, h: 0.8, fontSize: 28, bold: true, ...lightText });
s.addText([
  { text: "🔄 CI/CD 流水线优化\n", options: { fontSize: 17, bold: true, color: C.accent } },
  { text: "   自动分析构建失败原因并修复\n\n", options: { fontSize: 15, ...lightText } },
  { text: "📊 监控告警处理\n", options: { fontSize: 17, bold: true, color: C.accent } },
  { text: "   自动诊断告警、执行修复操作\n\n", options: { fontSize: 15, ...lightText } },
  { text: "📝 文档自动生成\n", options: { fontSize: 17, bold: true, color: C.accent } },
  { text: "   根据代码变更自动更新文档\n\n", options: { fontSize: 15, ...lightText } },
  { text: "🔐 安全合规检查\n", options: { fontSize: 17, bold: true, color: C.accent } },
  { text: "   持续扫描依赖漏洞并自动升级", options: { fontSize: 15, ...lightText } },
], { x: 0.8, y: 1.3, w: 11, h: 5, valign: "top" });

// Slide 12 - Demo
s = addSlide(bgLight, "现场演示环节，展示Agent完成实际任务的全过程。");
s.addText("🎬 现场演示", { x: 1, y: 1.5, w: 11, h: 1, fontSize: 36, bold: true, color: C.primary, align: "center" });
s.addText("观看 AI Agent 实时完成以下任务:", { x: 1, y: 2.8, w: 11, h: 0.6, fontSize: 20, color: C.secondary, align: "center" });
s.addText([
  { text: "1. 分析一个 GitHub 仓库的代码质量\n", options: { fontSize: 18, color: C.dark } },
  { text: "2. 自动创建 Issue 并提交修复 PR\n", options: { fontSize: 18, color: C.dark } },
  { text: "3. 生成代码变更的中文文档\n", options: { fontSize: 18, color: C.dark } },
], { x: 2.5, y: 3.8, w: 8, h: 2.5, valign: "top" });

// Slide 13 - Session 3 Title
s = addSlide(bgDark, "进入第三环节，开始OpenClaw的安装和动手实验。");
s.addText("🔧 Session 3", { x: 1, y: 1.5, w: 11, h: 1, fontSize: 24, color: C.accent, align: "center" });
s.addText("OpenClaw 安装与动手实验", { x: 1, y: 2.5, w: 11, h: 1.2, fontSize: 40, bold: true, ...lightText, align: "center" });
s.addText("从零开始，亲手搭建你的 AI Agent", { x: 1, y: 3.8, w: 11, h: 0.8, fontSize: 20, color: C.accent, align: "center" });
s.addText("⏱️ 30 分钟", { x: 1, y: 5, w: 11, h: 0.6, fontSize: 18, color: C.accent, align: "center", bold: true });

// Slide 14 - Prerequisites
s = addSlide(bgLight, "列出动手实验的环境要求，确保所有学员准备就绪。");
s.addText("📋 环境准备", { x: 0.8, y: 0.3, w: 11, h: 0.8, fontSize: 28, bold: true, color: C.primary });
const preRows = [
  [{ text: "工具", options: { bold: true, color: C.white, fill: { color: C.primary } } },
   { text: "版本要求", options: { bold: true, color: C.white, fill: { color: C.primary } } },
   { text: "说明", options: { bold: true, color: C.white, fill: { color: C.primary } } }],
  ["Node.js", "≥ 18.x", "运行时环境"],
  ["Git", "最新版", "代码管理"],
  ["VS Code", "最新版", "推荐编辑器"],
  ["Azure CLI", "≥ 2.50", "云资源管理"],
  ["Docker", "≥ 24.x", "容器化部署"],
].map((r, i) => i === 0 ? r : r.map(c => ({ text: c, options: { fill: { color: i % 2 === 0 ? "E8F0F8" : C.white } } })));
s.addTable(preRows, { x: 0.8, y: 1.4, w: 11.5, colW: [3, 3, 5.5], fontSize: 15, border: { type: "solid", pt: 0.5, color: "CCCCCC" }, rowH: 0.6 });

// Slide 15 - Installation Steps
s = addSlide(bgDark, "逐步指导学员安装OpenClaw，讲师同步演示。");
s.addText("🚀 OpenClaw 安装步骤", { x: 0.8, y: 0.3, w: 11, h: 0.8, fontSize: 28, bold: true, ...lightText });
s.addText([
  { text: "Step 1: 克隆仓库\n", options: { fontSize: 17, bold: true, color: C.accent } },
  { text: "  git clone https://github.com/openclaw/openclaw.git\n\n", options: { fontSize: 14, color: "AABBCC", fontFace: "Courier New" } },
  { text: "Step 2: 安装依赖\n", options: { fontSize: 17, bold: true, color: C.accent } },
  { text: "  cd openclaw && npm install\n\n", options: { fontSize: 14, color: "AABBCC", fontFace: "Courier New" } },
  { text: "Step 3: 配置环境变量\n", options: { fontSize: 17, bold: true, color: C.accent } },
  { text: "  cp .env.example .env && vim .env\n\n", options: { fontSize: 14, color: "AABBCC", fontFace: "Courier New" } },
  { text: "Step 4: 启动服务\n", options: { fontSize: 17, bold: true, color: C.accent } },
  { text: "  npm run start\n\n", options: { fontSize: 14, color: "AABBCC", fontFace: "Courier New" } },
  { text: "Step 5: 验证\n", options: { fontSize: 17, bold: true, color: C.accent } },
  { text: "  curl http://localhost:3000/health", options: { fontSize: 14, color: "AABBCC", fontFace: "Courier New" } },
], { x: 0.8, y: 1.3, w: 11, h: 5.5, valign: "top" });

// Slide 16 - Hands-on Lab
s = addSlide(bgLight, "学员动手实验时间，讲师巡场指导。");
s.addText("🧪 动手实验", { x: 0.8, y: 0.3, w: 11, h: 0.8, fontSize: 28, bold: true, color: C.primary });
s.addText([
  { text: "实验任务:\n\n", options: { fontSize: 20, bold: true, color: C.secondary } },
  { text: "1️⃣  配置 OpenClaw 连接 Azure OpenAI\n\n", options: { fontSize: 17, color: C.dark } },
  { text: "2️⃣  创建你的第一个 Agent 工作流\n\n", options: { fontSize: 17, color: C.dark } },
  { text: "3️⃣  让 Agent 自动分析一段代码\n\n", options: { fontSize: 17, color: C.dark } },
  { text: "4️⃣  查看 Agent 的执行日志和推理过程\n\n", options: { fontSize: 17, color: C.dark } },
  { text: "⏱️ 20分钟动手时间 | 遇到问题请举手 🙋", options: { fontSize: 16, bold: true, color: C.accent } },
], { x: 0.8, y: 1.3, w: 11, h: 5, valign: "top" });

// Slide 17 - Session 4 Title
s = addSlide(bgDark, "进入最后环节，介绍OpenClaw在Azure上的最佳实践。");
s.addText("☁️ Session 4", { x: 1, y: 1.5, w: 11, h: 1, fontSize: 24, color: C.accent, align: "center" });
s.addText("OpenClaw on Azure 最佳实践", { x: 1, y: 2.5, w: 11, h: 1.2, fontSize: 40, bold: true, ...lightText, align: "center" });
s.addText("企业级部署 · 安全合规 · 高可用架构", { x: 1, y: 3.8, w: 11, h: 0.8, fontSize: 20, color: C.accent, align: "center" });
s.addText("⏱️ 20 分钟", { x: 1, y: 5, w: 11, h: 0.6, fontSize: 18, color: C.accent, align: "center", bold: true });

// Slide 18 - Azure Architecture
s = addSlide(bgLight, "展示OpenClaw在Azure上的推荐架构，讲解各服务的角色和选型理由。");
s.addText("🏗️ Azure 架构设计", { x: 0.8, y: 0.3, w: 11, h: 0.8, fontSize: 28, bold: true, color: C.primary });
const azureServices = [
  { icon: "🖥️", name: "Azure VM", desc: "开发测试环境" },
  { icon: "📦", name: "Azure Container Apps", desc: "生产级容器部署" },
  { icon: "🤖", name: "Azure OpenAI", desc: "GPT-4 / GPT-4o 模型服务" },
  { icon: "💾", name: "Cosmos DB", desc: "Agent 记忆与状态存储" },
  { icon: "🔐", name: "Key Vault", desc: "密钥与证书管理" },
  { icon: "🌐", name: "Front Door", desc: "全球负载均衡与CDN" },
];
azureServices.forEach((svc, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = col === 0 ? 0.8 : 6.8;
  const y = 1.4 + row * 1.6;
  s.addShape("roundRect", { x, y, w: 5.5, h: 1.3, fill: { color: C.white }, shadow: { type: "outer", blur: 6, offset: 2, color: "CCCCCC" }, rectRadius: 0.1 });
  s.addText(`${svc.icon} ${svc.name}`, { x: x + 0.2, y, w: 5, h: 0.7, fontSize: 17, bold: true, color: C.primary, valign: "bottom" });
  s.addText(svc.desc, { x: x + 0.2, y: y + 0.6, w: 5, h: 0.5, fontSize: 14, color: C.secondary });
});

// Slide 19 - Best Practices
s = addSlide(bgDark, "总结Azure部署的关键最佳实践，帮助学员在实际项目中少走弯路。");
s.addText("✅ 部署最佳实践", { x: 0.8, y: 0.3, w: 11, h: 0.8, fontSize: 28, bold: true, ...lightText });
// Two columns
s.addText([
  { text: "🔒 安全性\n\n", options: { fontSize: 18, bold: true, color: C.accent } },
  { text: "• 使用 Managed Identity\n• Key Vault 管理所有密钥\n• 网络隔离 (VNet)\n• RBAC 最小权限原则\n", options: { fontSize: 15, ...lightText } },
], { x: 0.5, y: 1.2, w: 5.8, h: 2.5, valign: "top" });
s.addText([
  { text: "📈 可扩展性\n\n", options: { fontSize: 18, bold: true, color: C.accent } },
  { text: "• Container Apps 自动伸缩\n• Cosmos DB 按需吞吐量\n• Front Door 全球分发\n• 多区域容灾部署\n", options: { fontSize: 15, ...lightText } },
], { x: 6.8, y: 1.2, w: 5.8, h: 2.5, valign: "top" });
s.addText([
  { text: "💰 成本优化\n\n", options: { fontSize: 18, bold: true, color: C.accent } },
  { text: "• Azure OpenAI PTU 预留容量\n• 容器按使用量计费\n• 开发环境定时关机\n• Azure Advisor 成本建议", options: { fontSize: 15, ...lightText } },
], { x: 0.5, y: 4, w: 5.8, h: 2.5, valign: "top" });
s.addText([
  { text: "🔍 可观测性\n\n", options: { fontSize: 18, bold: true, color: C.accent } },
  { text: "• Application Insights 监控\n• Log Analytics 日志分析\n• Agent 执行链路追踪\n• 自定义仪表盘告警", options: { fontSize: 15, ...lightText } },
], { x: 6.8, y: 4, w: 5.8, h: 2.5, valign: "top" });

// Slide 20 - Q&A
s = addSlide(bgLight, "问答环节和资源分享，鼓励学员提问和后续学习。");
s.addText("❓ Q&A / 资源", { x: 1, y: 0.5, w: 11, h: 1, fontSize: 36, bold: true, color: C.primary, align: "center" });
s.addText("感谢参与！欢迎提问 🙋", { x: 1, y: 1.6, w: 11, h: 0.8, fontSize: 22, color: C.secondary, align: "center" });
s.addText([
  { text: "📚 学习资源\n\n", options: { fontSize: 20, bold: true, color: C.primary } },
  { text: "🔗 OpenClaw 文档: https://openclaw.dev/docs\n", options: { fontSize: 16, color: C.dark } },
  { text: "🔗 Azure OpenAI: https://aka.ms/azure-openai\n", options: { fontSize: 16, color: C.dark } },
  { text: "🔗 示例代码: https://github.com/openclaw/examples\n", options: { fontSize: 16, color: C.dark } },
  { text: "🔗 社区论坛: https://community.openclaw.dev\n\n", options: { fontSize: 16, color: C.dark } },
  { text: "📧 联系讲师 | 💬 加入微信交流群\n\n", options: { fontSize: 18, bold: true, color: C.secondary } },
  { text: "⭐ 请扫码填写反馈问卷 ⭐", options: { fontSize: 20, bold: true, color: C.accent } },
], { x: 1.5, y: 2.8, w: 10, h: 4, valign: "top" });

const outPath = "/tmp/agent-workshop/slides/openclaw-on-azure.pptx";
pres.writeFile({ fileName: outPath }).then(() => {
  console.log("✅ Presentation saved to " + outPath);
}).catch(err => {
  console.error("Error:", err);
});
