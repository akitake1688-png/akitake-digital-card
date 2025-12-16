/**
 * 东大日本秋武老师 - 数字名片 SOTA 2.0 逻辑完全对齐版
 * 修正点：适配数组格式 JSON、补全 B 站外链、确保 Phase 2 逻辑平滑追加
 */

// --- 1. SOTA Phase 2 深度数据库 ---
const PHASE2_DATA = {
    "面试": "【秋武数据提醒】：根据评分表，离开座位【推回椅子】价值 10 分；关门前【最后眼神交汇】是区分普通学生的关键。这体现了研究者的‘环境意识’。",
    "酯化": "【学术底层逻辑】：不要死记方程式。强调‘可逆反应’、‘浓硫酸吸水打破平衡’，这能证明你拥有系统思维，而非死记硬背。",
    "费用": "【秋武商业逻辑】：主张‘按需定制’。通过优质合作机构，可实现 0 额外支出的顶级辅导，将预算花在真正提升录取率的刀刃上。"
};

document.addEventListener('DOMContentLoaded', () => {
    // === A. 恢复左侧卡片切换与外链功能 ===
    const expandBtn = document.getElementById('expandButton');
    const backBtn = document.getElementById('backButton');
    const initialCard = document.querySelector('.initial-card');
    const menuCard = document.querySelector('.menu-card');
    const menuButtons = document.querySelectorAll('.menu-button');
    const contentCards = document.querySelectorAll('.content-card');
    const closeButtons = document.querySelectorAll('.close-content');

    // 修复外链跳转
    const linkBili = document.getElementById('linkBilibili');
    const linkZhihu = document.getElementById('linkFreeMechanism');
    if (linkBili) linkBili.onclick = () => window.open('https://space.bilibili.com/3494371191060931', '_blank');
    if (linkZhihu) linkZhihu.onclick = () => window.open('https://zhuanlan.zhihu.com/p/1968723287774327128', '_blank');

    if (expandBtn) expandBtn.onclick = () => { initialCard.classList.add('hidden'); menuCard.classList.remove('hidden'); };
    if (backBtn) backBtn.onclick = () => { menuCard.classList.add('hidden'); initialCard.classList.remove('hidden'); };

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

    // === B. 核心聊天逻辑 (适配数组格式知识库) ===
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const chatBody = document.getElementById('chat-body');

    let knowledgeArray = []; // 修改为数组
    fetch('knowledge.json')
        .then(res => res.json())
        .then(data => { knowledgeArray = data; })
        .catch(err => console.error("JSON 加载受阻"));

    const handleAction = () => {
        const text = userInput.value.trim();
        if (!text || !chatBody) return;

        const uMsg = document.createElement('div');
        uMsg.className = 'message user-message';
        uMsg.innerText = text;
        chatBody.appendChild(uMsg);

        let response = "";
        
        // 关键修正：从数组中检索包含关键词的对象
        const foundItem = knowledgeArray.find(item => 
            item.keywords.some(key => text.toLowerCase().includes(key.toLowerCase()))
        );

        if (foundItem) {
            response = foundItem.response;
        } else {
            response = "这是一个很好的切入点。为了给出准确建议，请告诉我您的目标院校或专业背景？或添加微信 qiuwu999。";
        }

        // 检查是否追加 SOTA Phase 2 深度建议 (增加“秋武数据”字眼)
        for (let sKey in PHASE2_DATA) {
            if (text.includes(sKey)) {
                response += `\n\n--------------------------\n🔍 [秋武数据补充]：\n${PHASE2_DATA[sKey]}`;
                break;
            }
        }

        const aiMsg = document.createElement('div');
        aiMsg.className = 'message ai-message';
        aiMsg.innerText = response;
        chatBody.appendChild(aiMsg);

        userInput.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    if (sendBtn) sendBtn.onclick = handleAction;
    if (userInput) userInput.onkeydown = (e) => { if (e.key === 'Enter') handleAction(); };
});
