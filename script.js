document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const detailCard = document.getElementById('detailCard');
    
    let knowledgeBase = [];

    // 1. 初始化数据加载
    async function loadKnowledge() {
        try {
            const res = await fetch('knowledge.json');
            if (res.ok) {
                knowledgeBase = await res.json();
                console.log("秋武数据同步成功，条数：" + knowledgeBase.length);
            }
        } catch (e) {
            console.error("无法加载 knowledge.json，请检查文件路径");
        }
    }
    loadKnowledge();

    // 2. 匹配逻辑
    function getReply(input) {
        const text = input.toLowerCase();
        let bestMatch = null;
        let highestScore = 0;

        knowledgeBase.forEach(item => {
            let score = 0;
            item.keywords.forEach(key => {
                if (text.includes(key.toLowerCase())) score++;
            });
            if (score > highestScore) {
                highestScore = score;
                bestMatch = item;
            }
        });
        return bestMatch ? bestMatch.response : null;
    }

    // 3. 渲染函数 (包含 MathJax 调度)
    function appendMessage(content, type) {
        const div = document.createElement('div');
        div.className = `msg ${type}`;
        // 处理换行和加粗
        div.innerHTML = content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;

        // 核心容错：动态公式渲染
        if (window.MathJax && window.MathJax.typesetPromise) {
            MathJax.typesetPromise([div]).catch(err => console.warn(err));
        }
    }

    // 4. 发送动作
    function onSend() {
        const val = userInput.value.trim();
        if (!val) return;

        appendMessage(val, 'user');
        userInput.value = '';

        setTimeout(() => {
            const reply = getReply(val) || "【秋武 AI 提示】\n该问题需要深度重构逻辑，请点击左侧按钮查看“核心内涵”或直接加微信 **qiuwu999**。";
            appendMessage(reply, 'ai');
        }, 400);
    }

    // 5. 绑定事件
    sendBtn.onclick = onSend;
    userInput.onkeyup = (e) => { if (e.key === 'Enter') onSend(); };

    // 6. 全局调度函数 (暴露给 HTML)
    window.openDetail = () => detailCard.classList.add('active');
    window.closeDetail = () => detailCard.classList.remove('active');

    window.copyToClipboard = (str) => {
        const el = document.createElement('textarea');
        el.value = str;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert('微信号已复制：' + str);
    };
});
