/**
 * 秋武流咨询室 - 核心逻辑引擎 (V2.7 修复版)
 * 适配 HTML 结构：.nav-card / data-trigger / #chat-window
 */
const AKI_SYSTEM = {
    state: { isProcessing: false, lastToast: null },

    // 语料库：键名必须与 HTML 中的 data-trigger 严格对应
    knowledgeBase: {
        '核心优势': {
            title: "核心优势：信息差与博弈",
            content: "低分高录的本质是‘认知偏差’。当他人因不自信放弃 6 月 EJU 时，秋武流主张：只需‘受验票’即可开启校内考博弈。逻辑重构后的面试表现，才是决定录取的软实力核心。记住：‘再现性’不是结果一致，而是偏差的可说明性。"
        },
        '辅导模式': {
            title: "辅导模式：三方共赢逻辑",
            content: "商业逻辑极其透明：机构支付介绍费等同于替您支付了我的咨询费。您省钱，机构获客，我获益。这套‘三方良し’的闭环确保了 100% 的负责态度。专注于‘研究计划构建’和‘教授心理博弈’。"
        },
        '联系': {
            title: "预约咨询：微信号 qiuwu999",
            content: "复杂的背景需要‘终局思维’下的针对性重构。微信：qiuwu999。点击右侧按钮或复制微信号，开启你的东大基准逻辑进化。记住：最好的肥料是失败后的觉醒。"
        }
    },

    init() {
        console.log("秋武流逻辑引擎加载成功...");
        this.fixResourceErrors();
        this.bindEvents();
        this.initMathJax();
    },

    fixResourceErrors() {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon'; link.rel = 'shortcut icon';
        link.href = 'data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
        document.head.appendChild(link);
    },

    bindEvents() {
        // 绑定左侧卡片点击
        document.querySelectorAll('.nav-card').forEach(card => {
            card.onclick = () => {
                const trigger = card.getAttribute('data-trigger');
                this.triggerResponse(trigger, card);
            };
        });

        // 绑定发送按钮
        const sendBtn = document.getElementById('send-btn');
        if (sendBtn) {
            sendBtn.onclick = () => this.handleUserInput();
        }
        
        // 绑定输入框回车
        const userInput = document.getElementById('user-input');
        if (userInput) {
            userInput.onkeypress = (e) => { if (e.key === 'Enter') this.handleUserInput(); };
        }
    },

    async handleUserInput() {
        const input = document.getElementById('user-input');
        const text = input.value.trim();
        if (!text || this.state.isProcessing) return;
        
        this.appendMessage('user', text);
        input.value = '';

        // 简易逻辑匹配
        if (text.includes('费') || text.includes('模')) await this.triggerResponse('辅导模式');
        else if (text.includes('优') || text.includes('高')) await this.triggerResponse('核心优势');
        else await this.triggerResponse('联系');
    },

    appendMessage(role, text) {
        const window = document.getElementById('chat-window');
        const msg = document.createElement('div');
        msg.className = `msg ${role}`;
        msg.innerText = text;
        window.appendChild(msg);
        window.scrollTop = window.scrollHeight;
    },

    async triggerResponse(trigger, element) {
        if (this.state.isProcessing || !this.knowledgeBase[trigger]) return;
        this.state.isProcessing = true;

        const chatWindow = document.getElementById('chat-window');
        const data = this.knowledgeBase[trigger];

        // UI 激活态切换
        document.querySelectorAll('.nav-card').forEach(b => b.classList.remove('active'));
        if (element) element.classList.add('active');

        // 创建 Bot 消息
        const botMsg = document.createElement('div');
        botMsg.className = 'msg bot';
        botMsg.innerHTML = `<b style="color:var(--aki-accent)">${data.title}</b><br><span id="typing-text"></span>`;
        chatWindow.appendChild(botMsg);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        await this.typeWriter(botMsg.querySelector('#typing-text'), data.content);

        if (window.MathJax) {
            window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, botMsg]);
        }
        this.state.isProcessing = false;
    },

    async typeWriter(element, text) {
        for (let char of text) {
            element.innerHTML += char;
            const delay = (['。', '！', '？', '；'].includes(char)) ? 400 : 30;
            await new Promise(r => setTimeout(r, delay));
        }
    },

    showToast(message) {
        if (this.state.lastToast) this.state.lastToast.remove();
        const toast = document.createElement('div');
        toast.className = 'aki-toast';
        toast.innerText = message;
        document.body.appendChild(toast);
        this.state.lastToast = toast;
        setTimeout(() => toast.remove(), 4000);
    },

    initMathJax() {
        if (window.MathJax) {
            window.MathJax.Hub.Config({ tex2jax: { inlineMath: [['$', '$']] } });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => AKI_SYSTEM.init());

// 兼容全局复制函数
function copyTextToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("微信号 qiuwu999 已复制。动作很稳，我在微信端等你的逻辑对撞。");
    });
}
