/**
 * 秋武逻辑 V40.2 智能增强版 (Intelligence & Feedback Enhanced)
 */
let knowledgeBase = [];
let isProcessing = false;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('knowledge.json');
        knowledgeBase = await res.json();
        console.log("秋武逻辑 V40.2 智能系统已就绪");
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.id === 'upload-btn') {
                    document.getElementById('file-upload').click();
                } else {
                    const preset = btn.dataset.preset;
                    if (preset) {
                        document.getElementById('user-input').value = preset;
                        handleAction();
                    }
                }
            });
        });

        document.getElementById('file-upload').addEventListener('change', handleFileUpload);

        // 绑定复制反馈 (V40.2 优化)
        document.getElementById('chat-container').addEventListener('click', function(e) {
            const target = e.target.closest('.copy-box');
            if (target) {
                const text = target.innerText.replace("📋 点击复制", "").replace("已复制！", "").trim();
                navigator.clipboard.writeText(text).then(() => {
                    const originalHTML = target.innerHTML;
                    target.style.background = "#d4edda"; 
                    target.innerText = "✅ 已复制到剪贴板！请投喂给 Claude";
                    setTimeout(() => {
                        target.style.background = "";
                        target.innerHTML = originalHTML;
                    }, 2000);
                });
            }
        });

    } catch (e) { console.error("初始化失败", e); }
});

async function handleAction() {
    const input = document.getElementById('user-input');
    const text = input?.value.trim();
    if (!text || isProcessing) return;

    postMessage(input.value, 'user');
    input.value = "";
    isProcessing = true;
    await processLogic(text.toLowerCase());
    isProcessing = false;
}

async function processLogic(query) {
    let match = null;
    let topScore = -1;

    knowledgeBase.forEach(item => {
        let score = 0;
        (item.keywords || []).forEach(k => { 
            if (query.includes(k.toLowerCase())) score += (item.priority || 100); 
        });
        if (score > topScore) { topScore = score; match = item; }
    });

    const response = (topScore > 0) ? match.response : knowledgeBase.find(i => i.id === "FALLBACK_CORE").response;
    await renderResponse(response);

    if (query.includes('清除') || query.includes('自毁')) {
        localStorage.clear();
        setTimeout(() => location.reload(), 1500);
    }
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    postMessage(`📄 已检测到文档: ${file.name}`, 'user');
    isProcessing = true;
    await renderResponse("<b>【哨兵隔离区】</b>[BREAK]正在进行逻辑特征码扫描...[BREAK]██████████ 100%");

    const name = file.name.toLowerCase();
    let typeKeyword = "FILE_TYPE_GENERAL";

    // 严格关键词匹配
    if (/rp|计划|plan|proposal|愿书|願書/.test(name)) {
        typeKeyword = "FILE_TYPE_RP";
    } else if (/面试|interview|面接|稿/.test(name)) {
        typeKeyword = "FILE_TYPE_INTERVIEW";
    } else if (/文书|essay|志望|理由|作文|thesis|statement/.test(name)) {
        typeKeyword = "FILE_TYPE_ESSAY";
    } 
    // V40.2 后缀兜底逻辑：如果是标准文档但没命中关键词，猜测为文书类以增强智能感
    else if (name.endsWith(".pdf") || name.endsWith(".docx") || name.endsWith(".doc")) {
        typeKeyword = "FILE_TYPE_ESSAY";
    }

    await processLogic(typeKeyword);
    event.target.value = ''; 
    isProcessing = false;
}

async function renderResponse(rawText) {
    const segments = rawText.split('[BREAK]');
    for (const segment of segments) {
        postMessage(segment.trim(), 'bot');
        await new Promise(r => setTimeout(r, 600));
    }
    if (window.MathJax) MathJax.typeset();
}

