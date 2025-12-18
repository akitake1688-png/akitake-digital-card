/* 打字机逻辑：具备标签感知能力 */
const data = {
    advantage: "<b>核心优势：</b><br>基于 $P(A|B) = \\frac{P(B|A)P(A)}{P(B)}$ 的逻辑对齐，精准捕获学术盲点。",
    mode: "<b>辅导模式：</b><br>全异步打字机交互，支持 HTML 标签感知渲染。",
    contact: "<b>联系：</b><br>ID: qiuwu999"
};

let typing = false;

function showSection(key) {
    if (typing) return;
    const el = document.getElementById('output');
    el.innerHTML = "";
    
    // 标签感知正则：防止拆分 <br> 或 <b> */
    const tokens = data[key].match(/<[^>]+>|[^<]/g);
    let i = 0;
    typing = true;

    const interval = setInterval(() => {
        if (i < tokens.length) {
            el.innerHTML += tokens[i];
            i++;
        } else {
            clearInterval(interval);
            typing = false;
            // 异步触发公式渲染
            if (window.MathJax) MathJax.Hub.Queue(["Typeset", MathJax.Hub, el]);
        }
    }, 30);
}
