const pptxgen = require("pptxgenjs");
const pptx = new pptxgen();

pptx.layout = "LAYOUT_16x9";
pptx.author = "AI Agent Workshop";
pptx.title = "AI Agent Workshop";

// Colors
const C = {
  deep: "065A82",
  teal: "1C7293",
  mid: "21295C",
  white: "FFFFFF",
  light: "F0F4F8",
  gray: "E8ECF1",
  darkText: "1A1A2E",
  subText: "4A5568",
  accent: "48BB78",
  orange: "ED8936",
  purple: "805AD5",
};

// Helper: dark divider slide
function addDivider(title, subtitle, icon) {
  const slide = pptx.addSlide();
  slide.background = { fill: C.mid };
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: "100%", h: "100%", fill: { type: "solid", color: C.mid } });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 2.2, w: 2, h: 0.08, fill: { type: "solid", color: C.teal } });
  if (icon) {
    slide.addText(icon, { x: 4, y: 0.8, w: 2, h: 1, fontSize: 48, color: C.teal, align: "center" });
  }
  slide.addText(title, { x: 0.5, y: 2.5, w: 9, h: 1.2, fontSize: 36, fontFace: "Georgia", color: C.white, bold: true });
  slide.addText(subtitle, { x: 0.5, y: 3.7, w: 9, h: 0.8, fontSize: 18, fontFace: "Calibri", color: C.teal });
  return slide;
}

// Helper: content slide with title
function addContent(title) {
  const slide = pptx.addSlide();
  slide.background = { fill: C.light };
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: "100%", h: 1.1, fill: { type: "solid", color: C.deep } });
  slide.addText(title, { x: 0.5, y: 0.15, w: 9, h: 0.8, fontSize: 24, fontFace: "Georgia", color: C.white, bold: true });
  // Accent line
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 1.1, w: 1.5, h: 0.06, fill: { type: "solid", color: C.teal } });
  return slide;
}

// ========== SLIDE 1: Title ==========
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.mid };
  // Decorative shapes
  slide.addShape(pptx.shapes.OVAL, { x: 7.5, y: -1, w: 4, h: 4, fill: { type: "solid", color: C.deep }, transparency: 60 });
  slide.addShape(pptx.shapes.OVAL, { x: 8.5, y: 3, w: 3, h: 3, fill: { type: "solid", color: C.teal }, transparency: 70 });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 3.8, w: 3, h: 0.08, fill: { type: "solid", color: C.teal } });

  slide.addText("AI Agent Workshop", { x: 0.8, y: 1.5, w: 8, h: 1.4, fontSize: 44, fontFace: "Georgia", color: C.white, bold: true });
  slide.addText("从 LLM 到 Agent：理解、应用与实践", { x: 0.8, y: 2.9, w: 8, h: 0.8, fontSize: 22, fontFace: "Calibri", color: C.teal });
  slide.addText("2小时沉浸式工作坊  |  动手实验", { x: 0.8, y: 4.1, w: 6, h: 0.6, fontSize: 16, fontFace: "Calibri", color: "A0AEC0" });
}

// ========== SLIDE 2: Agenda ==========
{
  const slide = addContent("📋  议程 Agenda");
  const sessions = [
    { time: "0:00 - 0:40", title: "Session 1: AI Agent vs LLM 探讨分析", desc: "概念对比、架构分析、适用场景", color: C.deep },
    { time: "0:40 - 1:20", title: "Session 2: Agent 日常工作使用场景展示", desc: "代码审查、研究分析、自动化、多Agent协作", color: C.teal },
    { time: "1:20 - 2:00", title: "Session 3: 安装 OpenClaw 动手实验", desc: "GitHub Copilot + WeChat 集成实践", color: C.mid },
  ];
  sessions.forEach((s, i) => {
    const y = 1.5 + i * 1.4;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y, w: 9, h: 1.15, rectRadius: 0.1, fill: { type: "solid", color: C.white }, shadow: { type: "outer", blur: 4, offset: 2, color: "CCCCCC" } });
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y, w: 0.12, h: 1.15, rectRadius: 0.06, fill: { type: "solid", color: s.color } });
    slide.addText(s.time, { x: 0.8, y, w: 2, h: 0.6, fontSize: 13, fontFace: "Calibri", color: s.color, bold: true });
    slide.addText(s.title, { x: 0.8, y: y + 0.05, w: 8, h: 0.65, fontSize: 17, fontFace: "Georgia", color: C.darkText, bold: true, valign: "bottom" });
    slide.addText(s.desc, { x: 0.8, y: y + 0.65, w: 8, h: 0.45, fontSize: 13, fontFace: "Calibri", color: C.subText });
  });
}

