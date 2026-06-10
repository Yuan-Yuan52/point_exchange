// ============ PHASE 3: 信任体系数据 ============
const trustData = {
    1: { verified: true, bankVerified: true, transactionCount: 98, disputeCount: 0, avgResponseTime: 300 },
    2: { verified: false, bankVerified: false, transactionCount: 12, disputeCount: 1, avgResponseTime: 1200 },
    3: { verified: true, bankVerified: true, transactionCount: 231, disputeCount: 0, avgResponseTime: 120 },
    4: { verified: false, bankVerified: true, transactionCount: 45, disputeCount: 2, avgResponseTime: 1800 },
    5: { verified: true, bankVerified: true, transactionCount: 156, disputeCount: 1, avgResponseTime: 180 },
    6: { verified: true, bankVerified: false, transactionCount: 67, disputeCount: 0, avgResponseTime: 480 },
    7: { verified: false, bankVerified: false, transactionCount: 8, disputeCount: 0, avgResponseTime: 2400 },
    8: { verified: true, bankVerified: true, transactionCount: 203, disputeCount: 0, avgResponseTime: 90 },
    9: { verified: true, bankVerified: true, transactionCount: 184, disputeCount: 1, avgResponseTime: 300 },
    10: { verified: true, bankVerified: false, transactionCount: 34, disputeCount: 0, avgResponseTime: 600 },
    11: { verified: false, bankVerified: false, transactionCount: 5, disputeCount: 0, avgResponseTime: 3000 },
    12: { verified: true, bankVerified: true, transactionCount: 89, disputeCount: 0, avgResponseTime: 210 },
    13: { verified: true, bankVerified: true, transactionCount: 267, disputeCount: 0, avgResponseTime: 150 },
    14: { verified: true, bankVerified: true, transactionCount: 124, disputeCount: 1, avgResponseTime: 240 },
};

/**
 * Phase 3: 计算用户的信任指数 (0-100)
 * 因子：
 * - 身份验证 (10分)
 * - 银行验证 (10分)
 * - 交易历史 (30分)
 * - 纠纷率 (20分)
 * - 回应速度 (30分)
 */
function calcTrustScore(userId) {
    const trust = trustData[userId];
    if (!trust) return 0;

    let score = 0;

    // 身份验证 (10分)
    if (trust.verified) score += 10;

    // 银行验证 (10分)
    if (trust.bankVerified) score += 10;

    // 交易历史 (30分)
    const txCount = trust.transactionCount;
    score += Math.min(30, txCount / 10); // 100笔以上满分

    // 纠纷率 (20分)
    const disputeRate = trust.transactionCount > 0 ? trust.disputeCount / trust.transactionCount : 0;
    const disputeScore = Math.max(0, 20 - disputeRate * 100);
    score += disputeScore;

    // 回应速度 (30分) - 越快越好
    const responseMinutes = trust.avgResponseTime / 60;
    if (responseMinutes < 5) score += 30;
    else if (responseMinutes < 30) score += 25;
    else if (responseMinutes < 60) score += 20;
    else if (responseMinutes < 120) score += 15;
    else score += Math.max(0, 10 - responseMinutes / 100);

    return Math.min(100, Math.round(score));
}

function getTrustBadges(userId) {
    const trust = trustData[userId];
    if (!trust) return [];

    const badges = [];
    if (trust.verified) badges.push({ icon: '✅', text: '身份已驗證', color: '#10b981' });
    if (trust.bankVerified) badges.push({ icon: '🏦', text: '銀行已驗證', color: '#0284c7' });
    if (trust.transactionCount >= 200) badges.push({ icon: '⭐', text: '資深交易者', color: '#f59e0b' });
    if (trust.disputeCount === 0 && trust.transactionCount > 10) badges.push({ icon: '🛡️', text: '零紛爭', color: '#8b5cf6' });

    return badges;
}

// Mock Data — 2026/06 真實市場價格
// 點數價格：一般互換價格 (不是官方定價，是P2P市場價)
// 里程價格：當前P2P轉讓市價約 0.45元/里
const mockFeed = [
    // 用户可以通过「我想補點」或「我有點可賣」发布需求
    // 这里为空，等待真实用户发布
];

const mockChats = [
    // 用户之间的聊天记录存储在这里
    // 初始为空，用户开始交易后会有记录
];

const mockReviews = [
    // 用户评价存储在这里
    // 初始为空，用户交易完成后会有评价
];

function escapeHTML(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function showToast(message, type = 'default', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const iconMap = {
        default: 'ph-check-circle',
        success: 'ph-check-circle',
        info:    'ph-info',
        warning: 'ph-warning-circle',
        error:   'ph-x-circle'
    };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="ph-fill ${iconMap[type] || iconMap.default}"></i><span>${escapeHTML(String(message))}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toast-out 0.28s ease forwards';
        setTimeout(() => toast.remove(), 280);
    }, duration);
}

function renderCardDetail() {
    const panel = document.getElementById('card-detail-panel');
    if (!panel) return;

    const key    = app.calcState.card;
    const card   = app.calcState.cards[key];
    const promo  = app.calcState.cardPromo?.[key];
    if (!card || !promo) { panel.innerHTML = ''; return; }

    // Update condition toggle labels
    const condLabel = document.getElementById('bonus-condition-label');
    const condNote  = document.getElementById('bonus-condition-note');
    const condRow   = document.getElementById('bonus-condition-row');
    if (condLabel) condLabel.textContent = promo.bonusLabel;
    if (condNote)  condNote.textContent  = promo.bonusNote;

    // Hide condition row for cards with no meaningful bonus
    const hasBonus = card.rates?.bonus && Object.values(card.rates.bonus).some(Number.isFinite);
    if (condRow) condRow.style.display = hasBonus ? '' : 'none';

    panel.innerHTML = `
        <div class="card-detail-bonus">
            <i class="ph-fill ph-gift"></i>
            <span>${escapeHTML(promo.signupBonus)}</span>
        </div>
        <div class="card-detail-promo">${escapeHTML(promo.promo)}</div>
        <a class="card-detail-apply" href="${escapeHTML(card.sourceUrl || '#')}" target="_blank" rel="noopener">
            <span>申辦此卡・享新戶優惠</span>
            <i class="ph ph-arrow-square-out"></i>
        </a>
    `;
}

function renderCardShowcase() {
    const container = document.getElementById('card-showcase');
    if (!container) return;

    const currentKey = app.calcState.card;
    const cards = app.calcState.cards;
    const spendType = app.calcState.spendType || 'domestic';

    // Build rows: rate = NT$ per mile (lower = better); CUBE shown separately
    const rows = Object.entries(cards).map(([key, card]) => {
        let rateLabel = '—';
        if (card.nonMileage) {
            const pts = card.pointRates?.[spendType] ?? 0;
            rateLabel = `${pts}點/千元`;
        } else {
            const rates = card.rates[spendType];
            const valid = Object.values(rates).filter(Number.isFinite);
            if (valid.length) {
                const best = Math.min(...valid);
                rateLabel = `${Math.floor(1000 / best)}哩/千元`;
            }
        }
        return { key, card, rateLabel, isActive: key === currentKey };
    });

    // Sort: active first, then by rate descending (best first)
    rows.sort((a, b) => {
        if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
        const ra = parseInt(a.rateLabel) || 0;
        const rb = parseInt(b.rateLabel) || 0;
        return rb - ra;
    });

    const clsMap = { primary: 'info', success: 'success', warn: 'warn', info: 'info' };

    container.innerHTML = `
        <div class="card-showcase-header">
            <span>信用卡</span>
            <span>哩程效率（${spendType === 'domestic' ? '國內' : spendType === 'overseas' ? '海外' : '加碼'}）</span>
            <span>申請</span>
        </div>
        ${rows.map(({ key, card, rateLabel, isActive }) => `
        <div class="card-showcase-row ${isActive ? 'active' : ''}" onclick="app.setCalcCard('${escapeHTML(key)}')">
            <div>
                <div class="card-showcase-name">${escapeHTML(card.name.replace(' - 指定加碼', ''))}</div>
                ${card.highlight ? `<span class="card-tag ${clsMap[card.highlight.cls] || 'info'}" style="margin-top:2px;display:inline-flex;">${escapeHTML(card.highlight.text)}</span>` : ''}
            </div>
            <div class="card-showcase-rate">${escapeHTML(rateLabel)}</div>
            <a class="card-apply-btn" href="${escapeHTML(card.sourceUrl || '#')}" target="_blank" rel="noopener" onclick="event.stopPropagation()">申請</a>
        </div>`).join('')}
    `;
}

function renderComparisonTable() {
    const container = document.getElementById('comparison-table');
    const routeLabel = document.getElementById('comp-route-label');
    if (!container) return;

    const calcState = app.calcState;
    const card = calcState.cards[calcState.card];
    if (!card || card.nonMileage) {
        container.innerHTML = '<div class="text-sm text-gray p-3 text-center">CUBE 卡不適合直接比對航空哩程計畫</div>';
        return;
    }

    const spendType = calcState.spendType;
    const rates = card.rates[spendType];
    const targets = calcState.targets;
    const amount = calcState.amount;
    const ownedMiles = Math.max(0, Math.floor(Number(document.getElementById('current-miles-input')?.value) || 0));

    // Update route label
    const fromEl = document.getElementById('route-from');
    const toEl   = document.getElementById('route-to');
    if (routeLabel && fromEl && toEl) {
        const cabinText = { economy: '經濟艙', premium: '豪華經濟艙', business: '商務艙', first: '頭等艙' }[calcState.cabin] || '經濟艙';
        const tripText  = calcState.tripType === 'ow' ? '單趟' : '來回';
        routeLabel.textContent =
            `${fromEl.options[fromEl.selectedIndex]?.text} → ${toEl.options[toEl.selectedIndex]?.text} ${tripText}${cabinText}`;
    }

    // Per-program config: official buy rate + P2P market average
    const programs = [
        { key: 'eva', name: '長榮哩程',   officialRate: 0.45, p2pRate: 0.40 },
        { key: 'ci',  name: '華航哩程',   officialRate: 0.40, p2pRate: 0.35 },
        { key: 'cx',  name: '亞洲萬里通', officialRate: 0.35, p2pRate: 0.30 },
    ];

    const rows = programs.map(p => {
        const rate = rates[p.key];
        if (!Number.isFinite(rate)) return null;
        const earned       = Math.floor(amount / rate);
        const total        = ownedMiles + earned;
        const target       = targets[p.key];
        const gap          = Math.max(0, target - total);
        const hasGap       = gap > 0;
        const officialCost = hasGap ? Math.round(gap * p.officialRate) : 0;
        const p2pCost      = hasGap ? Math.round(gap * p.p2pRate)      : 0;
        const saving       = officialCost - p2pCost;
        return { ...p, earned, total, target, gap, hasGap, officialCost, p2pCost, saving };
    }).filter(Boolean);

    if (rows.length === 0) {
        container.innerHTML = '<div class="text-sm text-gray p-3 text-center">此卡在目前情境無可比較的哩程估算</div>';
        return;
    }

    // Best value = lowest P2P cost among those with a gap
    const withGap = rows.filter(r => r.hasGap);
    const bestKey = withGap.length
        ? withGap.reduce((a, b) => a.p2pCost < b.p2pCost ? a : b).key
        : null;
    const topUpLinks   = calcState.topUpLinks;
    const awardUrls    = calcState.airlineAwardUrls;

    container.innerHTML = rows.map(row => {
        const isBest   = row.key === bestKey;
        const topUpUrl = escapeHTML(topUpLinks[row.key]?.url || '#');
        const awardUrl = escapeHTML(awardUrls?.[row.key] || '#');
        return `
        <div class="comparison-row${isBest ? ' best-value' : ''}">
            <div>
                <div class="comparison-program">${escapeHTML(row.name)}</div>
                <div class="comparison-target">目標 ${row.target.toLocaleString()} 哩</div>
                ${isBest ? '<div class="best-value-tag">⭐ 媒合最省</div>' : ''}
            </div>
            <div>
                <div class="comparison-gap-badge ${row.hasGap ? 'warn' : 'ok'}">
                    ${row.hasGap ? `還差 ${row.gap.toLocaleString()} 哩` : '✓ 已達標'}
                </div>
                ${row.hasGap ? `
                <div class="comparison-cost-row">
                    <div><span class="cost-label">官方補哩：</span><span class="cost-value">NT$ ${row.officialCost.toLocaleString()}</span></div>
                    <div><span class="cost-label">媒合均價：</span><span class="cost-value p2p">約 NT$ ${row.p2pCost.toLocaleString()}</span></div>
                    ${row.saving > 0 ? `<div class="cost-saving">↓ 透過媒合省約 NT$ ${row.saving.toLocaleString()}</div>` : ''}
                </div>` : '<div class="text-xs text-primary" style="margin-top:0.2rem">可立即查票兌換</div>'}
            </div>
            <div>
                ${row.hasGap
                    ? `<button class="table-cta-btn match" onclick="app.jumpToMatchmaking('${escapeHTML(row.name)}')">找媒合</button>`
                    : `<a class="award-book-btn" href="${awardUrl}" target="_blank" rel="noopener">✈ 查獎勵票</a>`}
            </div>
        </div>`;
    }).join('');
}

