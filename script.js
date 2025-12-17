/**
 * 东大日本秋武老师 - 数字名片 SOTA 3.0 逻辑栈增强版
 * 1. 记忆栈引擎：支持 3 次连续对话上下文追踪
 * 2. 逻辑解耦：解耦记忆、匹配、与内涵生成模块，确保系统稳定性
 */

const AKITAKE_MASTER_LOGIC = {
    "面试": "【逻辑联动】：日本考学面试核心是‘研究者资质’。正如秋武数据中提到的，教授看重‘思考时的停顿’（少し考えてもよろしいでしょうか）。真正的升维在于‘隐藏分细节’（如：推回椅子、眼神留白）。这种逻辑粘性决定了你是否具备研究者的‘余裕’。",
    "微分": "【学术联动】：教授问微分定义，实质是在考察你对‘瞬时变化率’的动态捕捉能力。研究者不能只看结果，要看‘过程的极限’。这种对微小扰动的敏感度，反映了你未来处理实验误差时的严谨性。",
    "动量": "【学术联动】：动量守恒的本质是系统对‘守恒律’的闭环管理。如果合外力不为零，系统就破裂了。教授通过此题考察你是否具备定义‘实验边界条件’的思维习惯。",
    "代谢": "【学术联动】：生物代谢的‘开放性’是系统恒常性的前提。研究者需要具备‘边界感’：既要与外界交换数据，又要保持内核逻辑的独立性。这不仅是生物学，更是科研工作的态度。",
    "费用": "【模式联动】：辅导费用应是‘风险溢价的对冲’。秋武‘0额外支出’模式是用资源置换中介溢价。这种共赢逻辑是基于东大基准的信任背书。"
};

document.addEventListener('DOMContentLoaded', () => {

    const ChatSystem = {
        knowledge: [],
        // 三级记忆栈，记录最近3轮的核心关键词与背景
        sessionStack: [], 
        
        init() {
            this.loadData();
            this.bindEvents();
        },

        loadData() {
            fetch('knowledge.json')
                .then(r => r.json())
                .then(d => this.knowledge = d)
                .catch(e => console.warn("进入秋武逻辑兜底模式"));
        },

        bindEvents() {
            const sendBtn = document.getElementById('send-btn');
            const userInput = document.getElementById('user-input');
            if (sendBtn) sendBtn.onclick = () => this.handleAction();
            if (userInput) userInput.onkeydown = (e) => { if (e.key === 'Enter') this.handleAction(); };
        },

        handleAction() {
            const input = document.getElementById('user-input');
            const chatBody = document.getElementById('chat-body');
            const text = input.value.trim();
            if (!text || !chatBody) return;

            this.renderMessage(chatBody, text, 'user-message');
            const response = this.generateResponse(text);
            this.renderMessage(chatBody, response, 'ai-message');

            input.value = '';
            chatBody.scrollTop = chatBody.scrollHeight;
        },

        generateResponse(text) {
            // 1. 更新记忆栈：识别专业或核心学科
            const profiles = ["专业", "本科", "背景", "数学", "物理", "化学", "生物"];
            profiles.forEach(p => {
                if (text.includes(p)) {
                    if (this.sessionStack.length >= 3) this.sessionStack.shift();
                    this.sessionStack.push(text);
                }
            });

            // 2. 基础检索
            const baseMatch = this.knowledge
                .sort((a, b) => (b.priority || 0) - (a.priority || 0))
                .find(i => i.keywords.some(k => text.includes(k)));

            // 3. 深度联动匹配
            const insightKey = Object.keys(AKITAKE_MASTER_LOGIC).find(k => text.includes(k));
            let insight = insightKey ? AKITAKE_MASTER_LOGIC[insightKey] : "";

            // 4. 多重联动逻辑拼接（SOTA 3.0 核心）
            let multiLinkage = "";
            if (this.sessionStack.length > 1) {
                const prevContext = this.sessionStack[this.sessionStack.length - 2];
                if (insightKey === "面试" || insightKey === "计划书") {
                    multiLinkage = `\n\n💡 **联动分析：** 结合您之前提到的[${prevContext}]背景，教授在面试中会侧重考察您如何将该学科的‘严谨性’映射到研究计划的‘逻辑缝合’上。请注意保持‘学术余裕’。`;
                }
            }

            // 5. 组装输出
            let finalOutput = insight || (baseMatch ? baseMatch.response : "这是一个有价值的逻辑破绽。请告知您的专业或院校背景，以便我进行针对性诊断。");
            if (baseMatch && insight) finalOutput = `${baseMatch.response}\n\n━━━━━━━━━━━━━━━\n🔍 深度联动：\n${insight}`;
            
            return finalOutput + multiLinkage;
        },

        renderMessage(container, text, className) {
            const div = document.createElement('div');
            div.className = `message ${className}`;
            div.innerHTML = text.replace(/\n/g, '<br>');
            container.appendChild(div);
        }
    };

    // 原有 NavigationSystem 逻辑保持不变...
    ChatSystem.init();
});
