let knowledgeBase = [];
let isProcessing = false;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('knowledge.json');
        knowledgeBase = await res.json();
        console.log("秋武逻辑：V38.1 救急引擎已挂载");
    } catch (e) {
        console.error("JSON 加载异常:", e);
    }

    // 绑定上传
    document.getElementById('upload-btn')?.addEventListener('click', () => document.getElementById('file-upload')?.click());
    document.getElementById('file-upload')?.addEventListener('change', e => handleFileUpload(e.target.files[0]));
});

async function handleAction() {
    const input = document.getElementById('user-input');
    const text = input?.value.trim().toLowerCase();
    if (!text || isProcessing) return;

    // 显示用户消息 (用原input.value，避免小写)
    postMessage(input.value, 'user');
    input.value = "";
    isProcessing = true;

    // 匹配逻辑
    let match = null;
    let topScore = -1;

    knowledgeBase.forEach(item => {
        let score = 0;
        item.keywords.forEach(k => {
            if (text.includes(k.toLowerCase())) score += item.priority;
        });
        if (score > topScore) {
            topScore = score;
            match = item;
        }
    });

    const response = (topScore > 0) ? match.response : knowledgeBase.find(i => i.id === "FALLBACK_CORE").response;
    
    // 渲染回复 (处理 [BREAK])
    const segments = response.split('[BREAK]');
    for (const segment of segments) {
        const botMsg = document.createElement('div');
        botMsg.className = 'msg-row bot';
        botMsg.innerHTML = `<div class="bubble">${segment.trim()}</div>`;
        document.getElementById('chat-container').appendChild(botMsg);
        await new Promise(r => setTimeout(r, 400)); // 模拟思考感
    }

    if (text.includes('清除') || text.includes('自毁')) {
        localStorage.clear();
        setTimeout(() => location.reload(), 2000);
    }

    isProcessing = false;
    const chat = document.getElementById('chat-container');
    chat.scrollTop = chat.scrollHeight;
    forceMathJax();
}

function postMessage(text, role) {
    const chat = document.getElementById('chat-container');
    const div = document.createElement('div');
    div.className = `msg-row ${role}`;
    div.innerHTML = `<div class="bubble">${text}</div>`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function handleFileUpload(file) {
    // 文件上传逻辑 (最小版，输出成功消息)
    postMessage(`📁 上传文件: ${file.name}`, 'user');
    postMessage("哨兵扫描成功：文件已锚定。输入‘指令’获取脚本。", 'bot');
}

function forceMathJax() {
    if (window.MathJax) MathJax.typeset();
}

document.getElementById('send-btn').addEventListener('click', handleAction);
document.getElementById('user-input').addEventListener('keypress', e => { if (e.key === 'Enter') handleAction(); });
document.getElementById('clear-history').addEventListener('click', () => {
    if (confirm("确认清除？")) {
        localStorage.clear();
        location.reload();
    }
});
