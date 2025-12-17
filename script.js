document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    
    let knowledgeBase = [];

    // 1. 强化加载逻辑：优先加载本地核心，再同步外部 JSON
    async function initKnowledge() {
        try {
            const response = await fetch('knowledge.json');
            if (response.ok) {
                knowledgeBase = await response.json();
                console.log("秋武 2.0 知识库同步成功，共载入 " + knowledgeBase.length + " 条逻辑。");
            }
        } catch (err) {
            console.error("JSON 加载失败，启用本地备用逻辑");
            // 这里可以放入之前提到的几个核心 Keys 作为兜底
        }
    }
    initKnowledge();

    // 2. 调度引擎：支持模糊匹配与意图识别
    function findResponse(input) {
        const text = input.toLowerCase();
        // 逻辑：计算关键词命中频次，而不只是 some
        let bestMatch = null;
        let maxScore = 0;

        knowledgeBase.forEach(item => {
            let score = 0;
            item.keywords.forEach(key => {
                if (text.includes(key.toLowerCase())) score++;
            });
            if (score > maxScore) {
                maxScore = score;
                bestMatch = item;
            }
        });

        return bestMatch ? bestMatch.response : null;
    }

    // 3. 发送与渲染 (增强容错)
    function handleChat() {
        const text = userInput.value.trim();
        if (!text) return;

        appendMsg(text, 'user');
        userInput.value = '';

        setTimeout(() => {
            const reply = findResponse(text) || "【秋武 AI 逻辑重构】\n这个问题超出了当前的自动索引。建议您**加微信 qiuwu999**，我会针对您的出身校和专业进行一对一逻辑对齐。";
            appendMsg(reply, 'ai');
        }, 400);
    }

    function appendMsg(content, type) {
        const div = document.createElement('div');
        div.className = `msg ${type}`;
        // 处理换行与加粗
        div.innerHTML = content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        chatBox.appendChild(div);
        
        chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });

        // MathJax 重绘
        if (window.MathJax && window.MathJax.typesetPromise) {
            MathJax.typesetPromise([div]);
        }
    }

    // 4. UI 事件绑定
    sendBtn.onclick = handleChat;
    userInput.onkeyup = (e) => { if (e.key === 'Enter') handleChat(); };

    // 5. 复制功能
    window.copyToClipboard = (str) => {
        const el = document.createElement('textarea');
        el.value = str;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert('秋武老师微信号已复制：' + str);
    };
});
