document.addEventListener('DOMContentLoaded', () => {
    // 元素获取与报错拦截
    const getEl = (id) => document.getElementById(id);
    const expandBtn = getEl('expandButton');
    const backBtn = getEl('backButton');
    const initialCard = getEl('initialCard');
    const menuCard = getEl('menuCard');
    const chatBody = getEl('chat-body');
    const sendBtn = getEl('send-btn');
    const userInput = getEl('user-input');

    // 逻辑 1: 名片展开与返回
    if (expandBtn && initialCard && menuCard) {
        expandBtn.onclick = () => { initialCard.classList.add('hidden'); menuCard.classList.remove('hidden'); };
        backBtn.onclick = () => { menuCard.classList.add('hidden'); initialCard.classList.remove('hidden'); };
    }

    // 逻辑 2: 详情展示
    document.querySelectorAll('.menu-button').forEach(btn => {
        btn.onclick = () => {
            const target = getEl(btn.dataset.target);
            if (target) {
                menuCard.classList.add('hidden');
                target.classList.remove('hidden');
            }
        };
    });

    // 逻辑 3: 关闭详情
    document.querySelectorAll('.close-x').forEach(btn => {
        btn.onclick = () => {
            btn.closest('.content-card').classList.add('hidden');
            menuCard.classList.remove('hidden');
        };
    });

    // 逻辑 4: 聊天 (含 JSON 报错处理)
    const sendMessage = async () => {
        const text = userInput.value.trim();
        if (!text) return;

        appendMsg(text, 'user-message');
        userInput.value = '';

        try {
            const res = await fetch('knowledge.json');
            const data = await res.json();
            const match = data.find(i => i.keywords.some(k => text.includes(k)));
            
            setTimeout(() => {
                appendMsg(match ? match.response : "涉及细节请咨询微信：qiuwu999。", 'ai-message');
            }, 400);
        } catch (err) {
            console.error("JSON加载失败，请检查knowledge.json文件格式", err);
        }
    };

    if (sendBtn) sendBtn.onclick = sendMessage;
    if (userInput) userInput.onkeydown = (e) => { if(e.key === 'Enter') sendMessage(); };

    function appendMsg(t, c) {
        const d = document.createElement('div');
        d.className = `message ${c}`;
        d.innerHTML = t;
        chatBody.appendChild(d);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
});
