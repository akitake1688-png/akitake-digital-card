/**
 * 秋武数字卡 V38.0 核心引擎
 * 自动适配、高维拦截、无损升级
 */
function handleQiuwuSearch(userInput) {
    // --- 1. 自动变量适配层 (适配您主逻辑中的变量名) ---
    // 请确保您的 JSON 数据加载后存储在以下变量之一，或在下方直接引用
    const rawData = typeof allData !== 'undefined' ? allData : 
                    (typeof knowledgeBase !== 'undefined' ? knowledgeBase : 
                    (typeof data !== 'undefined' ? data : []));

    const query = userInput.toLowerCase().trim();
    if (!query || rawData.length === 0) return null;

    // --- 2. 前置：高维范式指纹匹配 (Priority: 985) ---
    const paradigm = rawData.find(item => {
        if (!item.is_paradigm) return false;
        // 核心算法：检测输入是否包含指纹库中至少 3 个词
        let hits = 0;
        for (const word of item.fingerprints) {
            if (query.includes(word.toLowerCase())) hits++;
        }
        return hits >= 3; 
    });

    if (paradigm) {
        return {
            type: "PARADIGM",
            tag: paradigm.tag,
            html: `<div class="qiuwu-paradigm-box">
                    <b>${paradigm.tag}</b>
                    <hr>
                    <p>${paradigm.response}</p>
                   </div>`
        };
    }

    // --- 3. 后置：旧有权重逻辑 Fallback ---
    // 如果没有命中范式，则执行您原有的权重搜索逻辑
    let bestMatch = null;
    let maxScore = -1;

    rawData.filter(item => !item.is_paradigm).forEach(item => {
        let currentScore = 0;
        const keywords = item.keywords || [];
        keywords.forEach(kw => {
            if (query.includes(kw.toLowerCase())) {
                currentScore += (item.priority || 100);
            }
        });

        if (currentScore > maxScore && currentScore > 0) {
            maxScore = currentScore;
            bestMatch = item;
        }
    });

    return bestMatch ? { type: "NORMAL", data: bestMatch } : null;
}
