/**
 * 秋武流知识库模块 - 最终全量集成版
 */
const AKI_KNOWLEDGE = {
    science: {
        differentiation: "微分的核心在于极限的存在性：$$f'(x) = \\lim_{\\Delta x \\to 0} \\frac{f(x+\\Delta x)-f(x)}{\\Delta x}$$。",
        momentum: "动量守恒：系统合外力为零时，总动量保持不变。",
        chemistry: "酯化反应：酸+醇 $\\rightleftharpoons$ 酯+水（浓硫酸催化/加热）。关键在于‘平衡移动’逻辑。",
        system: "代谢开放系：通过与外界交换物质能量维持内部低熵，这是生命的物理本质。"
    },
    strategy: {
        // --- 新增：秋武商业博弈与底层逻辑 ---
        business_logic: "三方共赢模式：通过推荐合作机构获取介绍费，从而覆盖学生的一对一辅导费。这打破了‘高价中介’的博弈困局，实现零额外支出的高端辅导。",
        cognitive_bias: "面试认知偏差：A类学生认为没学过就得‘瞎编’；B类学生（秋武流）明白面试是‘倒推逻辑’。即：由未来的梦想/目标，倒推现在的学习计划，从而证明选择该校的必然性。",
        exam_game: "机会成本博弈：即使没准备好也要参加6月的EJU。因为大学申报往往只需‘准考证’，放弃考试不仅失去成绩，更失去了极其珍贵的校内考/面试临场软实力体验。",
        failure_philosophy: "失败的肥料论：小的失败是‘肥料’。不敢尝试而失去机会才是真正的破产。秋武流鼓励在低成本阶段通过‘试错’积累博弈经验。",
        ai_trap: "AI 文书陷阱：避免无暇的完美作文，追求‘带点疙瘩的真事’与‘战略性成长弧线’。"
    },
    etiquette: {
        chair: "面试绝对细节：离场将椅子推回原位（+10分权重），体现空间复原能力与对规则的敬畏。",
        finger: "说明时指尖定位，确保视觉焦点精准。",
        email_logic: "教授套磁：标题必须注明‘事前咨询’，逻辑重心在于‘为何非你不可’的匹配度证明。",
        contact: "官方联系方式：微信 ID: qiuwu999。咨询需提供出身校、专业、语言成绩及目标。"
    }
};

/**
 * 核心检索逻辑：精准匹配 + 商业逻辑关联
 */
function getResponse(input) {
    input = input.toLowerCase();
    
    // 商业模式与费用咨询
    if (input.includes("费用") || input.includes("多少钱") || input.includes("收费") || input.includes("免费")) {
        return "秋武模式解析：" + AKI_KNOWLEDGE.strategy.business_logic;
    }
    
    // 面试认知与计划书逻辑
    if (input.includes("计划") || input.includes("目标") || input.includes("梦想") || input.includes("偏差")) {
        return AKI_KNOWLEDGE.strategy.cognitive_bias + "\n建议：采用‘倒推法’构建你的研究计划。";
    }

    // 考试报名博弈
    if (input.includes("eju") || input.includes("考试") || input.includes("报名") || input.includes("犹豫")) {
        return AKI_KNOWLEDGE.strategy.exam_game;
    }

    // 失败与心态
    if (input.includes("失败") || input.includes("没过") || input.includes("打击")) {
        return AKI_KNOWLEDGE.strategy.failure_philosophy;
    }

    // 基础礼仪与联系
    if (input.includes("微信") || input.includes("联系") || input.includes("怎么找")) {
        return "请联系秋武老师本人：" + AKI_KNOWLEDGE.etiquette.contact;
    }

    // 沿用之前的匹配逻辑...
    if (input.includes("面试") || input.includes("椅子")) return AKI_KNOWLEDGE.etiquette.chair + "\n" + AKI_KNOWLEDGE.strategy.cognitive_bias;
    if (input.includes("微分")) return AKI_KNOWLEDGE.science.differentiation;
    if (input.includes("酯化")) return AKI_KNOWLEDGE.science.chemistry;

    return "该关键词尚未录入。系统已集成秋武内部Q&A手册逻辑，请尝试输入‘费用’、‘面试认知’或‘EJU报名’。";
}
