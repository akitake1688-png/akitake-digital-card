document.addEventListener('DOMContentLoaded', () => {
    const ChatSystem = {
        knowledge: [],

        async init() {
            try {
                const response = await fetch('knowledge.json');
                this.knowledge = await response.json();
                this.bindEvents();
            } catch (e) { console.error("数据加载失败"); }
        },

        bindEvents() {
            // 右侧聊天
            document.getElementById('send-btn').onclick = () => this.handleAction();
            document.getElementById('user-input').onkeydown = (e) => { if(e.key === 'Enter') this.handleAction(); };

            // 左侧逻辑 (通过 Class 控制，完美匹配 CSS)
            const initial = document.querySelector('.initial-card');
            const menu = document.querySelector('.menu-card');

            document.getElementById('expandButton').onclick = () => {
                initial.classList.add('hidden');
                menu.classList.remove('hidden');
            };

            document.getElementById('backButton').onclick = () => {
                menu.classList.add('hidden');
                initial.classList.remove('hidden');
            };

            document.querySelectorAll('.menu-button').forEach(btn => {
                btn.onclick = () => {
                    menu.classList.add('hidden');
                    document.getElementById(btn.dataset.target).classList.remove('hidden');
                };
            });

            document.querySelectorAll('.close-content').forEach(btn => {
                btn.onclick = () => {
                    btn.closest('.content-card').classList.add('hidden');
                    menu.classList.remove('hidden');
                };
            });
        },

        handleAction() {
            const input = document.getElementById('user-input');
            const text = input.value.trim();
            if (!text) return;

            this.renderMessage(text, 'user-message');
            
            setTimeout(() => {
                const match = this.knowledge.find(i => i.keywords.some(k => text.includes(k)));
                const response = match ? match.response : "这个问题建议咨询秋武老师（微信：qiuwu999）。";
                this.renderMessage(response, 'ai-message');
            }, 500);
            input.value = '';
        },

        renderMessage(text, className) {
            const body = document.getElementById('chat-body');
            const div = document.createElement('div');
            div.className = `message ${className}`;
            div.innerHTML = text;
            body.appendChild(div);
            body.scrollTop = body.scrollHeight;
        }
    };
    ChatSystem.init();
});
