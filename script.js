/**
 * 秋武全量知识库 (AKI_KNOWLEDGE)
 * 后续追加 PDF 数据请在此对象内扩展子类别
 */
const AKI_KNOWLEDGE = {
    science: {
        calculus: "【理科逻辑：微分极限】微分本质是瞬时变化率。定义为：$$ \lim_{\Delta x \to 0} \frac{f(x+\Delta x) - f(x)}{\Delta x} $$ 掌握极限思维是理解动态系统的基石。",
        momentum: "【理科逻辑：动量守恒】在无外力干扰下，系统总动量保持不变。公式：$$ \sum \vec{F} = 0 \implies \Delta \vec{p} = 0 $$ 这不仅是物理公式，更是分析利益分配平衡的思维工具。",
        chemistry: "【理科逻辑：酯化反应】酸脱羟基醇脱氢。条件：浓硫酸催化、加热。这是一个可逆反应，通过移除生成的水使平衡向右移动。"
    },
    strategy: {
        interview: "【面试评分标准】礼仪占 22%。关键细节：离场时回头微笑着将椅子推回原位，此举可直接获得 10 分加分。",
        eju: "【EJU博弈】准考证即入场券。即使复习不充分也要参加 6 月考。目标是积累“临场软实力”，而非单纯的分数。",
        cognitive: "【认知偏差修复】反对‘没学过就瞎编’。主张‘由未来梦想倒推学习计划’的逆向逻辑。先确定终局，再填充过程。"
    },
    philosophy: {
        ai_trap: "【AI 陷阱】拒绝提交无瑕疵的作文。优秀的文书应展示带有‘疙瘩’的真实成长弧线，而非冷冰冰的完美。",
        win_win: "【商业透明度】三方共赢逻辑：我们的介绍费完全覆盖辅导费，确保学生在获得优质资源时无需额外负担。"
    }
};

const AKI_ENGINE = {
    init() {
        this.display = document.getElementById('chat-display');
        this.input = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.bindEvents();
    },

    bindEvents() {
        this.sendBtn.addEventListener('click', () => this.handleSend());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSend();
        });
    },

    handleSend() {
        const text = this.input.value.trim();
        if (!text) return;

        this.appendMsg(text, 'user-msg');
        this.input.value = '';
        
        // 模拟 AI 思考延迟
        setTimeout(() => this.processQuery(text), 600);
    },

    processQuery(query) {
        let response = "抱歉，由于知识库正在升级，您可以尝试输入：'面试'、'动量'、'EJU' 或 '1'。";
        
        const q = query.toLowerCase();
        
        // 匹配逻辑
        if (q.includes('面试') || q === '1') {
            response = AKI_KNOWLEDGE.strategy.interview;
        } else if (q.includes('动量')) {
            response = AKI_KNOWLEDGE.science.momentum;
        } else if (q.includes('酯化')) {
            response = AKI_KNOWLEDGE.science.chemistry;
        } else if (q.includes('eju')) {
            response = AKI_KNOWLEDGE.strategy.eju;
        } else if (q.includes('优势') || q.includes('核心')) {
            response = AKI_KNOWLEDGE.strategy.cognitive;
        } else if (q.includes('微分') || q.includes('极限')) {
            response = AKI_KNOWLEDGE.science.calculus;
        }

        this.appendMsg(response, 'bot-msg');
        
        // 触发 MathJax 重新渲染公式
        if (window.MathJax) {
            MathJax.typeset();
        }
    },

    appendMsg(content, type) {
        const div = document.createElement('div');
        div.className = `msg ${type}`;
        div.innerHTML = content;
        
        // 双击复制功能
        div.title = "双击复制内容";
        div.addEventListener('dblclick', () => this.copyToClipboard(content));
        
        this.display.appendChild(div);
        this.display.scrollTop = this.display.scrollHeight;
    },

    quickAction(type) {
        this.input.value = type;
        this.handleSend();
    },

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text.replace(/<[^>]+>/g, ''));
            alert('内容已成功复制到剪贴板！');
        } catch (err) {
            console.error('复制失败', err);
        }
    }
};

// 启动引擎
document.addEventListener('DOMContentLoaded', () => AKI_ENGINE.init());
