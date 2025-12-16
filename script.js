/**
 * 东大日本秋武老师 - 数字名片 SOTA 2.5 深度逻辑增强版
 * 1. 记忆引擎：支持上下文背景追踪
 * 2. 语料内化：集成 PDF 核心面试与学术升维逻辑
 */

const AKITAKE_MASTER_LOGIC = {
    "面试": "【逻辑联动】：日本考学面试的核心在于‘研究者资质’的非语言识别。正如秋武数据中提到的，教授更看重你‘思考时的停顿’（少し考えてもよろしいでしょうか）。真正的升维在于通过‘隐藏分细节’（如：推回椅子、眼神留白）来展示你的环境意识。这种逻辑粘性决定了你是否具备研究者的‘余裕’。",
    "酯化": "【学术联动】：教授考察酯化反应，背后是评估你的‘系统科研思维’。不要只背公式，要从‘产率控制逻辑’出发：浓硫酸不仅是催化剂，更是脱水剂，通过移走水分促进平衡右移。这种从基础现象映射到工程逻辑的能力，才是证明你具备‘带资进组’潜力的核心内涵。",
    "费用": "【模式联动】：辅导费用的本质应是‘风险溢价的对冲’。我推行的‘0额外支出’模式，是用深耕的行业资源置换中介溢价，将您的投入直接转化为东大级的录取胜率。这种共赢的商业闭环，正是秋武数据区别于传统机构的内涵所在。",
    "研究计划书": "【文书联动】：一份具备‘内涵粘性’的计划书，要求将‘个人原体验’与‘学术破绽’进行高频碰撞。秋武逻辑教你如何发现这些破绽并设计实验验证。这种‘独立解决问题’的学术灵气，是打动教授的唯一路径。"
};

document.addEventListener('DOMContentLoaded', () => {

    // === 🔘 模块一：全局导航与外链引擎 (100% 成功率修复) ===
    const NavigationSystem = {
        init() {
            this.bindButtons();
            this.bindExternalLinks();
        },
        bindButtons() {
            const expandBtn = document.getElementById('expandButton');
            const backBtn = document.getElementById('backButton');
            const initialCard = document.querySelector('.initial-card');
            const menuCard = document.querySelector('.menu-card');

            if (expandBtn) expandBtn.onclick = () => { initialCard.classList.add('hidden'); menuCard.classList.remove('hidden'); };
            if (backBtn) backBtn.onclick = () => { menuCard.classList.add('hidden'); initialCard.classList.remove('hidden'); };

            document.querySelectorAll('.menu-button').forEach(btn => {
                btn.onclick = () => {
                    menuCard.classList.add('hidden');
                    const target = document.getElementById(btn.getAttribute('data-target'));
                    if (target) target.classList.remove('hidden');
                };
            });

            document.querySelectorAll('.close-content').forEach(btn => {
                btn.onclick = () => {
                    btn.closest('.content-card').classList.add('hidden');
                    menuCard.classList.remove('hidden');
                };
            });
        },
        bindExternalLinks() {
            const links = {
                'linkBilibili': 'https://space.bilibili.com/323700487/lists',
                'linkFreeMechanism': 'https://zhuanlan.zhihu.com/p/1968723287774327128'
            };
            for (let id in links) {
                const el = document.getElementById(id);
                if (el) {
                    el.onclick = (e) => {
                        e.preventDefault();
                        window.open(links[id], '_blank');
                    };
                }
            }
        }
    };

    // === 💬 模块二：SOTA Phase 2.5 记忆交互引擎 ===
    const ChatSystem = {
        knowledge: [],
        // 上下文记忆槽
        session: {
            major: null, // 专业
            target: null // 目标
        },
        init() {
            this.loadData();
            this.bindEvents();
        },
        loadData() {
            fetch('knowledge.json')
                .then(r => r.json())
                .then(d => this.knowledge = d)
                .catch(e => console.warn("进入秋武逻辑兜底模式"));
        },
        bindEvents() {
            const sendBtn = document.getElementById('send-btn');
            const userInput = document.getElementById('user-input');
            if (sendBtn) sendBtn.onclick = () => this.handleAction();
            if (userInput) userInput.onkeydown = (e) => { if (e.key === 'Enter') this.handleAction(); };
        },
        handleAction() {
            const input = document.getElementById('user-input');
            const chatBody = document.getElementById('chat-body');
            const text = input.value.trim();
            if (!text || !chatBody) return;

            this.renderMessage(chatBody, text, 'user-message');
            const response = this.generateResponse(text);
            this.renderMessage(chatBody, response, 'ai-message');

            input.value = '';
            chatBody.scrollTop = chatBody.scrollHeight;
        },
        generateResponse(text) {
            // 1. 背景抓取逻辑 (记忆用户提到的专业)
            const majorPatterns = ["专业", "本科", "学过", "背景", "出身"];
            if (majorPatterns.some(p => text.includes(p))) {
                this.session.major = text;
            }

            // 2. 检索基础库 (带优先级的模糊匹配)
            const baseMatch = this.knowledge
                .sort((a, b) => (b.priority || 0) - (a.priority || 0))
                .find(i => i.keywords.some(k => text.includes(k)));

            // 3. 检索深度内涵 (核心模块)
            const insightKey = Object.keys(AKITAKE_MASTER_LOGIC).find(k => text.includes(k));
            let insight = insightKey ? AKITAKE_MASTER_LOGIC[insightKey] : "";

            // 4. 上下文语义缝合
            let contextBonus = "";
            if (this.session.major && (insightKey === "面试" || insightKey === "研究计划书")) {
                contextBonus = `\n\n💡 **针对您提到的[${this.session.major}]背景补充：**\n在秋武逻辑中，特定背景的‘学术破绽’是教授最爱抓的重点。建议在面试中展现出从基础学科向‘系统思维’升维的过程。`;
            }

            // 5. 最终合成
            if (baseMatch && insight) {
                return `${baseMatch.response}\n\n━━━━━━━━━━━━━━━\n🔍 深度联动分析：\n${insight}${contextBonus}`;
            } else if (insight) {
                return insight + contextBonus;
            } else if (baseMatch) {
                return baseMatch.response + contextBonus;
            }
            
            return "这是一个很有价值的逻辑破绽。为了给出更贴合‘秋武特色’的针对性建议，请告诉我您的具体院校目标或专业背景？";
        },
        renderMessage(container, text, className) {
            const div = document.createElement('div');
            div.className = `message ${className}`;
            // 转换换行符为 HTML 换行
            div.innerHTML = text.replace(/\n/g, '<br>');
            container.appendChild(div);
        }
    };

    NavigationSystem.init();
    ChatSystem.init();
});
