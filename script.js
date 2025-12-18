(function() {
    "use strict";

    const AKI_CONFIG = {
        responses: {
            "核心优势": "【秋武流：理科思维重构】<br><br>1. **理科定义**：利用博弈论拆解申请模型。公式为 $$P(A|B) = \\frac{P(B|A)P(A)}{P(B)}$$<br>2. **逻辑内核**：拒绝感性叙述，将履历数据化，寻找教授无法拒绝的『逻辑奇点』。",
            "辅导模式": "【三方共赢逻辑】<br><br>我们建立的是一种利益对齐机制：<br>- **0元方案**：通过机构端合作抵充费用。<br>- **深度负责**：打破传统中介的信息差，提供『研究计划书』的高频对审与学术进化。",
            "联系": "【预约咨询：终局思维】<br><br>请添加主理人微信号：**qiuwu999**<br><br>提示：在迷茫时寻找答案是本能，在逻辑中寻找胜率是本事。期待与你在名校之门交汇。",
            "default": "正在分析您的逻辑需求... 建议尝试点击『核心优势』或输入『面试』。"
        },
        typeSpeed: 25
    };

    let isTyping = false;

    function init() {
        const chatWindow = document.getElementById('chat-window');
        const userInput = document.getElementById('user-input');
        const sendBtn = document.getElementById('send-btn');
        const navCards = document.querySelectorAll('.nav-card');

        if (!chatWindow || !sendBtn) return;

        // 核心渲染函数
        async function renderResponse(triggerKey) {
            if (isTyping) return;
            
            // 用户侧气泡
            appendMessage(triggerKey, 'user');

            // 机器人侧气泡
            const botMsgDiv = appendMessage("", 'bot');
            const fullText = AKI_CONFIG.responses[triggerKey] || AKI_CONFIG.responses.default;
            
            await typeWriter(fullText, botMsgDiv);
        }

        function appendMessage(text, role) {
            const div = document.createElement('div');
            div.className = `msg ${role}`;
            div.innerHTML = text;
            chatWindow.appendChild(div);
            chatWindow.scrollTop = chatWindow.scrollHeight;
            return div;
        }

        async function typeWriter(text, element) {
            isTyping = true;
            let i = 0;
            element.innerHTML = "";
            
            return new Promise(resolve => {
                const interval = setInterval(() => {
                    if (i < text.length) {
                        element.innerHTML += text.charAt(i);
                        i++;
                        chatWindow.scrollTop = chatWindow.scrollHeight;
                    } else {
                        clearInterval(interval);
                        isTyping = false;
                        // MathJax 2.7.9 渲染调用
                        if (window.MathJax) {
                            MathJax.Hub.Queue(["Typeset", MathJax.Hub, element]);
                        }
                        resolve();
                    }
                }, AKI_CONFIG.typeSpeed);
            });
        }

        // 事件挂载
        navCards.forEach(card => {
            card.addEventListener('click', () => {
                const key = card.getAttribute('data-trigger');
                renderResponse(key);
            });
        });

        sendBtn.addEventListener('click', () => {
            const val = userInput.value.trim();
            if (val) {
                renderResponse(val);
                userInput.value = "";
            }
        });

        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendBtn.click();
        });

        console.log("秋武流系统：逻辑引擎自检通过。");
    }

    // 健壮的加载检测
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
