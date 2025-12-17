document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const detailCard = document.getElementById('detailCard');

    // 模拟从 knowledge.json 加载的逻辑库
    const knowledgeBase = [
        {
            "keywords": ["费用", "免费", "模式"],
            "response": "【秋武辅导模式：透明、靠谱的商业逻辑】🧡\\n\\n留学的每一分钱都该花在刀刃上。我们提供清晰透明的收费模式。\\n\\n1. **强推免费模式**：通过秋武老师推荐进入合作私塾，辅导费由机构支付。您 **0 额外支出**。\\n2. **定制收费**：若不走机构渠道，也提供独立的文书修改服务。"
        },
        {
            "keywords": ["微分", "导数"],
            "response": "【秋武流：理科思维】📐\\n\\n必须强调极限 $\\lim_{h \\to 0} \\frac{f(a+h) - f(a)}{h}$ 的存在性。在东大基准下，逻辑的严密性高于答案的正确性。"
        }
    ];

    window.openDetail = () => detailCard.classList.add('active');
    window.closeDetail = () => detailCard.classList.remove('active');

    function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        appendMsg(text, 'user');
        userInput.value = '';

        setTimeout(() => {
            let match = knowledgeBase.find(item => item.keywords.some(kw => text.includes(kw)));
            let response = match ? match.response : "💡 **秋武建议**：您提问的角度很有趣！建议针对“面试礼仪”、“跨专业”或“研究计划书”进行深入提问。";
            appendMsg(response, 'ai');
        }, 600);
    }

    function appendMsg(t, type) {
        const d = document.createElement('div');
        d.className = `msg ${type}`;
        d.innerHTML = t.replace(/\\n/g, '<br>');
        chatBox.appendChild(d);
        chatBox.scrollTop = chatBox.scrollHeight;

        if (window.MathJax && MathJax.typesetPromise) {
            MathJax.typesetPromise([d]);
        }
    }

    sendBtn.onclick = handleSend;
    userInput.onkeyup = (e) => { if (e.key === 'Enter') handleSend(); };
});
