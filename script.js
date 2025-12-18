/**
 * 秋武流数字化名片引擎
 * 核心逻辑：异步加载 JSON 数据 + 动态按钮生成 + MathJax 公式渲染
 */

let KNOWLEDGE_DATA = [];
let isTyping = false;

// 1. 初始化加载
async function init() {
    try {
        const resp = await fetch('knowledge.json');
        KNOWLEDGE_DATA = await resp.json();
        renderButtons(KNOWLEDGE_DATA);
    } catch (e) {
        console.error("数据加载失败", e);
        document.getElementById('nav-buttons-container').innerHTML = "数据加载失败";
    }
}

// 2. 渲染按钮
function renderButtons(data) {
    const container = document.getElementById('nav-buttons-container');
    container.innerHTML = "";
    data.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        // 按钮文字：取 intent 并美化（如 academic_math -> Academic Math）
        btn.innerText = item.intent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        btn.onclick = () => typeEffect(item.response);
        container.appendChild(btn);
    });
}

// 3. 搜索过滤
document.getElementById('search-input').addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = KNOWLEDGE_DATA.filter(item => 
        item.keywords.some(k => k.includes(val)) || item.intent.includes(val)
    );
    renderButtons(filtered);
});

// 4. 打字机特效核心
function typeEffect(text) {
    if (isTyping) return;
    const output = document.getElementById('output-box');
    const container = document.getElementById('chat-container');
    output.innerHTML = "";
    isTyping = true;

    // 正则捕获：HTML标签、MathJax公式、或单个字符
    const tokens = text.match(/(<[^>]+>|\$[^\$]+\$|[^<$]|\n)/g) || [];
    let i = 0;

    const timer = setInterval(() => {
        if (i < tokens.length) {
            if (tokens[i] === "\n") {
                output.innerHTML += "<br>";
            } else {
                output.innerHTML += tokens[i];
            }
            i++;
            container.scrollTop = container.scrollHeight;
        } else {
            clearInterval(timer);
            isTyping = false;
            // 渲染完毕后，让 MathJax 处理公式
            if (window.MathJax) {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, output]);
            }
        }
    }, 25);
}

// 联系按钮特殊处理
function showContact() {
    typeEffect("<b>联系秋武：</b><br><br>📍 微信号：<b>qiuwu999</b><br>提示：添加请注明“数字化名片”。");
}

// 屏蔽报错确保运行
window.onerror = () => true;

init();
