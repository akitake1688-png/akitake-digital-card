let KNOWLEDGE_DATA = [];
let isTyping = false;

async function init() {
    try {
        const resp = await fetch('knowledge.json');
        KNOWLEDGE_DATA = await resp.json();
        renderButtons(KNOWLEDGE_DATA);
        
        // 分段式欢迎语，增强“内涵感”
        setTimeout(() => {
            sendBotMessage("你好，欢迎来到<b>秋武 AI 终局思维咨询室</b>。🌸");
        }, 500);
        setTimeout(() => {
            sendBotMessage("在这里，我们不聊空洞的技巧，只通过“终局逻辑”拆解你的考学破绽。请点击左侧感兴趣的维度开始。");
        }, 1200);
    } catch (e) {
        console.error("Data Load Error", e);
    }
}

function renderButtons(data) {
    const container = document.getElementById('nav-buttons-container');
    container.innerHTML = "";
    data.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        // 提取 Emoji 和 标题，增强可视化
        const label = item.intent.replace(/_/g, ' ');
        btn.innerHTML = `<i class="btn-icon">⚡</i> <span class="btn-text">${label}</span>`;
        btn.onclick = () => {
            if (isTyping) return;
            handleInquiry(label, item.response);
        };
        container.appendChild(btn);
    });
}

function handleInquiry(title, response) {
    sendUserMessage(title);
    
    // 模拟思考状态
    document.getElementById('typing-status').innerText = "秋武流逻辑生成中...";
    document.getElementById('typing-status').classList.add('typing-active');
    
    setTimeout(() => {
        typeEffect(response);
        document.getElementById('typing-status').innerText = "在线回复中";
        document.getElementById('typing-status').classList.remove('typing-active');
    }, 800);
}

function sendUserMessage(text) {
    const container = document.getElementById('chat-container');
    const msg = document.createElement('div');
    msg.className = 'msg-row user';
    msg.innerHTML = `<div class="bubble">${text}</div>`;
    container.appendChild(msg);
    scrollToBottom();
}

function sendBotMessage(text) {
    const container = document.getElementById('chat-container');
    const msg = document.createElement('div');
    msg.className = 'msg-row bot';
    msg.innerHTML = `<img src="profile.jpg" class="avatar-chat"><div class="bubble">${text}</div>`;
    container.appendChild(msg);
    if (window.MathJax) MathJax.Hub.Queue(["Typeset", MathJax.Hub, msg]);
    scrollToBottom();
}

function typeEffect(text) {
    isTyping = true;
    const container = document.getElementById('chat-container');
    const row = document.createElement('div');
    row.className = 'msg-row bot';
    row.innerHTML = `<img src="profile.jpg" class="avatar-chat"><div class="bubble"></div>`;
    container.appendChild(row);
    
    const bubble = row.querySelector('.bubble');
    const tokens = text.match(/(<[^>]+>|\$[^\$]+\$|[^<$]|\n)/g) || [];
    let i = 0;

    const timer = setInterval(() => {
        if (i < tokens.length) {
            bubble.innerHTML += (tokens[i] === "\n") ? "<br>" : tokens[i];
            i++;
            container.scrollTop = container.scrollHeight;
        } else {
            clearInterval(timer);
            isTyping = false;
            if (window.MathJax) MathJax.Hub.Queue(["Typeset", MathJax.Hub, bubble]);
        }
    }, 15);
}

function scrollToBottom() {
    const chat = document.getElementById('chat-container');
    chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });
}

function showContact() {
    handleInquiry("获取秋武老师联系方式", "<b>📍 微信号：qiuwu999</b><br>请注明“数字化名片”咨询。");
}

document.addEventListener('DOMContentLoaded', init);