// ========== SLIDE 3: What is LLM ==========
{
  const slide = addContent("什么是 LLM（大语言模型）？");
  slide.addText([
    { text: "LLM 的核心特点", options: { fontSize: 18, bold: true, color: C.deep, fontFace: "Georgia" } },
    { text: "", options: { breakLine: true, fontSize: 8 } },
    { text: "基于 Transformer 架构的大规模语言模型", options: { bullet: true, fontSize: 14, color: C.darkText, fontFace: "Calibri", breakLine: true } },
    { text: "通过海量文本数据预训练，掌握语言规律", options: { bullet: true, fontSize: 14, color: C.darkText, fontFace: "Calibri", breakLine: true } },
    { text: "输入 Prompt → 输出文本（单轮交互）", options: { bullet: true, fontSize: 14, color: C.darkText, fontFace: "Calibri", breakLine: true } },
    { text: "无记忆、无工具调用、无自主规划能力", options: { bullet: true, fontSize: 14, color: C.darkText, fontFace: "Calibri", breakLine: true } },
    { text: "代表：GPT-4、Claude、Gemini、DeepSeek", options: { bullet: true, fontSize: 14, color: C.darkText, fontFace: "Calibri", breakLine: true } },
  ], { x: 0.5, y: 1.4, w: 5.5, h: 4, valign: "top" });

  // Right side box
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 6.3, y: 1.6, w: 3.5, h: 3.2, rectRadius: 0.15, fill: { type: "solid", color: C.white }, shadow: { type: "outer", blur: 4, offset: 2, color: "CCCCCC" } });
  slide.addText("LLM 工作模式", { x: 6.3, y: 1.7, w: 3.5, h: 0.6, fontSize: 15, fontFace: "Georgia", color: C.deep, bold: true, align: "center" });
  slide.addText("Prompt → Model → Response", { x: 6.3, y: 2.4, w: 3.5, h: 0.5, fontSize: 13, fontFace: "Calibri", color: C.teal, align: "center", bold: true });
  slide.addText("⬇", { x: 6.3, y: 2.8, w: 3.5, h: 0.4, fontSize: 20, align: "center", color: C.teal });
  slide.addText("「无状态的文本生成器」", { x: 6.3, y: 3.2, w: 3.5, h: 0.5, fontSize: 14, fontFace: "Calibri", color: C.mid, align: "center" });
  slide.addText("每次对话都是全新开始\n不能主动获取外部信息\n不能执行实际操作", { x: 6.5, y: 3.7, w: 3.1, h: 1, fontSize: 11, fontFace: "Calibri", color: C.subText, align: "center" });
}

// ========== SLIDE 4: What is AI Agent ==========
{
  const slide = addContent("什么是 AI Agent（智能体）？");
  slide.addText([
    { text: "AI Agent 的核心特点", options: { fontSize: 18, bold: true, color: C.deep, fontFace: "Georgia" } },
    { text: "", options: { breakLine: true, fontSize: 8 } },
    { text: "以 LLM 为「大脑」，具备自主决策能力", options: { bullet: true, fontSize: 14, color: C.darkText, fontFace: "Calibri", breakLine: true } },
    { text: "能调用外部工具（API、数据库、代码执行）", options: { bullet: true, fontSize: 14, color: C.darkText, fontFace: "Calibri", breakLine: true } },
    { text: "拥有记忆系统（短期 + 长期记忆）", options: { bullet: true, fontSize: 14, color: C.darkText, fontFace: "Calibri", breakLine: true } },
    { text: "能自主规划和分解复杂任务", options: { bullet: true, fontSize: 14, color: C.darkText, fontFace: "Calibri", breakLine: true } },
    { text: "支持多步推理和反思循环", options: { bullet: true, fontSize: 14, color: C.darkText, fontFace: "Calibri", breakLine: true } },
    { text: "代表：AutoGPT、Devin、OpenClaw", options: { bullet: true, fontSize: 14, color: C.darkText, fontFace: "Calibri", breakLine: true } },
  ], { x: 0.5, y: 1.4, w: 5.5, h: 4, valign: "top" });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 6.3, y: 1.6, w: 3.5, h: 3.2, rectRadius: 0.15, fill: { type: "solid", color: C.deep }, shadow: { type: "outer", blur: 4, offset: 2, color: "CCCCCC" } });
  slide.addText("Agent 工作模式", { x: 6.3, y: 1.7, w: 3.5, h: 0.6, fontSize: 15, fontFace: "Georgia", color: C.white, bold: true, align: "center" });
  slide.addText("感知 → 思考 → 行动 → 观察", { x: 6.3, y: 2.3, w: 3.5, h: 0.5, fontSize: 13, fontFace: "Calibri", color: C.accent, align: "center", bold: true });
  slide.addText("🔄", { x: 6.3, y: 2.7, w: 3.5, h: 0.5, fontSize: 24, align: "center" });
  slide.addText("「自主循环的智能助手」", { x: 6.3, y: 3.2, w: 3.5, h: 0.5, fontSize: 14, fontFace: "Calibri", color: C.teal, align: "center" });
  slide.addText("持续记忆上下文\n主动调用工具获取信息\n自主规划和执行任务", { x: 6.5, y: 3.7, w: 3.1, h: 1, fontSize: 11, fontFace: "Calibri", color: "A0AEC0", align: "center" });
}

// ========== SLIDE 5: Architecture Comparison ==========
{
  const slide = addContent("架构对比：Agent vs LLM");
  // LLM side
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: 1.5, w: 4.5, h: 3.8, rectRadius: 0.15, fill: { type: "solid", color: C.white }, shadow: { type: "outer", blur: 4, offset: 2, color: "CCCCCC" } });
  slide.addText("LLM 架构", { x: 0.4, y: 1.5, w: 4.5, h: 0.7, fontSize: 18, fontFace: "Georgia", color: C.deep, bold: true, align: "center" });
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 1.2, y: 2.4, w: 2.8, h: 0.6, rectRadius: 0.1, fill: { type: "solid", color: C.gray } });
  slide.addText("用户输入 Prompt", { x: 1.2, y: 2.4, w: 2.8, h: 0.6, fontSize: 12, fontFace: "Calibri", color: C.darkText, align: "center" });
  slide.addText("⬇", { x: 1.2, y: 3.0, w: 2.8, h: 0.35, fontSize: 16, align: "center", color: C.deep });
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 1.2, y: 3.35, w: 2.8, h: 0.6, rectRadius: 0.1, fill: { type: "solid", color: C.deep } });
  slide.addText("LLM 模型推理", { x: 1.2, y: 3.35, w: 2.8, h: 0.6, fontSize: 12, fontFace: "Calibri", color: C.white, align: "center" });
  slide.addText("⬇", { x: 1.2, y: 3.95, w: 2.8, h: 0.35, fontSize: 16, align: "center", color: C.deep });
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 1.2, y: 4.3, w: 2.8, h: 0.6, rectRadius: 0.1, fill: { type: "solid", color: C.gray } });
  slide.addText("文本输出", { x: 1.2, y: 4.3, w: 2.8, h: 0.6, fontSize: 12, fontFace: "Calibri", color: C.darkText, align: "center" });

  // Agent side
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 5.2, y: 1.5, w: 4.5, h: 3.8, rectRadius: 0.15, fill: { type: "solid", color: C.white }, shadow: { type: "outer", blur: 4, offset: 2, color: "CCCCCC" } });
  slide.addText("Agent 架构", { x: 5.2, y: 1.5, w: 4.5, h: 0.7, fontSize: 18, fontFace: "Georgia", color: C.teal, bold: true, align: "center" });
  
  const agentBoxes = [
    { label: "感知层 Perception", y: 2.3, color: C.teal },
    { label: "规划层 Planning", y: 3.0, color: C.deep },
    { label: "执行层 Action + Tools", y: 3.7, color: C.mid },
    { label: "记忆层 Memory", y: 4.4, color: C.teal },
  ];
  agentBoxes.forEach(b => {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 5.8, y: b.y, w: 3.3, h: 0.55, rectRadius: 0.1, fill: { type: "solid", color: b.color } });
    slide.addText(b.label, { x: 5.8, y: b.y, w: 3.3, h: 0.55, fontSize: 12, fontFace: "Calibri", color: C.white, align: "center" });
  });
}

