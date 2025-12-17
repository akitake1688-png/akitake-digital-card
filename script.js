document.addEventListener('DOMContentLoaded', () => {
    // 核心逻辑库：提炼自 PDF 数据
    const knowledge = [
        {
            keys: ["费用", "钱", "多少钱", "价格", "收费", "免费"],
            res: "【秋武流：商业逻辑与免费机制】\n\n💰 **核心模式**：强烈推荐“免费模式”。通过我推荐进入合作私塾，辅导费由机构承担。您 0 负担获得高端指导。\n\n✅ **逻辑透明**：我是渠道方，机构支付介绍费，这等同于机构为您支付了我的咨询费。加微信：qiuwu999。"
        },
        {
            keys: ["面试", "椅子", "细节", "加分", "表现"],
            res: "【秋武流：面试隐藏加分项】\n\n💡 **致命细节**：\n1. 离开时**静静推回椅子**（直接 +10分）。\n2. 面对不会的问题执行“战术停顿”（少し考えてもよろしいでしょうか）。\n3. 门前再次致谢并鞠躬。这是对学术场所的敬畏心考核。"
        },
        {
            keys: ["酯化", "化学", "东洋大学", "反应式"],
            res: "【秋武流：理系口頭試問——酯化反应】\n\n⚗️ **核心公式**：$CH_3COOH + CH_3CH_2OH \\xrightleftharpoons[\\Delta]{H_2SO_4(浓)} CH_3COOCH_2CH_3 + H_2O$\n\n🧪 **必备要素**：必须强调**浓硫酸**（催化剂+吸水剂）和**加热**。这是东洋大学理工学部的最常考点。"
        },
        {
            keys: ["微分", "定义", "数学", "导数"],
            res: "【秋武流：理系口頭試問——微分定义】\n\n📐 **严谨表述**：必须写出 $\\lim_{h \\to 0} \\frac{f(a+h) - f(a)}{h}$ 存在。\n\n⚠️ **避坑**：符号的随意（如写成 $x \\to 0$）在教授眼中意味着思维崩塌。"
        },
        {
            keys: ["读空气", "压力", "日本文化", "治愈"],
            res: "【秋武流：治愈建议】\n\n🌊 **本质**：『空気を読む』是对非语言信息的敏感度。不必过度焦虑，学会适度的“钝感力”。教授期待的是你作为一个独立研究者的逻辑，而非 100% 的从众。"
        }
    ];

    const chatBody = document.getElementById('chat-body');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // 1. 发送逻辑
    function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        renderMsg(text, 'user-message');
        userInput.value = '';

        setTimeout(() => {
            const match = knowledge.find(item => item.keys.some(k => text.includes(k)));
            const reply = match ? match.res : "这个问题触及了考学的底层逻辑。建议针对**‘费用模式’**、**‘面试细节’**或具体的**‘理科定义’**提问。";
            renderMsg(reply, 'ai-message');
        }, 500);
    }

    function renderMsg(text, cls) {
        const div = document.createElement('div');
        div.className = `message ${cls}`;
        div.innerHTML = text.replace(/\n/g, '<br>');
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;

        // 动态渲染公式
        if (window.MathJax) MathJax.typesetPromise([div]);
    }

    // 2. UI 交互逻辑
    const expandBtn = document.getElementById('expandButton');
    const backBtn = document.getElementById('backButton');
    const initialCard = document.getElementById('initialCard');
    const menuCard = document.getElementById('menuCard');

    expandBtn.onclick = () => { initialCard.classList.add('hidden'); menuCard.classList.remove('hidden'); };
    backBtn.onclick = () => { menuCard.classList.add('hidden'); initialCard.classList.remove('hidden'); };

    document.querySelectorAll('.menu-button').forEach(btn => {
        btn.onclick = () => {
            const target = document.getElementById(btn.dataset.target);
            if (target) target.classList.add('active');
        };
    });

    document.querySelectorAll('.close-content').forEach(cb => {
        cb.onclick = () => cb.closest('.content-card').classList.remove('active');
    });

    // 3. 复制功能
    window.copyToClipboard = (str) => {
        const el = document.createElement('textarea');
        el.value = str;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert('微信号已复制：' + str);
    };

    sendBtn.onclick = handleSend;
    userInput.onkeyup = (e) => { if (e.key === 'Enter') handleSend(); };
});
