document.addEventListener('DOMContentLoaded', () => {
    // 基于截图效果重构的结构化语料库
    const corpus = {
        "核心优势": `【核心优势：跨学科思维建模】<br><br>
                    1. **理科定义**：我们将文书重构为“逻辑模型”，通过 $P(录取) = 逻辑 \times 信息差$ 的公式进行推演。<br>
                    2. **东大基准**：拒绝模板化，采用直连教授思维的学术语言。<br>
                    3. **底层逻辑**：挖掘你背景中的“破绽”并转化为“独特潜力”。`,
        "辅导模式": `【辅导模式：透明且负责的闭环】<br><br>
                    - **三方共赢**：机构付费介绍，确保我对学员 100% 负责。<br>
                    - **0元合作**：通过特定渠道实现零学费辅导的博弈方案。<br>
                    - **VIP定制**：从研究计划书到面试模拟的『一问一答』草稿编辑。`,
        "联系": `【预约咨询：直接对话主理人】<br><br>
                微信号：**qiuwu999**<br>
                提示：最好的肥料是失败后的觉醒。复杂的背景需要『终局思维』重构，请添加微信开启进化。`
    };

    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const navButtons = document.querySelectorAll('.nav-card');

    async function showMessage(text, role) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg ${role}`;
        chatWindow.appendChild(msgDiv);
        
        if (role === 'bot') {
            let i = 0;
            const timer = setInterval(() => {
                if (i < text.length) {
                    msgDiv.innerHTML = text.substring(0, i + 1);
                    i++;
                    chatWindow.scrollTop = chatWindow.scrollHeight;
                } else {
                    clearInterval(timer);
                    if (window.MathJax) MathJax.Hub.Queue(["Typeset", MathJax.Hub, msgDiv]);
                }
            }, 15);
        } else {
            msgDiv.textContent = text;
        }
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // 绑定导航按钮
    navButtons.forEach(btn => {
        btn.onclick = () => {
            const type = btn.getAttribute('data-trigger');
            if (corpus[type]) {
                showMessage(type, 'user');
                setTimeout(() => showMessage(corpus[type], 'bot'), 500);
            }
        };
    });

    // 绑定输入框
    const handleManualInput = () => {
        const val = userInput.value.trim();
        if (!val) return;
        showMessage(val, 'user');
        userInput.value = '';
        setTimeout(() => showMessage("该关键词的逻辑正在计算中，请尝试点击左侧核心按钮或添加微信 qiuwu999。", 'bot'), 800);
    };

    sendBtn.onclick = handleManualInput;
    userInput.onkeypress = (e) => { if (e.key === 'Enter') handleManualInput(); };
});
