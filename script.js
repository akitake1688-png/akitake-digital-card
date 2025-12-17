document.addEventListener('DOMContentLoaded', () => {
    const ChatSystem = {
        knowledge: [],
        currentSubject: null,

        async init() {
            try {
                const response = await fetch('knowledge.json');
                this.knowledge = await response.json();
                this.bindEvents();
            } catch (e) { console.error("数据加载失败"); }
        },

        bindEvents() {
            const btn = document.getElementById('send-btn');
            const input = document.getElementById('user-input');
            if (btn) btn.onclick = () => this.handleAction();
            if (input) input.onkeydown = (e) => { if (e.key === 'Enter') this.handleAction(); };
        },

        handleAction() {
            const input = document.getElementById('user-input');
            const text = input.value.trim();
            if (!text) return;

            this.renderMessage(text, 'user-message');
            this.updateContext(text); // 背景提取
            
            const response = this.generateResponse(text);
            setTimeout(() => {
                this.renderMessage(response, 'ai-message');
                const body = document.getElementById('chat-body');
                body.scrollTop = body.scrollHeight;
            }, 500);
            input.value = '';
        },

        // 背景提取优化：只存关键词，不存整句话
        updateContext(text) {
            const subjects = ["生物", "物理", "数学", "理工", "农学", "法学", "经济", "工科"];
            for (let sub of subjects) {
                if (text.includes(sub)) {
                    this.currentSubject = sub;
                    break;
                }
            }
        },

        generateResponse(text) {
            // 1. 意图分发
            let match = this.knowledge.find(i => i.keywords.some(k => text.includes(k)));
            
            // 2. 默认兜底（秋武流引导）
            if (!match) {
                return "这个问题触及了考学的底层逻辑。为了给出‘东大基准’的判断，建议先告知你的**本科专业**或**研究方向**，或者直接咨询关于**‘费用模式’**与**‘研究计划重构’**。";
            }

            let responseHtml = match.response;

            // 3. 背景缝合逻辑（仅针对学术类问题触发）
            if (this.currentSubject && (match.category.startsWith('academic') || text.includes('什么'))) {
                const prefix = `
                    <div style="border-left: 4px solid #ff4d4f; background: rgba(255,77,79,0.05); padding: 12px; margin-bottom: 15px; border-radius: 4px;">
                        📢 <strong>秋武导师点评：</strong><br>
                        既然你具备【${this.currentSubject}】背景，在处理“${text.substring(0,10)}...”这类问题时，绝对不能停留在表面，要展现研究者的本能。
                    </div>`;
                responseHtml = prefix + responseHtml;
            }

            return responseHtml.replace(/\n/g, '<br>');
        },

        renderMessage(text, className) {
            const container = document.getElementById('chat-body');
            const div = document.createElement('div');
            div.className = `message ${className}`;
            div.innerHTML = text;
            container.appendChild(div);
        }
    };

    ChatSystem.init();
});