// ========== SLIDE 6: Agent = LLM + Tools + Memory + Planning ==========
{
  const slide = addContent("Agent = LLM + Tools + Memory + Planning");
  const components = [
    { icon: "🧠", title: "LLM 大脑", desc: "核心推理引擎\n理解意图、生成回复", x: 0.4, color: C.deep },
    { icon: "🔧", title: "Tools 工具", desc: "API调用、代码执行\n文件操作、网络搜索", x: 2.8, color: C.teal },
    { icon: "💾", title: "Memory 记忆", desc: "短期对话记忆\n长期知识存储", x: 5.2, color: C.mid },
    { icon: "📋", title: "Planning 规划", desc: "任务分解、步骤规划\n反思与自我修正", x: 7.6, color: C.deep },
  ];
  components.forEach(c => {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: c.x, y: 1.6, w: 2.2, h: 3.2, rectRadius: 0.15, fill: { type: "solid", color: C.white }, shadow: { type: "outer", blur: 4, offset: 2, color: "CCCCCC" } });
    slide.addText(c.icon, { x: c.x, y: 1.7, w: 2.2, h: 0.8, fontSize: 36, align: "center" });
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: c.x + 0.3, y: 2.6, w: 1.6, h: 0.06, rectRadius: 0.03, fill: { type: "solid", color: c.color } });
    slide.addText(c.title, { x: c.x, y: 2.75, w: 2.2, h: 0.55, fontSize: 15, fontFace: "Georgia", color: c.color, bold: true, align: "center" });
    slide.addText(c.desc, { x: c.x + 0.15, y: 3.3, w: 1.9, h: 1.3, fontSize: 11, fontFace: "Calibri", color: C.subText, align: "center" });
  });
}

// ========== SLIDE 7: When to use Agent vs LLM ==========
{
  const slide = addContent("何时使用 Agent vs LLM？");
  // Table
  const rows = [
    ["维度", "LLM", "Agent"],
    ["任务复杂度", "简单单轮问答", "复杂多步骤任务"],
    ["是否需要工具", "否", "是（API/代码/搜索）"],
    ["是否需要记忆", "否（无状态）", "是（上下文记忆）"],
    ["自主性", "被动响应", "主动规划执行"],
    ["延迟容忍", "需要快速响应", "可接受较长处理时间"],
    ["典型场景", "翻译、摘要、问答", "开发、研究、自动化"],
  ];
  slide.addTable(rows, {
    x: 0.5, y: 1.5, w: 9, h: 3.5,
    fontSize: 12, fontFace: "Calibri",
    border: { pt: 0.5, color: "CBD5E0" },
    colW: [1.5, 3.75, 3.75],
    rowH: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    autoPage: false,
    color: C.darkText,
    headerRow: true,
  });
}

// ========== SLIDE 8: Session 2 Divider ==========
addDivider("Agent 日常工作使用场景", "Session 2  |  40 分钟  |  四大核心场景演示", "🎯");

