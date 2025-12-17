/**
 * 秋武老师数字名片 SOTA 3.4 - 深度背景缝合版
 * 修复：专业背景报出后回复无变化的问题
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ SOTA 3.4 终极联动系统启动...");

    const UISystem = {
        init() {
            this.bindCardTransitions();
            this.bindMenuButtons();
            this.bindCloseButtons();
        },
        bindCardTransitions() {
            const expandBtn = document.getElementById('expandButton');
            const backBtn = document.getElementById('backButton');
            const initialCard = document.querySelector('.initial-card');
            const menuCard = document.querySelector('.menu-card');
            if (expandBtn && initialCard && menuCard) {
                expandBtn.onclick = () => { initialCard.classList.add('hidden'); menuCard.classList.remove('hidden'); };
            }
            if (backBtn && initialCard && menuCard) {
                backBtn.onclick = () => { menuCard.classList.add('hidden'); initialCard.classList.remove('hidden'); };
            }
        },
        bindMenuButtons() {
            document.querySelectorAll('.menu-button').forEach(btn => {
                btn.onclick = () => {
                    const targetId = btn.getAttribute('data-target');
                    const targetSection = document.getElementById(targetId);
                    if (targetSection) {
                        document.querySelectorAll('.content-card').forEach(c => c.classList.add('hidden'));
                        targetSection.classList.remove('hidden');
                    }
                };
            });
        },
        bindCloseButtons() {
            document.querySelectorAll('.close-content').forEach(btn => {
                btn.onclick = (e) => { e.target.closest('.content-card').classList.add('hidden'); };
            });
        }
    };

    const ChatSystem = {
        knowledge: [],
        sessionStack: [],

        init() {
            this.loadData();
            this.bindEvents();
        },
        loadData() {
            fetch('knowledge.json').then(r => r.json()).then(d => this.knowledge = d).catch(e => console.warn("数据加载失败"));
        },
        bindEvents() {
            const btn = document.getElementById('send-btn');
            const input = document.getElementById('user-input');
            if (btn) btn.onclick = () => this.handleAction();
            if (input) input.onkeydown = (e) => { if (e.key === 'Enter') this.handleAction(); };
        },
        handleAction() {
            const input = document.getElementById('user-input');
            const chatBody = document.getElementById('chat-body');
            const text = input.value.trim();
            if (!text) return;
            this.renderMessage(chatBody, text, 'user-message');
            const response = this.generateResponse(text);
            setTimeout(() => {
                this.renderMessage(chatBody, response, 'ai-message');
                chatBody.scrollTop = chatBody.scrollHeight;
            }, 400);
            input.value = '';
        },
        generateResponse(text) {
            // 1. 背景提取逻辑
            const subjectKeywords = ["生物", "物理", "数学", "几何", "专业", "本科", "背景", "农学", "理工"];
            subjectKeywords.forEach(kw => {
                if (text.includes(kw)) {
                    this.sessionStack.push(text);
                }
            });
            if (this.sessionStack.length > 3) this.sessionStack.shift();

            // 2. 匹配知识点
            const match = this.knowledge.find(i => i.keywords.some(k => text.includes(k)));
            if (!match) return "这是一个有趣的切入点。为了给出东大基准的诊断，建议先告知您的具体研究方向。";

            // 3. 深度缝合生成
            let responseHtml = match.response;
            
            if (this.sessionStack.length >= 1) {
                const lastContext = this.sessionStack[this.sessionStack.length - 1];
                // 如果用户报过背景且正在询问知识点
                const isAskingTech = text.includes("什么") || text.includes("解释") || text.includes("吗") || text.includes("怎么");
                
                if (isAskingTech) {
                    const prefix = `<div style="border-left: 3px solid #ff4d4f; padding-left: 10px; margin-bottom: 10px; color: #555; font-style: italic;">📢 <strong>秋武导师点评：</strong><br>既然你具备【${lastContext}】的相关背景，那么你在回答“${text.replace(/？|\?/g, '')}”时，绝对不能只停留在背诵定义上。</div>`;
                    const suffix = `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #ddd; color: #d4380d;">💡 <strong>深度提示：</strong>教授看重的是你作为${lastContext.includes('专业') ? '' : '该专业'}学生，是否具备对<strong>变量控制</strong>的本能直觉。</div>`;
                    responseHtml = prefix + match.response + suffix;
                }
            }
            return responseHtml;
        },
        renderMessage(container, text, className) {
            const div = document.createElement('div');
            div.className = `message ${className}`;
            div.innerHTML = text.replace(/\n/g, '<br>');
            container.appendChild(div);
        }
    };

    UISystem.init();
    ChatSystem.init();
});
