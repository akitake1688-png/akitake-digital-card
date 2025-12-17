document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const detailCard = document.getElementById('detailCard');

    // 1. 分层调度函数
    window.openDetail = () => detailCard.classList.add('active');
    window.closeDetail = () => detailCard.classList.remove('active');

    // 2. 核心发送逻辑
    function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        appendMsg(text, 'user');
        userInput.value = '';

        // 模拟 AI 逻辑检索
        setTimeout(() => {
            let response = "【秋武流：逻辑对齐失败】秋武老师建议：请针对面试礼仪、理科公式（如微分、酯化）进行具体提问。微信：qiuwu999";
            
            // 简单关键词匹配逻辑
            if(text.includes("微分")) response = "【秋武流：理系口頭試問】\\n必须强调极限 $\\lim_{h \\to 0} \\frac{f(a+h) - f(a)}{h}$ 存在。";
            if(text.includes("面试")) response = "【秋武流：面试隐藏评分】\\n离场时请务必将椅子推回原位。这是对学术场所的敬畏心考核。";
            if(text.includes("费用")) response = "【秋武流：服务模式】\\n通过合作机构申请可享 0 额外费用的导师级文书辅导。";

            appendMsg(response, 'ai');
        }, 600);
    }

    function appendMsg(t, type) {
        const d = document.createElement('div');
        d.className = `msg ${type}`;
        d.innerHTML = t.replace(/\\n/g, '<br>');
        chatBox.appendChild(d);
        chatBox.scrollTop = chatBox.scrollHeight;

        // 触发 MathJax 渲染
        if (window.MathJax && MathJax.typesetPromise) {
            MathJax.typesetPromise([d]).catch(err => console.log(err));
        }
    }

    // 3. 复制功能（增强容错版）
    window.copyToClipboard = (str) => {
        const fallback = () => {
            const el = document.createElement('textarea');
            el.value = str; document.body.appendChild(el); el.select();
            document.execCommand('copy'); document.body.removeChild(el);
            alert('微信号已复制');
        };
        if (navigator.clipboard) {
            navigator.clipboard.writeText(str).then(() => alert('微信号已复制')).catch(fallback);
        } else { fallback(); }
    };

    sendBtn.onclick = handleSend;
    userInput.onkeyup = (e) => { if (e.key === 'Enter') handleSend(); };
});
