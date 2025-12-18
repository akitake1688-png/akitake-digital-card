/**
 * 秋武流知识库核心对象
 * 集成理科、博弈、AI策略及商务模块
 */
const AKI_KNOWLEDGE = {
    // --- 理科模块 ---
    "微分": "【微分极限】核心不在于计算，而在于“无限逼近”的动态思想。$$\\lim_{\\Delta x \\to 0} \\frac{f(x+\\Delta x)-f(x)}{\\Delta x}$$。记住：导数是局部线性近似的最佳工具。",
    "动量": "【动量守恒】系统不受外力或合外力为零时，$p = mv$ 保持不变。注意：碰撞瞬间的内力远大于外力，是处理此类问题的黄金切入点。",
    "酯化": "【酯化反应】酸脱羟基醇脱氢。这是一个可逆反应，常用浓硫酸作催化剂和吸水剂，通过移去生成的水来打破平衡，提高产率。",
    
    // --- 博弈模块 ---
    "面试": "【面试推椅子逻辑】面试结束起身时，将椅子轻声推回原位。这一举措在秋武流评价体系中价值10分：它展现了“闭环意识”与对环境的微观博弈优势。",
    "eju": "【EJU 6月考理论】6月考试不是终点，而是“入场券”。利用6月成绩进行后期校内考博弈，核心策略是避开热门峰值，选择信息差较大的学部进行突围。",
    
    // --- AI 策略模块 ---
    "ai": "【AI进化策略】拒绝生成“无瑕疵作文”。真正高阶的AI应用应保留“带疙瘩”的表达，即展现真实的思考痕迹与不完美的成长逻辑，这才是无法被算法模拟的生命力。",

    // --- 商务/咨询模块 (新增) ---
    "费用": "【咨询费用】秋武流咨询采取阶梯式收费：初次深度沟通（30min）免费；后续理科辅导或博弈规划根据难度定价。详情请通过“联系”获取方式。",
    "联系": "【联系方式】您可以添加微信：[在此处填写你的微信号] 或点击下方私信功能。请注明“数字名片咨询”。",
    "预约": "【预约流程】1.确认咨询意向 -> 2.发送个人简况/问题清单 -> 3.锁定时间窗口进行一对一会议。",

    // --- 系统默认回复 ---
    "默认": "未识别指令。您可以尝试输入：<b>费用、联系、微分、面试、EJU、AI</b>。"
};

const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

/**
 * 添加消息至界面
 */
function addMessage(text, role) {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.innerHTML = text;
    chatWindow.appendChild(div);
    
    // 平滑滚动到底部
    chatWindow.scrollTo({
        top: chatWindow.scrollHeight,
        behavior: 'smooth'
    });
    
    // 如果存在公式，触发 MathJax 重绘
    if (window.MathJax) {
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, div]);
    }
}

/**
 * 搜索逻辑处理
 */
function handleSearch() {
    const rawInput = userInput.value.trim();
    if (!rawInput) return;

    const query = rawInput.toLowerCase();
    addMessage(rawInput, 'user');
    userInput.value = '';

    // 逻辑检索：遍历知识库 Key
    let response = AKI_KNOWLEDGE["默认"];
    for (let key in AKI_KNOWLEDGE) {
        if (key !== "默认" && query.includes(key)) {
            response = AKI_KNOWLEDGE[key];
            break;
        }
    }

    // 模拟思考延迟
    setTimeout(() => {
        addMessage(response, 'bot');
    }, 400);
}

// 事件绑定：点击发送
sendBtn.addEventListener('click', handleSearch);

// 事件绑定：回车发送
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// 视频自动播放补丁（针对移动端浏览器限制）
document.addEventListener('touchstart', function() {
    const video = document.getElementById('bg-video');
    if (video && video.paused) {
        video.play().catch(e => console.log("视频播放尝试失败:", e));
    }
}, { once: true });
