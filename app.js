// Mock Data
const mockFeed = [
    { id: 1, user: '王小明', avatar: '王', type: 'Open Points', pointAmount: 500, cashOffer: 450, note: '想換現金吃晚餐，可立刻匯款！', rating: 4.8, postType: 'buy' },
    { id: 2, user: '李美美', avatar: '李', type: '全聯福利點', pointAmount: 1200, cashOffer: 1000, note: '換現，誠意收', rating: 5.0, postType: 'buy' },
    { id: 3, user: '張大頭', avatar: '張', type: 'Line Points', pointAmount: 300, cashOffer: 280, note: '缺現金繳費，拜託了', rating: 4.5, postType: 'buy' },
    { id: 4, user: '陳小美', avatar: '陳', type: 'Open Points', pointAmount: 2000, cashOffer: 1700, note: '點數太多用不完，便宜賣現！', rating: 4.9, postType: 'sell' },
    { id: 5, user: '林阿土', avatar: '林', type: '全聯福利點', pointAmount: 800, cashOffer: 700, note: '全聯點數出售，意者私', rating: 4.7, postType: 'sell' },
    { id: 6, user: '善心人士', avatar: '善', type: '長榮哩程', pointAmount: 1000, cashOffer: 0, note: '哩程快過期了，免費贈送給有緣人', rating: 5.0, postType: 'gift' },
];

const mockChats = [
    { id: 1, userId: 1, user: '王小明', avatar: '王', lastMsg: '請問450元可以嗎？', time: '10:30', unread: 1 },
    { id: 2, userId: 2, user: '李美美', avatar: '李', lastMsg: '我已經轉帳囉，確認一下', time: '昨天', unread: 0 },
];

