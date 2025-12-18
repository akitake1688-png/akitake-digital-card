/**
 * 秋武流数字名片 - 逻辑中枢 (V2.6 Final)
 * 适配 HTML 结构：.nav-card & .chat-window
 */

const AKI_SYSTEM = {
    state: { isProcessing: false },

    // 精确匹配 HTML 的触发词
    knowledgeBase: {
        '核心优势': {
            title: "核心优势：信息差与博弈",
            content: "低分高录的本质是‘认知偏差’。当他人因不自信放弃 6 月 EJU 时，秋武流主张：只需‘受验票’即可开启校内考博弈。逻辑重构后的面试表现，才是决定录取的软实力核心。"
        },
        '辅导模式': {
            title: "辅导模式：三方共赢逻辑",
            content: "商业逻辑极其透明：通过我推荐进入合作私塾，机构支付佣金即覆盖辅导费。您省钱，机构获客，我获益。这套‘三方良し’的闭环确保了 100% 的负责态度。"
        },
        '联系': {
            title: "预约咨询：微信号 qiuwu999",
            content: "复杂的背景需要‘终局思维’下的针对性重构。微信：qiuwu999。点击右侧按钮或复制微信号，开启你的东大基准逻辑进化。记住：最好的肥料是失败后的觉醒。"
        }
    },

    init() {
        console.log("秋武流系统：逻辑链路已对齐 HTML 结构。");
        this.fixIcons();
        this.bindEvents();
        this.initMathJax();
    },

    fixIcons() {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.rel = 'icon'; link.href = 'data:,';
        document.head.appendChild(link);
    },

    bindEvents() {
        // 1. 左侧导航卡片点击
        document.querySelectorAll('.nav-card').forEach(card => {
            card.onclick = () => {
                const trigger = card.getAttribute('data-trigger');
                this.triggerResponse(trigger, card);
            };
        });

        // 2. 右侧输入框发送
        const sendBtn = document.getElementById('send-btn');
        const input = document.getElementById('user-input');
        if (sendBtn) {
            sendBtn.onclick = () => this.handleUserInput();
            input.onkeypress = (e) => { if (e.key === 'Enter') this.handleUserInput(); };
        }
    },

    async handleUserInput() {
        const input = document.getElementById('user-input');
        const text = input.value.trim();
        if (!text || this.state.isProcessing) return;

        // 模拟用户消息
        this.appendMessage('user', text);
        input.value = '';

        // 逻辑匹配：如果输入包含关键字，触发特定回复
        let matched = false;
        for (let key in this.knowledgeBase) {
            if (text.includes(key) || (key === '联系' && text.toLowerCase().includes('微信'))) {
                await this.triggerResponse(key);
                matched = true;
                break;
            }
        }

        if (!matched) {
            await this.triggerResponse('联系'); // 默认引导至联系方式
        }
    },

    async triggerResponse(trigger, element = null) {
        if (this.state.isProcessing) return;
        const data = this.knowledgeBase[trigger];
        if (!data) return;

        this.state.isProcessing = true;
        const chatWindow = document.getElementById('chat-window');

        // UI 激活态切换
        document.querySelectorAll('.nav-card').forEach(c => c.classList.remove('active'));
        if (element) element.classList.add('active');

        // 创建 Bot 消息容器
        const msgDiv = document.createElement('div');
        msgDiv.className = 'msg bot';
        msgDiv.innerHTML = `<b style="color:var(--aki-accent)">${data.title}</b><br><span id="typing-box"></span>`;
        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // 流式打字效果
        await this.typeWriter(msgDiv.querySelector('#typing-box'), data.content);

        // MathJax 渲染
        if (window.MathJax) MathJax.Hub.Queue(["Typeset", MathJax.Hub, msgDiv]);

        this.state.isProcessing = false;
    },

    appendMessage(role, text) {
        const chatWindow = document.getElementById('chat-window');
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg ${role}`;
        msgDiv.innerText = text;
        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    },

    async typeWriter(element, text) {
        for (let char of text) {
            element.innerHTML += char;
            const delay = (['。', '！', '？', '：'].includes(char)) ? 400 : 30;
            await new Promise(r => setTimeout(r, delay));
        }
    },

    initMathJax() {
        if (window.MathJax) {
            MathJax.Hub.Config({ tex2jax: { inlineMath: [['$', '$']] } });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => AKI_SYSTEM.init());

// 兼容你 HTML 中可能存在的 copyTextToClipboard 调用
function copyTextToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("微信号 qiuwu999 已复制。逻辑重构从添加好友开始。");
    });
}
