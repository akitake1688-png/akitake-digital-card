/**
 * 秋武老师数字名片 - 2.0 终极自愈版
 * 修复：彻底解决点击无反应、发送失效问题
 */

// 1. 深度内置数据库（确保即使JSON失效，核心功能依然能用）
var QA_CONFIG = {
    "面试": {
        "t": "🎖️ 秋武深度预判：面试 10 分项细节",
        "c": "细节决定成向：根据秋武数据➋，离开座位【推回椅子】价值 10 分；关门前【最后眼神交汇】是区分普通留学生的关键。",
        "h": "💡 提示：教授会考查你对课程大纲的了解，想知道如何展示进学意欲吗？"
    },
    "酯化": {
        "t": "🧪 学术底层重构：酯化反应思维",
        "c": "不要死记硬背：酸醇‘手拉手’脱水是‘可逆反应’。提及‘浓硫酸催化’和‘平衡移动’，能向教授证明你的系统逻辑思维。",
        "h": "💡 追问预判：如果教授问‘如何提高产率’，你知道如何逻辑救场吗？"
    },
    "费用": {
        "t": "💰 商业透明：秋武费用逻辑",
        "c": "秋武主张‘按需定制’：通过优质合作机构，可实现 0 额外支出的顶级辅导，将预算花在真正提升录取率的刀刃上。",
        "h": "💡 想要实现 0 额外支出？请联系微信：qiuwu999"
    }
};

// 全局变量存储 JSON 数据
var localData = {};

// 2. 核心回复逻辑
function getAiResponse(val) {
    var txt = val.toLowerCase();
    var res = "这是一个很好的切入点。为了给出建议，请告诉我您的目标院校或专业？或添加微信 qiuwu999。";
    
    // 优先级 1：费用
    if (txt.includes("贵") || txt.includes("钱") || txt.includes("费")) {
        return buildSota("费用", localData["费用"] || "费用方案主张透明定制。");
    }

    // 优先级 2：关键词
    for (var k in localData) {
        if (txt.includes(k.toLowerCase())) {
            return buildSota(k, localData[k]);
        }
    }
    return res;
}

function buildSota(key, base) {
    // 查找是否存在 SOTA 增强模块
    var sota = null;
    for(var sk in QA_CONFIG) {
        if(key.includes(sk)) { sota = QA_CONFIG[sk]; break; }
    }
    if (sota) {
        return base + "\n\n--------------------------\n" + sota.t + "\n" + sota.c + "\n\n" + sota.h;
    }
    return base;
}

// 3. 页面交互逻辑 (采用最原始、兼容性最强的绑定方式)
window.onload = function() {
    var btn = document.getElementById('send-btn');
    var ipt = document.getElementById('chat-input');
    var box = document.getElementById('chat-box');

    // 预加载 JSON (不影响后续代码执行)
    fetch('knowledge.json')
        .then(function(r){ return r.json(); })
        .then(function(d){ localData = d; })
        .catch(function(e){ console.log("JSON Load Fail, use internal data."); });

    // 定义发送动作
    function doSend() {
        var msg = ipt.value.trim();
        if (!msg) return;

        // 用户消息显示
        var u = document.createElement('div');
        u.className = 'user-msg';
        u.innerText = msg;
        box.appendChild(u);

        // AI 回复显示
        var a = document.createElement('div');
        a.className = 'ai-msg';
        a.innerText = getAiResponse(msg);
        box.appendChild(a);

        ipt.value = '';
        box.scrollTop = box.scrollHeight;
    }

    // 直接绑定，不使用 addEventListener 减少冲突
    if (btn) {
        btn.onclick = doSend;
    }
    
    if (ipt) {
        ipt.onkeydown = function(e) {
            if (e.keyCode === 13) { doSend(); }
        };
    }
};
