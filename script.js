let KNOWLEDGE_DATA = [];
let isTyping = false;

async function init() {
    try {
        const resp = await fetch('knowledge.json');
        KNOWLEDGE_DATA = await resp.json();
        renderButtons(KNOWLEDGE_DATA);
        
        setTimeout(() => {
            sendBotMessage("你好！我是秋武老师的 AI 助理。🌸<br>我已连接<b>秋武流：终局思维知识库</b>。<br>请点击左侧维度开始咨询，或直接私信下方微信号。");
        }, 300);
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
        // 修正：将下划线替换为空格，并保留 Emoji 呈现
        const displayName = item.intent.replace(/_/g, ' ');
        btn.innerHTML = `<span>💡</span> ${displayName}`;
        btn.onclick = () => {
            if (isTyping) return;
            sendUserMessage(displayName);
            setTimeout(() => typeEffect(item.response), 400);
        };
        container.appendChild(btn);
    });
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
    chat.scrollTop = chat.scrollHeight;
}

function showContact() {
    if (isTyping) return;
    sendUserMessage("如何获取秋武老师联系方式？");
    setTimeout(() => {
        sendBotMessage("<b>📍 秋武老师微信号：qiuwu999</b><br>提示：添加时请务必注明“数字化名片”，以便快速通过。");
    }, 400);
}

document.addEventListener('DOMContentLoaded', init);
