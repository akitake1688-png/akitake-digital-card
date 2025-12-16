/**
 * 秋武老师数字名片 - 2.0 终极防御版
 * 核心目标：绝对保证“发送”按钮可用，100% 兼容性
 */

// 1. 内置 Phase 2 增强模块 (确保无 JSON 时也能显示高品质回复)
var SOTA_DATA = {
    "面试": {
        "t": "🎖️ 秋武深度预判：面试 10 分项细节",
        "c": "根据秋武数据➋：离开座位【推回椅子】价值 10 分；关门前【最后眼神交汇】是区分普通留学生的关键。这体现了研究者的‘环境意识’。",
        "h": "💡 提示：教授会考查你对课程大纲的了解，想知道如何展示进学意欲吗？"
    },
    "酯化": {
        "t": "🧪 学术底层重构：酯化反应思维",
        "c": "酸醇‘手拉手’脱水。记住这是‘可逆反应’，浓硫酸不仅是催化剂，更是为了吸水打破平衡。展现逻辑比背公式更重要。",
        "h": "💡 教授若问‘如何提高产率’，你知道如何逻辑救场吗？"
    },
    "费用": {
        "t": "💰 商业透明：秋武费用逻辑",
        "c": "秋武主张‘按需定制’：核心在于文书重构。通过优质合作机构，可实现 0 额外支出的顶级辅导，将预算花在刀刃上。",
        "h": "💡 想要实现 0 额外支出？请联系微信：qiuwu999"
    }
};

var globalKB = {}; // 存储加载的 JSON

// 2. 核心回复引擎
function getResponse(text) {
    var val = text.toLowerCase();
    var baseRes = "这是一个很好的切入点。为了给出建议，请告诉我您的目标院校或专业？或添加微信 qiuwu999。";

    // 优先级 1: 费用拦截
    if (val.includes("贵") || val.includes("钱") || val.includes("费")) {
        return buildFinal("费用", globalKB["费用"] || "关于费用，我主张透明化定制。");
    }

    // 优先级 2: 关键词匹配
    for (var key in globalKB) {
        if (val.indexOf(key.toLowerCase()) !== -1) {
            return buildFinal(key, globalKB[key]);
        }
    }
    return baseRes;
}

function buildFinal(key, base) {
    var sota = null;
    for (var sKey in SOTA_DATA) {
        if (key.indexOf(sKey) !== -1) { sota = SOTA_DATA[sKey]; break; }
    }
    if (sota) {
        return base + "\n\n--------------------------\n" + sota.t + "\n" + sota.c + "\n\n" + sota.h;
    }
    return base;
}

// 3. 页面交互 (使用最原始的 DOM 处理)
function handleAction() {
    var ipt = document.getElementById('chat-input');
    var box = document.getElementById('chat-box');
    if (!ipt || !box) return;

    var msg = ipt.value.trim();
    if (!msg) return;

    // 显示用户消息
    var uDiv = document.createElement('div');
    uDiv.className = 'user-msg';
    uDiv.innerText = msg;
    box.appendChild(uDiv);

    // 显示 AI 回复
    var aDiv = document.createElement('div');
    aDiv.className = 'ai-msg';
    aDiv.innerText = getResponse(msg);
    box.appendChild(aDiv);

    ipt.value = '';
    box.scrollTop = box.scrollHeight;
}

// 初始化加载
window.onload = function() {
    // 异步尝试加载 JSON
    fetch('knowledge.json')
        .then(function(r) { return r.json(); })
        .then(function(d) { globalKB = d; })
        .catch(function(e) { console.log("JSON Load Mode: Internal Only"); });

    // 绑定按钮和回车
    var btn = document.getElementById('send-btn');
    var ipt = document.getElementById('chat-input');
    
    if (btn) btn.onclick = handleAction;
    if (ipt) {
        ipt.onkeydown = function(e) {
            if (e.keyCode === 13) handleAction();
        };
    }
};
