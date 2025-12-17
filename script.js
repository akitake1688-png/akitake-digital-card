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
            // 聊天发送
            const btn = document.getElementById('send-btn');
            const input = document.getElementById('user-input');
            if (btn) btn.onclick = () => this.handleAction();
            if (input) input.onkeydown = (e) => { if (e.key === 'Enter') this.handleAction(); };

            // 名片展开与返回 (针对 HTML 结构)
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

            // 详情展示与关闭
            document.querySelectorAll('.menu-button').forEach(b => {
                b.onclick = () => {
                    const target = document.getElementById(b.dataset.target);
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
                const body = document.getElementById('chat-body');
                body.scrollTop = body.scrollHeight;
            }, 500);
            input.value = '';
        },

        updateContext(text) {
            const subjects = ["生物", "物理", "数学", "理工", "农学", "法学", "经济", "工科"];
            for (let sub of subjects) {
                if (text.includes(sub)) { this.currentSubject = sub; break; }
            }
        },

        generateResponse(text) {
            let match = this.knowledge.find(i => i.keywords.some(k => text.includes(k)));
            if (!match) return "这个问题触及了考学的底层逻辑。建议先告知你的**专业方向**或咨询**‘费用模式’**。";

            let responseHtml = match.response;
            if (this.currentSubject && (match.category.startsWith('academic') || text.includes('什么'))) {
                const prefix = `<div style="border-left:4px solid #ff4d4f; background:rgba(255,77,79,0.05); padding:12px; margin-bottom:15px; border-radius:4px;">
                    📢 <strong>秋武导师点评：</strong><br>既然你具备【${this.currentSubject}】背景，处理“${text.substring(0,10)}...”时要展现研究者的本能。</div>`;
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
