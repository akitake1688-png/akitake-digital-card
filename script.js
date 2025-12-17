/**
 * 秋武老师数字名片 SOTA 3.1 稳定版
 * 修复：左侧导航冲突、三级记忆栈优化、中日文权重平衡
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 模块一：导航系统（修复左侧按键） ---
    const NavigationSystem = {
        init() {
            const navItems = document.querySelectorAll('.nav-item');
            const sections = document.querySelectorAll('.content-section');
            
            navItems.forEach(item => {
                item.addEventListener('click', () => {
                    const target = item.getAttribute('data-target');
                    
                    // 切换激活状态
                    navItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    
                    // 切换显示区域
                    sections.forEach(s => {
                        s.classList.remove('active');
                        if (s.id === target) s.classList.add('active');
                    });
                });
            });
        }
    };

    // --- 模块二：聊天系统（三级联动 + 去油腻逻辑） ---
    const ChatSystem = {
        knowledge: [],
        sessionStack: [],

        init() {
            this.loadData();
            this.bindEvents();
        },

        loadData() {
            fetch('knowledge.json')
                .then(r => r.json())
                .then(d => this.knowledge = d)
                .catch(() => console.warn("秋武逻辑兜底启动"));
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
            
            // 模拟思考延迟，增加真实感
            setTimeout(() => {
                this.renderMessage(chatBody, response, 'ai-message');
                chatBody.scrollTop = chatBody.scrollHeight;
            }, 400);

            input.value = '';
        },

        generateResponse(text) {
            // 记忆栈更新
            const subjects = ["物理", "数学", "生物", "几何", "专业", "背景"];
            subjects.forEach(s => { if (text.includes(s)) this.sessionStack.push(text); });
            if (this.sessionStack.length > 3) this.sessionStack.shift();

            // 基础匹配
            const match = this.knowledge.find(i => i.keywords.some(k => text.includes(k)));
            
            if (!match) return "这是一个有趣的逻辑切入点。为了给出东大基准的诊断，建议您先告知您的专业背景或研究方向。";

            // 联动逻辑生成（中文为主）
            let linkage = "";
            if (this.sessionStack.length > 1) {
                const context = this.sessionStack[0];
                linkage = `\n\n💡 **秋武联动诊断：** 考虑到你之前提到的【${context}】背景，这类基础定义在面试中往往不是考知识，而是考你对**变量定义（変数定義）**的严谨性。如果这里出现逻辑破绽，教授会质疑你未来处理复杂实验数据的能力。`;
            }

            return match.response + linkage;
        },

        renderMessage(container, text, className) {
            const div = document.createElement('div');
            div.className = `message ${className}`;
            div.innerHTML = text.replace(/\n/g, '<br>');
            container.appendChild(div);
        }
    };

    // 启动双系统
    NavigationSystem.init();
    ChatSystem.init();
});
