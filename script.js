// 1. 增强型复制函数 (容错率优化)
async function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        // 降级方案：针对旧版微信浏览器
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            alert('微信号已成功复制');
        } catch (err) {
            console.error('复制失败', err);
        }
        document.body.removeChild(textArea);
        return;
    }
    await navigator.clipboard.writeText(text);
    alert('微信号已成功复制：' + text);
}

// 2. 智能层级协同调度
function showDetail(tabId) {
    // 关闭所有卡片
    document.querySelectorAll('.content-card').forEach(card => {
        card.classList.remove('active');
    });
    // 激活目标卡片
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');
}

// 3. SNS 模式动态生成逻辑
function generateSnsComment(text) {
    return `<div class="sns-comment">
                <strong>秋武导师点评：</strong><br>${text}
            </div>`;
}
