let KNOWLEDGE_DATA = [];
let isTyping = false;

async function init() {
    try {
        const resp = await fetch('knowledge.json');
        if (!resp.ok) throw new Error('Network response was not ok');
        KNOWLEDGE_DATA = await resp.json();
        renderButtons(KNOWLEDGE_DATA);
        
        // 初始欢迎语
        sendBotMessage("你好！我是秋武老师的 AI 助理。🌸<br>关于日本考学、文书逻辑重构或面试技巧，随时问我！");
        setTimeout(() => {
            sendBotMessage("📚 **秋武知识库加载完成。** 您可以开始提问！", "system");
        }, 800);
    } catch (e) {
        console.error("数据加载失败:", e);
        sendBotMessage("⚠️ 知识库加载失败，请检查 knowledge.json 文件路径或格式。", "system");
    }
}

function renderButtons(data) {
    const container = document.getElementById('nav-buttons-container');
    container.innerHTML = "";
    data.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        // 为按钮添加图标
        const icon = item.intent.includes('理科') ? '⚗️' : '🚀';
        btn.innerHTML = `<span>${icon}</span> ${item.intent.replace(/_/g, ' ')}`;
        
        btn.onclick = () => {
            if (isTyping) return;
            sendUserMessage(item.intent.replace(/_/g, ' '));
            setTimeout(() => typeEffect(item.response), 600);
        };
        container.appendChild(btn);
    });
}

function sendUserMessage(text) {
    const container = document.getElementById('chat-container');
    const div = document.createElement('div');
    div.className = 'msg-row user';
    div.innerHTML = `<div class="bubble">${text}</div>`;
    container.appendChild(div);
    scrollToBottom();
}

function sendBotMessage(text, type = "bot") {
    const container = document.getElementById('chat-container');
    const div = document.createElement('div');
    div.className = type === "system" ? "msg-row system" : "msg-row bot";
    
    if (type === "system") {
        div.innerHTML = `<div class="sys-tip">${text}</div>`;
    } else {
        div.innerHTML = `<img src="profile.jpg" class="avatar-chat"><div class="bubble">${text}</div>`;
    }
    container.appendChild(div);
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
            scrollToBottom();
        } else {
            clearInterval(timer);
            isTyping = false;
            if (window.MathJax) MathJax.Hub.Queue(["Typeset", MathJax.Hub, bubble]);
        }
    }, 25);
}

function scrollToBottom() {
    const chat = document.getElementById('chat-container');
    chat.scrollTop = chat.scrollHeight;
}

document.addEventListener('DOMContentLoaded', init);