function renderMarketStats() {
    const priceItems = mockFeed.filter(i => i.cashOffer > 0 && i.pointAmount > 0);
    const avgPrice = priceItems.length
        ? priceItems.reduce((sum, i) => sum + i.cashOffer / i.pointAmount, 0) / priceItems.length
        : 0.9;
    const el = id => document.getElementById(id);
    if (el('stat-active-listings')) el('stat-active-listings').textContent = mockFeed.length + 38;
    if (el('stat-weekly-matches')) el('stat-weekly-matches').textContent = 31;
    if (el('stat-avg-price'))      el('stat-avg-price').textContent = avgPrice.toFixed(2) + ' 元';
}

// App State
const state = {
    currentChatUserId: null,
    currentChatUserName: '',
    activeTab: 'buy',
    activeCategory: '全部',
    formPostType: 'buy',
    airlineAckDone: false,       // true after user acknowledges airline P2P disclaimer
    pendingAirlineCategory: null, // stored while ack modal is open
    pendingAirlineChip: null,     // stored chip element
};

// Initialization Function (called after user auth)
function initMainApp() {
    // Render the main app
    const container = document.getElementById('app-container');
    if (container.innerHTML === '') {
        // Render the main app HTML here
        // (keeping existing structure)
        container.innerHTML = getMainAppHTML();
    }

    initNavigation();
    renderFeed();
    renderChatList();
    renderReviews();
    renderMarketStats();
    renderCardDetail();
    renderCardShowcase();
    app.updateCardPickerDisplay();
    app.updateRouteTarget();
    app.setPostType('buy');
}

// Called from auth.js when user is authenticated
window.initMainApp = initMainApp;

// DOMContentLoaded - don't initialize app yet, let auth.js handle it
document.addEventListener('DOMContentLoaded', () => {
    // Auth module will handle initialization
    // Just waiting for Firebase to load...
});

// Navigation Logic
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update nav styles
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Update views
            const targetId = item.getAttribute('data-target');
            document.querySelectorAll('.view:not(.sub-view)').forEach(view => {
                view.classList.remove('active');
            });
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// Render Functions
function renderFeed() {
    const list = document.getElementById('feed-list');
    list.innerHTML = '';
    
    // Filter by tab (buy/sell) and category (Open Points, PX Mart, etc.)
    const filtered = mockFeed.filter(item => {
        const matchesTab = item.postType === state.activeTab;
        const matchesCategory = state.activeCategory === '全部' || item.type === state.activeCategory;
        return matchesTab && matchesCategory;
    });

    if (filtered.length === 0) {
        list.innerHTML = `<div class="text-center text-gray p-8 text-sm">目前沒有相關的${state.activeTab === 'buy' ? '補點需求' : state.activeTab === 'sell' ? '可轉讓點數' : '免費轉讓'}</div>`;
        return;
    }
    
    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card feed-item';
        card.onclick = () => app.openChatRoom(item.id, item.user);
        
        const isBuy = item.postType === 'buy';
        const isGift = item.postType === 'gift';
        const badgeClass = isGift ? 'gift' : (isBuy ? 'buy' : 'sell');
        const badgeText = isGift ? '免費轉讓' : (isBuy ? '想補點數' : '可轉讓點數');
        const labelAmount = isGift ? '可轉讓數量' : (isBuy ? '缺口數量' : '可轉讓數量');
        const labelPrice = isBuy ? '可接受成本' : '參考成本';
        const btnText = isGift ? '詢問轉讓細節' : (isBuy ? '我可能可協助' : '詢問補點方式');
        const safeItem = {
            user: escapeHTML(item.user),
            avatar: escapeHTML(item.avatar),
            type: escapeHTML(item.type),
            note: escapeHTML(item.note || ''),
            rating: escapeHTML(item.rating),
            pointAmount: escapeHTML(item.pointAmount),
            cashOffer: escapeHTML(item.cashOffer)
        };
        
        // Phase 1-3: 改进card显示 + 信任体系
        const responseTime = item.id % 3 === 0 ? '< 5分鐘' : item.id % 3 === 1 ? '< 30分鐘' : '< 2小時';
        const trustScore = calcTrustScore(item.id); // Phase 3: 真实的信任分数
        const badges = getTrustBadges(item.id); // Phase 3: 验证徽章
        const unitLabel = item.type.includes('哩程') ? '里' : '點';
        const pricePerUnit = item.cashOffer > 0 ? (item.cashOffer / item.pointAmount).toFixed(2) : '免費';

        card.innerHTML = `
            <!-- 用户头部 + 评分 + 信任指数 (Phase 3) -->
            <div class="feed-header">
                <div class="user-info">
                    <div class="avatar">${safeItem.avatar}</div>
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 0.3rem; margin-bottom: 0.2rem;">
                            <div class="font-bold text-sm">${safeItem.user}</div>
                            <span style="font-size: 0.75rem; background: ${trustScore >= 80 ? '#d1fae5' : trustScore >= 60 ? '#fef3c7' : '#fee2e2'}; color: ${trustScore >= 80 ? '#065f46' : trustScore >= 60 ? '#92400e' : '#7f1d1d'}; padding: 0.1rem 0.4rem; border-radius: 3px; font-weight: 600; cursor: pointer; transition: all 0.2s;" onclick="app.openTrustModal(${item.id})" onmouseover="this.style.opacity='0.8'; this.style.textDecoration='underline';" onmouseout="this.style.opacity='1'; this.style.textDecoration='none';">
                                信任 ${trustScore}/100
                            </span>
                        </div>
                        <div class="flex items-center gap-1" style="margin-bottom: 0.3rem;">
                            <span class="text-xs text-warning"><i class="ph-fill ph-star"></i> ${safeItem.rating}</span>
                            ${badges.length > 0 ? badges.map(b => `<span style="font-size: 0.7rem; color: ${b.color}; margin-left: 0.2rem;" title="${b.text}">${b.icon}</span>`).join('') : ''}
                            <span style="font-size: 0.7rem; color: #666; margin-left: auto;">🟢 ${responseTime}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 核心信息：一眼看到 -->
            <div style="margin-top: 0.75rem; padding: 0.75rem; background: #f9f9f9; border-radius: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <div>
                        <div style="font-size: 0.75rem; color: #666; margin-bottom: 0.2rem;">需要</div>
                        <div style="font-size: 1.1rem; font-weight: 600; color: #333;">
                            ${safeItem.type}
                            <span style="color: #d97706;">${safeItem.pointAmount}</span>${unitLabel}
                        </div>
                    </div>
                    ${!isGift ? `<div style="text-align: right;">
                        <div style="font-size: 0.75rem; color: #666; margin-bottom: 0.2rem;">成本</div>
                        <div style="font-size: 1.3rem; font-weight: 700; color: #059669;">
                            NT$${safeItem.cashOffer}
                        </div>
                        <div style="font-size: 0.7rem; color: #999;">${pricePerUnit}元/${unitLabel}</div>
                    </div>` : `<div style="text-align: right; font-size: 1rem; color: #10b981; font-weight: 600;">🎁 免費</div>`}
                </div>
            </div>

            <!-- 描述 + 标签 -->
            ${item.note ? `<div style="margin-top: 0.5rem; font-size: 0.85rem; color: #555; line-height: 1.4;">${safeItem.note}</div>` : ''}

            ${(() => {
                const airlineTypes = ['長榮哩程', '華航哩程', '亞洲萬里通'];
                const isAirline = airlineTypes.includes(item.type);
                const isGift   = item.postType === 'gift';
                const isLarge  = item.pointAmount >= 3000;
                const tags = [];
                if (isAirline) {
                    tags.push(`<span class="card-tag danger"><i class="ph ph-warning"></i>注意T&C</span>`);
                    tags.push(`<span class="card-tag warn">確認效期</span>`);
                } else {
                    tags.push(`<span class="card-tag success">零售點數</span>`);
                }
                if (isGift)  tags.push(`<span class="card-tag purple">免費轉讓</span>`);
                if (isLarge) tags.push(`<span class="card-tag info">大額</span>`);
                const disclaimer = isAirline ? `
                    <div class="airline-disclaimer-strip">
                        <i class="ph ph-info"></i>
                        本平台僅提供媒合資訊，不介入付款，不代管資金，不保證合法性。哩程轉讓是否符合 T&C 由雙方自行確認及承擔責任。
                    </div>` : '';
                return `<div class="card-tags">${tags.join('')}</div>${disclaimer}`;
            })()}

            <button class="btn-primary w-full mt-3">${btnText}</button>
        `;
        list.appendChild(card);
    });
}

function renderChatList() {
    const list = document.getElementById('chat-list');
    list.innerHTML = '';
    
    mockChats.forEach(chat => {
        const item = document.createElement('div');
        item.className = 'chat-list-item';
        item.onclick = () => app.openChatRoom(chat.userId, chat.user);
        const safeChat = {
            avatar: escapeHTML(chat.avatar),
            user: escapeHTML(chat.user),
            time: escapeHTML(chat.time),
            lastMsg: escapeHTML(chat.lastMsg),
            unread: escapeHTML(chat.unread)
        };
        
        item.innerHTML = `
            <div class="avatar">${safeChat.avatar}</div>
            <div class="chat-details">
                <div class="chat-name-time">
                    <span class="font-bold">${safeChat.user}</span>
                    <span class="text-xs text-gray">${safeChat.time}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="chat-last-msg">${safeChat.lastMsg}</span>
                    ${chat.unread > 0 ? `<span class="unread-badge">${safeChat.unread}</span>` : ''}
                </div>
            </div>
        `;
        list.appendChild(item);
    });
}

