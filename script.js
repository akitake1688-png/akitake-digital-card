/**
 * 秋武老师数字名片 - SOTA Phase 2 全量重构版
 * 状态：已根据 HTML 结构完成 ID 对齐 (user-input / chat-body)
 * 安全性：最高级别，采用预加载与防卡死逻辑
 */

// 1. SOTA 深度增强数据库 (Phase 2 核心)
const SUB_MODULES = {
    "面试": {
        "title": "🎖️ 秋武深度预判：面试 10 分项细节",
        "content": "【细节重构】：根据秋武数据➋，教授极其看重‘研究者潜质’。离开座位时【将椅子推回原位】直接区分了 0 分与 10 分。关门前与教授的【最后眼神交汇】是建立职业信心的关键。",
        "hook": "💡 提示：教授通常会追问你对课程大纲的了解，想知道如何通过具体课程展示‘进学意欲’吗？"
    },
    "酯化": {
        "title": "🧪 学术底层重构：酯化反应的‘逻辑链’",
        "content": "【深入浅出】：酸和醇‘手拉手’脱水。不要死记硬背，要强调这是‘可逆反应’。提及‘浓硫酸脱水/催化’和‘平衡移动’，这能向教授证明你拥有解决复杂问题的系统思维。",
        "hook": "💡 追问预判：如果教授问‘如何提高产率’，你知道如何用‘勒夏特列原理’降维打击吗？"
    },
    "跨专业": {
        "title": "🔄 认知重构：跨专业/理转文的‘王牌逻辑’",
        "content": "【认知突围】：跨专业不是基础薄弱，而是‘背景稀缺’。利用理科的实证思维去重构文科研究计划，告诉教授你的‘跨界视角’能发现别人看不见的学术破绽。这是 10 分级的答辩逻辑。",
        "hook": "💡 应对‘为什么要转行’这个必问考点，想知道秋武老师总结的‘唯一性公式’吗？"
    },
    "费用": {
        "title": "💰 商业透明：秋武费用逻辑",
        "content": "【要件定义】：留学收费贵是因为信息差。秋武推崇‘按需定制’，核心在于文书逻辑。通过优质合作机构，可实现 0 额外支出的顶级辅导，将预算花在真正能提升录取率的刀刃上。",
        "hook": "💡 想要实现 0 额外支出获得东大级辅导？请联系微信：qiuwu999 详细拆解。"
    }
};

let cachedKnowledge = {}; // 存储加载的 JSON 数据

// 2. 核心逻辑函数
function getEnhancedResponse(userInput, database) {
    const input = userInput.toLowerCase();
    let baseRes = "这是一个非常好的切入点。为了给出准确的‘秋武级’建议，请告诉我您的目标院校或专业背景？或者添加我的微信 qiuwu999 详细拆解。";

    // 优先级拦截：费用
    if (input.includes("贵") || input.includes("钱") || input.includes("费") || input.includes("多少")) {
        const base = database["费用"] || "关于费用，我主张透明与定制方案。";
        return buildSotaText("费用", base);
    }

    // 关键词搜索
    for (let key in database) {
        if (input.includes(key.toLowerCase())) {
            return buildSotaText(key, database[key]);
        }
    }
    return baseRes;
}

function buildSotaText(key, base) {
    const subKey = Object.keys(SUB_MODULES).find(k => key.includes(k) || k.includes(key));
    const extra = SUB_MODULES[subKey];
    if (extra) {
        return `${base}\n\n--------------------------\n${extra.title}\n${extra.content}\n\n${extra.hook}`;
    }
    return base;
}

// 3. 页面交互 (严格对齐 HTML ID: user-input / chat-body / send-btn)
document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input'); // 对应 HTML 中的 user-input
    const chatBody = document.getElementById('chat-body'); // 对应 HTML 中的 chat-body

    // 预加载知识库，防止点击时网络延迟导致失效
    fetch('knowledge.json')
        .then(res => res.json())
        .then(data => { cachedKnowledge = data; })
        .catch(err => console.log("JSON加载跳过，使用内置逻辑。"));

    // 发送函数
    const handleAction = () => {
        const text = userInput.value.trim();
        if (!text || !chatBody) return;

        // 创建用户消息
        const uMsg = document.createElement('div');
        uMsg.className = 'message user-message'; // 对齐 HTML 中的样式名
        uMsg.innerText = text;
        chatBody.appendChild(uMsg);

        // 创建 AI 回复
        const aiMsg = document.createElement('div');
        aiMsg.className = 'message ai-message'; // 对齐 HTML 中的样式名
        aiMsg.innerText = getEnhancedResponse(text, cachedKnowledge);
        chatBody.appendChild(aiMsg);

        // UI 自动处理
        userInput.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    // 绑定点击
    if (sendBtn) sendBtn.onclick = handleAction;

    // 绑定回车
    if (userInput) {
        userInput.onkeydown = (e) => {
            if (e.key === 'Enter') handleAction();
        };
    }
});
