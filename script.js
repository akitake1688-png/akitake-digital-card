document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const detailCard = document.getElementById('detailCard');

    let kb = [];
    const fallbackMsg = "【调度建议】逻辑库网络抖动，请直接对齐微信：qiuwu999";

    // 1. 增强型数据加载
    fetch('knowledge.json')
        .then(r => r.json())
        .then(data => { kb = data; console.log("秋武逻辑库注入成功"); })
        .catch(e => { console.error("数据加载降级"); kb = []; });

    // 2. 分层调度函数
    window.openDetail = () => detailCard.classList.add('active');
    window.closeDetail = () => detailCard.classList.remove('active');

    // 3. 增强型对话逻辑
    function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        append(text, 'user');
        userInput.value = '';

        // 模拟 AI 思考感
        setTimeout(() => {
            const match = kb.find(item => item.keywords.some(k => text.includes(k)));
            const reply = match ? match.response : fallbackMsg;
            append(reply, 'ai');
        }, 500);
    }

    function append(t, type) {
        const d = document.createElement('div');
        d.className = `msg ${type}`;
        d.innerHTML = t.replace(/\n/g, '<br>');
        chatBox.appendChild(d);
        chatBox.scrollTop = chatBox.scrollHeight;

        // 关键：动态触发 MathJax 渲染 LaTeX 公式
        if (window.MathJax && MathJax.typesetPromise) {
            MathJax.typesetPromise([d]);
        }
    }

    // 4. 增强型复制（解决微信兼容性）
    window.copyToClipboard = (str) => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(str).then(() => alert('逻辑已复制')).catch(() => fallbackCopy(str));
        } else {
            fallbackCopy(str);
        }
    };

    function fallbackCopy(str) {
        const el = document.createElement('textarea');
        el.value = str;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert('微信号已复制（兼容模式）');
    }

    if (sendBtn) sendBtn.onclick = handleSend;
    userInput.onkeyup = (e) => { if (e.key === 'Enter') handleSend(); };
});
