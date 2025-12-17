document.addEventListener('DOMContentLoaded', () => {
    const ChatSystem = {
        knowledge: [],
        currentSubject: null,

        async init() {
            try {
                // 确保文件名一致
                const response = await fetch('knowledge.json');
                if (!response.ok) throw new Error('无法加载知识库');
                this.knowledge = await response.json();
                this.bindEvents();
            } catch (e) {
                console.error("数据加载失败:", e);
            }
        },

        bindEvents() {
            // 1. 聊天逻辑
            const sendBtn = document.getElementById('send-btn');
            const userInput = document.getElementById('user-input');
            if (sendBtn) sendBtn.onclick = () => this.handleAction();
            if (userInput) userInput.onkeydown = (e) => { if (e.key === 'Enter') this.handleAction(); };

            // 2. 名片展开/收起 (对照 HTML 的 id)
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

            // 3. 详情页展示
            document.querySelectorAll('.menu-button').forEach(button => {
                button.onclick = () => {
                    const targetId = button.getAttribute('data-target');
                    const targetEl = document.getElementById(targetId);
                    if (targetEl) {
                        menuCard.classList.add('hidden');
                        targetEl.classList.remove('hidden');
                    }
                };
            });

            // 4. 关闭详情页回到菜单
            document.querySelectorAll('.close-content').forEach(closeBtn => {
                closeBtn.onclick = () => {
                    closeBtn.closest('.content-card').classList.add('hidden');
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
                if (text.includes(sub)) {
                    this.currentSubject = sub;
                    break;
                }
            }
        },

        generateResponse(text) {
            let match = this.knowledge.find(i => i.keywords.some(k => text.includes(k)));
            
            if (!match) {
                return "这个问题触及了考学的底层逻辑。为了给出‘东大基准’的判断，建议先告知你的**本科专业**或**研究方向**，或者直接咨询关于**‘费用模式’**与**‘研究计划重构’**。";
            }

            let responseHtml = match.response;

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