const mockReviews = [
    { id: 1, user: '陳先生', rating: 5, text: '交易快速，回覆很親切！', date: '2026-05-18' },
    { id: 2, user: '林小姐', rating: 4, text: '很順利的換到點數了。', date: '2026-05-15' },
    { id: 3, user: '吳同學', rating: 5, text: '優質好買家！', date: '2026-05-10' },
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
    activeTab: 'buy', // 'buy' or 'sell'
    activeCategory: '全部',
    formPostType: 'buy' // 'buy' or 'sell'
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    renderFeed();
    renderChatList();
    renderReviews();
    app.updateRouteTarget();
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
        list.innerHTML = `<div class="text-center text-gray p-8 text-sm">目前沒有相關的${state.activeTab === 'buy' ? '徵求需求' : state.activeTab === 'sell' ? '出售刊登' : '免費贈與'}</div>`;
        return;
    }
    
    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card feed-item';
        card.onclick = () => app.openChatRoom(item.id, item.user);
        
        const isBuy = item.postType === 'buy';
        const isGift = item.postType === 'gift';
        const badgeClass = isGift ? 'gift' : (isBuy ? 'buy' : 'sell');
        const badgeText = isGift ? '免費贈與' : (isBuy ? '徵求點數' : '出售點數');
        const labelAmount = isGift ? '贈送數量' : (isBuy ? '需求點數' : '可賣點數');
        const labelPrice = isBuy ? '願意支付' : '期望售價';
        const btnText = isGift ? '向他索取 (聯繫)' : (isBuy ? '與他聯繫 (交易)' : '向他購買 (交易)');
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
                    <span class="detail-label">${isGift ? '費用' : labelPrice + ' (現金)'}</span>
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
            document.getElementById('form-main-title').innerText = '發布您的點數需求';
            document.getElementById('label-amount').innerText = '徵求數量';
            document.getElementById('label-price').innerText = '願意提供的兌換金額 (NT$)';
            document.getElementById('hint-price').innerText = '這代表您願意用現金向有過多點數的人收購';
        } else if (type === 'sell') {
            document.getElementById('form-main-title').innerText = '出售您的多餘點數';
            document.getElementById('label-amount').innerText = '出售數量';
            document.getElementById('label-price').innerText = '期望獲得的現金金額 (NT$)';
            document.getElementById('hint-price').innerText = '這代表您願意以此價格出售您的點數給需要的人';
        } else {
            document.getElementById('form-main-title').innerText = '免費贈送您的點數';
            document.getElementById('label-amount').innerText = '贈送數量';
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
        
        alert(state.formPostType === 'buy' ? '點數徵求需求發布成功！' : (state.formPostType === 'sell' ? '點數出售刊登成功！' : '免費贈送發布成功！'));
        
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
            alert('請輸入數量與預期花費金額');
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
        alert('已成功向 3 位賣家發送交易邀請！');
        app.closeAutoMatch();
        // Go to chat list
        document.querySelector('.nav-item[data-target="view-chat"]').click();
    },

    startEscrow: () => {
        const feedItem = mockFeed.find(f => f.id === state.currentChatUserId);
        const amt = feedItem ? feedItem.cashOffer : 500;
        const fee = Math.floor(amt * 0.03);
        const total = amt + fee;
        
        const confirmMsg = `確認啟動「模擬擔保交易」？\n\nPrototype 將示範代管 NT$ ${total} (含3%手續費 $${fee}) 的流程。\n實際上線前需串接合法金流與交易規範，這裡不代表真實扣款或撥款。`;
        
        if (confirm(confirmMsg)) {
            alert('已啟動模擬擔保流程。此 prototype 不會進行真實扣款或撥款。');
            app.finishTransaction();
        }
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
            ? `您好，我看到您有 ${feedItem.pointAmount} 點的 ${feedItem.type} 想要以 $${feedItem.cashOffer} 出售，我想跟您購買！`
            : feedItem && feedItem.postType === 'gift' 
            ? `您好，我看到您有 ${feedItem.pointAmount} 點的 ${feedItem.type} 想要免費贈送，請問還可以向您索取嗎？非常感謝您！`
            : `您好，我有 ${userName === '王小明' ? 'Open Points' : '點數'} 可以提供換現金，請問您還需要嗎？`;

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
        card: 'cube',
        rates: {
            cube: { eva: 3, ci: 3, cx: 3 }, // 模擬 CUBE 10% 等同於 3元=1哩 的極致優惠
            hsbc: { eva: 20, ci: 20, cx: 20 },
            dbs: { eva: 15, ci: 15, cx: 15 },
            eva: { eva: 10, ci: 20, cx: 20 },
            ci: { eva: 20, ci: 18, cx: 20 }
        },
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
    
    updateCalculator: () => {
        const slider = document.getElementById('calc-spend-slider');
        const amount = parseInt(slider.value);
        app.calcState.amount = amount;
        
        // Display formatted amount
        document.getElementById('calc-spend-display').innerText = amount.toLocaleString();
        
        const card = app.calcState.card;
        const rates = app.calcState.rates[card];
        const targets = app.calcState.targets;
        
        // Calculate efficiency based on best rate for the card
        const bestRate = Math.min(rates.eva, rates.ci, rates.cx);
        const eff = Math.floor(1000 / bestRate);
        document.getElementById('calc-efficiency').innerText = eff;
        
        // Update airlines
        const updateAirline = (key, name) => {
            const miles = Math.floor(amount / rates[key]);
            const target = targets[key];
            const missingMiles = Math.max(0, target - miles);
            const reqSpend = missingMiles * rates[key];
            
            document.getElementById(`${key}-miles`).innerText = miles.toLocaleString();
            
            const pct = Math.min(100, Math.floor((miles / target) * 100));
            document.getElementById(`${key}-progress`).style.width = pct + '%';
            
            const statusEl = document.getElementById(`${key}-status`);
            const ctaBtn = document.getElementById(`${key}-cta`);
            
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
        if (card === 'cube') {
            const missingMilesEVA = Math.max(0, targets.eva - Math.floor(amount / rates.eva));
            const reqSpendCUBE = missingMilesEVA * rates.eva;
            const reqSpendGeneral = missingMilesEVA * 20; // 假設一般消費 20元=1哩
            const savings = reqSpendGeneral - reqSpendCUBE;
            if (missingMilesEVA > 0) {
                aiEl.innerHTML = `選擇 CUBE 卡 (指定回饋最高)！您僅需刷 <span class="font-bold text-primary">NT$ ${reqSpendCUBE.toLocaleString()}</span> 即可換機票，相較一般模式省下 <span class="font-bold text-danger">NT$ ${savings.toLocaleString()}</span> 的門檻！`;
            } else {
                aiEl.innerHTML = `使用 CUBE 卡高回饋活動，您已成功達標機票門檻！`;
            }
        } else if (card === 'eva') {
            aiEl.innerHTML = `長榮極致無限卡最適合累積長榮哩程 (10元=1哩)！建議將目標鎖定在長榮航空，即可快速達成機票門檻。`;
        } else if (card === 'dbs') {
            aiEl.innerHTML = `星展飛行世界商務卡是非常好的通用卡，各家航空皆為 15元=1哩，適合想要自由選擇航空公司的您。`;
        } else if (card === 'hsbc') {
            aiEl.innerHTML = `滙豐旅人輕旅卡通用性極高，但目前 20元=1哩 累積速度較為中規中矩。如果您有特定喜歡的航空，可以搭配聯名卡使用。`;
        } else if (card === 'ci') {
            aiEl.innerHTML = `華航聯名卡最適合累積華航哩程 (18元=1哩)！建議將目標鎖定在中華航空。`;
        }
    },

    jumpToMatchmaking: (airlineName) => {
        app.switchFeedTab('buy');
        document.querySelector('.nav-item[data-target="view-home"]').click();
        
        // Use timeout to ensure view change completes before alert
        setTimeout(() => {
            alert(`已導航至媒合大廳！您可以在此向其他人收購「${airlineName}」所需的哩程/點數。`);
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
