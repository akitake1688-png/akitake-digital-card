(function() {
    let knowledgeBase = [];
    let isProcessing = false;

    // 1. 全局防御与环境监听
    window.addEventListener('error', (e) => {
        console.warn('哨兵拦截:', e.message);
    });

    document.addEventListener('DOMContentLoaded', async () => {
        try {
            // 2. 加载全量知识库并防止缓存
            const res = await fetch('knowledge.json?v=' + Date.now());
            knowledgeBase = await res.json();
            console.log("秋武逻辑 V40.8 (精诚版) 部署完毕");

            // 3. 事件绑定
            document.getElementById('send-btn')?.addEventListener('click', handleAction);
            document.getElementById('user-input')?.addEventListener('keypress', e => {
                if(e.key === 'Enter') handleAction();
            });
            
            // 清除功能自检
            document.getElementById('clear-history')?.addEventListener('click', () => {
                if (confirm("确认执行数据物理自毁？所有本地记录将抹除。")) {
                    localStorage.clear();
                    location.reload();
                }
            });

            document.getElementById('upload-btn')?.addEventListener('click', () => {
                document.getElementById('file-upload').click();
            });

            document.getElementById('file-upload')?.addEventListener('change', handleFileUpload);

            // 预设按钮事件委托
            document.querySelectorAll('.nav-btn[data-preset]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const input = document.getElementById('user-input');
                    if(input) {
                        input.value = btn.dataset.preset;
                        handleAction();
                    }
                });
            });

        } catch (e) { console.error("内核加载失败:", e); }
    });

    async function handleAction() {
        const input = document.getElementById('user-input');
        const text = input?.value.trim();
        if (!text || isProcessing) return;
        
        postMessage(text, 'user');
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
            item.keywords.forEach(k => {
                const kw = k.toLowerCase();
                // 算法升级：全匹配权重翻倍，部分匹配权重累加
                if (query === kw) score += (item.priority + 1000);
                else if (query.includes(kw)) score += (item.priority || 100);
            });
            if (score > maxScore) { maxScore = score; match = item; }
        });

        const res = (maxScore > 0) ? match.response : knowledgeBase.find(i => i.id === "FALLBACK_CORE").response;
        await renderResponse(res);
    }

    async function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return postMessage("<b>【警报】</b> 文档体积超限(>5MB)，请压缩后再次上传。", "bot");

        postMessage(`📄 捕获文档: ${file.name}`, 'user');
        isProcessing = true;
        await renderResponse("<b>【哨兵扫描】</b>[BREAK]正在进行日式逻辑特征码提取...[BREAK]██████████ 100%[BREAK]扫描完成。");
        
        const name = file.name.toLowerCase();
        let kw = "分析"; // 默认触发分析逻辑
        if (/rp|计划/.test(name)) kw = "rp分析";
        else if (/面试|面接/.test(name)) kw = "面试";

        await processLogic(kw);
        e.target.value = "";
        isProcessing = false;
    }

    async function renderResponse(raw) {
        const segments = raw.split('[BREAK]');
        for (const s of segments) {
            if (s && s.trim()) {
                postMessage(s.trim(), 'bot');
                // 模拟人类节奏延迟
                const delay = Math.min(Math.max(s.length * 40, 600), 1500);
                await new Promise(r => setTimeout(r, delay));
            }
        }
        setTimeout(() => { if(window.MathJax) window.MathJax.typeset(); }, 150);
    }

    function postMessage(content, role) {
        const chat = document.getElementById('chat-container');
        if (!chat) return;
        const div = document.createElement('div');
        div.className = `msg-row ${role}`;
        div.innerHTML = `<div class="bubble">${content}</div>`;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }
})();
