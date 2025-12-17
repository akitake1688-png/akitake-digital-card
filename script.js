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
            // --- 右侧聊天功能 ---
            const sendBtn = document.getElementById('send-btn');
            const input = document.getElementById('user-input');
            if (sendBtn) sendBtn.onclick = () => this.handleAction();
            if (input) input.onkeydown = (e) => { if (e.key === 'Enter') this.handleAction(); };

            // --- 左侧名片功能：全覆盖核心 ---
            const expandBtn = document.getElementById('expandButton');
            const backBtn = document.getElementById('backButton');
            const initialCard = document.querySelector('.initial-card');
            const menuCard = document.querySelector('.menu-card');

            // 展开
            if (expandBtn) {
                expandBtn.onclick = () => {
                    initialCard.classList.add('hidden');
                    menuCard.classList.remove('hidden');
                };
            }
            // 返回
            if (backBtn) {
                backBtn.onclick = () => {
                    menuCard.classList.add('hidden');
                    initialCard.classList.remove('hidden');
                };
            }
            // 详情按钮跳转
            document.querySelectorAll('.menu-button').forEach(btn => {
                btn.onclick = () => {
                    const targetId = btn.getAttribute('data-target');
                    menuCard.classList.add('hidden');
                    document.getElementById(targetId).classList.remove('hidden');
                };
            });
            // 关闭详情
            document.querySelectorAll('.close-content').forEach(btn => {
                btn.onclick = () => {
                    btn.closest('.content-card').classList.add('hidden');
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
            }, 500);
            input.value = '';
        },

        updateContext(text) {
            const subjects = ["生物", "物理", "数学", "理工", "工科", "法学"];
            for (let sub of subjects) {
                if (text.includes(sub)) { this.currentSubject = sub; break; }
            }
        },

        generateResponse(text) {
            // 这里执行 PDF 数据的检索匹配
            let match = this.knowledge.find(i => i.keywords.some(k => text.includes(k)));
            if (!match) return "这个问题触及了考学的底层逻辑。请告知你的本科专业，或咨询关于‘费用’与‘面试’。";
            
            let html = match.response;
            if (this.currentSubject && match.category.includes('academic')) {
                html = `<div style="border-left:4px solid red; padding:10px; margin-bottom:10px; background:#fff5f5;">📢 秋武点评：基于你的${this.currentSubject}背景...</div>` + html;
            }
            return html.replace(/\n/g, '<br>');
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
