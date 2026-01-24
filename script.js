/**
 * 秋武数字卡 V38.0 统一熔接引擎
 * A层：隐私/自毁指令 | B层：高维指纹拦截 | C层：权重算法 fallback
 */
let akitakeData = [];

// 数据加载与初始化
async function initAkitakeApp() {
    try {
        const response = await fetch('knowledge.json');
        akitakeData = await response.json();
        console.log("V38.0 熔接系统：数据资产与拦截引擎已同步。");
    } catch (err) {
        console.error("加载失败:", err);
    }
}

// 统一搜索入口
function search(userInput) {
    const s = userInput.toLowerCase().trim();
    if (!s) return null;

    // --- A层：隐私主权逻辑 (保护您的清理优化) ---
    if (s === '清除' || s === '自毁' || s === 'clear') {
        localStorage.clear();
        return { type: 'SYS', html: '<div class="sys-alert"><b>【哨兵指令】</b> 缓存灵感已物理粉碎，逻辑足迹已抹除。</div>' };
    }

    // --- B层：高维范式拦截 (V38 指纹指纹识别) ---
    const paradigm = akitakeData.find(item => {
        if (!item.is_paradigm) return false;
        // 交叉检测：必须命中至少 3 个指纹词
        const hits = item.fingerprints.filter(f => s.includes(f.toLowerCase())).length;
        return hits >= 3;
    });

    if (paradigm) {
        return { 
            type: 'PARADIGM', 
            html: `<div class="qiuwu-paradigm-box"><b>${paradigm.tag}</b><hr><p>${paradigm.response}</p></div>` 
        };
    }

    // --- C层：常规权重博弈 (保留您所有的旧有优化数据) ---
    let bestMatch = null;
    let maxScore = -1;

    akitakeData.filter(item => !item.is_paradigm).forEach(item => {
        let currentScore = 0;
        const keywords = item.keywords || [];
        keywords.forEach(kw => {
            if (s.includes(kw.toLowerCase())) {
                currentScore += (item.priority || 100);
            }
        });

        if (currentScore > maxScore && currentScore > 0) {
            maxScore = currentScore;
            bestMatch = item;
        }
    });

    if (bestMatch) {
        return { 
            type: 'NORMAL', 
            html: `<div class="normal-box"><b>${bestMatch.title || '秋武逻辑建议'}</b><p>${bestMatch.content}</p></div>` 
        };
    }
    
    return null;
}

initAkitakeApp();
