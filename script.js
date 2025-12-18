document.addEventListener('DOMContentLoaded', () => {
    // 语料库：核心映射逻辑
    const responses = {
        "核心优势": "秋武流的核心在于**理科思维建模**。我们利用数据模型拆解招生官心理，$P(录取|特质)$ 的逻辑重构，让信息差转化为你的升学胜率。",
        "辅导模式": "推行**三方共赢逻辑**：机构端与结果挂钩，学员端专注科研构建。通过『研究计划书』的高频磨合，实现思维层面的彻底进化。",
        "联系": "请添加主理人微信：**qiuwu999**。提示：最好的肥料是失败后的觉醒。点击右侧按钮复制或直接搜索，开启你的东大基准逻辑进化。",
        "默认": "该关键词的逻辑模型正在构建中。建议尝试：『核心优势』、『费用』或『面试』。"
    };

    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const navButtons = document.querySelectorAll('.nav-card');
    
    let isTyping = false;

    // 解决 Favicon 404
    const fixFavicon = () => {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">秋</text></svg>';
        document.head.appendChild(link);
    };
    fixFavicon();

    // 打字机渲染引擎
    async function typeOutput(text, container) {
        isTyping = true;
        let i = 0;
        container.innerHTML = "";
        
        return new Promise(resolve => {
            const timer = setInterval(() => {
                if (i < text.length) {
                    container.innerHTML += text.charAt(i);
                    i++;
                    chatWindow.scrollTop = chatWindow.scrollHeight;
                } else {
                    clearInterval(timer);
                    isTyping = false;
                    // 触发 MathJax 渲染
                    if (window.MathJax && window.MathJax.typeset) {
                        window.MathJax.typeset([container]);
                    }
                    resolve();
                }
            }, 25);
        });
    }

    // 处理消息发送
    async function handleSend(key) {
        if (!key || isTyping) return;

        // 用户消息气泡
        const userDiv = document.createElement('div');
        userDiv.className = 'message user';
        userDiv.textContent = key;
        chatWindow.appendChild(userDiv);
        
        userInput.value = "";
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // 机器人响应逻辑
        const botDiv = document.createElement('div');
        botDiv.className = 'message bot';
        chatWindow.appendChild(botDiv);

        const reply = responses[key] || responses["默认"];
        await typeOutput(reply, botDiv);
    }

    // 按钮点击监听
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const trigger = btn.getAttribute('data-trigger');
            handleSend(trigger);
        });
    });

    // 输入框监听
    sendBtn.addEventListener('click', () => handleSend(userInput.value.trim()));
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend(userInput.value.trim());
    });

    console.log("秋武流系统调试完成，逻辑引擎就绪。");
});
