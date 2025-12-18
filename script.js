/**
 * 秋武流知识库核心对象
 * 集成理科、博弈、AI策略三大模块
 */
const AKI_KNOWLEDGE = {
    // 理科模块
    "微分": "【微分极限】核心不在于计算，而在于“无限逼近”的动态思想。$\lim_{\Delta x \to 0} \frac{f(x+\Delta x)-f(x)}{\Delta x}$。记住：导数是局部线性近似的最佳工具。",
    "动量": "【动量守恒】系统不受外力或合外力为零时，$p = mv$ 保持不变。注意：碰撞瞬间的内力远大于外力，是处理此类问题的黄金切入点。",
    "酯化": "【酯化反应】酸脱羟基醇脱氢。这是一个可逆反应，常用浓硫酸作催化剂和吸水剂，通过移去生成的水来打破平衡，提高产率。",
    
    // 博弈模块
    "面试": "【面试推椅子逻辑】面试结束起身时，将椅子轻声推回原位。这一举措在秋武流评价体系中价值10分：它展现了“闭环意识”与对环境的微观博弈优势。",
    "eju": "【EJU 6月考理论】6月考试不是终点，而是“入场券”。利用6月成绩进行后期校内考博弈，核心策略是避开热门峰值，选择信息差较大的学部进行突围。",
    
    // AI 策略模块
    "ai": "【AI进化策略】拒绝生成“无瑕疵作文”。真正高阶的AI应用应保留“带疙瘩”的表达，即展现真实的思考痕迹与不完美的成长逻辑，这才是无法被算法模拟的生命力。",
    "默认": "未识别指令。请输入关键词：微分、动量、酯化、面试、EJU、AI。"
};

const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

function addMessage(text, role) {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.innerHTML = text;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    
    // 如果存在公式，触发 MathJax 重绘
    if (window.MathJax) {
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, div]);
    }
}

function handleSearch() {
    const query = userInput.value.trim().toLowerCase();
    if (!query) return;

    addMessage(query, 'user');
    userInput.value = '';

    // 逻辑检索
    let response = AKI_KNOWLEDGE["默认"];
    for (let key in AKI_KNOWLEDGE) {
        if (query.includes(key)) {
            response = AKI_KNOWLEDGE[key];
            break;
        }
    }

    setTimeout(() => {
        addMessage(response, 'bot');
    }, 500);
}

// 事件绑定
sendBtn.addEventListener('click', handleSearch);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// 视频自动播放补丁（针对部分浏览器限制）
document.addEventListener('touchstart', function() {
    const video = document.getElementById('bg-video');
    if (video.paused) video.play();
}, { once: true });
