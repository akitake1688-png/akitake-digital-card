document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const detailCard = document.getElementById('detailCard');
    const expandBtn = document.getElementById('expandButton');
    const backBtn = document.getElementById('backButton');

    // 1. 核心知识库 (提炼自 PDF)
    const knowledgeBase = [
        {
            keys: ["费用", "钱", "收费", "免费"],
            res: "【秋武流：商业逻辑】\n\n💰 **核心模式**：通过我进入合作私塾，您无需支付咨询费。加微信：**qiuwu999** 获取透明报价。"
        },
        {
            keys: ["面试", "口试", "细节"],
            res: "【秋武流：面试致命细节】\n\n💡 离开时**推回椅子**是日本教授判断学生“读空气”能力的重要指标。$Success \\propto Manners$"
        },
        {
            keys: ["化学", "酯化", "反应式"],
            res: "【理科定义：酯化反应】\n\n🧪 $CH_3COOH + CH_3CH_2OH \\xrightleftharpoons[\\Delta]{H_2SO_4} CH_3COOCH_2CH_3 + H_2O$\n必须强调浓硫酸的吸水作用。"
        },
        {
            keys: ["微分", "定义", "数学"],
            res: "【理科定义：微分】\n\n📐 定义式：$\\lim_{h \\to 0} \\frac{f(a+h) - f(a)}{h}$"
        }
    ];

    // 2. 发送逻辑
    function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        appendMsg(text, 'user');
        userInput.value = '';

        // 模拟 AI 响应
        setTimeout(() => {
            const match = knowledgeBase.find(item => item.keys.some(k => text.includes(k)));
            const reply = match ? match.res : "这个问题触及了考学的底层逻辑。建议输入关键词如“费用”、“面试”或“定义”。";
            appendMsg(reply, 'ai');
        }, 500);
    }

    // 3. 增强渲染与 MathJax 调度
    function appendMsg(text, type) {
        const div = document.createElement('div');
        div.className = `msg ${type}`;
        div.innerHTML = text.replace(/\n/g, '<br>');
        chatBox.appendChild(div);
        
        // 自动滚动
        chatBox.scrollTop = chatBox.scrollHeight;

        // 触发 MathJax 渲染
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([div]).catch(err => console.log(err));
        }
    }

    // 4. UI 交互调度
    expandBtn.onclick = () => detailCard.classList.add('active');
    backBtn.onclick = () => detailCard.classList.remove('active');

    // 5. 事件绑定
    sendBtn.onclick = handleSend;
    userInput.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };

    // 6. 复制功能 (增强兼容性)
    window.copyToClipboard = (str) => {
        const el = document.createElement('textarea');
        el.value = str;
        document.body.appendChild(el);
        el.select();
        try {
            document.execCommand('copy');
            alert('微信号 qiuwu999 已复制');
        } catch (e) {
            alert('请手动添加微信：' + str);
        }
        document.body.removeChild(el);
    };
});
