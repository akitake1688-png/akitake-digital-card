(function() {
    let knowledgeBase = [];
    let isProcessing = false;

    // 全局错误防御
    window.addEventListener('error', (e) => {
        console.warn('哨兵拦截:', e.message);
        if (!document.querySelector('.error-guard')) {
            postMessage("<b>【警报】</b> 环境加载异常，请按 <b>Ctrl+Shift+R</b> 刷新。", 'bot');
        }
    });

    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const res = await fetch('knowledge.json?v=' + Date.now());
            knowledgeBase = await res.json();
            console.log("秋武逻辑 V40.6 部署完毕");

            document.getElementById('send-btn')?.addEventListener('click', handleAction);
            document.getElementById('user-input')?.addEventListener('keypress', e => e.key === 'Enter' && handleAction());
            
            // 清除功能绑定
            document.getElementById('clear-history')?.addEventListener('click', () => {
                if (confirm("确认清除本地对话缓存？")) {
                    localStorage.clear();
                    location.reload();
                }
            });

            // 上传及导航
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (btn.id === 'upload-btn') document.getElementById('file-upload').click();
                    else if (btn.dataset.preset) {
                        document.getElementById('user-input').value = btn.dataset.preset;
                        handleAction();
                    }
                });
            });

            document.getElementById('file-upload')?.addEventListener('change', handleFileUpload);

            // 复制反馈
            document.getElementById('chat-container').addEventListener('click', e => {
                const box = e.target.closest('.copy-box');
                if (box) {
                    const text = box.innerText.replace(/📋|✅|点击复制|已复制/g, "").trim();
                    navigator.clipboard.writeText(text).then(() => {
                        const old = box.innerHTML;
                        box.innerHTML = "✅ 已复制指令！请投喂给 Claude";
                        setTimeout(() => box.innerHTML = old, 2000);
                    });
                }
            });

        } catch (e) { console.error("内核加载失败:", e); }
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
        let maxScore = -1;
        knowledgeBase.forEach(item => {
            let score = 0;
            item.keywords.forEach(k => { if (query.includes(k.toLowerCase())) score += (item.priority || 100); });
            if (score > maxScore) { maxScore = score; match = item; }
        });
        const res = (maxScore > 0) ? match.response : knowledgeBase.find(i => i.id === "FALLBACK_CORE").response;
        await renderResponse(res);
    }

    async function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return postMessage("<b>【警报】</b> 文件体积超限(>5MB)。", "bot");

        postMessage(`📄 捕获文档: ${file.name}`, 'user');
        isProcessing = true;
        await renderResponse("<b>【哨兵扫描】</b>[BREAK]特征码匹配中...[BREAK]██████████ 100%");
        
        const name = file.name.toLowerCase();
        let kw = "FILE_TYPE_GENERAL";
        if (/rp|计划|plan/.test(name)) kw = "FILE_TYPE_RP";
        else if (/面试|面接|interview/.test(name)) kw = "FILE_TYPE_INTERVIEW";
        else if (/志望|essay|文书|pdf|docx/.test(name)) kw = "FILE_TYPE_ESSAY";

        await processLogic(kw);
        e.target.value = "";
        isProcessing = false;
    }

    async function renderResponse(raw) {
        const segments = raw.split('[BREAK]');
        for (const s of segments) {
            if (s.trim()) { // 补丁：防空气泡
                postMessage(s.trim(), 'bot');
                await new Promise(r => setTimeout(r, 600));
            }
        }
        setTimeout(() => { if(window.MathJax) window.MathJax.typeset(); }, 100);
    }

    function postMessage(content, role) {
        const chat = document.getElementById('chat-container');
        const div = document.createElement('div');
        div.className = `msg-row ${role}`;
        div.innerHTML = `<div class="bubble">${content}</div>`;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }
})();
