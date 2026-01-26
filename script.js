(function() {
    let knowledgeBase = [];
    let isProcessing = false;

    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const res = await fetch('knowledge.json?v=' + Date.now());
            knowledgeBase = await res.json();
            
            const input = document.getElementById('user-input');
            const sendBtn = document.getElementById('send-btn');
            const chat = document.getElementById('chat-container');

            document.querySelectorAll('.nav-btn[data-preset]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (isProcessing) return;
                    input.value = btn.getAttribute('data-preset');
                    await handleSend(); 
                });
            });

            document.getElementById('clear-history')?.addEventListener('click', () => {
                if (confirm("确认清除所有逻辑记录？")) { 
                    chat.innerHTML = '';
                    localStorage.clear(); 
                    location.reload(true); 
                }
            });

            document.getElementById('file-upload')?.addEventListener('change', async e => {
                const file = e.target.files[0];
                if (!file) return;
                if (!/\.(pdf|doc|docx|txt)$/i.test(file.name)) {
                    alert("格式限制：仅支持 PDF/DOCX/TXT");
                    return;
                }
                appendMessage('user', `📄 上传文档: ${file.name}`);
                appendMessage('bot', '<b>【哨兵扫描】</b> 逻辑特征提取中...');
                setTimeout(() => {
                    appendMessage('bot', '扫描完成。该研究计划逻辑链已捕获。请告诉您的困惑，或联系微信：qiuwu999。');
                }, 1500);
            });

            const handleSend = async () => {
                const text = input.value.trim();
                if (!text || isProcessing) return;
                
                isProcessing = true;
                sendBtn.disabled = true;
                input.disabled = true; 
                
                appendMessage('user', text);
                input.value = '';

                let matches = [];
                knowledgeBase.forEach(item => {
                    let score = 0;
                    item.keywords.forEach(k => {
                        const lowText = text.toLowerCase();
                        const lowKw = k.toLowerCase();
                        if (lowText === lowKw) score += (item.priority + 5000);
                        else if (lowText.includes(lowKw)) score += item.priority;
                    });
                    if (score > 0) matches.push({ item, score });
                });

                matches.sort((a, b) => b.score - a.score);
                const best = matches[0]?.item || knowledgeBase.find(i => i.id === "SENTINEL_GATE");

                const segments = best.response.split('[BREAK]');
                for (let i = 0; i < segments.length; i++) {
                    if (segments[i].trim()) {
                        appendMessage('bot', segments[i].trim());
                        await new Promise(r => setTimeout(r, Math.min(segments[i].length * 25 + 400, 1100)));
                    }
                }

                if (window.MathJax) {
                    window.MathJax.typesetPromise().catch(err => {
                        console.warn("MathJax Error:", err);
                        appendMessage('bot', '<small style="color:#999">（渲染异常，请加微信 qiuwu999）</small>');
                    });
                }

                isProcessing = false;
                sendBtn.disabled = false;
                input.disabled = false;
                input.focus();
            };

            sendBtn.addEventListener('click', handleSend);
            input.addEventListener('keypress', e => { if (e.key === 'Enter') handleSend(); });

        } catch (e) { console.error("Loading Error"); }
    });

    function appendMessage(role, html) {
        const chat = document.getElementById('chat-container');
        if (!chat) return;
        const div = document.createElement('div');
        div.className = `msg-row ${role}`;
        div.innerHTML = `<div class="bubble">${html}</div>`;
        
        if (role === 'bot') {
            div.querySelector('.bubble').addEventListener('click', async function() {
                try {
                    await navigator.clipboard.writeText(this.innerText);
                    this.classList.add('copied');
                    setTimeout(() => this.classList.remove('copied'), 1200);
                } catch(e) {}
            });
        }
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }
})();