function postMessage(content, role) {
    const chat = document.getElementById('chat-container');
    const div = document.createElement('div');
    div.className = `msg-row ${role}`;
    div.innerHTML = `<div class="bubble">${content}</div>`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

document.getElementById('send-btn').addEventListener('click', handleAction);
document.getElementById('user-input').addEventListener('keypress', e => { if (e.key === 'Enter') handleAction(); });/**
 * 秋武逻辑 V40.1 哨兵桥接版 (Sentinel Bridge Enhanced)
 * 功能：文档类型嗅探 + Claude 桥接 + 多语言逻辑 + 隐私安全 + 容错增强
 */
let knowledgeBase = [];
let isProcessing = false;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('knowledge.json');
        knowledgeBase = await res.json();
        console.log("秋武逻辑 V40.1 哨兵系统已加载 (容错增强版)");
        
        // 绑定预设按钮
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.id === 'upload-btn') {
                    document.getElementById('file-upload').click();
                } else {
                    const preset = btn.dataset.preset;
                    if (preset) {
                        document.getElementById('user-input').value = preset;
                        handleAction();
                    }
                }
            });
        });

        // 绑定文件上传
        const fileInput = document.getElementById('file-upload');
        if (fileInput) {
            fileInput.addEventListener('change', handleFileUpload);
        }

        // 绑定复制功能 (事件委托)
        document.getElementById('chat-container').addEventListener('click', function(e) {
            if (e.target.classList.contains('copy-box') || e.target.closest('.copy-box')) {
                const target = e.target.classList.contains('copy-box') ? e.target : e.target.closest('.copy-box');
                const text = target.innerText.replace("复制", "").trim();
                navigator.clipboard.writeText(text).then(() => {
                    const originalBg = target.style.background;
                    target.style.background = "#d4edda"; // 绿色反馈
                    setTimeout(() => target.style.background = originalBg, 500);
                });
            }
        });

    } catch (e) { console.error("JSON加载错误", e); }
});

async function handleAction() {
    const input = document.getElementById('user-input');
    const text = input?.value.trim().toLowerCase();
    if (!text || isProcessing) return;

    postMessage(input.value, 'user');
    input.value = "";
    isProcessing = true;

    await processLogic(text);
    isProcessing = false;
}

// 核心处理逻辑
async function processLogic(query) {
    let match = null;
    let topScore = -1;

    knowledgeBase.forEach(item => {
        let score = 0;
        (item.keywords || []).forEach(k => { 
            if (query.includes(k.toLowerCase())) score += (item.priority || 100); 
        });
        if (score > topScore) { topScore = score; match = item; }
    });

    const response = (topScore > 0) ? match.response : knowledgeBase.find(i => i.id === "FALLBACK_CORE").response;
    await renderResponse(response);

    // 隐私清除逻辑
    if (query.includes('清除') || query.includes('自毁')) {
        localStorage.clear();
        setTimeout(() => location.reload(), 1500);
    }
}

// 文件上传处理 (V40.1 核心增强)
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    postMessage(`📄 已上传文件: ${file.name}`, 'user');
    isProcessing = true;

    // 模拟扫描动画
    await renderResponse("<b>【哨兵系统启动】</b>[BREAK]正在进行结构化扫描...[BREAK]██████████ 100%");

    // 基于文件名的类型嗅探 (Sentinel Sniffing)
    const name = file.name.toLowerCase();
    let typeKeyword = "FILE_TYPE_GENERAL"; // 默认兜底

    // 严格匹配逻辑
    if (name.includes("rp") || name.includes("计划") || name.includes("plan") || name.includes("proposal")) {
        typeKeyword = "FILE_TYPE_RP";
    } else if (name.includes("面试") || name.includes("interview") || name.includes("面接") || name.includes("稿")) {
        typeKeyword = "FILE_TYPE_INTERVIEW";
    } else if (name.includes("文书") || name.includes("essay") || name.includes("志望") || name.includes("理由") || name.includes("thesis")) {
        typeKeyword = "FILE_TYPE_ESSAY";
    }

    // 触发对应的 JSON 逻辑
    await processLogic(typeKeyword);
    
    // 清空 input 防止重复上传无效
    event.target.value = ''; 
    isProcessing = false;
}

async function renderResponse(rawText) {
    const segments = rawText.split('[BREAK]');
    for (const segment of segments) {
        postMessage(segment.trim(), 'bot');
        await new Promise(r => setTimeout(r, 600)); // 思考延迟
    }
    if (window.MathJax) MathJax.typeset();
}

function postMessage(content, role) {
    const chat = document.getElementById('chat-container');
    const div = document.createElement('div');
    div.className = `msg-row ${role}`;
    div.innerHTML = `<div class="bubble">${content}</div>`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

// 绑定回车与发送
document.getElementById('send-btn').addEventListener('click', handleAction);
document.getElementById('user-input').addEventListener('keypress', e => { if (e.key === 'Enter') handleAction(); });
document.getElementById('clear-history')?.addEventListener('click', () => {
    if (confirm("确认清除？")) { localStorage.clear(); location.reload(); }
});
