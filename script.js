/**
 * 东大日本秋武老师 - 数字名片 SOTA 2.0 最终全量版
 * 状态：已修复 B 站 404、适配数组 JSON、集成 Phase 2 深度逻辑
 */

// --- 1. SOTA Phase 2 深度数据库 (秋武老师核心语料) ---
const PHASE2_DATA = {
    "面试": "【秋武数据提醒】：根据评分表，离开座位【推回椅子】价值 10 分；关门前【最后眼神交汇】是区分普通留学生的关键。这体现了研究者的‘环境意识’。",
    "酯化": "【学术底层逻辑】：不要死记方程式。强调‘可逆反应’、‘浓硫酸吸水打破平衡’，这能向教授证明你拥有系统思维，而非死记硬背。",
    "费用": "【秋武商业逻辑】：主张‘按需定制’。通过优质合作机构，可实现 0 额外支出的顶级辅导，将预算花在真正提升录取率的刀刃上。"
};

document.addEventListener('DOMContentLoaded', () => {
    // === A. 左侧卡片交互与外链修复 ===
    const expandBtn = document.getElementById('expandButton');
    const backBtn = document.getElementById('backButton');
    const initialCard = document.querySelector('.initial-card');
    const menuCard = document.querySelector('.menu-card');
    const menuButtons = document.querySelectorAll('.menu-button');
    const closeButtons = document.querySelectorAll('.close-content');

    // 修复 B 站链接 (采用完整空间地址)
    const linkBili = document.getElementById('linkBilibili');
    const linkZhihu = document.getElementById('linkFreeMechanism');
    
    if (linkBili) {
        linkBili.onclick = () => {
            window.open('https://space.bilibili.com/3494371191060931', '_blank');
        };
    }
    if (linkZhihu) {
        linkZhihu.onclick = () => {
            window.open('https://zhuanlan.zhihu.com/p/1968723287774327128', '_blank');
        };
    }

    if (expandBtn) expandBtn.onclick = () => {
        initialCard.classList.add('hidden');
        menuCard.classList.remove('hidden');
    };

    if (backBtn) backBtn.onclick = () => {
        menuCard.classList.add('hidden');
        initialCard.classList.remove('hidden');
    };

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

    // === B. 核心右侧聊天交互 (适配数组格式知识库) ===
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const chatBody = document.getElementById('chat-body');

    let knowledgeArray = []; 
    // 预加载 JSON 数据
    fetch('knowledge.json')
        .then(res => res.json())
        .then(data => { knowledgeArray = data; })
        .catch(err => console.error("数据加载受阻，系统已启用 Phase 2 兜底模式"));

    const handleAction = () => {
        const text = userInput.value.trim();
        if (!text || !chatBody) return;

        // 1. 渲染用户消息
        const uMsg = document.createElement('div');
        uMsg.className = 'message user-message';
        uMsg.innerText = text;
        chatBody.appendChild(uMsg);

        // 2. 匹配逻辑 (检索数组中关键词)
        let response = "";
        const foundItem = knowledgeArray.find(item => 
            item.keywords.some(key => text.toLowerCase().includes(key.toLowerCase()))
        );

        if (foundItem) {
            response = foundItem.response;
        } else {
            response = "这是一个很好的切入点。为了给出‘秋武级’的准确建议，请告诉我您的目标院校或专业背景？或添加微信 qiuwu999 详细拆解。";
        }

        // 3. 检查并追加 SOTA Phase 2 深度建议
        for (let sKey in PHASE2_DATA) {
            if (text.includes(sKey)) {
                response += `\n\n━━━━━━━━━━━━━━━\n🔍 [秋武数据补充分析]：\n${PHASE2_DATA[sKey]}`;
                break;
            }
        }

        // 4. 渲染 AI 回复
        const aiMsg = document.createElement('div');
        aiMsg.className = 'message ai-message';
        aiMsg.innerText = response;
        chatBody.appendChild(aiMsg);

        // 5. 扫尾逻辑
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
