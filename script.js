const LOGIC_HUB = {
    advantage: "<b>核心优势（文理融合）：</b><br>基于东大基准的逻辑重构。利用公式精准定位认知偏差：$P(A|B) = \\frac{P(B|A)P(A)}{P(B)}$，将感性叙事全量转化为理性竞争力。",
    mode: "<b>辅导模式：</b><br>1. <b>终局思维反推</b>：从目标需求逆向重构材料。<br>2. <b>逻辑破绽修正</b>：巧妙利用背景“弱点”创造独特视角。",
    contact: "<b>联系秋武：</b><br>微信号：qiuwu999<br>提示：添加请注明“数字化名片”，系统将自动优先对齐您的逻辑需求。"
};

let typing = false;

function handleLogic(key) {
    if (typing) return;
    const output = document.getElementById('output-box');
    const container = document.getElementById('chat-container');
    output.innerHTML = "";
    
    // 标签感知正则：整体捕获 HTML 标签和 MathJax 公式
    const tokens = LOGIC_HUB[key].match(/(<[^>]+>|\$[^\$]+\$|[^<$])/g);
    let i = 0;
    typing = true;

    const timer = setInterval(() => {
        if (i < tokens.length) {
            output.innerHTML += tokens[i];
            i++;
            // 自动触底滚动
            container.scrollTop = container.scrollHeight;
        } else {
            clearInterval(timer);
            typing = false;
            // 打字结束，异步对齐公式
            if (window.MathJax) {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, output]);
            }
        }
    }, 35);
}

// 屏蔽非关键报错，确保 GitHub Pages 执行流不中断
window.onerror = () => true;
