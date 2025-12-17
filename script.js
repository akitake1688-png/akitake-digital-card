document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const detailCard = document.getElementById('detailCard');

    // 1. 逻辑库配置 (直接整合你的 JSON 数据)
    const knowledgeBase = [
        {
            "keywords": ["酯化", "反应式", "催化剂", "さくさん", "浓硫酸"],
            "response": "【秋武流：理系口頭試問——酯化反应】\\n\\n⚗️ **核心公式**：\\n$CH_3COOH + CH_3CH_2OH \\xrightleftharpoons[\\Delta]{H_2SO_4(浓)} CH_3COOCH_2CH_3 + H_2O$\\n\\n🧪 **考点**：强调浓硫酸的吸水性，产物醋酸乙酯有香味。"
        },
        {
            "keywords": ["微分", "定义", "导数", "limit"],
            "response": "【秋武流：理系口頭試問——微分定义】\\n\\n📐 **严谨表述**：\\n必须强调极限 $\\lim_{h \\to 0} \\frac{f(a+h) - f(a)}{h}$ **存在**。\\n\\n⚠️ **避坑**：不要写成 $x \\to 0$。"
        },
        {
            "keywords": ["面试", "礼仪", "椅子", "推回"],
            "response": "【秋武流：面试隐藏评分】\\n\\n🪑 **致命细节**：\\n离场时请将椅子推回原位。这是考查“读空气”能力及学术敬畏心。"
        },
        {
            "keywords": ["费用", "钱", "多少钱", "价格"],
            "response": "【秋武流：服务模式】\\n\\n💰 **免费机制**：\\n通过合作机构申请可享 0 额外费用的导师级文书辅导。由我亲自控卷。"
        }
    ];

    // 2. 基础功能
    window.openDetail = () => detailCard.classList.add('active');
    window.closeDetail = () => detailCard.classList.remove('active');

    function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        appendMsg(text, 'user');
        userInput.value = '';

        setTimeout(() => {
            // 自动检索逻辑
            let match = knowledgeBase.find(item => 
                item.keywords.some(kw => text.includes(kw))
            );

            let response = match ? match.response : "【秋武流：逻辑对齐中】建议尝试关键词：面试、微分、费用。微信：qiuwu999";
            appendMsg(response, 'ai');
        }, 500);
    }

    function appendMsg(t, type) {
        const d = document.createElement('div');
        d.className = `msg ${type}`;
        d.innerHTML = t.replace(/\\n/g, '<br>');
        chatBox.appendChild(d);
        chatBox.scrollTop = chatBox.scrollHeight;

        // 重新渲染数学公式
        if (window.MathJax && MathJax.typesetPromise) {
            MathJax.typesetPromise([d]).catch(e => console.error(e));
        }
    }

    // 3. 复制与事件绑定
    window.copyToClipboard = (str) => {
        navigator.clipboard.writeText(str).then(() => alert('微信号已复制')).catch(() => {
            const el = document.createElement('textarea');
            el.value = str; document.body.appendChild(el); el.select();
            document.execCommand('copy'); document.body.removeChild(el);
            alert('微信号已复制');
        });
    };

    sendBtn.onclick = handleSend;
    userInput.onkeyup = (e) => { if (e.key === 'Enter') handleSend(); };
});
