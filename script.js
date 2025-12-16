/**
 * 东大日本秋武老师 - 数字名片 SOTA 2.0 系统级优化版
 * 1. 结构：解耦交互与逻辑，确保全平台稳定性
 * 2. 内涵：实现内涵联动，拒绝机械拼接
 * 3. 补丁：内置 B 站/知乎 100% 成功率跳转
 */

// --- 全局深度内涵库 (高度粘性语料) ---
const AKITAKE_MASTER_LOGIC = {
    "面试": "【逻辑联动】：日本考学面试的核心在于‘研究者资质’的非语言识别。基础对策只是入场券，真正的升维在于通过秋武复盘的‘隐藏分细节’（如：推回椅子、眼神留白）来展示你的环境意识。这种逻辑粘性直接决定了教授是否愿意接纳你进入其学术圈层。",
    "酯化": "【学术联动】：教授考察基础知识（如酯化反应）的背后，是评估你的‘系统科研思维’。升维的做法是将单一反应式升华为‘产率控制逻辑’。展示这种从基础现象映射到复杂工程的能力，才是证明你具备‘带资进组’潜力的核心内涵。",
    "费用": "【模式联动】：辅导费用的本质应是‘风险溢价的对冲’。我推行的‘0额外支出’模式，是用我深耕的行业资源置换中介溢价，将您的投入直接转化为东大级的录取胜率。这种透明、共赢的商业闭环，正是秋武数据区别于传统机构的内涵所在。",
    "研究计划书": "【文书联动】：一份具备‘内涵粘性’的计划书，绝非模板堆砌。它要求将你的‘个人原体验’与‘学术破绽’进行高频碰撞。秋武逻辑教你如何发现这些破绽并设计实验验证，这种独立解决问题的‘学术灵气’，是打动教授的唯一路径。"
};

document.addEventListener('DOMContentLoaded', () => {

    // === 🔘 模块一：全局导航与外链引擎 (系统级隔离) ===
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
                'linkBilibili': 'https://space.bilibili.com/3494371191060931',
                'linkFreeMechanism': 'https://zhuanlan.zhihu.com/p/1968723287774327128'
            };
            for (let id in links) {
                const el = document.getElementById(id);
                if (el) el.onclick = () => window.open(links[id], '_blank');
            }
        }
    };

    // === 💬 模块二：SOTA Phase 2 交互引擎 ===
    const ChatSystem = {
        knowledge: [],
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

            // 1. 渲染用户气泡
            this.renderMessage(chatBody, text, 'user-message');

            // 2. 深度逻辑合成
            const response = this.generateResponse(text);

            // 3. 渲染 AI 气泡
            this.renderMessage(chatBody, response, 'ai-message');

            // 4. UI 扫尾
            input.value = '';
            chatBody.scrollTop = chatBody.scrollHeight;
        },
        generateResponse(text) {
            // A. 检索基础库
            const baseMatch = this.knowledge.find(i => i.keywords.some(k => text.includes(k)));
            // B. 检索深度联动内涵
            const insightKey = Object.keys(AKITAKE_MASTER_LOGIC).find(k => text.includes(k));
            const insight = insightKey ? AKITAKE_MASTER_LOGIC[insightKey] : "";

            // C. 语义融合 (SOTA 升维体现)
            if (baseMatch && insight) {
                return `${baseMatch.response}\n\n━━━━━━━━━━━━━━━\n🔍 深度联动分析：\n${insight}`;
            } else if (insight) {
                return insight;
            } else if (baseMatch) {
                return baseMatch.response;
            }
            return "这是一个很有价值的逻辑破绽。为了给出更贴合‘秋武特色’的针对性建议，请告诉我您的具体院校目标？";
        },
        renderMessage(container, text, className) {
            const div = document.createElement('div');
            div.className = `message ${className}`;
            div.innerText = text;
            container.appendChild(div);
        }
    };

    // 启动全局系统
    NavigationSystem.init();
    ChatSystem.init();
});
