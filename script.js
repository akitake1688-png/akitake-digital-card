/* * 秋武逻辑 V40.2 智能增强版 
 * 请【全量覆盖】此文件，确保第一行没有重复的声明 
 */
let knowledgeBase = [];
let isProcessing = false;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('knowledge.json');
        if (!res.ok) throw new Error('Knowledge source 404');
        knowledgeBase = await res.json();
        console.log("秋武逻辑 V40.2 哨兵系统启动成功");
        
        // 绑定侧边栏按钮
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
        if (fileInput) fileInput.addEventListener('change', handleFileUpload);

        // 复制功能反馈优化
        document.getElementById('chat-container').addEventListener('click', function(e) {
            const target = e.target.closest('.copy-box');
            if (target) {
                const text = target.innerText.replace("📋 点击复制", "").replace("✅ 已复制！", "").trim();
                navigator.clipboard.writeText(text).then(() => {
                    const originalHTML = target.innerHTML;
                    target.style.background = "#d4edda"; 
                    target.innerHTML = "✅ 已复制！请投喂给 Claude";
                    setTimeout(() => {
                        target.style.background = "";
                        target.innerHTML = originalHTML;
                    }, 2000);
                });
            }
        });

    } catch (e) { console.error("初始化逻辑失败:", e); }
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
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    postMessage(`📄 已上传文件: ${file.name}`, 'user');
    isProcessing = true;
    await renderResponse("<b>【哨兵扫描中】</b>[BREAK]正在进行结构化建模...[BREAK]██████████ 100%");

    const name = file.name.toLowerCase();
    let typeKeyword = "FILE_TYPE_GENERAL";

    // 智能嗅探逻辑
    if (/rp|计划|plan|proposal/.test(name)) {
        typeKeyword = "FILE_TYPE_RP";
    } else if (/面试|interview|面接|稿/.test(name)) {
        typeKeyword = "FILE_TYPE_INTERVIEW";
    } else if (/文书|essay|志望|理由|作文|thesis|statement/.test(name) || name.endsWith(".pdf") || name.endsWith(".docx")) {
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
document.getElementById('user-input').addEventListener('keypress', e => { if (e.key === 'Enter') handleAction(); });
