/**
 * 秋武老师数字名片 SOTA 3.3 - HTML深度适配版
 * 1. 完美适配 menu-button 和 content-card 结构
 * 2. 包含 SOTA 3.0 理科逻辑栈与记忆联动
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ SOTA 3.3 定制适配版启动...");

    // --- 模块一：UI 交互系统 (针对您的 HTML 定制) ---
    const UISystem = {
        init() {
            this.bindCardTransitions();
            this.bindMenuButtons();
            this.bindCloseButtons();
        },

        // 1. 处理名片展开/收起 (Initial Card <-> Menu Card)
        bindCardTransitions() {
            const expandBtn = document.getElementById('expandButton');
            const backBtn = document.getElementById('backButton');
            const initialCard = document.querySelector('.initial-card');
            const menuCard = document.querySelector('.menu-card');

            if (expandBtn && initialCard && menuCard) {
                expandBtn.addEventListener('click', () => {
                    initialCard.classList.add('hidden');
                    menuCard.classList.remove('hidden');
                });
            }

            if (backBtn && initialCard && menuCard) {
                backBtn.addEventListener('click', () => {
                    menuCard.classList.add('hidden');
                    initialCard.classList.remove('hidden');
                });
            }
        },

        // 2. 处理菜单按钮点击 (Menu Buttons -> Content Cards)
        bindMenuButtons() {
            const buttons = document.querySelectorAll('.menu-button');
            
            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetId = btn.getAttribute('data-target');
                    const targetSection = document.getElementById(targetId);

                    if (targetSection) {
                        // 先隐藏所有其他内容卡片
                        document.querySelectorAll('.content-card').forEach(c => {
                            if (c.id !== 'menu-card') c.classList.add('hidden');
                        });
                        // 显示目标卡片
                        targetSection.classList.remove('hidden');
                        console.log(`✅ 打开卡片: ${targetId}`);
                    } else {
                        console.error(`❌ 未找到 ID 为 ${targetId} 的卡片`);
                    }
                });
            });
        },

        // 3. 处理关闭按钮 (X 号)
        bindCloseButtons() {
            document.querySelectorAll('.close-content').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    // 找到最近的父级 content-card 并隐藏
                    const card = e.target.closest('.content-card');
                    if (card) card.classList.add('hidden');
                });
            });
        }
    };

    // --- 模块二：聊天系统 (保留 SOTA 3.2 核心逻辑) ---
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
                .then(d => {
                    this.knowledge = d;
                    console.log("✅ 知识库加载成功");
                })
                .catch(e => console.warn("⚠️ 知识库加载异常:", e));
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
            // 记忆栈
            const subjects = ["物理", "数学", "生物", "几何", "专业", "背景"];
            subjects.forEach(s => { if (text.includes(s)) this.sessionStack.push(text); });
            if (this.sessionStack.length > 3) this.sessionStack.shift();

            // 匹配
            const match = this.knowledge.find(i => i.keywords.some(k => text.includes(k)));
            if (!match) return "这是一个有趣的切入点。为了给出东大基准的诊断，建议您先告知您的专业背景或研究方向。";

            // 联动
            let linkage = "";
            if (this.sessionStack.length > 1) {
                const context = this.sessionStack[0];
                linkage = `\n\n💡 **秋武联动诊断：** 考虑到你之前提到的【${context}】背景，这类基础定义在面试中往往不是考知识，而是考你对**变量定义（変数定義）**的严谨性。`;
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
    UISystem.init();
    ChatSystem.init();
});
