const AKI_KNOWLEDGE = {
    "微分": "【微分极限】核心不在于计算，而在于“无限逼近”的动态思想。记住：导数是局部线性近似的最佳工具。",
    "动量": "【动量守恒】系统不受外力或合外力为零时，$p = mv$ 保持不变。",
    "酯化": "【酯化反应】酸脱羟基醇脱氢。这是一个可逆反应。",
    "面试": "【面试推椅子逻辑】展现了“闭环意识”与对环境的微观博弈优势。",
    "eju": "【EJU 6月考理论】核心策略是避开热门峰值，选择信息差较大的学部进行突围。",
    "ai": "【AI进化策略】真正的AI应用应保留展现真实的思考痕迹，这才是生命力。",
    
    // ！！！这是你截图里缺失的关键部分 ！！！
    "费用": "【咨询费用】秋武流咨询采取阶梯式收费。初次深度沟通（30min）免费，详情请咨询微信号：qiuwu999。",
    "联系": "【联系方式】请添加主理人微信：qiuwu999，备注“数字名片”。",

    "默认": "未识别指令。请输入关键词：<b>费用、联系、微分、面试、EJU、AI</b>。"
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
    
    if (window.MathJax) {
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, div]);
    }
}

function handleSearch() {
    const query = userInput.value.trim().toLowerCase();
    if (!query) return;

    addMessage(userInput.value, 'user');
    userInput.value = '';

    // 逻辑改进：只要用户输入的内容包含关键词（比如“多少费用”包含“费用”），就能匹配成功
    let response = AKI_KNOWLEDGE["默认"];
    for (let key in AKI_KNOWLEDGE) {
        if (key !== "默认" && query.indexOf(key) !== -1) {
            response = AKI_KNOWLEDGE[key];
            break;
        }
    }

    setTimeout(() => {
        addMessage(response, 'bot');
    }, 500);
}

sendBtn.addEventListener('click', handleSearch);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
