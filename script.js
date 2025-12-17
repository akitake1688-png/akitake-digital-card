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
            const sendBtn = document.getElementById('send-btn');
            const input = document.getElementById('user-input');
            if (sendBtn) sendBtn.onclick = () => this.handleAction();
            if (input) input.onkeydown = (e) => { if (e.key === 'Enter') this.handleAction(); };

            const expandBtn = document.getElementById('expandButton');
            const backBtn = document.getElementById('backButton');
            const initialCard = document.querySelector('.initial-card');
            const menuCard = document.querySelector('.menu-card');

            if (expandBtn) {
                expandBtn.onclick = () => {
                    initialCard.classList.add('hidden');
                    menuCard.classList.remove('hidden');
                };
            }
            if (backBtn) {
                backBtn.onclick = () => {
                    menuCard.classList.add('hidden');
                    initialCard.classList.remove('hidden');
                };
            }

            document.querySelectorAll('.menu-button').forEach(btn => {
                btn.onclick = () => {
                    const target = document.getElementById(btn.dataset.target);
                    if (target) {
                        menuCard.classList.add('hidden');
                        target.classList.remove('hidden');
                    }
                };
            });

            document.querySelectorAll('.close-content').forEach(cb => {
                cb.onclick = () => {
                    cb.closest('.content-card').classList.add('hidden');
                    menuCard.classList.remove('hidden');
                };
            });
        },

        handleAction() {
            const input = document.getElementById('user-input');
            const text = input.value.trim();
            if (!text) return;

            this.renderMessage(text, 'user-message');
            this.updateContext(text);
            
            const response = this.generateResponse(text);
            setTimeout(() => {
                this.renderMessage(response, 'ai-message');
                if (window.MathJax) MathJax.typeset();
                const body = document.getElementById('chat-body');
                body.scrollTop = body.scrollHeight;
            }, 400);
            input.value = '';
        },

        updateContext(text) {
            const subjects = ["生物", "物理", "数学", "理工", "化学", "经济", "工科"];
            for (let sub of subjects) {
                if (text.includes(sub)) { this.currentSubject = sub; break; }
            }
        },

        generateResponse(text) {
            let match = this.knowledge.find(i => i.keywords.some(k => text.includes(k)));
            if (!match) return "这个问题触及了考学的底层逻辑。建议先告知你的**专业方向**，或者咨询关于**‘费用模式’**与**‘面试细节’**。";

            let responseHtml = match.response
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            if (this.currentSubject && (match.category.startsWith('academic') || text.includes('什么'))) {
                const prefix = `<div class="sns-comment">
                    📢 <strong>秋武导师点评：</strong><br>
                    针对你的【${this.currentSubject}】背景，这类问题不能单纯背诵。教授想看的是你作为研究者的“本能反应”。建议从逻辑底层重构答案。
                </div>`;
                responseHtml = prefix + responseHtml;
            }
            return responseHtml;
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
