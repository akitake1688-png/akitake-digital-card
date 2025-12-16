/**
 * 秋武老师数字名片 - 2025 全量重构 SOTA 2.0 (稳定增强版)
 * 检查日期：2025/12/16
 * 修复重点：消除点击延迟、确保发送稳定、隔离错误风险
 */

// 1. 深度答辩数据常量 (直接写入 JS，确保脱离 JSON 也能独立运行，提高稳定性)
const QA_MODULES = {
    "面试": {
        "title": "🎖️ 秋武深度预判：面试 10 分项细节",
        "content": "根据秋武数据➋：教授看重‘研究者素养’。离开座位【推回椅子】价值 10 分；关门前【最后眼神交汇】是区分普通留学生的关键。",
        "hook": "💡 想知道如何通过‘课程大纲’展示进学意欲吗？"
    },
    "酯化": {
        "title": "🧪 学术底层重构：酯化反应思维",
        "content": "酸醇‘手拉手’脱水。记住这是‘可逆反应’，浓硫酸是催化剂并吸水打破平衡。展现逻辑比背公式更重要。",
        "hook": "💡 教授若问‘如何提高产率’，你想知道如何用逻辑救场吗？"
    },
    "跨专业": {
        "title": "🔄 认知重构：理转文王牌逻辑",
        "content": "跨专业面试的 10 分项在于【逻辑严密性】。用理科的实证思维去重构文科研究计划，告诉教授你的‘背景差异’正是你的‘学术王牌’。",
        "hook": "💡 面对‘为什么要转行’这个考点，想知道秋武老师总结的‘唯一性公式’吗？"
    },
    "费用": {
        "title": "💰 商业透明：秋武费用逻辑",
        "content": "秋武主张‘按需定制’。通过优质合作机构，可实现 0 额外支出的顶级辅导，将预算花在文书逻辑等刀刃上。",
        "hook": "💡 想要实现 0 额外支出？请联系微信：qiuwu999"
    }
};

// 2. 核心逻辑：意图识别与回复增强
function getFinalResponse(userInput, database) {
    const input = userInput.toLowerCase();
    let response = "这是一个很好的切入点。为了给出‘秋武级’建议，请告诉我您的目标院校或专业背景？或添加微信 qiuwu999。";

    // 优先级 1：拦截费用/价格
    if (input.includes("贵") || input.includes("钱") || input.includes("费") || input.includes("多少")) {
        const base = database["费用"] || "关于费用，我主张透明与定制。";
        return applyEnhancement("费用", base);
    }

    // 优先级 2：关键词匹配
    for (let key in database) {
        if (input.includes(key)) {
            response = database[key];
            return applyEnhancement(key, response);
        }
    }

    return response;
}

// 附加 SOTA 模块的逻辑 (确保无副作用)
function applyEnhancement(key, baseText) {
    // 模糊匹配子模块关键词
    const subKey = Object.keys(QA_MODULES).find(k => key.includes(k) || k.includes(key));
    const extra = QA_MODULES[subKey];
    if (extra) {
        return `${baseText}\n\n--------------------------\n${extra.title}\n${extra.content}\n\n${extra.hook}`;
    }
    return baseText;
}

// 微信复制功能
async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        alert('微信 ID 已复制！');
    } catch (e) {
        window.prompt("复制微信号：", text);
    }
}

// 3. 页面交互 (彻底修复点击发不出的问题)
let cachedData = {}; // 预加载数据

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('send-btn');
    const input = document.getElementById('chat-input');
    const box = document.getElementById('chat-box');

    // --- 重点：提前加载数据，避免点击时延迟 ---
    fetch('knowledge.json')
        .then(res => res.json())
        .then(data => { cachedData = data; })
        .catch(e => console.warn("JSON 加载受阻，使用内置逻辑兜底"));

    // 核心执行逻辑
    const executeSend = () => {
        const val = input.value.trim();
        if (!val || !box) return;

        // 渲染用户端
        const u = document.createElement('div');
        u.className = 'user-msg';
        u.innerText = val;
        box.appendChild(u);

        // 渲染回复端 (使用缓存好的数据，秒回，不卡死)
        const a = document.createElement('div');
        a.className = 'ai-msg';
        a.innerText = getFinalResponse(val, cachedData);
        box.appendChild(a);

        input.value = '';
        box.scrollTop = box.scrollHeight;
    };

    // 绑定点击事件 (旧版 onclick 覆盖，防冲突)
    if (btn) {
        btn.onclick = (e) => {
            e.preventDefault(); // 阻止默认刷新行为
            executeSend();
        };
    }

    // 绑定回车事件
    if (input) {
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                executeSend();
            }
        };
    }
});
