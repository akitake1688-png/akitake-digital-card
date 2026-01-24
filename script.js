/**
 * 秋武逻辑 V38.2 终极生产版
 * 修复：逻辑重叠、MathJax失效、侧边栏映射
 */
let knowledgeBase = [];
let isProcessing = false;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('knowledge.json');
        knowledgeBase = await res.json();
        console.log("秋武逻辑 V38.2 已全量加载");
        
        // 绑定预设按钮
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                if (preset) {
                    document.getElementById('user-input').value = preset;
                    handleAction();
                }
            });
        });
    } catch (e) { console.error("JSON加载错误", e); }
});

async function handleAction() {
    const input = document.getElementById('user-input');
    const text = input?.value.trim().toLowerCase();
    if (!text || isProcessing) return;

    postMessage(input.value, 'user');
    input.value = "";
    isProcessing = true;

    // 匹配引擎
    let match = null;
    let topScore = -1;

    knowledgeBase.forEach(item => {
        let score = 0;
        (item.keywords || []).forEach(k => { if (text.includes(k)) score += (item.priority || 100); });
        if (score > topScore) { topScore = score; match = item; }
    });

    const response = (topScore > 0) ? match.response : knowledgeBase.find(i => i.id === "FALLBACK_CORE").response;
    
    // 异步分段渲染
    const segments = response.split('[BREAK]');
    for (const segment of segments) {
        postMessage(segment.trim(), 'bot');
        await new Promise(r => setTimeout(r, 400));
    }

    // MathJax 重绘
    if (window.MathJax) MathJax.typeset();

    // 隐私指令执行
    if (text.includes('清除') || text.includes('自毁')) {
        localStorage.clear();
        postMessage("哨兵指令执行：正在粉碎本地缓存...", "bot");
        setTimeout(() => location.reload(), 1500);
    }

    isProcessing = false;
}

function postMessage(content, role) {
    const chat = document.getElementById('chat-container');
    const div = document.createElement('div');
    div.className = `msg-row ${role}`;
    div.innerHTML = `<div class="bubble">${content}</div>`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

document.getElementById('send-btn').addEventListener('click', handleAction);
document.getElementById('user-input').addEventListener('keypress', e => { if (e.key === 'Enter') handleAction(); });
document.getElementById('clear-history')?.addEventListener('click', () => {
    if (confirm("确认清除？")) { localStorage.clear(); location.reload(); }
});
