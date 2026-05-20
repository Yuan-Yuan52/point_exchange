// Mock Data
const mockFeed = [
    { id: 1, user: '王小明', avatar: '王', type: 'Open Points', pointAmount: 500, cashOffer: 450, note: '還差 500 點兌換折抵，希望找可轉讓點數。', rating: 4.8, postType: 'buy' },
    { id: 2, user: '李美美', avatar: '李', type: '全聯福利點', pointAmount: 1200, cashOffer: 1000, note: '想補足購物折抵缺口，可先聊轉讓方式。', rating: 5.0, postType: 'buy' },
    { id: 3, user: '張大頭', avatar: '張', type: 'Line Points', pointAmount: 300, cashOffer: 280, note: '試算後還差 300 點，想找小額補點。', rating: 4.5, postType: 'buy' },
    { id: 4, user: '陳小美', avatar: '陳', type: 'Open Points', pointAmount: 2000, cashOffer: 1700, note: '近期用不到，可討論轉讓方式與效期。', rating: 4.9, postType: 'sell' },
    { id: 5, user: '林阿土', avatar: '林', type: '全聯福利點', pointAmount: 800, cashOffer: 700, note: '有多餘點數，可協助需要補點的人。', rating: 4.7, postType: 'sell' },
    { id: 6, user: '善心人士', avatar: '善', type: '長榮哩程', pointAmount: 1000, cashOffer: 0, note: '哩程快到期，想轉讓給剛好有缺口的人。', rating: 5.0, postType: 'gift' },
];

const mockChats = [
    { id: 1, userId: 1, user: '王小明', avatar: '王', lastMsg: '請問450元可以嗎？', time: '10:30', unread: 1 },
    { id: 2, userId: 2, user: '李美美', avatar: '李', lastMsg: '我已經轉帳囉，確認一下', time: '昨天', unread: 0 },
];

const mockReviews = [
    { id: 1, user: '陳先生', rating: 5, text: '交易快速，回覆很親切！', date: '2026-05-18' },
    { id: 2, user: '林小姐', rating: 4, text: '很順利的換到點數了。', date: '2026-05-15' },
    { id: 3, user: '吳同學', rating: 5, text: '溝通清楚、回覆快速。', date: '2026-05-10' },
];

