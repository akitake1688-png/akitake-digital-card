(function() {
    let knowledgeBase = [];
    let isProcessing = false;

    function findBestMatch(userInput) {
        const text = userInput.toLowerCase();
        let matches = [];
        
        knowledgeBase.forEach(item => {
            let score = 0;
            item.keywords.forEach(key => {
                const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                const count = (text.match(regex) || []).length;
                if (count > 0) {
                    // 算法升级：密度分 + 优先级分，并设上限防止长文本爆炸
                    score += (count * 3) + (item.priority / 1000);
                }
            });
            if (score > 0) {
                matches.push({ item, score: Math.min(score, 5000) });
            }
        });

        if (matches.length === 0) return null;
        matches.sort((a, b) => b.score - a.score);
        return matches[0].item;
    }

    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const res = await fetch('knowledge.json?v=' + Date.now());
            knowledgeBase = await res.json();
            
            const input = document.getElementById('user-input');
            const sendBtn = document.getElementById('send-btn');
            const chat = document.getElementById('chat-container');

            const handleSend = async () => {
                const text = input.value.trim();
                if (!text || isProcessing) return;
                
                isProcessing = true;
                input.disabled = true;
                sendBtn.disabled = true;

                appendMessage('user', text);
                input.value = '';

                const matched = findBestMatch(text);
                const responseText = matched ? matched.response : knowledgeBase.find(i => i.id === 'SENTINEL_GATE').response;
                
                const segments = responseText.split('[BREAK]');
                for (let seg of segments) {
                    if (seg.trim()) {
                        appendMessage('bot', seg.trim());
                        await new Promise(r => setTimeout(r, 600));
                        if (window.MathJax) MathJax.typesetPromise();
                    }
                }

                isProcessing = false;
                input.disabled = false;
                sendBtn.disabled = false;
                input.focus();
            };

            sendBtn.onclick = handleSend;
            input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };
            document.querySelectorAll('.nav-btn[data-preset]').forEach(btn => {
                btn.onclick = () => { input.value = btn.getAttribute('data-preset'); handleSend(); };
            });

            document.getElementById('clear-btn').onclick = () => {
                chat.innerHTML = "";
                localStorage.clear();
                location.reload(); 
            };
        } catch (e) { console.error("Sentinel System Error:", e); }
    });

    function appendMessage(role, html) {
        const chat = document.getElementById('chat-container');
        const div = document.createElement('div');
        div.className = `msg-row ${role}`;
        div.innerHTML = `<div class="bubble">${html}</div>`;
        div.onclick = () => {
            navigator.clipboard.writeText(div.innerText).then(() => {
                div.classList.add('copied');
                setTimeout(() => div.classList.remove('copied'), 2000);
            });
        };
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }
})();
