let KNOWLEDGE_DATA = [];
let isTyping = false;

async function init() {
    try {
        const resp = await fetch('knowledge.json');
        KNOWLEDGE_DATA = await resp.json();
        renderButtons(KNOWLEDGE_DATA);
        
        // 欢迎流程
        await wait(500);
        await typeEffect("你好！我是秋武 AI 咨询助理。🌸", true);
        await wait(600);
        await typeEffect("我已连接秋武流知识库。点击左侧维度或下方选项，我们将开始逻辑推演。", false);
        renderOptions([{"label": "📊 核心优势", "next": "核心优势"}, {"label": "🎓 辅导模式", "next": "辅导模式"}]);
    } catch (e) { console.error("Data Error", e); }
}

function renderButtons(data) {
    const container = document.getElementById('nav-buttons-container');
    container.innerHTML = "";
    data.forEach(item => {
        if (!item.intent.includes("case")) { // 只显示主菜单
            const btn = document.createElement('button');
            btn.className = 'nav-btn';
            btn.innerHTML = `<span>⚡</span> ${item.intent.replace(/_/g, ' ')}`;
            btn.onclick = () => handleInquiry(item);
            container.appendChild(btn);
        }
    });
}

async function handleInquiry(item, isAuto = false) {
    if (isTyping) return;
    if (!isAuto) sendUserMessage(item.intent.replace(/_/g, ' '));
    
    const status = document.getElementById('typing-status');
    status.innerText = "秋武老师正在推演逻辑...";
    status.classList.add('typing-active');

    const segments = item.response.split('[BREAK]').map(s => s.trim());
    
    for (let i = 0; i < segments.length; i++) {
        await typeEffect(segments[i], i === 0); 
        await wait(600);
    }

    if (item.next_steps) renderOptions(item.next_steps);
    
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
                } else if (text.substring(i, i+2) === '**') {
                    let end = text.indexOf('**', i + 2);
                    bubble.innerHTML += `<b>${text.substring(i+2, end)}</b>`;
                    i = end + 2;
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

function renderOptions(steps) {
    const chat = document.getElementById('chat-container');
    const div = document.createElement('div');
    div.className = 'options-area';
    steps.forEach(step => {
        const btn = document.createElement('button');
        btn.className = 'opt-click-btn';
        btn.innerText = step.label;
        btn.onclick = () => {
            const target = KNOWLEDGE_DATA.find(d => d.intent === step.next);
            if (target) handleInquiry(target);
        };
        div.appendChild(btn);
    });
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
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
function showContact() { handleInquiry(KNOWLEDGE_DATA.find(d => d.intent.includes("联系")) || {intent:"联系秋武", response:"微信号：qiuwu999"}); }
document.addEventListener('DOMContentLoaded', init);
