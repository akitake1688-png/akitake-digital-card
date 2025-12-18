/**
 * 秋武流数字化名片核心引擎
 * 具备自动数据加载、关键词检索及渲染容错机制
 */

let KNOWLEDGE_BASE = [];
let isTyping = false;

// 1. 初始化：从 knowledge.json 获取数据
async function initApp() {
    try {
        const response = await fetch('knowledge.json');
        if (!response.ok) throw new Error('无法加载数据库文件');
        KNOWLEDGE_BASE = await response.json();
        renderButtons(KNOWLEDGE_BASE);
    } catch (error) {
        console.error('Initialization Error:', error);
        document.getElementById('nav-buttons-container').innerHTML = `<p style="color:#ef4444; font-size:12px;">数据库连接失败</p>`;
    }
}

// 2. 渲染左侧按钮
function renderButtons(data) {
    const container = document.getElementById('nav-buttons-container');
    container.innerHTML = "";
    
    data.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        // 自动将 intent 转化为更易读的标题
        btn.innerHTML = item.intent.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        btn.onclick = () => startDisplay(item.response);
        container.appendChild(btn);
    });
}

// 3. 搜索逻辑
document.getElementById('search-input').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = KNOWLEDGE_BASE.filter(item => 
        item.keywords.some(k => k.toLowerCase().includes(term)) || 
        item.intent.toLowerCase().includes(term)
    );
    renderButtons(filtered);
});

// 4. 打字机效果核心逻辑
function startDisplay(text) {
    if (isTyping) return;
    
    const output = document.getElementById('output-box');
    const container = document.getElementById('chat-container');
    output.innerHTML = "";
    isTyping = true;

    // 正则捕获：HTML标签、MathJax公式 ($...$)、或者单个字符
    const tokens = text.match(/(<[^>]+>|\$[^\$]+\$|[^<$])/g) || [];
    let index = 0;

    const timer = setInterval(() => {
        if (index < tokens.length) {
            output.innerHTML += tokens[index];
            index++;
            // 自动滚动到底部
            container.scrollTop = container.scrollHeight;
        } else {
            clearInterval(timer);
            isTyping = false;
            // 渲染结束，调用 MathJax 处理公式
            if (window.MathJax) {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, output]);
            }
        }
    }, 30); // 速度设为 30ms，平衡视觉效果与阅读感
}

// 5. 特殊按钮：联系方式
function handleContact() {
    const contactText = "<b>联系秋武：</b><br><br>📍 微信号：<b>qiuwu999</b><br>💡 提示：添加请注明“数字化名片”，系统将自动优先对齐您的逻辑需求。";
    startDisplay(contactText);
}

// 屏蔽非关键报错
window.onerror = () => true;

// 启动程序
initApp();
