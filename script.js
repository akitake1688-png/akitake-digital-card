document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const detailCard = document.getElementById('detailCard');
    const brandSide = document.getElementById('brandSide');

    let kb = [];

    // 加载逻辑库并处理容错
    fetch('knowledge.json')
        .then(r => r.json())
        .then(data => { kb = data; console.log("✅ 逻辑库就绪"); })
        .catch(() => { console.warn("降级模式启动"); });

    // 调度：打开/关闭详情
    window.openDetail = () => detailCard.classList.add('active');
    window.closeDetail = () => detailCard.classList.remove('active');

    function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        append(text, 'user');
        userInput.value = '';

        // 交互反馈：左侧卡片微动暗示 AI 响应
        brandSide.style.transform = "scale(0.98)";
        setTimeout(() => brandSide.style.transform = "scale(1)", 100);

        setTimeout(() => {
            const match = kb.find(item => item.keywords.some(k => text.includes(k)));
            const reply = match ? match.response : "【逻辑未对齐】建议直接联系秋武老师微信：qiuwu999。";
            append(reply, 'ai');
        }, 600);
    }

    function append(t, type) {
        const d = document.createElement('div');
        d.className = `msg ${type}`;
        d.innerHTML = t.replace(/\n/g, '<br>');
        chatBox.appendChild(d);
        chatBox.scrollTop = chatBox.scrollHeight;

        // 强制公式重绘
        if (window.MathJax && MathJax.typesetPromise) {
            MathJax.typesetPromise([d]);
        }
    }

    // 复制功能适配微信
    window.copyToClipboard = (s) => {
        const fallback = () => {
            const el = document.createElement('textarea');
            el.value = s; document.body.appendChild(el); el.select();
            document.execCommand('copy'); document.body.removeChild(el);
            alert('微信号已复制');
        };
        if (navigator.clipboard) {
            navigator.clipboard.writeText(s).then(() => alert('微信号已复制')).catch(fallback);
        } else {
            fallback();
        }
    };

    sendBtn.onclick = handleSend;
    userInput.onkeyup = (e) => { if (e.key === 'Enter') handleSend(); };
});
