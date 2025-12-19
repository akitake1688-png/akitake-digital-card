/* ============================================================
   秋武 AI 终局思维逻辑引擎 - 核心驱动脚本
   修复内容：左侧按钮激活态、点击锁定、异步分段流、MathJax 渲染
   ============================================================ */

let KNOWLEDGE_DATA = [];
let isTyping = false; // 全局锁定开关，防止逻辑冲突

/**
 * 1. 初始化系统，加载知识库
 */
async function init() {
    try {
        const resp = await fetch('./knowledge.json'); 
        if (!resp.ok) throw new Error("知识库路径配置错误，请确认 knowledge.json 在当前目录");
        KNOWLEDGE_DATA = await resp.json();
        
        // 渲染左侧逻辑引擎维度按钮
        renderButtons(KNOWLEDGE_DATA);
        
        // 初始欢迎语
        await wait(500);
        await typeEffect("你好！我是秋武老师的 AI 助理。🌸", true);
        await wait(600);
        await typeEffect("我已加载考学逻辑库。你可以点击左侧维度，或在下方输入关键词进行深度咨询。", false);
    } catch (e) {
        console.error("初始化失败:", e);
        const chat = document.getElementById('chat-container');
        if (chat) chat.innerHTML = `<div style="padding:20px; color:#ef4444;">[系统错误] 无法连接到逻辑大脑，请检查 JSON 路径。</div>`;
    }
}

/**
 * 2. 渲染左侧导航按钮（核心修复点）
 */
function renderButtons(data) {
    const container = document.getElementById('nav-buttons-container');
    if (!container) return;
    
    container.innerHTML = "";
    data.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        
        // 提取 Intent 的核心部分作为显示名称
        const label = item.intent.split('_').pop().toUpperCase();
        btn.innerHTML = `<span>⚡</span> ${label}`;
        
        // 核心修复：显式绑定点击事件并处理排他性
        btn.onclick = () => {
            // 如果 AI 正在回复，为了逻辑严谨性，暂时锁定切换
            if (isTyping) return; 

            // 视觉反馈：清除所有高亮，激活当前按钮
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 触发回复逻辑
            handleInquiry(item);
        };
        container.appendChild(btn);
    });
}

/**
 * 3. 搜索框逻辑
 */
async function handleSearch() {
    const input = document.getElementById('user-input');
    const query = input.value.trim().toLowerCase();
    
    // 状态检查：空输入或正在回复时拦截
    if (!query || isTyping) return;

    // 清除左侧按钮的激活态（因为是全局搜索）
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    sendUserMessage(input.value.trim());
    input.value = "";

    const match = KNOWLEDGE_DATA.find(item => 
        item.intent.toLowerCase().includes(query) || 
        (item.keywords && item.keywords.some(k => query.includes(k.toLowerCase()) || k.toLowerCase().includes(query))) ||
        (item.response.includes(query) && query.length > 1)
    );

    if (match) {
        await handleInquiry(match, true);
    } else {
        await typeEffect("这个维度的逻辑我还在学习中。建议您输入：<b>酯化、面试、费用</b>，或直接咨询秋武老师：<b>qiuwu999</b>", true);
    }
}

/**
 * 4. 核心回复分发器
 */
async function handleInquiry(item, isFromSearch = false) {
    if (isTyping || !item) return;

    // 如果不是从搜索框进来的（即点击左侧进入），需要补发一个用户气泡
    if (!isFromSearch) {
        const userLabel = item.intent.split('_').pop().toUpperCase();
        sendUserMessage(userLabel);
    }

    // 视觉状态切换：分析中
    const status = document.getElementById('typing-status');
    status.innerText = "秋武老师正在分析...";
    status.classList.add('typing-active');

    // 处理分段异步流 [BREAK]
    const segments = item.response.split('[BREAK]').map(s => s.trim());
    for (let i = 0; i < segments.length; i++) {
        await typeEffect(segments[i], i === 0);
        await wait(600); // 秋武流呼吸停顿
    }
    
    status.innerText = "在线";
    status.classList.remove('typing-active');
}

/**
 * 5. 打字机效果与渲染
 */
function typeEffect(text, showAvatar = true) {
    return new Promise(resolve => {
        isTyping = true;
        const chat = document.getElementById('chat-container');
        const row = document.createElement('div');
        row.className = `msg-row bot ${showAvatar ? '' : 'no-avatar'}`;
        row.innerHTML = `${showAvatar ? '<img src="profile.jpg" class="avatar-chat">' : '<div class="avatar-placeholder"></div>'}<div class="bubble"></div>`;
        chat.appendChild(row);
        
        const bubble = row.querySelector('.bubble');
        let i = 0;
        
        const interval = setInterval(() => {
            if (i < text.length) {
                // 处理 HTML 标签（如粗体和换行）
                if (text[i] === '<') { 
                    let end = text.indexOf('>', i);
                    bubble.innerHTML += text.substring(i, end + 1);
                    i = end + 1;
                } else {
                    bubble.innerHTML += text[i] === "\n" ? "<br>" : text[i];
                    i++;
                }
                chat.scrollTop = chat.scrollHeight;
            } else {
                clearInterval(interval);
                isTyping = false;
                // 渲染 LaTeX 数学公式
                if (window.MathJax) {
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub, bubble]);
                }
                resolve();
            }
        }, 15);
    });
}

/**
 * 6. 辅助工具函数
 */
function sendUserMessage(text) {
    const chat = document.getElementById('chat-container');
    const msg = document.createElement('div');
    msg.className = 'msg-row user';
    msg.innerHTML = `<div class="bubble">${text}</div>`;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

const wait = (ms) => new Promise(res => setTimeout(res, ms));

function showContact() {
    if (isTyping) return;
    const contactData = KNOWLEDGE_DATA.find(d => d.intent.includes("financial")) || 
                        {intent:"联系秋武", response:"【秋武老师联系方式】[BREAK]💬 微信号：**qiuwu999** [BREAK]📩 请注明考学意向领域。"};
    handleInquiry(contactData);
}

// 绑定全局事件
document.getElementById('send-btn').onclick = handleSearch;
document.getElementById('user-input').onkeydown = (e) => { if(e.key === 'Enter') handleSearch(); };
document.addEventListener('DOMContentLoaded', init);
