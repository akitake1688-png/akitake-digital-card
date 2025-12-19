let KNOWLEDGE_DATA = [];
let isTyping = false; 

async function init() {
    try {
        const resp = await fetch('./knowledge.json'); 
        if (!resp.ok) throw new Error("JSON path error");
        KNOWLEDGE_DATA = await resp.json();
        renderButtons(KNOWLEDGE_DATA);
        await wait(500);
        await typeEffect("你好！我是秋武老师的 AI 助理。🌸", true);
        await wait(600);
        await typeEffect("考学逻辑库已全量加载。请点击左侧维度或输入关键词咨询。", false);
    } catch (e) {
        console.error("Init Error:", e);
        const chat = document.getElementById('chat-container');
        if (chat) chat.innerHTML = `<div style="padding:20px; color:#ef4444;">[系统错误] 无法连接到逻辑大脑。</div>`;
    }
}

function renderButtons(data) {
    const container = document.getElementById('nav-buttons-container');
    if (!container) return;
    container.innerHTML = "";
    data.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        const label = item.nav_btn || item.intent.split('_').pop();
        btn.innerHTML = `<span>⚡</span> ${label}`;
        btn.onclick = () => {
            if (isTyping) return; 
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            handleInquiry(item);
        };
        container.appendChild(btn);
    });
}

async function handleSearch() {
    const input = document.getElementById('user-input');
    const query = input.value.trim().toLowerCase();
    if (!query || isTyping) return;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    sendUserMessage(input.value.trim());
    input.value = "";
    const match = KNOWLEDGE_DATA.find(item => 
        item.intent.toLowerCase().includes(query) || 
        (item.keywords && item.keywords.some(k => query.includes(k.toLowerCase()))) ||
        (item.response.includes(query) && query.length > 1)
    );
    if (match) { await handleInquiry(match, true); } 
    else { await typeEffect("该维度尚未对齐。建议输入关键词，或咨询：<b>qiuwu999</b>", true); }
}

async function handleInquiry(item, isFromSearch = false) {
    if (isTyping || !item) return;
    if (!isFromSearch) { sendUserMessage(item.nav_btn || item.intent.split('_').pop()); }
    const status = document.getElementById('typing-status');
    status.innerText = "正在分析逻辑...";
    const segments = item.response.split('[BREAK]').map(s => s.trim());
    for (let i = 0; i < segments.length; i++) {
        await typeEffect(segments[i], i === 0);
        await wait(600); 
    }
    status.innerText = "在线";
}

function typeEffect(text, showAvatar = true) {
    return new Promise(resolve => {
        isTyping = true;
        const chat = document.getElementById('chat-container');
        const row = document.createElement('div');
        row.className = `msg-row bot ${showAvatar ? '' : 'no-avatar'}`;
        row.innerHTML = `${showAvatar ? '<img src="profile.jpg" class="avatar-chat" onerror="this.src=\'https://via.placeholder.com/100?text=Q\'">' : '<div class="avatar-placeholder"></div>'}<div class="bubble"></div>`;
        chat.appendChild(row);
        const bubble = row.querySelector('.bubble');
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                if (text[i] === '<') { 
                    let end = text.indexOf('>', i);
                    bubble.innerHTML += text.substring(i, end + 1);
                    i = end + 1;
                } else {
                    bubble.innerHTML += text[i];
                    i++;
                }
                chat.scrollTop = chat.scrollHeight;
            } else {
                clearInterval(interval);
                isTyping = false;
                if (window.MathJax) { MathJax.Hub.Queue(["Typeset", MathJax.Hub, bubble]); }
                resolve();
            }
        }, 15);
    });
}

function sendUserMessage(text) {
    const chat = document.getElementById('chat-container');
    const msg = document.createElement('div');
    msg.className = 'msg-row user';
    msg.innerHTML = `<div class="bubble">${text}</div>`;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

const wait = (ms) => new Promise(res => setTimeout(res, ms));

function showContact() {
    if (isTyping) return;
    handleInquiry({
        nav_btn: "联系秋武",
        response: "<b>【秋武老师联系方式】</b>[BREAK]💬 微信号：<b>qiuwu999</b> [BREAK]请注明您的咨询领域（文理/面试/生存策略）。"
    });
}

document.getElementById('send-btn').onclick = handleSearch;
document.getElementById('user-input').onkeydown = (e) => { if(e.key === 'Enter') handleSearch(); };
document.addEventListener('DOMContentLoaded', init);