// ========== SLIDE 9: Code Review ==========
{
  const slide = addContent("场景一：代码审查与开发 Code Review");
  slide.addText([
    { text: "Agent 如何助力代码开发？", options: { fontSize: 16, bold: true, color: C.deep, fontFace: "Georgia" } },
    { text: "", options: { breakLine: true, fontSize: 6 } },
    { text: "自动审查 Pull Request，识别潜在问题", options: { bullet: true, fontSize: 13, color: C.darkText, fontFace: "Calibri", breakLine: true } },
    { text: "根据代码上下文生成改进建议", options: { bullet: true, fontSize: 13, color: C.darkText, fontFace: "Calibri", breakLine: true } },
    { text: "自动编写单元测试和集成测试", options: { bullet: true, fontSize: 13, color: C.darkText, fontFace: "Calibri", breakLine: true } },
    { text: "理解项目全局架构，保持一致性", options: { bullet: true, fontSize: 13, color: C.darkText, fontFace: "Calibri", breakLine: true } },
    { text: "跨文件重构与依赖分析", options: { bullet: true, fontSize: 13, color: C.darkText, fontFace: "Calibri", breakLine: true } },
  ], { x: 0.5, y: 1.4, w: 5.5, h: 3.5, valign: "top" });

  // Tools box
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 6.3, y: 1.5, w: 3.5, h: 3.5, rectRadius: 0.15, fill: { type: "solid", color: C.deep } });
  slide.addText("常用工具", { x: 6.3, y: 1.6, w: 3.5, h: 0.5, fontSize: 15, fontFace: "Georgia", color: C.white, bold: true, align: "center" });
  const tools = ["GitHub Copilot", "Cursor Agent", "Coderabbit", "SonarQube + AI", "OpenClaw"];
  tools.forEach((t, i) => {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 6.6, y: 2.2 + i * 0.52, w: 2.9, h: 0.42, rectRadius: 0.08, fill: { type: "solid", color: C.teal } });
    slide.addText(t, { x: 6.6, y: 2.2 + i * 0.52, w: 2.9, h: 0.42, fontSize: 12, fontFace: "Calibri", color: C.white, align: "center" });
  });
}

// ========== SLIDE 10: Research & Analysis ==========
{
  const slide = addContent("场景二：研究与分析 Research & Analysis");
  slide.addText([
    { text: "Agent 驱动的智能研究流程", options: { fontSize: 16, bold: true, color: C.deep, fontFace: "Georgia" } },
    { text: "", options: { breakLine: true, fontSize: 6 } },
    { text: "自动搜索并汇总多源信息", options: { bullet: true, fontSize: 13, color: C.darkText, fontFace: "Calibri", breakLine: true } },
    { text: "分析技术文档、论文、竞品报告", options: { bullet: true, fontSize: 13, color: C.darkText, fontFace: "Calibri", breakLine: true } },
    { text: "生成结构化研究报告和对比矩阵", options: { bullet: true, fontSize: 13, color: C.darkText, fontFace: "Calibri", breakLine: true } },
    { text: "持续跟踪特定领域的最新动态", options: { bullet: true, fontSize: 13, color: C.darkText, fontFace: "Calibri", breakLine: true } },
    { text: "数据可视化与趋势预测", options: { bullet: true, fontSize: 13, color: C.darkText, fontFace: "Calibri", breakLine: true } },
  ], { x: 0.5, y: 1.4, w: 5.5, h: 3.5, valign: "top" });

  // Flow diagram
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 6.3, y: 1.5, w: 3.5, h: 3.5, rectRadius: 0.15, fill: { type: "solid", color: C.white }, shadow: { type: "outer", blur: 4, offset: 2, color: "CCCCCC" } });
  slide.addText("研究流程", { x: 6.3, y: 1.6, w: 3.5, h: 0.5, fontSize: 15, fontFace: "Georgia", color: C.deep, bold: true, align: "center" });
  const steps = ["🔍 信息收集", "📊 数据分析", "📝 报告生成", "✅ 审核优化"];
  steps.forEach((s, i) => {
    slide.addText(s, { x: 6.6, y: 2.2 + i * 0.65, w: 2.9, h: 0.5, fontSize: 13, fontFace: "Calibri", color: C.deep, align: "center" });
    if (i < steps.length - 1) {
      slide.addText("⬇", { x: 6.6, y: 2.55 + i * 0.65, w: 2.9, h: 0.3, fontSize: 12, align: "center", color: C.teal });
    }
  });
}

