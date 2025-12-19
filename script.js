let KNOWLEDGE_DATA = [];
let isTyping = false;

async function init() {
    try {
        const resp = await fetch('./knowledge.json'); 
        if (!resp.ok) throw new Error("JSON路径错误");
        KNOWLEDGE_DATA = await resp.json();
        renderButtons(KNOWLEDGE_DATA);
        
        await wait(500);
        await typeEffect("你好！我是秋武老师的 AI 助理。🌸", true);
        await wait(600);
        await typeEffect("我已加载考学逻辑库。你可以点击左侧维度，或在下方输入关键词进行深度咨询。", false);
    } catch (e) {
        console.error("初始化失败:", e);
        document.getElementById('chat-container').innerHTML = `<div style="padding:20px; color:red;">[系统错误] 无法加载知识库，请检查 knowledge.json 拼写。</div>`;
    }
}

function renderButtons(data) {
    const container = document.getElementById('nav-buttons-container');
    container.innerHTML = "";
    data.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        const label = item.intent.split('_').pop().toUpperCase();
        btn.innerHTML = `<span>⚡</span> ${label}`;
        btn.onclick = () => handleInquiry(item);
        container.appendChild(btn);
    });
}

// 核心：模糊匹配逻辑
async function handleSearch() {
    const input = document.getElementById('user-input');
    const query = input.value.trim().toLowerCase();
    if (!query || isTyping) return;

    sendUserMessage(input.value.trim());
    input.value = "";

    const match = KNOWLEDGE_DATA.find(item => 
        item.intent.toLowerCase().includes(query) || 
        (item.keywords && item.keywords.some(k => query.includes(k.toLowerCase()) || k.toLowerCase().includes(query))) ||
        (item.response.includes(query) && query.length > 1)
    );

    if (match) {
        await handleInquiry(match, true);
    } else {
        await typeEffect("这个维度的逻辑我还在学习中。建议您输入：<b>酯化、面试、费用</b>，或直接咨询秋武老师：<b>qiuwu999</b>", true);
    }
}

async function handleInquiry(item, isFromSearch = false) {
    if (isTyping) return;
    if (!isFromSearch) sendUserMessage(item.intent.split('_').pop().toUpperCase());

    const status = document.getElementById('typing-status');
    status.innerText = "秋武老师正在分析...";
    status.classList.add('typing-active');

    const segments = item.response.split('[BREAK]').map(s => s.trim());
    for (let i = 0; i < segments.length; i++) {
        await typeEffect(segments[i], i === 0);
        await wait(600);
    }
    
    status.innerText = "在线";
    status.classList.remove('typing-active');
}

function typeEffect(text, showAvatar = true) {
    return new Promise(resolve => {
        isTyping = true;
        const chat = document.getElementById('chat-container');
        const row = document.createElement('div');
        row.className = `msg-row bot ${showAvatar ? '' : 'no-avatar'}`;
        row.innerHTML = `${showAvatar ? '<img src="profile.jpg" class="avatar-chat">' : '<div class="avatar-placeholder"></div>'}<div class="bubble"></div>`;
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
                    bubble.innerHTML += text[i] === "\n" ? "<br>" : text[i];
                    i++;
                }
                chat.scrollTop = chat.scrollHeight;
            } else {
                clearInterval(interval);
                isTyping = false;
                if (window.MathJax) MathJax.Hub.Queue(["Typeset", MathJax.Hub, bubble]);
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
function showContact() { handleInquiry(KNOWLEDGE_DATA.find(d => d.intent.includes("financial")) || {intent:"联系秋武", response:"微信号：qiuwu999"}); }

document.getElementById('send-btn').onclick = handleSearch;
document.getElementById('user-input').onkeydown = (e) => { if(e.key === 'Enter') handleSearch(); };
document.addEventListener('DOMContentLoaded', init);
