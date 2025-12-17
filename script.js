document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const detailCard = document.getElementById('detailCard');

    let kb = [];

    // 加载数据
    fetch('knowledge.json')
        .then(r => r.json())
        .then(data => { kb = data; console.log("秋武逻辑库已就绪"); })
        .catch(e => console.error("Data Load Error:", e));

    function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        append(text, 'user');
        userInput.value = '';

        setTimeout(() => {
            const match = kb.find(item => item.keywords.some(k => text.includes(k)));
            const reply = match ? match.response : "建议加微信 qiuwu999 深度对齐逻辑。";
            append(reply, 'ai');
        }, 400);
    }

    function append(t, type) {
        const d = document.createElement('div');
        d.className = `msg ${type}`;
        d.innerHTML = t.replace(/\n/g, '<br>');
        chatBox.appendChild(d);
        chatBox.scrollTop = chatBox.scrollHeight;
        if (window.MathJax) MathJax.typesetPromise([d]);
    }

    // 安全绑定
    if (sendBtn) sendBtn.onclick = handleSend;
    if (userInput) userInput.onkeyup = (e) => { if (e.key === 'Enter') handleSend(); };

    // 全局函数
    window.openDetail = () => detailCard.classList.add('active');
    window.closeDetail = () => detailCard.classList.remove('active');
    window.copyToClipboard = (s) => {
        navigator.clipboard.writeText(s).then(() => alert('微信号已复制')).catch(() => {
            const el = document.createElement('textarea');
            el.value = s; document.body.appendChild(el); el.select();
            document.execCommand('copy'); document.body.removeChild(el);
            alert('微信号已复制');
        });
    };
});
