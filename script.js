const contentMap = {
    advantage: "<b>核心优势：</b><br>基于贝叶斯推断的咨询模型：$P(A|B) = \\frac{P(B|A)P(A)}{P(B)}$，帮助学员精准定位认知偏差。",
    mode: "<b>辅导模式：</b><br>采用“双轨并行”策略，结合认知心理学与系统工程学，实现知识的全量重构。",
    contact: "<b>联系秋武：</b><br>通过 GitHub Pages 建立的数字化入口，探索咨询的无限可能。"
};

let isTyping = false;

function triggerContent(key) {
    if (isTyping) return;
    const target = document.getElementById('output-box');
    target.innerHTML = ""; // 清空画布
    typeWriter(contentMap[key], target);
}

function typeWriter(text, element) {
    isTyping = true;
    let i = 0;
    
    // 标签感知正则：匹配完整HTML标签或单个字符
    const tokens = text.match(/<[^>]+>|[^<]/g); 
    
    function printToken() {
        if (i < tokens.length) {
            element.innerHTML += tokens[i];
            i++;
            // 滚动到底部保持可见性
            element.parentElement.scrollTop = element.parentElement.scrollHeight;
            setTimeout(printToken, 30);
        } else {
            isTyping = false;
            // 核心修复：内容注入后手动触发 MathJax 渲染
            if (window.MathJax) {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, element]);
            }
        }
    }
    printToken();
}
