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
            const sendBtn = document.getElementById('send-btn');
            const input = document.getElementById('user-input');
            if (sendBtn) sendBtn.onclick = () => this.handleAction();
            if (input) input.onkeydown = (e) => { if (e.key === 'Enter') this.handleAction(); };

            // 详情页调度逻辑
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
                btn.onclick = () => this.showDetail(btn.dataset.target);
            });

            document.querySelectorAll('.close-content').forEach(cb => {
                cb.onclick = () => this.hideDetails();
            });
        },

        showDetail(id) {
            const target = document.getElementById(id);
            if (target) target.classList.add('active');
        },

        hideDetails() {
            document.querySelectorAll('.content-card').forEach(c => c.classList.remove('active'));
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
                // 核心：动态触发 MathJax 渲染公式
                if (window.MathJax) MathJax.typesetPromise();
            }, 500);
            input.value = '';
        },

        updateContext(text) {
            const subjects = ["生物", "物理", "数学", "化学", "理科", "文科"];
            for (let sub of subjects) {
                if (text.includes(sub)) { this.currentSubject = sub; break; }
            }
        },

        generateResponse(text) {
            let match = this.knowledge.find(i => i.keywords.some(k => text.includes(k)));
            if (!match) return "这个问题触及了考学的底层逻辑。建议先咨询关于**‘费用模式’**、**‘面试细节’**或具体的**‘理科公式’**。";

            let res = match.response.replace(/\n/g, '<br>');
            
            // SNS 模式：自动追加上下文点评
            if (this.currentSubject && match.category.startsWith('academic')) {
                const comment = `既然你具备【${this.currentSubject}】背景，在处理此类问题时，绝对不能背答案，要展现研究者的本能。`;
                res = this.generateSnsComment(comment) + res;
            }
            
            // 如果提到微信号，附加复制功能建议
            if (text.includes("费用") || text.includes("微信")) {
                res += `<br><button onclick="copyTextToClipboard('qiuwu999')" class="action-link-button" style="margin-top:10px">一键复制秋武老师微信</button>`;
            }

            return res;
        },

        generateSnsComment(text) {
            return `<div class="sns-comment"><strong>📢 秋武导师点评：</strong><br>${text}</div>`;
        },

        renderMessage(text, className) {
            const container = document.getElementById('chat-body');
            const div = document.createElement('div');
            div.className = `message ${className}`;
            div.innerHTML = text;
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
        }
    };

    // 全局复制函数实现
    window.copyTextToClipboard = async function(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                alert('微信号 qiuwu999 已复制到剪贴板');
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('微信号 qiuwu999 已复制 (降级方案)');
            }
        } catch (err) { alert('复制失败，请手动添加微信：qiuwu999'); }
    };

    ChatSystem.init();
});