// ========== SLIDE 11: Daily Automation ==========
{
  const slide = addContent("场景三：日常自动化 Daily Automation");
  const items = [
    { icon: "📧", title: "邮件处理", desc: "自动分类、摘要、草拟回复" },
    { icon: "📅", title: "日程管理", desc: "智能安排会议、提醒事项" },
    { icon: "📄", title: "文档生成", desc: "自动生成报告、PPT、周报" },
    { icon: "🔄", title: "工作流自动化", desc: "CI/CD、部署、监控告警" },
    { icon: "💬", title: "客户支持", desc: "智能客服、工单分类处理" },
    { icon: "📊", title: "数据处理", desc: "ETL、数据清洗、报表生成" },
  ];
  items.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.4 + col * 3.15;
    const y = 1.5 + row * 1.8;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y, w: 2.95, h: 1.5, rectRadius: 0.12, fill: { type: "solid", color: C.white }, shadow: { type: "outer", blur: 3, offset: 1, color: "CCCCCC" } });
    slide.addText(item.icon, { x, y: y + 0.1, w: 2.95, h: 0.5, fontSize: 24, align: "center" });
    slide.addText(item.title, { x, y: y + 0.55, w: 2.95, h: 0.4, fontSize: 14, fontFace: "Georgia", color: C.deep, bold: true, align: "center" });
    slide.addText(item.desc, { x, y: y + 0.95, w: 2.95, h: 0.4, fontSize: 11, fontFace: "Calibri", color: C.subText, align: "center" });
  });
}

// ========== SLIDE 12: Multi-Agent Collaboration ==========
{
  const slide = addContent("多 Agent 协作 Multi-Agent Collaboration");
  slide.addText("多个专业 Agent 协同完成复杂任务", { x: 0.5, y: 1.35, w: 9, h: 0.5, fontSize: 14, fontFace: "Calibri", color: C.subText });

  const agents = [
    { name: "PM Agent\n需求分析", x: 1.0, y: 2.2, color: C.deep },
    { name: "Dev Agent\n代码开发", x: 3.5, y: 2.2, color: C.teal },
    { name: "QA Agent\n测试验证", x: 6.0, y: 2.2, color: C.mid },
    { name: "Ops Agent\n部署运维", x: 8.5, y: 2.2, color: C.deep },
  ];
  agents.forEach(a => {
    slide.addShape(pptx.shapes.OVAL, { x: a.x, y: a.y, w: 1.6, h: 1.6, fill: { type: "solid", color: a.color }, shadow: { type: "outer", blur: 4, offset: 2, color: "CCCCCC" } });
    slide.addText(a.name, { x: a.x, y: a.y + 0.3, w: 1.6, h: 1, fontSize: 12, fontFace: "Calibri", color: C.white, align: "center", bold: true });
  });
  // Arrows between agents
  [2.7, 5.2, 7.7].forEach(x => {
    slide.addText("→", { x, y: 2.7, w: 0.8, h: 0.6, fontSize: 28, color: C.teal, align: "center" });
  });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 1.5, y: 4.2, w: 7, h: 0.8, rectRadius: 0.1, fill: { type: "solid", color: C.gray } });
  slide.addText("🔗  共享记忆层 + 消息总线 + 任务编排器", { x: 1.5, y: 4.2, w: 7, h: 0.8, fontSize: 14, fontFace: "Calibri", color: C.deep, align: "center", bold: true });
}

// ========== SLIDE 13: Session 3 Divider ==========
addDivider("安装 OpenClaw", "Session 3  |  40 分钟  |  动手实验", "⚡");

