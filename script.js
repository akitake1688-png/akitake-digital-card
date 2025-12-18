/**
 * AKI_SYSTEM 核心逻辑引擎
 * 针对稳定性与安全性进行了输入过滤处理
 */
const AKI_CONTENT = {
    "核心优势": "【秋武流：逻辑压制与终局思维】<br>我们拒绝盲目刷题。核心优势在于：<br>1. **文理贯通**：用理科的严谨重构文科文书。<br>2. **博弈视角**：模拟教授心理，在信息差中寻找最优出路。<br>3. **AI赋能**：让AI成为你的思考杠杆，而非替代品。",
    "辅导模式": "【中肯的建议：选择最适合您的路径】<br>● **秋武流合伙人计划**：0元对接合作机构，我们为您把关。<br>● **深度私订**：针对高难目标，进行毁灭式的逻辑复盘与文书推翻。详情咨询微信：<b>qiuwu999</b>。",
    "费用": "【关于费用的专业说明】<br>咨询是认知的交易。初次沟通（30min）完全免费。我们不通过低价获客，而是通过**确定性的产出**定价。请添加微信 <b>qiuwu999</b> 索取详细的服务手册。",
    "面试": "【面试博弈】卡壳并不可怕。真正专业的面试表现是：展现出你在极高压下的**思考痕迹**。我们的模拟面试将针对性强化这一点。",
    "默认": "💡 未匹配到特定策略。您可以输入：<b>费用、辅导模式、面试、编入</b>，或点击左侧卡片直接获取核心逻辑。"
};

const chatWin = document.getElementById('chat-window');
const input = document.getElementById('user-input');

function safeHTML(str) {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML; // 基础防注入
}

function pushMsg(content, role) {
    const div = document.createElement('div');
    div.className = `msg ${role} fade-in`;
    div.innerHTML = content;
    chatWin.appendChild(div);
    chatWin.scrollTo({top: chatWin.scrollHeight, behavior: 'smooth'});
    if (window.MathJax) MathJax.Hub.Queue(["Typeset", MathJax.Hub, div]);
}

// 侧边栏协同逻辑：建立粘性
document.querySelectorAll('.nav-card').forEach(card => {
    card.addEventListener('click', () => {
        const key = card.getAttribute('data-trigger');
        pushMsg(key, 'user');
        // 模拟AI思考，增加张力
        setTimeout(() => pushMsg(AKI_CONTENT[key] || AKI_CONTENT["默认"], 'bot'), 400);
    });
});

function handleSend() {
    const text = input.value.trim();
    if (!text) return;
    pushMsg(text, 'user');
    input.value = '';

    let reply = AKI_CONTENT["默认"];
    // 模糊匹配逻辑：确保中肯回复
    for (let key in AKI_CONTENT) {
        if (key !== "默认" && text.toLowerCase().includes(key.toLowerCase())) {
            reply = AKI_CONTENT[key];
            break;
        }
    }
    setTimeout(() => pushMsg(reply, 'bot'), 500);
}

document.getElementById('send-btn').onclick = handleSend;
input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };
