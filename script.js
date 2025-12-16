/**
 * 东大日本秋武老师 - 数字名片 SOTA 2.0 终极对齐修复版
 * 状态：已根据 HTML 源码 100% 对齐功能与 ID
 */

// --- 1. SOTA Phase 2 深度数据库 (仅作为追加内容，不覆盖原有 JSON) ---
const PHASE2_DATA = {
    "面试": "【秋武深度提醒】：根据评分表，离开座位【推回椅子】价值 10 分；关门前【最后眼神交汇】是区分普通留学生的关键。这体现了研究者的‘环境意识’。",
    "酯化": "【学术底层逻辑】：不要死记方程式。强调‘可逆反应’、‘浓硫酸吸水打破平衡’，这能向教授证明你拥有系统思维，而不仅仅是背书。",
    "费用": "【秋武商业逻辑】：主张‘按需定制’。通过优质合作机构，可实现 0 额外支出的顶级辅导，将预算花在真正提升录取率的刀刃上。"
};

document.addEventListener('DOMContentLoaded', () => {
    // === A. 恢复左侧卡片切换功能 (确保展开、返回、核心优势按钮可用) ===
    const expandBtn = document.getElementById('expandButton');
    const backBtn = document.getElementById('backButton');
    const initialCard = document.querySelector('.initial-card');
    const menuCard = document.querySelector('.menu-card');
    const menuButtons = document.querySelectorAll('.menu-button');
    const contentCards = document.querySelectorAll('.content-card');
    const closeButtons = document.querySelectorAll('.close-content');

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

    menuButtons.forEach(btn => {
        btn.onclick = () => {
            const targetId = btn.getAttribute('data-target');
            menuCard.classList.add('hidden');
            const targetContent = document.getElementById(targetId);
            if(targetContent) targetContent.classList.remove('hidden');
        };
    });

    closeButtons.forEach(btn => {
        btn.onclick = () => {
            btn.closest('.content-card').classList.add('hidden');
            menuCard.classList.remove('hidden');
        };
    });

    // === B. 核心聊天逻辑 (对齐 ID: user-input, chat-body) ===
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const chatBody = document.getElementById('chat-body');

    let knowledgeBase = {};
    // 预加载数据库
    fetch('knowledge.json')
        .then(res => res.json())
        .then(data => { knowledgeBase = data; })
        .catch(err => console.error("JSON 加载受阻，使用兜底回复"));

    const handleAction = () => {
        const text = userInput.value.trim();
        if (!text || !chatBody) return;

        // 1. 显示用户提问
        const uMsg = document.createElement('div');
        uMsg.className = 'message user-message';
        uMsg.innerText = text;
        chatBody.appendChild(uMsg);

        // 2. 生成回复 (逻辑：先找 JSON，再看是否追加 Phase 2)
        let response = "";
        const matchedKey = Object.keys(knowledgeBase).find(k => text.includes(k));
        
        if (matchedKey) {
            response = knowledgeBase[matchedKey];
        } else {
            response = "这是一个很好的切入点。为了给出准确建议，请告诉我您的目标院校或专业背景？或添加微信 qiuwu999。";
        }

        // 检查是否追加 SOTA Phase 2 的深度建议
        for (let sKey in PHASE2_DATA) {
            if (text.includes(sKey)) {
                response += `\n\n--------------------------\n${PHASE2_DATA[sKey]}`;
                break;
            }
        }

        const aiMsg = document.createElement('div');
        aiMsg.className = 'message ai-message';
        aiMsg.innerText = response;
        chatBody.appendChild(aiMsg);

        // 3. UI 扫尾
        userInput.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    if (sendBtn) sendBtn.onclick = handleAction;
    if (userInput) {
        userInput.onkeydown = (e) => {
            if (e.key === 'Enter') handleAction();
        };
    }
});