function renderReviews() {
    const list = document.getElementById('review-list');
    list.innerHTML = '';
    
    mockReviews.forEach(review => {
        const starsHtml = Array(5).fill(0).map((_, i) => 
            `<i class="${i < review.rating ? 'ph-fill' : 'ph'} ph-star"></i>`
        ).join('');
        const safeReview = {
            user: escapeHTML(review.user),
            date: escapeHTML(review.date),
            text: escapeHTML(review.text)
        };
        
        const item = document.createElement('div');
        item.className = 'review-item';
        item.innerHTML = `
            <div class="flex justify-between items-center mb-1">
                <span class="font-bold text-sm">${safeReview.user}</span>
                <span class="text-xs text-gray">${safeReview.date}</span>
            </div>
            <div class="review-stars">${starsHtml}</div>
            <p class="text-sm">${safeReview.text}</p>
        `;
        list.appendChild(item);
    });
}

// App Actions API
window.app = {
    switchFeedTab: (tab) => {
        state.activeTab = tab;
        document.getElementById('tab-buy').classList.toggle('active', tab === 'buy');
        document.getElementById('tab-sell').classList.toggle('active', tab === 'sell');
        document.getElementById('tab-gift').classList.toggle('active', tab === 'gift');
        renderFeed();

        // Phase 2: 如果用户点击「我想補點」，显示智能推荐
        if (tab === 'buy' && state.activeCategory !== '全部') {
            // 根据当前筛选的点数类型显示推荐
            app.showSmartMatches(state.activeCategory, 100);
        } else if (tab === 'buy') {
            document.getElementById('smart-matches-container').style.display = 'none';
        }
    },

    filterType: (event, category) => {
        const airlineTypes = ['長榮哩程', '華航哩程', '亞洲萬里通'];
        const isAirline = airlineTypes.includes(category);

        // Airline filter: require acknowledgment first
        if (isAirline && !state.airlineAckDone) {
            state.pendingAirlineCategory = category;
            state.pendingAirlineChip = event.target;
            document.getElementById('ack-checkbox').checked = false;
            document.getElementById('ack-confirm-btn').disabled = true;
            document.getElementById('airline-ack-modal').classList.remove('hidden');
            return; // Don't activate chip yet
        }

        state.activeCategory = category;
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        event.target.classList.add('active');

        const officialSection = document.getElementById('official-channels-section');
        const feedList = document.getElementById('feed-list');
        if (officialSection) officialSection.style.display = 'none';
        if (feedList)        feedList.style.display = 'flex';
        renderFeed();
    },

    setPostType: (type) => {
        state.formPostType = type;
        document.getElementById('btn-post-type-buy').classList.toggle('active', type === 'buy');
        document.getElementById('btn-post-type-sell').classList.toggle('active', type === 'sell');
        document.getElementById('btn-post-type-gift').classList.toggle('active', type === 'gift');

        // Hide/Show price input
        if (type === 'gift') {
            document.getElementById('form-group-price').style.display = 'none';
        } else {
            document.getElementById('form-group-price').style.display = 'block';
        }

        // Airline options are always visible; ack required at submit time

        // Update Labels based on type
        if (type === 'buy') {
            document.getElementById('form-main-title').innerText = '發布您的補點缺口';
            document.getElementById('label-amount').innerText = '缺口數量';
            document.getElementById('label-price').innerText = '可接受補點成本 (NT$)';
            document.getElementById('hint-price').innerText = '這只是媒合參考成本，實際轉讓方式需由雙方自行確認';
        } else if (type === 'sell') {
            document.getElementById('form-main-title').innerText = '發布可轉讓的點數';
            document.getElementById('label-amount').innerText = '可轉讓數量';
            document.getElementById('label-price').innerText = '參考補點成本 (NT$)';
            document.getElementById('hint-price').innerText = '請在媒合前確認點數效期、轉讓限制與平台規範';
        } else {
            document.getElementById('form-main-title').innerText = '免費轉讓您的點數';
            document.getElementById('label-amount').innerText = '可轉讓數量';
        }
        app.updateRecommendedPrice();
    },

    submitPost: () => {
        const type = document.getElementById('post-type').value;
        const amount = parseInt(document.getElementById('post-amount').value, 10);
        let price = parseInt(document.getElementById('post-price').value, 10);
        const note = document.getElementById('post-note').value;
        
        if (state.formPostType === 'gift') {
            price = 0;
        }
        
        // Airline miles: require acknowledgment before posting
        const airlineTypes = ['長榮哩程', '華航哩程', '亞洲萬里通'];
        if (airlineTypes.includes(type) && !state.airlineAckDone) {
            document.getElementById('ack-checkbox').checked = false;
            document.getElementById('ack-confirm-btn').disabled = true;
            document.getElementById('airline-ack-modal').classList.remove('hidden');
            showToast('發布航空哩程前，請先閱讀並確認免責聲明', 'warning', 3500);
            return;
        }

        if (!Number.isFinite(amount) || amount <= 0 || (state.formPostType !== 'gift' && (!Number.isFinite(price) || price <= 0))) {
            showToast('請填寫有效的數量與金額', 'error');
            return;
        }

        // Add to mock feed
        const newPost = {
            id: mockFeed.length + 1,
            user: '我',
            avatar: '我',
            type: type,
            pointAmount: amount,
            cashOffer: price,
            note: note,
            rating: 5.0,
            postType: state.formPostType
        };

        mockFeed.unshift(newPost);
        
        showToast(state.formPostType === 'buy' ? '補點缺口已發布！' : (state.formPostType === 'sell' ? '可轉讓點數已發布！' : '免費轉讓資訊已發布！'), 'success');
        
        // Clear Inputs
        document.getElementById('post-amount').value = '';
        document.getElementById('post-price').value = '';
        document.getElementById('post-note').value = '';
        
        // Reset form type to buy
        app.setPostType('buy');
        
        // Go back to home
        state.activeTab = newPost.postType;
        document.getElementById('tab-buy').classList.toggle('active', state.activeTab === 'buy');
        document.getElementById('tab-sell').classList.toggle('active', state.activeTab === 'sell');
        document.getElementById('tab-gift').classList.toggle('active', state.activeTab === 'gift');
        
        renderFeed();
        document.querySelector('.nav-item[data-target="view-home"]').click();
    },
    
    updateRecommendedPrice: () => {
        const typeSelect = document.getElementById('post-type');
        const type = typeSelect.value;
        const amountStr = document.getElementById('post-amount').value;
        const amount = parseInt(amountStr);
        
        // 1. Airline Warning
        const isAirline = type.includes('哩程') || type.includes('萬里通');
        const warningEl = document.getElementById('airline-warning');
        if (isAirline && state.formPostType !== 'gift') {
            warningEl.classList.remove('hidden');
        } else {
            warningEl.classList.add('hidden');
        }
        
        // 2. Price Recommendation
        const recEl = document.getElementById('price-recommendation');
        if (!amount || isNaN(amount) || state.formPostType === 'gift') {
            recEl.classList.add('hidden');
            return;
        }
        
        let rate = 1.0;
        let unitText = '點';
        if (type === '長榮哩程') rate = 0.45;
        else if (type === '華航哩程') rate = 0.4;
        else if (type === '亞洲萬里通') rate = 0.35;
        else if (type === 'Open Points') rate = 0.95;
        else if (type === '全聯福利點') rate = 0.9;
        else if (type === 'Line Points') rate = 0.98;
        else if (type === 'Happy GO') rate = 0.92;
        
        if (isAirline) unitText = '哩';
        
        const recPrice = Math.floor(amount * rate);
        document.getElementById('rec-price-val').innerText = recPrice.toLocaleString();
        document.getElementById('rec-price-unit').innerText = `${unitText}=${rate}`;
        recEl.classList.remove('hidden');
    },

    toggleCardShowcase: (btn) => {
        const showcase = document.getElementById('card-showcase');
        const isOpen = btn.classList.toggle('open');
        showcase.style.display = isOpen ? 'block' : 'none';
    },

    toggleBonusPromo: (checked) => {
        app.calcState.conditions.bonusPromo = checked;
        app.updateCalculator();
    },

    showNotifTrackComingSoon: () => {
        showToast('開發中！Android 版將可自動偵測銀行推播，即時累計哩程缺口', 'info', 4500);
    },

    calculate: () => {
        app.updateCalculator();
        renderComparisonTable();
        document.getElementById('calc-result-sheet').classList.add('open');
        document.getElementById('calc-result-overlay').classList.add('open');
    },

    openCardSheet: () => {
        document.getElementById('card-sheet').classList.add('open');
        document.getElementById('card-sheet-overlay').classList.add('open');
    },

    closeCardSheet: () => {
        const sheet = document.getElementById('card-sheet');
        const overlay = document.getElementById('card-sheet-overlay');
        sheet.style.animation = 'sheet-slide-down 0.32s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        overlay.style.animation = 'overlay-fade-out 0.25s ease forwards';
        setTimeout(() => {
            sheet.classList.remove('open');
            overlay.classList.remove('open');
            sheet.style.animation = '';
            overlay.style.animation = '';
            app.updateCardPickerDisplay();
        }, 330);
    },

    updateCardPickerDisplay: () => {
        const card = app.calcState.cards[app.calcState.card];
        const spendType = { domestic: '國內一般', overseas: '海外一般', bonus: '指定加碼' }[app.calcState.spendType] || '國內一般';
        document.getElementById('card-picker-name').innerText = card.name.replace(' - 指定加碼', '');
        document.getElementById('card-picker-sub').innerText = `${spendType}消費・點擊調整`;
    },

    updateCostAnalysis: () => {
        const costEl = document.getElementById('cost-analysis-content');
        if (!costEl) return;

        const cardKey = app.calcState.card;
        const card = app.calcState.cards[cardKey];
        const ownedInput = document.getElementById('current-miles-input');
        const ownedMiles = Math.max(0, Math.floor(Number(ownedInput?.value) || 0));
        const targets = app.calcState.targets;
        const spendType = app.calcState.spendType;

        // Apply bonus rates if condition is checked
        let rates = { ...card.rates[spendType] };
        if (app.calcState.conditions?.bonusPromo && card.rates?.bonus) {
            const bonus = card.rates.bonus;
            ['eva', 'ci', 'cx'].forEach(k => {
                if (Number.isFinite(bonus[k]) && (!Number.isFinite(rates[k]) || bonus[k] < rates[k])) {
                    rates[k] = bonus[k];
                }
            });
        }

        const amount = parseInt(document.getElementById('calc-spend-slider').value, 10);
        const costData = [];

        // Calculate for each airline
        const analyzeAirline = (key, name, pricePerMile) => {
            const rate = rates[key];
            if (!Number.isFinite(rate)) return null;

            const target = targets[key];
            const earnedMiles = Math.floor(amount / 1000 * rate);
            const totalMiles = ownedMiles + earnedMiles;
            const missingMiles = Math.max(0, target - totalMiles);

            if (missingMiles <= 0) {
                return { name, missing: 0, cost: 0, costViaPoints: 0 };
            }

            // P2P Price (0.45元/里 for airlines)
            const costViaAirline = Math.round(missingMiles * pricePerMile);

            // Cost via points (0.75元/點 for general points)
            // If user wants to convert cash to points: 100 points ≈ 75元
            // So 1 point ≈ 0.75元
            const costViaPoints = Math.round(missingMiles * 100 * 0.75 / 100); // rough estimate

            return {
                name,
                missing: missingMiles,
                costAirline: costViaAirline,
                costPoints: costViaPoints
            };
        };

        const evaData = analyzeAirline('eva', '長榮', 0.45);
        const ciData = analyzeAirline('ci', '華航', 0.45);
        const cxData = analyzeAirline('cx', '國泰', 0.45);

        const validData = [evaData, ciData, cxData].filter(d => d && d.missing > 0);

        if (validData.length === 0) {
            costEl.innerHTML = '<p style="margin: 0; text-align: center; padding: 0.5rem 0; color: #27ae60;">✅ 預計消費即可達成目標，不需補點！</p>';
            return;
        }

        let html = '<div style="background: white; border-radius: 6px; padding: 0.5rem;">';
        validData.forEach((data, idx) => {
            html += `
                <div style="padding: 0.4rem 0; border-bottom: ${idx < validData.length - 1 ? '1px solid #eee' : 'none'}">
                    <div style="font-weight: 600; color: #333; margin-bottom: 0.2rem;">${data.name}</div>
                    <div style="font-size: 0.75rem; color: #666; margin-bottom: 0.3rem;">缺少 ${data.missing.toLocaleString()} 里</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.8rem;">
                        <div style="background: #fef3c7; padding: 0.3rem; border-radius: 4px; text-align: center;">
                            <div style="color: #92400e; font-weight: 600;">NT$ ${data.costAirline.toLocaleString()}</div>
                            <div style="color: #b45309; font-size: 0.7rem;">P2P 里程</div>
                        </div>
                        <div style="background: #dbeafe; padding: 0.3rem; border-radius: 4px; text-align: center;">
                            <div style="color: #0c2d6b; font-weight: 600;">NT$ ${data.costPoints.toLocaleString()}</div>
                            <div style="color: #1e40af; font-size: 0.7rem;">轉換點數</div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        html += '<div style="margin-top: 0.4rem; padding-top: 0.4rem; border-top: 1px solid #eee; color: #999; font-size: 0.75rem;">💡 基於目前P2P市價估算 (里程 0.45元/里、點數 0.75元/點)</div>';

        costEl.innerHTML = html;
    },

    closeCalcResult: () => {
        const sheet   = document.getElementById('calc-result-sheet');
        const overlay = document.getElementById('calc-result-overlay');
        sheet.style.animation   = 'sheet-slide-down 0.32s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        overlay.style.animation = 'overlay-fade-out 0.25s ease forwards';
        setTimeout(() => {
            sheet.classList.remove('open');
            overlay.classList.remove('open');
            sheet.style.animation   = '';
            overlay.style.animation = '';
        }, 330);
    },

    closeAckModal: () => {
        document.getElementById('airline-ack-modal').classList.add('hidden');
        state.pendingAirlineCategory = null;
        state.pendingAirlineChip = null;
    },

    confirmAck: () => {
        if (!document.getElementById('ack-checkbox').checked) return;
        state.airlineAckDone = true;
        document.getElementById('airline-ack-modal').classList.add('hidden');

        if (state.pendingAirlineCategory && state.pendingAirlineChip) {
            // Opened from filter chip → activate the filter
            state.activeCategory = state.pendingAirlineCategory;
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            state.pendingAirlineChip.classList.add('active');
            const feedList = document.getElementById('feed-list');
            if (feedList) feedList.style.display = 'flex';
            renderFeed();
            showToast('已進入航空哩程媒合區。每筆刊登均附有平台免責聲明。', 'warning', 4500);
        } else {
            // Opened from post form → inform user to submit again
            showToast('聲明已確認，請再次點擊「確認發布」', 'info', 3000);
        }
        state.pendingAirlineCategory = null;
        state.pendingAirlineChip = null;
    },

    openAutoMatch: () => {
        document.getElementById('auto-match-modal').classList.remove('hidden');
        document.getElementById('match-results').classList.add('hidden');
        document.getElementById('match-actions').style.display = 'flex';
    },

    closeAutoMatch: () => {
        document.getElementById('auto-match-modal').classList.add('hidden');
    },

    runAutoMatch: () => {
        const amt = document.getElementById('match-amount').value;
        const budget = document.getElementById('match-budget').value;
        const type = document.getElementById('match-type').value;
        
        if (!amt || !budget) {
            showToast('請輸入缺口數量與可接受補點成本', 'error');
            return;
        }
        
        document.getElementById('match-actions').style.display = 'none';
        document.getElementById('match-results').classList.remove('hidden');
        
        // Simple validation rule: if budget < amount * minRate, show warning
        const retailTypes = ['Open Points', '全聯福利點', 'Line Points', 'Happy GO'];
        let minRate = retailTypes.includes(type) ? 0.7 : 0.2;
        
        const isTooLow = parseInt(budget) < parseInt(amt) * minRate;

        if (isTooLow) {
            document.getElementById('match-success').classList.add('hidden');
            document.getElementById('match-warning').classList.remove('hidden');
            document.getElementById('match-results').className = 'mt-4 bg-red-50 border border-red-200 p-3 rounded text-sm text-center';
        } else {
            document.getElementById('match-warning').classList.add('hidden');
            document.getElementById('match-success').classList.remove('hidden');
            document.getElementById('match-results').className = 'mt-4 bg-primary-bg border border-primary p-3 rounded text-sm text-center';
        }
    },

    closeAutoMatchAndSend: () => {
        app.closeAutoMatch();
        showToast('已向 3 位符合條件的用戶發送詢問，請在訊息頁查看', 'success', 4000);
        // Go to chat list
        document.querySelector('.nav-item[data-target="view-chat"]').click();
    },

    showSafetyTips: () => {
        document.getElementById('safety-modal').classList.remove('hidden');
    },
    
    openChatRoom: (feedId, userName) => {
        const feedItem = mockFeed.find(f => f.id === feedId);
        state.currentChatUserId = feedId;
        state.currentChatUserName = userName;
        
        document.getElementById('chat-room-name').innerText = userName;
        const chatRoom = document.getElementById('view-chat-room');
        chatRoom.classList.add('active');
        
        // Mock loading messages based on context
        const msgs = document.getElementById('chat-messages');
        const defaultMsg = feedItem && feedItem.postType === 'sell'
            ? `您好，我試算後有 ${feedItem.type} 的缺口，看到您有 ${feedItem.pointAmount} 點可討論轉讓，想先了解效期與使用限制。`
            : feedItem && feedItem.postType === 'gift' 
            ? `您好，我試算後剛好有 ${feedItem.type} 缺口，看到您有 ${feedItem.pointAmount} 點可免費轉讓，想先確認是否仍可使用。`
            : `您好，我看到您正在尋找補點，想先了解您的缺口、期限與點數平台規則。`;

        msgs.innerHTML = `
            <div class="text-center text-xs text-gray my-2">今日</div>
            <div class="message msg-received">${escapeHTML(defaultMsg)}</div>
        `;
    },
    
    closeChatRoom: () => {
        document.getElementById('view-chat-room').classList.remove('active');
    },
    
    sendMessage: () => {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        if (!text) return;
        
        const msgs = document.getElementById('chat-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message msg-sent';
        msgDiv.innerText = text;
        msgs.appendChild(msgDiv);
        
        input.value = '';
        msgs.scrollTop = msgs.scrollHeight;
    },
    
    finishTransaction: () => {
        document.getElementById('rating-target-name').innerText = state.currentChatUserName;
        document.getElementById('rating-modal').classList.remove('hidden');
    },
    
    closeRatingModal: () => {
        document.getElementById('rating-modal').classList.add('hidden');
        app.closeChatRoom();
    },
    
    submitRating: () => {
        app.closeRatingModal();
        showToast('感謝您的評價！', 'success');
    },

    // Calculator Logic
    calcState: {
        amount: 100000,
        card: 'dbs_world',
        spendType: 'domestic',
        tripType: 'rt',   // 'rt' (來回) or 'ow' (單趟)
        cabin: 'economy', // economy / premium / business / first
        conditions: { bonusPromo: false },

        // 各哩程計畫獎勵票訂位連結 (引流收入)
        airlineAwardUrls: {
            eva: 'https://www.evaair.com/zh-tw/flights/award-tickets/search/',
            ci:  'https://booking.china-airlines.com/Award/SelectFlight',
            cx:  'https://www.asiamiles.com/en/redeem-miles/flights/search.html'
        },

        // 各信用卡優惠說明與加碼條件
        cardPromo: {
            dbs_world: {
                signupBonus: '🎁 新戶首3月國內消費升級 NT$18=1哩',
                promo: '飛行積金可兌換長榮、新航、印度、華夏等多哩程計畫',
                bonusLabel: '符合飛行積金活動加碼期間',
                bonusNote: '部分期間或通路有加碼，需確認當期活動條件'
            },
            hsbc_light: {
                signupBonus: '🎁 依當期活動給予旅遊積分開卡禮（無固定額度）',
                promo: '國內外同率 NT$20=1 積分，無年度回饋上限；1 積分=1 華夏哩程',
                bonusLabel: '此卡無特定加碼條件',
                bonusNote: '國內外同率，不受消費通路或月份影響'
            },
            hsbc_infinite: {
                signupBonus: '🎁 依當期活動給予旅遊積分開卡禮（無固定額度）',
                promo: '海外 NT$10=1 積分、國內 NT$18=1 積分；積分可轉長榮、華航、新航哩程',
                bonusLabel: '此卡依國內/海外自動套用不同費率',
                bonusNote: '勾選後切換為海外最優費率試算，不需另行登錄'
            },
            ctbc_ci_ding: {
                signupBonus: '🎁 依活動最高可獲 1,500–3,000 華夏哩程開卡禮',
                promo: '指定產業消費加碼2倍（NT$9=1哩）；生日當月加碼3倍；每月加碼有上限',
                bonusLabel: '消費屬指定產業 MCC 或生日月份',
                bonusNote: '指定 MCC（餐飲、超市、航空等）或生日當月，每月有加碼哩數上限'
            },
            ctbc_ci_bright: {
                signupBonus: '🎁 依活動最高可獲 1,000–2,000 華夏哩程開卡禮',
                promo: '指定產業消費加碼2倍（NT$10=1哩）；生日當月加碼3倍；每月加碼有上限',
                bonusLabel: '消費屬指定產業 MCC 或生日月份',
                bonusNote: '指定 MCC（餐飲、超市、航空等）或生日當月，每月有加碼哩數上限'
            },
            ctbc_ci_business: {
                signupBonus: '🎁 依活動最高可獲 500–1,000 華夏哩程開卡禮',
                promo: '基本 NT$30=1哩；指定產業加碼2倍（NT$15=1哩）；每月加碼有上限',
                bonusLabel: '消費屬指定產業 MCC',
                bonusNote: '指定 MCC 可享加碼2倍，每月有加碼哩數上限'
            },
            cathay_eva_bonus: {
                signupBonus: '🎁 開卡禮 5,000–20,000 長榮哩程（依卡等與當期活動）',
                promo: '2026年度：海外 NT$15=1哩；登錄活動後指定條件最優 NT$10=1哩（有年度上限）',
                bonusLabel: '已登錄活動且達長榮/海外指定消費條件',
                bonusNote: '需在期限內登錄，各卡等年度回饋上限不同（10-20 萬哩）'
            },
            cube_info: {
                signupBonus: '🎁 依 CUBE 等級與當期活動給予小樹點開卡禮',
                promo: '一般消費 0.3% 小樹點；指定方案可達 2–3.3%（每日在 CUBE App 切換）',
                bonusLabel: '已在 CUBE App 切換指定權益方案（每日限切換一次）',
                bonusNote: 'Level 2 常見 3% 回饋，需先切換方案且符合通路條件'
            }
        },
        targets: {
            eva: 35000,
            ci: 35000,
            cx: 20000
        },
        routeTargets: {
            'TYO': { eva: 35000, ci: 35000, cx: 20000 },
            'SEL': { eva: 35000, ci: 35000, cx: 20000 },
            'BKK': { eva: 35000, ci: 35000, cx: 20000 },
            'HKG': { eva: 20000, ci: 20000, cx: 15000 },
            'LAX': { eva: 100000, ci: 100000, cx: 60000 },
            'NYC': { eva: 100000, ci: 100000, cx: 60000 },
            'LON': { eva: 100000, ci: 100000, cx: 60000 },
            'PAR': { eva: 100000, ci: 100000, cx: 60000 }
        },
        topUpLinks: {
            eva: {
                label: '長榮官方補哩',
                url: 'https://www.evaair.com/zh-tw/infinity-mileagelands/mileage-award-program/purchase-miles/',
                note: '長榮 Purchase/Top up Miles；購買規則與可用範圍以官方頁為準。'
            },
            ci: {
                label: '華航官方購買哩程',
                url: 'https://www.china-airlines.com/tw/zh/member/airline-miles/purchased-miles',
                note: '華航官方購買哩程；購買後用途與轉讓限制請先確認。'
            },
            cx: {
                label: '亞洲萬里通 Top-up miles',
                url: 'https://www.asiamiles.com/en/account/manage-miles/top-up-miles.html/1000',
                note: '亞洲萬里通 Top-up miles 通常需已達指定比例並在兌換時補足。'
            },
            cube: {
                label: '國泰世華 CUBE 權益',
                url: 'https://www.cathaybk.com.tw/cathaybk/-/media/fddd4d9d98754438a663ee9129eb345a.pdf?sc_lang=en',
                note: '查看小樹點折抵、指定權益方案與兌換規則。'
            },
            hsbc: {
                label: '滙豐飛行計劃',
                url: 'https://shop.hsbc.com.tw/installments/creditcard/rewards/fly.html',
                note: '查看旅遊積分轉航空哩程與飯店點數的官方規則。'
            }
        },
        cards: {
            dbs_world: {
                name: '星展飛行世界商務卡',
                issuer: '星展銀行',
                highlight: { text: '多哩程計畫可兌', cls: 'info' },
                earnType: '飛行積金',
                sourceUrl: 'https://www.dbs.com.tw/personal-zh/cards/travelworld/index.html?pid=tw-pweb-personal-zh_cards_dbs-credit-cards_default_page-hyperlink&sc=2c9264916603c1eec363d358204e151c',
                lastChecked: '2026-05-21',
                rates: {
                    domestic: { eva: 22, ci: 22, cx: 22 },
                    overseas: { eva: 18, ci: 18, cx: 18 },
                    bonus: { eva: 18, ci: 18, cx: 18 }
                },
                notes: '官方 2026 權益列海外一般消費每 NT$18 累積 1 點飛行積金、國內一般消費每 NT$22 累積 1 點，優惠期間至 2026/12/31。飛行積金可兌換亞洲萬里通、長榮、新航、華夏哩程，需留意不回饋項目與銀行對一般消費的認定。'
            },
            hsbc_light: {
                name: '滙豐旅人輕旅卡',
                issuer: '滙豐銀行',
                highlight: { text: '無回饋上限', cls: 'success' },
                earnType: '旅遊積分',
                sourceUrl: 'https://www.hsbc.com.tw/credit-cards/products/travelone/',
                lastChecked: '2026-05-21',
                rates: {
                    domestic: { eva: 20, ci: 20, cx: 20 },
                    overseas: { eva: 20, ci: 20, cx: 20 },
                    bonus: { eva: 20, ci: 20, cx: 20 }
                },
                notes: '官方列國內外消費 NT$20 = 1 旅遊積分、回饋無上限；官方頁載明自 2026/4/1 起，旅人無限卡、旅人御璽卡與旅人輕旅卡兌換中華航空哩程調整為 1 旅遊積分 = 1 華夏哩程，因此華航欄位已改以 NT$20 = 1 哩估算。'
            },
            hsbc_infinite: {
                name: '滙豐旅人無限卡',
                issuer: '滙豐銀行',
                highlight: { text: '海外最強', cls: 'primary' },
                earnType: '旅遊積分',
                sourceUrl: 'https://www.hsbc.com.tw/credit-cards/products/travel/visa-infinite/',
                lastChecked: '2026-05-21',
                rates: {
                    domestic: { eva: 18, ci: 18, cx: 18 },
                    overseas: { eva: 10, ci: 10, cx: 10 },
                    bonus: { eva: 10, ci: 10, cx: 10 }
                },
                notes: '官方列旅人無限卡海外消費 NT$10 = 1 旅遊積分、國內 NT$18 = 1 旅遊積分；官方頁載明自 2026/4/1 起兌換中華航空哩程調整為 1 旅遊積分 = 1 華夏哩程，因此華航欄位已不再用 2:1 折算。年費、資格與兌換比例請以官方公告為準。'
            },
            ctbc_ci_ding: {
                name: '中信華航鼎尊無限卡',
                issuer: '中國信託',
                highlight: { text: '指定加碼2倍', cls: 'warn' },
                earnType: '華夏哩程',
                sourceUrl: 'https://www.ctbcbank.com/content/dam/minisite/long/creditcard/CTBCCI/index.html',
                lastChecked: '2026-05-21',
                rates: {
                    domestic: { eva: null, ci: 18, cx: null },
                    overseas: { eva: null, ci: 18, cx: null },
                    bonus: { eva: null, ci: 9, cx: null }
                },
                notes: '官方列基本哩 NT$18 = 1 哩；指定產業加碼 2 倍、生日月加碼 3 倍，且有每月加碼回饋上限。此卡主要累積華夏哩程，本頁不換算長榮或亞洲萬里通。'
            },
            ctbc_ci_bright: {
                name: '中信華航璀璨無限卡',
                issuer: '中國信託',
                highlight: { text: '生日月加碼3倍', cls: 'warn' },
                earnType: '華夏哩程',
                sourceUrl: 'https://www.ctbcbank.com/content/dam/minisite/long/creditcard/CTBCCI/index.html',
                lastChecked: '2026-05-21',
                rates: {
                    domestic: { eva: null, ci: 20, cx: null },
                    overseas: { eva: null, ci: 20, cx: null },
                    bonus: { eva: null, ci: 10, cx: null }
                },
                notes: '官方列基本哩 NT$20 = 1 哩；指定產業加碼 2 倍、生日月加碼 3 倍，且有每月加碼回饋上限。此卡主要累積華夏哩程，本頁不換算長榮或亞洲萬里通。'
            },
            ctbc_ci_business: {
                name: '中信華航商務御璽卡',
                issuer: '中國信託',
                highlight: { text: '商務指定加碼', cls: 'info' },
                earnType: '華夏哩程',
                sourceUrl: 'https://www.ctbcbank.com/content/dam/minisite/long/creditcard/CTBCCI/index.html',
                lastChecked: '2026-05-21',
                rates: {
                    domestic: { eva: null, ci: 30, cx: null },
                    overseas: { eva: null, ci: 30, cx: null },
                    bonus: { eva: null, ci: 15, cx: null }
                },
                notes: '官方列基本哩 NT$30 = 1 哩；指定產業加碼 2 倍，且有每月加碼回饋上限。此卡主要累積華夏哩程，本頁不換算長榮或亞洲萬里通。'
            },
            cathay_eva_bonus: {
                name: '國泰世華長榮航空聯名卡 - 指定加碼',
                issuer: '國泰世華銀行',
                highlight: { text: '長榮首選', cls: 'primary' },
                earnType: '長榮哩程',
                sourceUrl: 'https://www.cathaybk.com.tw/cathaybk/personal/credit-card/cards/intro/eva/login/',
                lastChecked: '2026-05-21',
                rates: {
                    domestic: { eva: null, ci: null, cx: null },
                    overseas: { eva: 15, ci: null, cx: null },
                    bonus: { eva: 10, ci: null, cx: null }
                },
                notes: '官方活動列 2026/1/1~2026/12/31 指定條件最優 NT$10 = 1 哩、交易地點非臺灣之一般交易視為海外消費享 NT$15 = 1 哩；最優 NT$10 = 1 哩依卡等有年度回饋上限，極致無限卡 20 萬哩、無限卡 15 萬哩、極致御璽卡 10 萬哩，且部分條件需登錄或符合長榮/海外指定消費定義。國內一般消費因卡等不同，本頁未估算。'
            },
            cube_info: {
                name: '國泰世華 CUBE 卡（小樹點）',
                issuer: '國泰世華銀行',
                highlight: { text: '小樹點折抵', cls: 'success' },
                earnType: '小樹點(信用卡)',
                sourceUrl: 'https://www.cathaybk.com.tw/cathaybk/-/media/fddd4d9d98754438a663ee9129eb345a.pdf?sc_lang=en',
                lastChecked: '2026-05-21',
                nonMileage: true,
                pointRates: { domestic: 3, overseas: 3, bonus: 30 },
                rates: {
                    domestic: { eva: null, ci: null, cx: null },
                    overseas: { eva: null, ci: null, cx: null },
                    bonus: { eva: null, ci: null, cx: null }
                },
                notes: '官方權益手冊列 2026/6/30 前一般消費 0.3% 小樹點回饋；指定權益方案需先在 CUBE App 切換，每日可切換一次。市面資訊與官方活動頁顯示指定方案會依 CUBE 等級與通路不同落在約 2%、3%、3.3% 或限時更高回饋，本頁「指定加碼/活動條件」先用 Level 2 常見 3% 估算；小樹點可折抵或參加航空哩程/飯店積分兌換，但兌換比例與通路條件需以 CUBE App/官網為準，因此本頁不直接換算航空哩程。'
            }
        }
    },
    
    updateRouteTarget: () => {
        const fromSelect = document.getElementById('route-from');
        const routeSelect = document.getElementById('route-to');
        const dest = routeSelect.value;
        const fromText = fromSelect.options[fromSelect.selectedIndex].text;
        const destText = routeSelect.options[routeSelect.selectedIndex].text;
        const baseTargets = app.calcState.routeTargets[dest];

        // Cabin multipliers (relative to economy round-trip baseline)
        const cabinMul = {
            economy:  1.0,
            premium:  1.5,
            business: 2.0,
            first:    3.0,
        }[app.calcState.cabin] || 1.0;
        const tripMul = app.calcState.tripType === 'ow' ? 0.5 : 1.0;

        const factor = cabinMul * tripMul;
        const targets = {
            eva: Math.round(baseTargets.eva * factor),
            ci:  Math.round(baseTargets.ci  * factor),
            cx:  Math.round(baseTargets.cx  * factor),
        };
        app.calcState.targets = targets;

        const cabinText = { economy: '經濟艙', premium: '豪華經濟艙', business: '商務艙', first: '頭等艙' }[app.calcState.cabin];
        const tripText  = app.calcState.tripType === 'ow' ? '單趟' : '來回';

        // Update the explicit info box
        document.getElementById('route-info-box').classList.remove('hidden');
        document.getElementById('route-info-title').innerText = `${fromText} ➔ ${destText} ${cabinText}${tripText}`;
        document.getElementById('route-info-eva').innerText = targets.eva.toLocaleString();
        document.getElementById('route-info-ci').innerText = targets.ci.toLocaleString();
        document.getElementById('route-info-cx').innerText = targets.cx.toLocaleString();

        // Update target labels in UI
        document.getElementById('label-target-eva').innerText = targets.eva.toLocaleString();
        document.getElementById('label-target-ci').innerText = targets.ci.toLocaleString();
        document.getElementById('label-target-cx').innerText = targets.cx.toLocaleString();

        app.updateCalculator();
    },
    
    setCalcCard: (card) => {
        app.calcState.card = card;
        const cardSelect = document.getElementById('calc-card');
        if (cardSelect && Array.from(cardSelect.options).some(option => option.value === card)) {
            cardSelect.value = card;
        }
        // Reset bonus checkbox when switching cards
        const chk = document.getElementById('chk-bonus-promo');
        if (chk) { chk.checked = false; app.calcState.conditions.bonusPromo = false; }
        renderCardDetail();
        renderCardShowcase();
        app.updateCardPickerDisplay();
        app.updateCalculator();
    },

    setSpendType: (spendType) => {
        app.calcState.spendType = spendType;
        renderCardShowcase();
        app.updateCardPickerDisplay();
        app.updateCalculator();
    },

    setTripType: (tripType, btn) => {
        app.calcState.tripType = tripType;
        document.querySelectorAll('.trip-type-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        app.updateRouteTarget();
    },

    setCabin: (cabin) => {
        app.calcState.cabin = cabin;
        app.updateRouteTarget();
    },

    updateSpendAmount: (value, source = 'input') => {
        const slider = document.getElementById('calc-spend-slider');
        const input = document.getElementById('calc-spend-input');
        const min = parseInt(slider.min, 10);
        const max = parseInt(slider.max, 10);
        let amount = parseInt(value, 10);
        if (!Number.isFinite(amount)) amount = min;
        amount = Math.min(max, Math.max(min, amount));
        app.calcState.amount = amount;
        if (source !== 'slider' && slider) slider.value = amount;
        if (input) input.value = amount;
        app.updateCalculator();
    },

    updateCubePointsSummary: (card, spendType, amount) => {
        const input = document.getElementById('cube-current-points');
        const summary = document.getElementById('cube-points-summary');
        if (!input || !summary) return;

        const currentPoints = Math.max(0, Math.floor(Number(input.value) || 0));
        const earnPerThousand = card.pointRates[spendType] ?? 0;
        const projectedPoints = Math.floor((amount / 1000) * earnPerThousand);
        const totalPoints = currentPoints + projectedPoints;

        if (!input.value) {
            summary.innerHTML = `本次預計消費可累積約 <span class="font-bold text-primary">${projectedPoints.toLocaleString()}</span> 小樹點。請輸入目前持有點數後，系統會估算合計可用點數。`;
            return;
        }

        summary.innerHTML = `目前持有 <span class="font-bold">${currentPoints.toLocaleString()}</span> 點；本次預計消費可再累積約 <span class="font-bold text-primary">${projectedPoints.toLocaleString()}</span> 點，合計約 <span class="font-bold text-primary">${totalPoints.toLocaleString()}</span> 小樹點。<br><span class="text-xs text-gray">小樹點折抵與兌換比例依 CUBE App、指定權益方案與通路規則為準，這裡先以點數總量做決策估算。</span>`;
    },

    buildDecision: (bestResult, card, spendType) => {
        if (card.nonMileage) {
            return {
                primary: 'official',
                title: '先確認 CUBE 權益與小樹點用途',
                reason: 'CUBE 的回饋會受等級、權益方案、通路與活動期間影響，不適合直接和固定哩程卡混排。先用官方權益頁與 App 確認可用點數，再決定是否轉向哩程卡。',
                officialLabel: '建議優先',
                keepLabel: '備用',
                matchLabel: '不建議',
                keepNote: '小樹點可以先保存估算，但不當作固定航空哩程缺口。',
                matchNote: '小樹點目前不建議進入哩程媒合。',
                trustTitle: '小樹點先做權益確認',
                trustBody: 'CUBE 牽涉等級、方案、通路與活動期間。若沒有官方兌換比例與可轉讓規則，不應把它放進媒合或固定哩程比較。'
            };
        }

        if (!bestResult) {
            return {
                primary: 'official',
                title: '先換一張可估算的哩程卡',
                reason: '目前卡片或消費情境沒有固定哩程換算資料，先不要做媒合判斷。',
                officialLabel: '查官方',
                keepLabel: '不適用',
                matchLabel: '暫停',
                keepNote: '缺少固定換算率，無法可靠追蹤缺口。',
                matchNote: '資料不足時不建議媒合。',
                trustTitle: '資料不足時先停下',
                trustBody: '沒有固定換算率就不應推媒合，否則使用者會以為平台保證結果。下一版需要補資料可信度與官方來源狀態。'
            };
        }

        if (bestResult.missingMiles === 0) {
            return {
                primary: 'official',
                title: '已達標，先查票與確認兌換艙位',
                reason: `${bestResult.name} 已達本航線估算門檻。這時不需要先媒合，應先確認可兌換日期、艙等與稅費。`,
                officialLabel: '建議優先',
                keepLabel: '備用追蹤',
                matchLabel: '不建議',
                keepNote: '可保存這次結果，之後追蹤票位或點數到期。',
                matchNote: '已達標時先不需要媒合補點。',
                trustTitle: '已達標時不要製造交易',
                trustBody: '此時平台價值是查票、稅費、效期與提醒，不應硬導向媒合。這能降低錯誤交易與信任成本。'
            };
        }

        if (bestResult.missingMiles <= 5000 || bestResult.reqSpend <= 80000) {
            return {
                primary: 'official',
                title: '缺口小，先走官方補哩或短期補刷',
                reason: `${bestResult.name} 還差 ${bestResult.missingMiles.toLocaleString()} 哩。缺口不大時，官方補哩或少量自然消費通常比媒合更單純。`,
                officialLabel: '建議優先',
                keepLabel: '次選',
                matchLabel: '保留',
                keepNote: `若近期本來就會消費，約再刷 NT$ ${bestResult.reqSpend.toLocaleString()} 可補足。`,
                matchNote: '缺口小時不建議直接媒合，除非官方補哩不可用。',
                trustTitle: '缺口小時信任成本高於交易價值',
                trustBody: '小缺口先用官方補哩或自然消費，通常比找陌生人媒合更容易完成，也更適合作為首次使用體驗。'
            };
        }

        if (bestResult.reqSpend <= 250000 && spendType !== 'bonus') {
            return {
                primary: 'keep',
                title: '先評估近期自然消費能否補足',
                reason: `${bestResult.name} 還差 ${bestResult.missingMiles.toLocaleString()} 哩，約需再消費 NT$ ${bestResult.reqSpend.toLocaleString()}。若這筆消費本來就會發生，繼續刷卡比立即媒合更適合。`,
                officialLabel: '次選',
                keepLabel: '建議優先',
                matchLabel: '保留',
                keepNote: '保存這次缺口，後續可做 App 追蹤、提醒與回來重算。',
                matchNote: '若時間很急或消費不會自然發生，再看媒合供給。',
                trustTitle: '把低頻需求改成可追蹤任務',
                trustBody: '哩程兌換本身低頻，留存要靠缺口追蹤、到期提醒、票位/價格提醒與回來重算，而不是要求使用者每天打開。'
            };
        }

        return {
            primary: 'match',
            title: '缺口偏大，先看媒合供給再決定',
            reason: `${bestResult.name} 還差 ${bestResult.missingMiles.toLocaleString()} 哩，依目前卡片約需再消費 NT$ ${bestResult.reqSpend.toLocaleString()}。若沒有等額自然消費，媒合資訊可以作為下一步比較。`,
            officialLabel: '先查規則',
            keepLabel: '次選',
            matchLabel: '建議優先',
            keepNote: '若近期有大額自然消費，可先保存缺口再追蹤。',
            matchNote: `帶著 ${bestResult.missingMiles.toLocaleString()} 哩缺口去媒合頁找資訊。`,
            trustTitle: '大缺口才有媒合價值',
            trustBody: '媒合要成立，必須讓供給方知道需求明確，並讓需求方看到可轉讓規則、評價、效期與履約紀錄。金流應在風控成熟後再進場。'
        };
    },

    applyDecision: (decision, bestResult) => {
        const decisionKicker = document.getElementById('decision-kicker');
        const decisionTitle = document.getElementById('decision-title');
        const decisionReason = document.getElementById('decision-reason');
        const officialBtn = document.getElementById('official-topup-link');
        const keepBtn = document.getElementById('keep-earning-entry');
        const matchmakingBtn = document.getElementById('matchmaking-entry-btn');
        const officialLabel = document.getElementById('official-action-label');
        const keepLabel = document.getElementById('keep-earning-label');
        const matchmakingLabel = document.getElementById('matchmaking-action-label');
        const keepNote = document.getElementById('keep-earning-note');
        const matchmakingNote = document.getElementById('matchmaking-note');
        const trustTitle = document.getElementById('trust-stage-title');
        const trustBody = document.getElementById('trust-stage-body');

        const setText = (el, val) => { if (el) el.innerText = val; };
        setText(decisionKicker, '建議下一步');
        setText(decisionTitle,  decision.title);
        setText(decisionReason, decision.reason);
        setText(officialLabel,  decision.officialLabel);
        setText(keepLabel,      decision.keepLabel);
        setText(matchmakingLabel, decision.matchLabel);
        setText(keepNote,       decision.keepNote);
        setText(matchmakingNote, decision.matchNote);
        setText(trustTitle, decision.trustTitle || '先做決策，不先撮合付款');
        setText(trustBody,  decision.trustBody  || '');

        [officialBtn, keepBtn, matchmakingBtn].forEach(btn => btn?.classList.remove('primary'));
        if (decision.primary === 'keep') keepBtn.classList.add('primary');
        else if (decision.primary === 'match') matchmakingBtn.classList.add('primary');
        else officialBtn.classList.add('primary');

        const shouldHideMatch = !bestResult || bestResult.missingMiles === 0 || decision.matchLabel === '不建議' || decision.matchLabel === '暫停';
        matchmakingBtn.classList.toggle('hidden', shouldHideMatch);
        keepBtn.classList.toggle('hidden', decision.keepLabel === '不適用');
    },

    trackCurrentGap: () => {
        const missingEl = document.getElementById('best-missing');
        const missingMiles = Number(missingEl?.dataset.missingMiles || 0);
        const card = app.calcState.cards[app.calcState.card];
        const fromSelect = document.getElementById('route-from');
        const toSelect = document.getElementById('route-to');
        const record = {
            createdAt: new Date().toISOString(),
            from: fromSelect?.value || '',
            to: toSelect?.value || '',
            card: card?.name || '',
            spendType: app.calcState.spendType,
            plannedSpend: app.calcState.amount,
            missingMiles,
            summary: document.getElementById('best-summary-title')?.innerText || '',
            decision: document.getElementById('decision-title')?.innerText || '',
            trustNote: document.getElementById('trust-stage-title')?.innerText || ''
        };
        const key = 'pointExchangeTrackedGaps';
        const list = JSON.parse(localStorage.getItem(key) || '[]');
        list.unshift(record);
        localStorage.setItem(key, JSON.stringify(list.slice(0, 20)));
        showToast('缺口已保存！App 版將支援到期提醒與媒合通知', 'success', 4000);
    },
    
    updateCalculator: () => {
        const slider = document.getElementById('calc-spend-slider');
        const amount = parseInt(slider.value, 10);
        app.calcState.amount = amount;
        const spendInput = document.getElementById('calc-spend-input');
        if (spendInput && document.activeElement !== spendInput) {
            spendInput.value = amount;
        }
        const ownedInput = document.getElementById('current-miles-input');
        const ownedMiles = Math.max(0, Math.floor(Number(ownedInput?.value) || 0));
        
        // Display formatted amount
        document.getElementById('calc-spend-display').innerText = amount.toLocaleString();
        
        const cardKey = app.calcState.card;
        const card = app.calcState.cards[cardKey];
        const spendType = app.calcState.spendType;

        // Apply bonus rates if condition is checked
        let rates = { ...card.rates[spendType] };
        if (app.calcState.conditions?.bonusPromo && card.rates?.bonus) {
            const bonus = card.rates.bonus;
            ['eva', 'ci', 'cx'].forEach(k => {
                if (Number.isFinite(bonus[k]) && (!Number.isFinite(rates[k]) || bonus[k] < rates[k])) {
                    rates[k] = bonus[k];
                }
            });
        }
        const targets = app.calcState.targets;
        const scenarioLabel = {
            domestic: '國內一般消費',
            overseas: '海外一般消費',
            bonus: '指定加碼/活動條件'
        }[spendType];
        
        document.getElementById('card-info-title').innerText = `${card.name}｜${scenarioLabel}`;
        document.getElementById('card-info-notes').innerText = card.notes;
        document.getElementById('card-info-updated').innerText = card.lastChecked;
        const sourceLink = document.getElementById('card-info-source');
        sourceLink.href = card.sourceUrl;
        sourceLink.innerText = `${card.issuer} 官方來源`;

        // Update affiliate link
        const affiliateLink = document.getElementById('card-affiliate-link');
        const affiliateText = document.getElementById('card-affiliate-text');
        if (affiliateLink && affiliateText) {
            affiliateLink.href = card.sourceUrl;
            affiliateText.innerText = `申請 ${card.name}，享新戶開卡優惠`;
        }

        const cubePanel = document.getElementById('cube-points-panel');
        if (cubePanel) {
            cubePanel.classList.toggle('hidden', !card.nonMileage);
            if (card.nonMileage) {
                app.updateCubePointsSummary(card, spendType, amount);
            }
        }
        
        const validRates = Object.values(rates).filter(rate => Number.isFinite(rate));
        const bestRate = validRates.length ? Math.min(...validRates) : null;
        if (card.nonMileage) {
            const points = card.pointRates[spendType] ?? 0;
            document.getElementById('calc-efficiency').innerText = points;
            document.getElementById('calc-efficiency-unit').innerText = '小樹點 / 千元';
        } else if (bestRate) {
            document.getElementById('calc-efficiency').innerText = Math.floor(1000 / bestRate);
            document.getElementById('calc-efficiency-unit').innerText = `${card.earnType} / 千元`;
        } else {
            document.getElementById('calc-efficiency').innerText = 'N/A';
            document.getElementById('calc-efficiency-unit').innerText = '此情境不估算哩程';
        }
        
        // Update airlines
        const airlineResults = [];
        const updateAirline = (key, name) => {
            const rate = rates[key];
            const statusEl = document.getElementById(`${key}-status`);
            const ctaBtn = document.getElementById(`${key}-cta`);
            if (!Number.isFinite(rate)) {
                document.getElementById(`${key}-miles`).innerText = 'N/A';
                document.getElementById(`${key}-progress`).style.width = '0%';
                statusEl.innerHTML = `${card.name} 在「${scenarioLabel}」不適用 ${name} 哩程固定估算`;
                statusEl.style.color = 'var(--text-muted)';
                ctaBtn.classList.add('hidden');
                return;
            }
            
            const earnedMiles = Math.floor(amount / rate);
            const target = targets[key];
            const totalMiles = ownedMiles + earnedMiles;
            const missingMiles = Math.max(0, target - totalMiles);
            const reqSpend = missingMiles * rate;
            
            document.getElementById(`${key}-miles`).innerText = totalMiles.toLocaleString();
            
            const pct = Math.min(100, Math.floor((totalMiles / target) * 100));
            document.getElementById(`${key}-progress`).style.width = pct + '%';
            
            if (missingMiles > 0) {
                statusEl.innerHTML = `已含目前持有 ${ownedMiles.toLocaleString()} 哩，還差 ${missingMiles.toLocaleString()} 哩；約需再消費 NT$ ${reqSpend.toLocaleString()}`;
                statusEl.style.color = 'var(--text-main)';
                ctaBtn.classList.remove('hidden');
            } else {
                statusEl.innerHTML = `已達標，可以準備查票或兌換。`;
                statusEl.style.color = 'var(--primary)';
                ctaBtn.classList.add('hidden');
            }

            airlineResults.push({ key, name, rate, target, earnedMiles, totalMiles, missingMiles, reqSpend });
        };
        
        updateAirline('eva', '長榮');
        updateAirline('ci', '華航');
        updateAirline('cx', '國泰');

        const summaryTitle = document.getElementById('best-summary-title');
        const summaryEarned = document.getElementById('best-earned');
        const summaryTotal = document.getElementById('best-total');
        const summaryMissing = document.getElementById('best-missing');
        const summaryCta = document.getElementById('best-cta');
        const officialTopUpLink = document.getElementById('official-topup-link');
        const officialTopUpNote = document.getElementById('official-topup-note');
        const keepEarningNote = document.getElementById('keep-earning-note');
        const matchmakingBtn = document.getElementById('matchmaking-entry-btn');
        const matchmakingNote = document.getElementById('matchmaking-note');
        const bestResult = airlineResults
            .filter(item => Number.isFinite(item.rate))
            .sort((a, b) => a.missingMiles - b.missingMiles || b.earnedMiles - a.earnedMiles)[0];

        if (card.nonMileage) {
            const points = Math.floor((amount / 1000) * (card.pointRates[spendType] ?? 0));
            const cubeOwned = Math.max(0, Math.floor(Number(document.getElementById('cube-current-points')?.value) || ownedMiles));
            summaryTitle.innerText = '這張卡適合先看小樹點回饋，不適合直接推算固定航空哩程。';
            summaryEarned.innerText = `${points.toLocaleString()} 點`;
            summaryTotal.innerText = `${(cubeOwned + points).toLocaleString()} 點`;
            summaryMissing.innerText = '依兌換規則';
            summaryMissing.dataset.missingMiles = '';
            summaryCta?.classList.add('hidden');
            const cubeLink = app.calcState.topUpLinks.cube;
            officialTopUpLink.href = cubeLink.url;
            officialTopUpLink.querySelector('span').innerText = cubeLink.label;
            officialTopUpNote.innerText = cubeLink.note;
            app.applyDecision(app.buildDecision(null, card, spendType), null);
        } else if (bestResult) {
            summaryTitle.innerText = bestResult.missingMiles > 0
                ? `${bestResult.name}還差 ${bestResult.missingMiles.toLocaleString()} 哩，約需再消費 NT$ ${bestResult.reqSpend.toLocaleString()}。`
                : `${bestResult.name}已達標，可以先查票再決定是否需要媒合。`;
            summaryEarned.innerText = `${bestResult.earnedMiles.toLocaleString()} 哩`;
            summaryTotal.innerText = `${bestResult.totalMiles.toLocaleString()} 哩`;
            summaryMissing.innerText = bestResult.missingMiles > 0 ? `NT$ ${bestResult.reqSpend.toLocaleString()}` : '已達標';
            summaryMissing.dataset.missingMiles = String(bestResult.missingMiles);
            summaryCta?.classList.toggle('hidden', bestResult.missingMiles === 0);
            const categoryMap = { eva: '長榮哩程', ci: '華航哩程', cx: '亞洲萬里通' };
            if (summaryCta) summaryCta.onclick = () => app.jumpToMatchmaking(categoryMap[bestResult.key]);
            const topUpLink = app.calcState.topUpLinks[bestResult.key];
            officialTopUpLink.href = topUpLink.url;
            officialTopUpLink.querySelector('span').innerText = topUpLink.label;
            officialTopUpNote.innerText = topUpLink.note;
            matchmakingBtn.onclick = () => app.jumpToMatchmaking(categoryMap[bestResult.key]);
            app.applyDecision(app.buildDecision(bestResult, card, spendType), bestResult);
        } else {
            summaryTitle.innerText = '此卡在目前情境沒有可比較的航空哩程資料。';
            summaryEarned.innerText = 'N/A';
            summaryTotal.innerText = 'N/A';
            summaryMissing.innerText = 'N/A';
            summaryMissing.dataset.missingMiles = '';
            summaryCta?.classList.add('hidden');
            const fallbackLink = cardKey.startsWith('hsbc') ? app.calcState.topUpLinks.hsbc : app.calcState.topUpLinks.eva;
            officialTopUpLink.href = fallbackLink.url;
            officialTopUpLink.querySelector('span').innerText = fallbackLink.label;
            officialTopUpNote.innerText = fallbackLink.note;
            app.applyDecision(app.buildDecision(null, card, spendType), null);
        }
        
        // Render comparison table (lazy-user at-a-glance view)
        renderComparisonTable();

        // AI Diagnosis
        const aiEl = document.getElementById('ai-diagnosis');
        if (card.nonMileage) {
            aiEl.innerHTML = `${card.name} 適合做小樹點回饋與折抵估算，但不應直接拿來推算固定航空哩程。若要比較機票缺口，請改選可直接累積或轉換哩程的卡片。`;
        } else if (!bestRate) {
            aiEl.innerHTML = `${card.name} 在「${scenarioLabel}」沒有可用的固定哩程估算資料。請改選其他消費情境，或回到銀行官方頁確認最新活動條件。`;
        } else {
            const candidates = [
                { key: 'eva', label: '長榮', rate: rates.eva, target: targets.eva },
                { key: 'ci', label: '華航', rate: rates.ci, target: targets.ci },
                { key: 'cx', label: '亞洲萬里通', rate: rates.cx, target: targets.cx }
            ].filter(item => Number.isFinite(item.rate));
            const best = candidates.sort((a, b) => a.rate - b.rate)[0];
            const miles = ownedMiles + Math.floor(amount / best.rate);
            const missing = Math.max(0, best.target - miles);
            if (missing > 0) {
                aiEl.innerHTML = `${card.name} 在「${scenarioLabel}」下，目前較適合累積 <span class="font-bold text-primary">${best.label}</span>。若要達標，還差約 <span class="font-bold text-danger">${missing.toLocaleString()}</span> 哩；此估算未納入登錄、上限、不回饋項目與活動期間限制。`;
            } else {
                aiEl.innerHTML = `${card.name} 在「${scenarioLabel}」下，依目前公開回饋率估算已達 ${best.label} 目標。不過實際入帳仍需符合銀行官方條件。`;
            }
        }

        // Update cost analysis
        app.updateCostAnalysis();
    },

    // Phase 1: 三大意图按钮处理函数
    intentBuy: () => {
        // 用户选择「缺點/哩程」→ 聚焦到买方tab
        state.activeTab = 'buy';
        document.getElementById('tab-buy').classList.add('active');
        document.getElementById('tab-sell').classList.remove('active');
        document.getElementById('tab-gift').classList.remove('active');
        renderFeed();
        showToast('👇 向下滑动查看现有点数・选择最便宜的成交', 'info', 3000);
    },

    intentSell: () => {
        // 用户选择「我有點可賣」→ 跳转到发布页面
        document.querySelector('.nav-item[data-target="view-post"]').click();
        app.setPostType('sell');
        showToast('發布你的點數・等待媒合者詢問', 'success', 3000);
    },

    intentCalculate: () => {
        // 用户选择「試算工具」→ 打开计算器modal（新增：快速缺口识别）
        app.openQuickCalculator();
    },

    // Phase 1: 快速计算器modal
    openQuickCalculator: () => {
        const modal = document.getElementById('quick-calc-modal');
        if (modal) {
            modal.classList.add('open');
            document.getElementById('quick-calc-overlay').classList.add('open');
            showToast('輸入你的飛行計畫・看看還缺多少點', 'info', 2500);
        }
    },

    closeQuickCalculator: () => {
        const modal = document.getElementById('quick-calc-modal');
        const overlay = document.getElementById('quick-calc-overlay');
        if (modal && overlay) {
            modal.classList.remove('open');
            overlay.classList.remove('open');
        }
    },

    quickCalcResult: () => {
        // Phase 1: 快速计算缺口
        const quickTargets = {
            TPE: { TYO: 8000, LAX: 55000, NYC: 65000, BKK: 25000 },
            KHH: { TYO: 9000, LAX: 58000, NYC: 68000, BKK: 28000 }
        };
        const cabinMul = {
            economy: 1,
            premium: 1.5,
            business: 2.5,
            first: 3
        };

        const from = document.getElementById('quick-route-from').value;
        const to = document.getElementById('quick-route-to').value;
        const cabin = document.getElementById('quick-cabin').value;
        const currentMiles = Math.max(0, parseInt(document.getElementById('quick-current-miles').value) || 0);

        const baseTarget = quickTargets[from]?.[to] || 50000;
        const adjustedTarget = Math.round(baseTarget * cabinMul[cabin]);
        const missingMiles = Math.max(0, adjustedTarget - currentMiles);
        const missingCost = Math.round(missingMiles * 0.45);

        document.getElementById('quick-missing-miles').textContent = missingMiles.toLocaleString();
        document.getElementById('quick-missing-cost').textContent = missingCost.toLocaleString();
        document.getElementById('quick-result').style.display = 'block';

        showToast(`缺口: ${missingMiles.toLocaleString()} 里 ≈ NT$${missingCost.toLocaleString()}`, 'success', 3000);
    },

    quickPostToFeed: () => {
        // Phase 1: 从快速计算器跳转到发布需求
        const missingMiles = document.getElementById('quick-missing-miles').textContent;
        const from = document.getElementById('quick-route-from').value;
        const to = document.getElementById('quick-route-to').value;
        const cabin = document.getElementById('quick-cabin').value;

        if (missingMiles === '0') {
            showToast('請先計算缺口', 'warning', 2000);
            return;
        }

        app.closeQuickCalculator();
        document.querySelector('.nav-item[data-target="view-post"]').click();
        app.setPostType('buy');

        const note = document.getElementById('post-note');
        const cabinLabel = { economy: '經濟艙', premium: '豪華經濟', business: '商務艙', first: '頭等艙' }[cabin];
        if (note) {
            note.value = `我試算後需要 ${missingMiles} 里程 (${from}→${to} ${cabinLabel})，想找可協助補足的點數或哩程。`;
        }

        showToast('發布需求成功！等待媒合者回應', 'success', 3000);
    },

    // ============ PHASE 3: 信任体系函数 ============
    openTrustModal: (userId) => {
        const trust = trustData[userId];
        const score = calcTrustScore(userId);
        const badges = getTrustBadges(userId);

        if (!trust) return;

        const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
        const scoreLevel = score >= 80 ? '非常安全' : score >= 60 ? '相對安全' : '謹慎交易';

        let html = `
            <div style="text-align: center; padding: 1rem; background: linear-gradient(135deg, ${scoreColor}20 0%, ${scoreColor}10 100%); border-radius: 8px; margin-bottom: 1rem;">
                <div style="font-size: 3rem; font-weight: 700; color: ${scoreColor}; margin-bottom: 0.3rem;">${score}</div>
                <div style="font-size: 1rem; font-weight: 600; color: ${scoreColor}; margin-bottom: 0.2rem;">信任指數</div>
                <div style="font-size: 0.85rem; color: ${scoreColor};">${scoreLevel}</div>
            </div>

            <!-- 验证徽章 -->
            <div style="margin-bottom: 1rem;">
                <div style="font-size: 0.85rem; font-weight: 600; color: #333; margin-bottom: 0.5rem;">驗證狀態</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                    <div style="background: ${trust.verified ? '#d1fae5' : '#f3f4f6'}; padding: 0.75rem; border-radius: 6px; text-align: center;">
                        <div style="font-size: 1.2rem; margin-bottom: 0.2rem;">${trust.verified ? '✅' : '⏳'}</div>
                        <div style="font-size: 0.75rem; color: #666;">${trust.verified ? '身份已驗證' : '身份待驗證'}</div>
                    </div>
                    <div style="background: ${trust.bankVerified ? '#d1fae5' : '#f3f4f6'}; padding: 0.75rem; border-radius: 6px; text-align: center;">
                        <div style="font-size: 1.2rem; margin-bottom: 0.2rem;">${trust.bankVerified ? '✅' : '⏳'}</div>
                        <div style="font-size: 0.75rem; color: #666;">${trust.bankVerified ? '銀行已驗證' : '銀行待驗證'}</div>
                    </div>
                </div>
            </div>

            <!-- 交易历史 -->
            <div style="margin-bottom: 1rem;">
                <div style="font-size: 0.85rem; font-weight: 600; color: #333; margin-bottom: 0.5rem;">交易表現</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                    <div style="background: #f0f9ff; padding: 0.75rem; border-radius: 6px;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: #0284c7;">${trust.transactionCount}</div>
                        <div style="font-size: 0.7rem; color: #666;">筆成功交易</div>
                    </div>
                    <div style="background: ${trust.disputeCount === 0 ? '#f0fdf4' : '#fef2f2'}; padding: 0.75rem; border-radius: 6px;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: ${trust.disputeCount === 0 ? '#10b981' : '#ef4444'};">${trust.disputeCount}</div>
                        <div style="font-size: 0.7rem; color: #666;">件爭議紀錄</div>
                    </div>
                </div>
            </div>

            <!-- 回应速度 -->
            <div style="margin-bottom: 1rem;">
                <div style="font-size: 0.85rem; font-weight: 600; color: #333; margin-bottom: 0.5rem;">平均回應速度</div>
                <div style="background: #fef3c7; padding: 0.75rem; border-radius: 6px; text-align: center;">
                    <div style="font-size: 1.3rem; font-weight: 700; color: #f59e0b;">
                        ${Math.round(trust.avgResponseTime / 60)} 分鐘
                    </div>
                </div>
            </div>

        `;

        document.getElementById('trust-detail-content').innerHTML = html;
        document.getElementById('trust-modal').style.display = 'flex';
        document.getElementById('trust-modal-overlay').style.display = 'block';
    },

    closeTrustModal: () => {
        document.getElementById('trust-modal').style.display = 'none';
        document.getElementById('trust-modal-overlay').style.display = 'none';
    },

    // ============ PHASE 2: 智能匹配算法 ============
    /**
     * 根据用户的缺口，智能推荐最匹配的3个listing
     * 排序优先级：价格 > 评分 > 回应速度
     */
    smartMatch: (targetType, targetAmount) => {
        // 过滤匹配的listings
        const matched = mockFeed.filter(item => {
            return item.postType === 'sell' && item.type === targetType && item.pointAmount >= targetAmount;
        });

        if (matched.length === 0) {
            return [];
        }

        // 评分算法：计算"匹配分数"
        const scored = matched.map(item => {
            const priceScore = item.cashOffer > 0 ? item.cashOffer / item.pointAmount : 0; // 越低越好
            const ratingScore = item.rating / 5; // 越高越好
            const responseScore = item.id % 3 === 0 ? 1 : item.id % 3 === 1 ? 0.6 : 0.3; // 回应速度

            // 综合分数（权重：价格40% + 评分40% + 回应20%）
            const matchScore = (1 - priceScore / 2) * 0.4 + ratingScore * 0.4 + responseScore * 0.2;

            return { ...item, matchScore, priceScore, ratingScore };
        });

        // 按匹配分数排序，取前3个
        return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
    },

    /**
     * 显示"推荐的媒合者"面板（在feed上方）
     */
    showSmartMatches: (targetType, targetAmount) => {
        const container = document.getElementById('smart-matches-container');
        if (!container) return;

        const matches = app.smartMatch(targetType, targetAmount);

        if (matches.length === 0) {
            container.innerHTML = '<div class="text-center text-gray p-4 text-sm">暫無匹配的現貨・你也可以發布需求等待媒合</div>';
            container.style.display = 'block';
            return;
        }

        let html = `
            <div style="padding: 0.75rem 1rem; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-bottom: 2px solid #fcd34d;">
                <div style="font-weight: 600; color: #92400e; margin-bottom: 0.5rem;">🎯 為你推薦最匹配的賣家</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem;">
        `;

        matches.forEach((item, idx) => {
            const pricePerUnit = (item.cashOffer / item.pointAmount).toFixed(2);
            const unitLabel = item.type.includes('哩程') ? '里' : '點';
            const responseTime = item.id % 3 === 0 ? '< 5分' : item.id % 3 === 1 ? '< 30分' : '< 2小時';

            html += `
                <div style="background: white; padding: 0.5rem; border-radius: 6px; cursor: pointer; transition: all 0.2s; border: 2px solid transparent;" onclick="app.openChatRoom(${item.id}, '${item.user.replace(/'/g, "\\'")}'); showToast('開啟聊天・開始媒合', 'success', 2000);" onmouseover="this.style.borderColor='#fcd34d'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)';" onmouseout="this.style.borderColor='transparent'; this.style.boxShadow='none';">
                    <div style="font-weight: 600; color: #333; font-size: 0.9rem; margin-bottom: 0.3rem;">
                        ${escapeHTML(item.user.substring(0, 6))}...
                        <i class="ph-fill ph-star" style="color: #fbbf24; font-size: 0.8rem;"></i>${item.rating}
                    </div>
                    <div style="font-size: 0.75rem; color: #666; margin-bottom: 0.2rem;">
                        有 ${item.pointAmount.toLocaleString()}${unitLabel}
                    </div>
                    <div style="font-weight: 600; color: #059669; font-size: 0.9rem; margin-bottom: 0.2rem;">
                        NT$${item.cashOffer}
                    </div>
                    <div style="font-size: 0.7rem; color: #999;">
                        🟢 ${responseTime}回應
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
        container.innerHTML = html;
        container.style.display = 'block';
    },

    openPostFromCalculator: () => {
        const activeNav = document.querySelector('.nav-item[data-target="view-post"]');
        if (activeNav) activeNav.click();
        app.setPostType('buy');
        const missingEl = document.getElementById('best-missing');
        const missingMiles = missingEl?.dataset.missingMiles || '';
        const missingText = missingMiles ? `${Number(missingMiles).toLocaleString()} 哩` : (missingEl?.innerText || '');
        const note = document.getElementById('post-note');
        const amount = document.getElementById('post-amount');
        if (note && !note.value) {
            note.value = `我用試算工具估算後還有缺口：${missingText}。想找可協助補足的點數或哩程資訊。`;
        }
        if (amount && !amount.value) {
            amount.value = parseInt(missingMiles || missingText.replace(/[^\d]/g, ''), 10) || '';
            app.updateRecommendedPrice();
        }
    },

    showAppComingSoon: () => {
        app.trackCurrentGap();
    },

    jumpToMatchmaking: (airlineName) => {
        app.switchFeedTab('buy');
        state.activeCategory = airlineName;
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.toggle('active', chip.textContent.trim() === airlineName);
        });
        renderFeed();
        document.querySelector('.nav-item[data-target="view-home"]').click();
        showToast(`已篩選「${airlineName}」，請先確認轉讓規則與效期`, 'info', 4000);
    }
};

// Rating Stars Interaction
document.getElementById('stars-input').addEventListener('click', (e) => {
    if (e.target.classList.contains('star-btn')) {
        const val = parseInt(e.target.getAttribute('data-val'));
        const stars = document.querySelectorAll('#stars-input .star-btn');
        stars.forEach((s, i) => {
            if (i < val) {
                s.classList.add('ph-fill', 'text-warning');
                s.classList.remove('ph');
            } else {
                s.classList.remove('ph-fill', 'text-warning');
                s.classList.add('ph');
            }
        });
    }
});