// ========== SLIDE 14: OpenClaw Architecture ==========
{
  const slide = addContent("OpenClaw 架构概览");
  slide.addText([
    { text: "OpenClaw 是什么？", options: { fontSize: 16, bold: true, color: C.deep, fontFace: "Georgia" } },
    { text: "", options: { breakLine: true, fontSize: 6 } },
    { text: "开源 AI Agent 平台，连接 GitHub Copilot 与 WeChat", options: { bullet: true, fontSize: 13, color: C.darkText, fontFace: "Calibri", breakLine: true } },
    { text: "支持多模型接入（GPT-4、Claude、本地模型）", options: { bullet: true, fontSize: 13, color: C.darkText, fontFace: "Calibri", breakLine: true } },
    { text: "插件化工具系统，可自定义扩展", options: { bullet: true, fontSize: 13, color: C.darkText, fontFace: "Calibri", breakLine: true } },
    { text: "内置记忆管理和任务规划引擎", options: { bullet: true, fontSize: 13, color: C.darkText, fontFace: "Calibri", breakLine: true } },
    { text: "WeChat 作为用户交互界面", options: { bullet: true, fontSize: 13, color: C.darkText, fontFace: "Calibri", breakLine: true } },
  ], { x: 0.5, y: 1.4, w: 5.5, h: 3.5, valign: "top" });

  // Architecture stack
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 6.2, y: 1.5, w: 3.6, h: 3.6, rectRadius: 0.15, fill: { type: "solid", color: C.white }, shadow: { type: "outer", blur: 4, offset: 2, color: "CCCCCC" } });
  const layers = [
    { label: "WeChat 界面层", color: C.accent },
    { label: "Agent 核心引擎", color: C.deep },
    { label: "工具 & 插件层", color: C.teal },
    { label: "LLM 模型层", color: C.mid },
  ];
  layers.forEach((l, i) => {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 6.5, y: 1.7 + i * 0.82, w: 3, h: 0.65, rectRadius: 0.08, fill: { type: "solid", color: l.color } });
    slide.addText(l.label, { x: 6.5, y: 1.7 + i * 0.82, w: 3, h: 0.65, fontSize: 12, fontFace: "Calibri", color: C.white, align: "center", bold: true });
  });
}

// ========== SLIDE 15: Install Steps ==========
{
  const slide = addContent("动手实验：安装 OpenClaw");
  const steps = [
    { num: "01", title: "环境准备", desc: "安装 Node.js 18+、Docker、Git" },
    { num: "02", title: "克隆项目", desc: "git clone https://github.com/openclaw/openclaw" },
    { num: "03", title: "配置环境变量", desc: "复制 .env.example → .env，填写 API Key" },
    { num: "04", title: "启动服务", desc: "docker compose up -d" },
    { num: "05", title: "连接 WeChat", desc: "扫码登录，完成 WeChat 绑定" },
    { num: "06", title: "验证测试", desc: "在 WeChat 中发送消息，验证 Agent 响应" },
  ];
  steps.forEach((s, i) => {
    const y = 1.4 + i * 0.72;
    slide.addShape(pptx.shapes.OVAL, { x: 0.5, y, w: 0.55, h: 0.55, fill: { type: "solid", color: C.teal } });
    slide.addText(s.num, { x: 0.5, y, w: 0.55, h: 0.55, fontSize: 13, fontFace: "Calibri", color: C.white, align: "center", valign: "middle", bold: true });
    slide.addText(s.title, { x: 1.2, y, w: 2.2, h: 0.55, fontSize: 14, fontFace: "Georgia", color: C.deep, bold: true, valign: "middle" });
    slide.addText(s.desc, { x: 3.4, y, w: 6.2, h: 0.55, fontSize: 12, fontFace: "Calibri", color: C.subText, valign: "middle" });
  });
}

// ========== SLIDE 16: Thank You ==========
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.mid };
  slide.addShape(pptx.shapes.OVAL, { x: -1, y: -1, w: 5, h: 5, fill: { type: "solid", color: C.deep }, transparency: 50 });
  slide.addShape(pptx.shapes.OVAL, { x: 7, y: 3, w: 4, h: 4, fill: { type: "solid", color: C.teal }, transparency: 60 });
  slide.addText("感谢参与！", { x: 1, y: 1.5, w: 8, h: 1.2, fontSize: 44, fontFace: "Georgia", color: C.white, bold: true, align: "center" });
  slide.addText("Thank You & Q&A", { x: 1, y: 2.7, w: 8, h: 0.8, fontSize: 24, fontFace: "Calibri", color: C.teal, align: "center" });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 3.5, y: 3.6, w: 3, h: 0.06, fill: { type: "solid", color: C.teal } });
  slide.addText("欢迎提问和交流 💬", { x: 1, y: 3.9, w: 8, h: 0.7, fontSize: 18, fontFace: "Calibri", color: "A0AEC0", align: "center" });
}

// Generate
const outPath = require("path").join(__dirname, "agent-workshop.pptx");
pptx.writeFile({ fileName: outPath }).then(() => {
  console.log(`✅ PPT generated: ${outPath}`);
}).catch(err => {
  console.error("❌ Error:", err);
});
