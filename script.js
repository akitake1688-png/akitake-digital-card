(function() {
    "use strict";

    const AKI_CONFIG = {
        responses: {
            "核心优势": "【秋武流：理科思维重构】<br><br>1. **理科定义**：利用博弈论拆解申请模型。公式为：$$P(A|B) = \\frac{P(B|A)P(A)}{P(B)}$$<br>2. **逻辑内核**：拒绝感性叙述，将履历数据化，寻找教授无法拒绝的『逻辑奇点』。",
            "辅导模式": "【三方共赢逻辑】<br><br>我们建立的是一种利益对齐机制：<br>- **0元方案**：通过机构端合作抵充费用。<br>- **深度负责**：打破传统中介的信息差，提供『研究计划书』的高频对审与学术进化。",
            "联系": "【预约咨询：终局思维】<br><br>请添加主理人微信号：**qiuwu999**<br><br>提示：在迷茫时寻找答案是本能，在逻辑中寻找胜率是本事。期待与你在名校之门交汇。",
            "default": "正在分析您的逻辑需求... 建议尝试点击『核心优势』或输入关键词查询理科考点（如：微分、酯化）。"
        },
        typeSpeed: 20
    };

    let isTyping = false;

    function init() {
        const chatWindow = document.getElementById('chat-window');
        const userInput = document.getElementById('user-input');
        const sendBtn = document.getElementById('send-btn');
        const navCards = document.querySelectorAll('.nav-card');

        async function renderResponse(triggerKey) {
            if (isTyping || !triggerKey) return;
            
            appendMessage(triggerKey, 'user');
            const botMsgDiv = appendMessage("", 'bot');
            
            // 查找关键词（包含模糊匹配）
            let responseText = AKI_CONFIG.responses[triggerKey];
            if(!responseText) {
                // 简单的关键词匹配尝试
                const match = Object.keys(AKI_CONFIG.responses).find(k => triggerKey.includes(k));
                responseText = match ? AKI_CONFIG.responses[match] : AKI_CONFIG.responses.default;
            }
            
            await typeWriter(responseText, botMsgDiv);
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
            
            // 预处理标签
            const tokens = text.match(/<[^>]+>|[^<]+/g) || [text];
            
            return new Promise(resolve => {
                let tokenIndex = 0;
                function printToken() {
                    if (tokenIndex < tokens.length) {
                        const token = tokens[tokenIndex];
                        if (token.startsWith('<')) {
                            element.innerHTML += token; // HTML标签直接插入
                            tokenIndex++;
                            setTimeout(printToken, 0);
                        } else {
                            let charIndex = 0;
                            function printChar() {
                                if (charIndex < token.length) {
                                    element.innerHTML += token.charAt(charIndex);
                                    charIndex++;
                                    chatWindow.scrollTop = chatWindow.scrollHeight;
                                    setTimeout(printChar, AKI_CONFIG.typeSpeed);
                                } else {
                                    tokenIndex++;
                                    printToken();
                                }
                            }
                            printChar();
                        }
                    } else {
                        isTyping = false;
                        if (window.MathJax) {
                            MathJax.Hub.Queue(["Typeset", MathJax.Hub, element]);
                        }
                        resolve();
                    }
                }
                printToken();
            });
        }

        navCards.forEach(card => {
            card.addEventListener('click', () => renderResponse(card.getAttribute('data-trigger')));
        });

        sendBtn.addEventListener('click', () => {
            const val = userInput.value.trim();
            if (val) { renderResponse(val); userInput.value = ""; }
        });

        userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendBtn.click(); });
    }

    if (document.readyState === 'complete') { init(); } 
    else { window.addEventListener('load', init); }
})();