function escapeHTML(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

// App State
const state = {
    currentChatUserId: null,
    currentChatUserName: '',
    activeTab: 'buy',
    activeCategory: '全部',
    formPostType: 'buy'
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    renderFeed();
    renderChatList();
    renderReviews();
    app.updateRouteTarget();
    app.setPostType('buy');
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
        
        card.innerHTML = `
            <div class="feed-header">
                <div class="user-info">
                    <div class="avatar">${safeItem.avatar}</div>
                    <div>
                        <div class="font-bold text-sm">${safeItem.user}</div>
                        <div class="text-xs text-warning"><i class="ph-fill ph-star"></i> ${safeItem.rating}</div>
                    </div>
                </div>
                <div class="flex items-center">
                    <span class="feed-card-badge ${badgeClass}">${badgeText}</span>
                    <div class="point-type">${safeItem.type}</div>
                </div>
            </div>
            
            <div class="exchange-details mt-2">
                <div class="detail-box">
                    <span class="detail-label">${labelAmount}</span>
                    <span class="detail-value">${safeItem.pointAmount} <span class="text-xs font-normal text-muted">點</span></span>
                </div>
                <i class="ph ph-arrow-right text-muted"></i>
                <div class="detail-box">
                    <span class="detail-label">${isGift ? '費用' : labelPrice + ' (NT$)'}</span>
                    <span class="detail-value highlight">${isGift ? '免費' : '$' + safeItem.cashOffer}</span>
                </div>
            </div>
            
            ${item.note ? `<div class="mt-3 text-sm text-gray bg-gray-50 p-2 rounded">${safeItem.note}</div>` : ''}
            
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
    },

    filterType: (event, category) => {
        state.activeCategory = category;
        const chips = document.querySelectorAll('.filter-chip');
        chips.forEach(chip => chip.classList.remove('active'));
        event.target.classList.add('active');
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
        
        if (!Number.isFinite(amount) || amount <= 0 || (state.formPostType !== 'gift' && (!Number.isFinite(price) || price <= 0))) {
            alert('請填寫有效的數量與金額');
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
        
        alert(state.formPostType === 'buy' ? '補點缺口發布成功！' : (state.formPostType === 'sell' ? '可轉讓點數發布成功！' : '免費轉讓資訊發布成功！'));
        
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
        
        if (isAirline) unitText = '哩';
        
        const recPrice = Math.floor(amount * rate);
        document.getElementById('rec-price-val').innerText = recPrice.toLocaleString();
        document.getElementById('rec-price-unit').innerText = `${unitText}=${rate}`;
        recEl.classList.remove('hidden');
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
            alert('請輸入缺口數量與可接受補點成本');
            return;
        }
        
        document.getElementById('match-actions').style.display = 'none';
        document.getElementById('match-results').classList.remove('hidden');
        
        // Simple validation rule: if budget < amount * minRate, show warning
        let minRate = 0.2;
        if (type === 'Open Points' || type === '全聯福利點' || type === 'Line Points') {
            minRate = 0.7; // These are closer to 1:1
        }
        
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
        alert('已向 3 位可能符合條件的使用者發送媒合詢問。請先確認點數規則與轉讓限制。');
        app.closeAutoMatch();
        // Go to chat list
        document.querySelector('.nav-item[data-target="view-chat"]').click();
    },

    showSafetyTips: () => {
        alert('媒合安全提醒：\n\n1. 先確認點數或哩程是否可轉讓、是否可合併、效期是否足夠。\n2. 平台只提供媒合與資訊提醒，不介入付款、不代管資金。\n3. 請避免一次交換過大金額，並保留雙方溝通紀錄。\n4. 若對方要求離開平台或提供敏感資料，請提高警覺。');
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
        alert('感謝您的評價！');
        app.closeRatingModal();
    },

    // Calculator Logic
    calcState: {
        amount: 100000,
        card: 'dbs_world',
        spendType: 'domestic',
        targets: {
            eva: 35000,
            ci: 35000,
            cx: 20000
        },
        routeTargets: {
            'ASIA': { eva: 35000, ci: 35000, cx: 20000 },
            'HKG': { eva: 20000, ci: 20000, cx: 15000 },
            'US': { eva: 100000, ci: 100000, cx: 60000 },
            'EUR': { eva: 100000, ci: 100000, cx: 60000 }
        },
        cards: {
            dbs_world: {
                name: '星展飛行世界商務卡',
                issuer: '星展銀行',
                earnType: '飛行積金',
                sourceUrl: 'https://www.dbs.com.tw/personal-zh/cards/travelworld/index.html?pid=tw-pweb-personal-zh_cards_offers_epptravel_index_html-L',
                lastChecked: '2026-05-20',
                rates: {
                    domestic: { eva: 20, ci: 20, cx: 20 },
                    overseas: { eva: 15, ci: 15, cx: 15 },
                    bonus: { eva: 15, ci: 15, cx: 15 }
                },
                notes: '官方列海外一般消費每 NT$15 累積 1 點飛行積金，國內一般消費每 NT$20 累積 1 點；飛行積金可兌換亞洲萬里通、長榮、華夏哩程等。需留意不回饋項目與銀行對一般消費的認定。'
            },
            hsbc_light: {
                name: '滙豐旅人輕旅卡',
                issuer: '滙豐銀行',
                earnType: '旅遊積分',
                sourceUrl: 'https://www.hsbc.com.tw/content/hsbc/tw/zh_tw/credit-cards/products/travel/visa-light/',
                lastChecked: '2026-05-20',
                rates: {
                    domestic: { eva: 20, ci: 40, cx: 20 },
                    overseas: { eva: 20, ci: 40, cx: 20 },
                    bonus: { eva: 20, ci: 40, cx: 20 }
                },
                notes: '官方列國內外消費 NT$20 = 1 旅遊積分、回饋無上限；官方頁另載自 2025/1/1 起兌換中華航空哩程比例為 2 旅遊積分 = 1 哩，因此華航欄位以有效 NT$40 = 1 哩估算。其他夥伴仍需以官方兌換頁為準。'
            },
            hsbc_infinite: {
                name: '滙豐旅人無限卡',
                issuer: '滙豐銀行',
                earnType: '旅遊積分',
                sourceUrl: 'https://www.hsbc.com.tw/content/dam/hsbc/tw/docs/credit-cards/product-tour.pdf',
                lastChecked: '2026-05-20',
                rates: {
                    domestic: { eva: 18, ci: 36, cx: 18 },
                    overseas: { eva: 10, ci: 20, cx: 10 },
                    bonus: { eva: 10, ci: 20, cx: 10 }
                },
                notes: '官方產品總覽列旅人無限卡海外 NT$10 = 1 點、國內 NT$18 = 1 點；中華航空哩程依滙豐公告以 2 旅遊積分 = 1 哩估算。年費、資格與兌換比例請以官方公告為準。'
            },
            ctbc_ci_ding: {
                name: '中信華航鼎尊無限卡',
                issuer: '中國信託',
                earnType: '華夏哩程',
                sourceUrl: 'https://www.ctbcbank.com/content/dam/minisite/long/creditcard/CTBCCI/index.html',
                lastChecked: '2026-05-20',
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
                earnType: '華夏哩程',
                sourceUrl: 'https://www.ctbcbank.com/content/dam/minisite/long/creditcard/CTBCCI/index.html',
                lastChecked: '2026-05-20',
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
                earnType: '華夏哩程',
                sourceUrl: 'https://www.ctbcbank.com/content/dam/minisite/long/creditcard/CTBCCI/index.html',
                lastChecked: '2026-05-20',
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
                earnType: '長榮哩程',
                sourceUrl: 'https://www.cathaybk.com.tw/cathaybk/personal/credit-card/cards/intro/eva/login/',
                lastChecked: '2026-05-20',
                rates: {
                    domestic: { eva: null, ci: null, cx: null },
                    overseas: { eva: 15, ci: null, cx: null },
                    bonus: { eva: 10, ci: null, cx: null }
                },
                notes: '官方活動列指定條件最優 NT$10 = 1 哩、海外一般交易 NT$15 = 1 哩；最優回饋有卡等年上限，且部分條件需登錄或符合長榮/海外指定消費定義。國內一般消費未在本頁估算。'
            },
            cube_info: {
                name: '國泰世華 CUBE卡 - 小樹點資訊',
                issuer: '國泰世華銀行',
                earnType: '小樹點(信用卡)',
                sourceUrl: 'https://www.cathaybk.com.tw/cathaybk/-/media/fddd4d9d98754438a663ee9129eb345a.pdf?sc_lang=en',
                lastChecked: '2026-05-20',
                nonMileage: true,
                pointRates: { domestic: 3, overseas: 3, bonus: 30 },
                rates: {
                    domestic: { eva: null, ci: null, cx: null },
                    overseas: { eva: null, ci: null, cx: null },
                    bonus: { eva: null, ci: null, cx: null }
                },
                notes: '官方權益手冊列 2026/6/30 前一般消費 0.3% 小樹點回饋，指定權益方案通路通常為 3% 小樹點；小樹點可折抵或參加航空哩程/飯店積分兌換，但兌換比例與通路條件需另以 CUBE App/官網為準，因此本頁不直接換算航空哩程。'
            }
        }
    },
    
    updateRouteTarget: () => {
        const routeSelect = document.getElementById('route-to');
        const dest = routeSelect.value;
        const destText = routeSelect.options[routeSelect.selectedIndex].text;
        const targets = app.calcState.routeTargets[dest];
        app.calcState.targets = { ...targets };
        
        // Update the explicit info box
        document.getElementById('route-info-box').classList.remove('hidden');
        document.getElementById('route-info-title').innerText = `台北 (TPE) ➔ ${destText} 經濟艙來回`;
        document.getElementById('route-info-eva').innerText = targets.eva.toLocaleString();
        document.getElementById('route-info-ci').innerText = targets.ci.toLocaleString();
        document.getElementById('route-info-cx').innerText = targets.cx.toLocaleString();
        
        // Update the target labels in UI
        document.getElementById('label-target-eva').innerText = targets.eva.toLocaleString();
        document.getElementById('label-target-ci').innerText = targets.ci.toLocaleString();
        document.getElementById('label-target-cx').innerText = targets.cx.toLocaleString();
        
        app.updateCalculator();
    },
    
    setCalcCard: (card) => {
        app.calcState.card = card;
        app.updateCalculator();
    },

    setSpendType: (spendType) => {
        app.calcState.spendType = spendType;
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
    
    updateCalculator: () => {
        const slider = document.getElementById('calc-spend-slider');
        const amount = parseInt(slider.value, 10);
        app.calcState.amount = amount;
        
        // Display formatted amount
        document.getElementById('calc-spend-display').innerText = amount.toLocaleString();
        
        const cardKey = app.calcState.card;
        const card = app.calcState.cards[cardKey];
        const spendType = app.calcState.spendType;
        const rates = card.rates[spendType];
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
            
            const miles = Math.floor(amount / rate);
            const target = targets[key];
            const missingMiles = Math.max(0, target - miles);
            const reqSpend = missingMiles * rate;
            
            document.getElementById(`${key}-miles`).innerText = miles.toLocaleString();
            
            const pct = Math.min(100, Math.floor((miles / target) * 100));
            document.getElementById(`${key}-progress`).style.width = pct + '%';
            
            if (missingMiles > 0) {
                statusEl.innerHTML = `距離解鎖機票，您還需消費：NT$ ${reqSpend.toLocaleString()}`;
                statusEl.style.color = 'var(--text-main)';
                ctaBtn.classList.remove('hidden');
            } else {
                statusEl.innerHTML = `🎉 恭喜！您已達標`;
                statusEl.style.color = 'var(--primary)';
                ctaBtn.classList.add('hidden');
            }
        };
        
        updateAirline('eva', '長榮');
        updateAirline('ci', '華航');
        updateAirline('cx', '國泰');
        
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
            const miles = Math.floor(amount / best.rate);
            const missing = Math.max(0, best.target - miles);
            if (missing > 0) {
                aiEl.innerHTML = `${card.name} 在「${scenarioLabel}」下，目前較適合累積 <span class="font-bold text-primary">${best.label}</span>。若要達標，還差約 <span class="font-bold text-danger">${missing.toLocaleString()}</span> 哩；此估算未納入登錄、上限、不回饋項目與活動期間限制。`;
            } else {
                aiEl.innerHTML = `${card.name} 在「${scenarioLabel}」下，依目前公開回饋率估算已達 ${best.label} 目標。不過實際入帳仍需符合銀行官方條件。`;
            }
        }
    },

    jumpToMatchmaking: (airlineName) => {
        app.switchFeedTab('buy');
        state.activeCategory = airlineName;
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.toggle('active', chip.textContent.trim() === airlineName);
        });
        renderFeed();
        document.querySelector('.nav-item[data-target="view-home"]').click();
        
        // Use timeout to ensure view change completes before alert
        setTimeout(() => {
            alert(`已切到補點媒合頁，並篩選「${airlineName}」。請先確認轉讓規則與效期。`);
        }, 100);
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
