const AKI_KNOWLEDGE = {
    "费用": "【秋武辅导模式：透明、靠谱的商业逻辑】🍀<br><br>1. **强推免费模式**：通过秋武老师进入合作机构，费用由机构支付，您享0额外支出。<br>2. **定制收费**：如果您需要独立的文书修改、面试特训，我们提供专项付费服务。<br>详情添加微信：<b>qiuwu999</b>。",
    "面试": "【面试对策：卡壳不可怕，可怕的是逻辑崩盘】🗣️<br><br>面试压力大，卡壳很正常。教授看重的是您思考的品质。我们提供一对一全模拟面试，助您在卡壳时也能用“真实思考”打动教授。请微信私信 <b>qiuwu999</b> 锁定训练时间。",
    "编入": "【编入学：看似捷径，实则“窄门”】🎓<br><br>编入学对专业基础连续性要求极高。秋武建议：面对高风险选择，务必进行“终局思维”反推。是选择风险极高的编入，还是更稳健的重读学部？",
    "默认": "💡 **秋武建议**：您的问题较复杂，涉及个人详细情况。建议添加秋武老师微信进行一对一深度沟通。<br>微信号：<b>qiuwu999</b>"
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
}

function handleSearch() {
    const query = userInput.value.trim();
    if (!query) return;

    addMessage(query, 'user');
    userInput.value = '';

    let response = AKI_KNOWLEDGE["默认"];
    const lowerQuery = query.toLowerCase();
    
    for (let key in AKI_KNOWLEDGE) {
        if (key !== "默认" && lowerQuery.includes(key)) {
            response = AKI_KNOWLEDGE[key];
            break;
        }
    }

    setTimeout(() => {
        addMessage(response, 'bot');
    }, 600);
}

sendBtn.addEventListener('click', handleSearch);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });
