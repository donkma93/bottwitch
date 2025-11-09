// Kết nối với Socket.IO
const socket = io();

// Language Screen Elements
const languageScreen = document.getElementById('languageScreen');
const mainApp = document.getElementById('mainApp');
const channelInputInitial = document.getElementById('channelInputInitial');
const connectInitialBtn = document.getElementById('connectInitialBtn');
const statusInitial = document.getElementById('statusInitial');
const languageSelect = document.getElementById('languageSelect');

// DOM Elements
const channelInput = document.getElementById('channelInput');
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const chatMessages = document.getElementById('chatMessages');
const statusDiv = document.getElementById('status');
const channelName = document.getElementById('channelName');
const messageCount = document.getElementById('messageCount');
const clearBtn = document.getElementById('clearBtn');
const toggleChatBtn = document.getElementById('toggleChatBtn');
const chatContainer = document.getElementById('chatContainer');

// Giveaway elements
const keywordInput = document.getElementById('keywordInput');
const setKeywordBtn = document.getElementById('setKeywordBtn');
const disableKeywordBtn = document.getElementById('disableKeywordBtn');
const keywordStatus = document.getElementById('keywordStatus');
const participantsList = document.getElementById('participantsList');
const participantCount = document.getElementById('participantCount');
const exportBtn = document.getElementById('exportBtn');
const clearParticipantsBtn = document.getElementById('clearParticipantsBtn');
const rollBtn = document.getElementById('rollBtn');
const winnerPopup = document.getElementById('winnerPopup');
const winnerName = document.getElementById('winnerName');
const countdown = document.getElementById('countdown');
const winnerMessages = document.getElementById('winnerMessages');
const closeWinnerBtn = document.getElementById('closeWinnerBtn');
const closeWinnerPopupBtn = document.getElementById('closeWinnerPopupBtn');
const rollAgainBtn = document.getElementById('rollAgainBtn');
const botUsernameInput = document.getElementById('botUsernameInput');
const botOAuthInput = document.getElementById('botOAuthInput');
const botMessageInput = document.getElementById('botMessageInput');
const botParticipantMessageInput = document.getElementById('botParticipantMessageInput');
const setBotBtn = document.getElementById('setBotBtn');
const setBotOAuthBtn = document.getElementById('setBotOAuthBtn');
const setBotMessageBtn = document.getElementById('setBotMessageBtn');
const setBotParticipantMessageBtn = document.getElementById('setBotParticipantMessageBtn');
const botStatus = document.getElementById('botStatus');

// Game API elements
const gameDvInput = document.getElementById('gameDvInput');
const gameKeyInput = document.getElementById('gameKeyInput');
const getBalanceBtn = document.getElementById('getBalanceBtn');
const getLastDonateBtn = document.getElementById('getLastDonateBtn');
const getAwardsBtn = document.getElementById('getAwardsBtn');
const gameRewardType = document.getElementById('gameRewardType');
const gameRewardValue = document.getElementById('gameRewardValue');
const gameRewardPlayer = document.getElementById('gameRewardPlayer');
const gameRewardDesc = document.getElementById('gameRewardDesc');
const sendRewardBtn = document.getElementById('sendRewardBtn');
const gameApiResult = document.getElementById('gameApiResult');
const refreshAwardsBtn = document.getElementById('refreshAwardsBtn');
const awardsList = document.getElementById('awardsList');

let messageCounter = 0;
let isConnected = false;
let currentKeyword = '';
let participants = [];
let excludedUsers = new Set(); // Danh sách người bị loại
let winners = new Set(); // Danh sách người đã trúng
let countdownInterval = null;
let winnerExpiryTime = null;
let shuffleInterval = null;

// Hàm hiển thị status
function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = `status-message show ${type}`;
    setTimeout(() => {
        statusDiv.className = 'status-message';
    }, 5000);
}

// Hàm tạo badge HTML
function createBadge(badges, isSubscriber, isMod, isVip, isTurbo) {
    let badgeHTML = '';
    
    if (isMod) {
        badgeHTML += '<span class="badge mod">MOD</span>';
    }
    if (isVip) {
        badgeHTML += '<span class="badge vip">VIP</span>';
    }
    if (isSubscriber) {
        badgeHTML += '<span class="badge subscriber">SUB</span>';
    }
    if (isTurbo) {
        badgeHTML += '<span class="badge turbo">TURBO</span>';
    }
    
    return badgeHTML;
}

// Hàm format timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
}

// Hàm thêm message vào chat
function addMessage(data) {
    messageCounter++;
    messageCount.textContent = `${messageCounter}`;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    
    // Thêm class dựa trên role
    if (data.subscriber) messageDiv.classList.add('subscriber');
    if (data.mod) messageDiv.classList.add('mod');
    if (data.vip) messageDiv.classList.add('vip');
    
    const badges = createBadge(
        data.badges,
        data.subscriber,
        data.mod,
        data.vip,
        data.turbo
    );
    
    messageDiv.innerHTML = `
        <div class="message-header">
            ${badges}
            <span class="username" style="color: ${data.color}">${escapeHtml(data.username)}</span>
            <span class="timestamp">${formatTime(data.timestamp)}</span>
        </div>
        <div class="message-content">${escapeHtml(data.message)}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    
    // Auto scroll xuống dưới
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hàm escape HTML để tránh XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Hàm kết nối với Twitch
async function connectToChannel() {
    const channel = channelInput.value.trim();
    
    if (!channel) {
        showStatus('Vui lòng nhập tên kênh!', 'error');
        return;
    }
    
    connectBtn.disabled = true;
    showStatus('Đang kết nối...', 'info');
    
    try {
        const response = await fetch('/api/connect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'socket-id': socket.id
            },
            body: JSON.stringify({ channel: channel })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            isConnected = true;
            connectBtn.disabled = true;
            disconnectBtn.disabled = false;
            channelInput.disabled = true;
            channelName.textContent = `#${channel}`;
            showStatus(data.message, 'success');
            
            // Show main app if coming from language screen
            if (languageScreen && languageScreen.style.display !== 'none') {
                languageScreen.style.display = 'none';
                mainApp.style.display = 'block';
            }
        } else {
            showStatus(data.error || 'Lỗi kết nối', 'error');
            connectBtn.disabled = false;
        }
    } catch (error) {
        showStatus('Lỗi: ' + error.message, 'error');
        connectBtn.disabled = false;
    }
}

// Hàm ngắt kết nối
async function disconnectFromChannel() {
    try {
        const response = await fetch('/api/disconnect', {
            method: 'POST',
            headers: {
                'socket-id': socket.id
            }
        });
        
        const data = await response.json();
        
        isConnected = false;
        connectBtn.disabled = false;
        disconnectBtn.disabled = true;
        channelInput.disabled = false;
        channelName.textContent = 'Chưa kết nối';
        showStatus(data.message, 'info');
    } catch (error) {
        showStatus('Lỗi: ' + error.message, 'error');
    }
}

// Event Listeners
if (connectBtn) {
    connectBtn.addEventListener('click', connectToChannel);
}
if (disconnectBtn) {
    disconnectBtn.addEventListener('click', disconnectFromChannel);
}
if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        if (chatMessages) {
            chatMessages.innerHTML = '';
            messageCounter = 0;
            if (messageCount) messageCount.textContent = '0';
        }
    });
}

// Toggle Chat
let chatVisible = true;
if (toggleChatBtn) {
    toggleChatBtn.addEventListener('click', () => {
        chatVisible = !chatVisible;
        if (chatContainer) {
            if (chatVisible) {
                chatContainer.classList.remove('hidden');
                toggleChatBtn.textContent = t('hideChatBtn');
            } else {
                chatContainer.classList.add('hidden');
                toggleChatBtn.textContent = t('showChatBtn');
            }
        }
    });
}

// Enter key để kết nối
if (channelInput) {
    channelInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !isConnected) {
            connectToChannel();
        }
    });
}

// Socket.IO Events - moved to bottom after giveaway functions

socket.on('disconnect', () => {
    console.log('Đã ngắt kết nối với server');
    showStatus('Đã ngắt kết nối với server', 'error');
});

socket.on('chat-message', (data) => {
    addMessage(data);
});

socket.on('status', (data) => {
    showStatus(data.message, data.type === 'error' ? 'error' : 'info');
});

// Giveaway Functions
async function setKeyword() {
    const keyword = keywordInput.value.trim();
    
    if (!keyword) {
        showStatus('Vui lòng nhập từ khóa!', 'error');
        return;
    }
    
    if (!socket.id) {
        showStatus('Đang kết nối với server...', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/giveaway/set-keyword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                keyword: keyword,
                socketId: socket.id
            })
        });
        
        if (!response.ok) {
            const text = await response.text();
            console.error('Response error:', text);
            showStatus('Lỗi từ server', 'error');
            return;
        }
        
        const data = await response.json();
        
        currentKeyword = keyword;
        keywordStatus.textContent = `Từ khóa đang hoạt động: "${keyword}"`;
        keywordStatus.className = 'keyword-status show active';
        // Lưu vào localStorage
        localStorage.setItem('giveaway_keyword', keyword);
        showStatus(data.message, 'success');
        loadParticipants();
    } catch (error) {
        console.error('Error setting keyword:', error);
        showStatus('Lỗi: ' + error.message, 'error');
    }
}

async function disableKeyword() {
    if (!socket.id) {
        showStatus('Đang kết nối với server...', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/giveaway/set-keyword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                keyword: '',
                socketId: socket.id
            })
        });
        
        if (!response.ok) {
            const text = await response.text();
            console.error('Response error:', text);
            showStatus('Lỗi từ server', 'error');
            return;
        }
        
        const data = await response.json();
        
        currentKeyword = '';
        keywordInput.value = '';
        keywordStatus.textContent = 'Giveaway đã tắt';
        keywordStatus.className = 'keyword-status show inactive';
        showStatus(data.message, 'info');
    } catch (error) {
        console.error('Error disabling keyword:', error);
        showStatus('Lỗi: ' + error.message, 'error');
    }
}

async function loadParticipants() {
    // Thử load từ localStorage trước
    const savedParticipants = localStorage.getItem('giveaway_participants');
    const savedKeyword = localStorage.getItem('giveaway_keyword');
    
    if (savedParticipants) {
        try {
            const parsed = JSON.parse(savedParticipants);
            if (Array.isArray(parsed) && parsed.length > 0) {
                participants = parsed;
                participantCount.textContent = participants.length;
                renderParticipants();
                showStatus(`Đã khôi phục ${participants.length} participants từ bộ nhớ`, 'info');
            }
        } catch (e) {
            console.error('Error loading from localStorage:', e);
        }
    }
    
    if (savedKeyword) {
        keywordInput.value = savedKeyword;
        currentKeyword = savedKeyword;
    }
    
    if (!socket.id) {
        return;
    }
    
    try {
        const response = await fetch(`/api/giveaway/participants?socketId=${encodeURIComponent(socket.id)}`);
        
        if (!response.ok) {
            const text = await response.text();
            console.error('Response error:', text);
            return;
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Expected JSON but got:', text.substring(0, 100));
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Nếu server có dữ liệu, dùng dữ liệu từ server
            if (data.participants && data.participants.length > 0) {
                participants = data.participants;
                participantCount.textContent = data.count;
                // Lưu vào localStorage
                localStorage.setItem('giveaway_participants', JSON.stringify(participants));
            }
            
            // Cập nhật excluded và winners
            if (data.excluded && Array.isArray(data.excluded)) {
                excludedUsers = new Set(data.excluded);
            }
            if (data.winners && Array.isArray(data.winners)) {
                winners = new Set(data.winners);
            }
            
            currentKeyword = data.keyword;
            
            if (data.keyword) {
                keywordStatus.textContent = `Từ khóa đang hoạt động: "${data.keyword}"`;
                keywordStatus.className = 'keyword-status show active';
                keywordInput.value = data.keyword;
                localStorage.setItem('giveaway_keyword', data.keyword);
            } else {
                keywordStatus.className = 'keyword-status';
            }
            
            renderParticipants();
        }
    } catch (error) {
        console.error('Error loading participants:', error);
    }
}

function renderParticipants() {
    participantsList.innerHTML = '';
    
    if (participants.length === 0) {
        participantsList.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 20px;">Chưa có người tham gia</div>';
        return;
    }
    
    participants.forEach((username, index) => {
        const isExcluded = excludedUsers.has(username);
        const isWinner = winners.has(username);
        const isStrikethrough = isExcluded || isWinner;
        
        const participantDiv = document.createElement('div');
        participantDiv.className = `participant-item ${isStrikethrough ? 'strikethrough' : ''}`;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'participant-checkbox';
        checkbox.checked = !isExcluded;
        checkbox.disabled = isWinner; // Disable checkbox cho người đã trúng
        checkbox.dataset.username = username;
        
        checkbox.addEventListener('change', async (e) => {
            const checked = e.target.checked;
            await toggleExcluded(username, checked);
        });
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'participant-name';
        if (isStrikethrough) {
            nameSpan.style.textDecoration = 'line-through';
            nameSpan.style.opacity = '0.6';
        }
        nameSpan.textContent = escapeHtml(username);
        
        const numberSpan = document.createElement('span');
        numberSpan.className = 'participant-number';
        numberSpan.textContent = `#${index + 1}`;
        
        if (isWinner) {
            const winnerBadge = document.createElement('span');
            winnerBadge.className = 'winner-badge';
            winnerBadge.textContent = '🏆';
            winnerBadge.title = 'Đã trúng quà';
            participantDiv.appendChild(winnerBadge);
        }
        
        participantDiv.appendChild(checkbox);
        participantDiv.appendChild(nameSpan);
        participantDiv.appendChild(numberSpan);
        
        participantsList.appendChild(participantDiv);
    });
}

async function toggleExcluded(username, include) {
    if (!socket.id) {
        showStatus('Đang kết nối với server...', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/giveaway/toggle-excluded', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                socketId: socket.id,
                username: username
            })
        });
        
        if (!response.ok) {
            const text = await response.text();
            console.error('Response error:', text);
            showStatus('Lỗi từ server', 'error');
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Cập nhật excludedUsers
            if (data.excluded) {
                excludedUsers.add(username);
            } else {
                excludedUsers.delete(username);
            }
            
            // Re-render danh sách
            renderParticipants();
            showStatus(data.message, 'info');
        } else {
            showStatus(data.message || 'Lỗi cập nhật', 'error');
        }
    } catch (error) {
        console.error('Error toggling excluded:', error);
        showStatus('Lỗi: ' + error.message, 'error');
    }
}

async function clearParticipants() {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ danh sách participants?')) {
        return;
    }
    
    if (!socket.id) {
        showStatus('Đang kết nối với server...', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/giveaway/clear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                socketId: socket.id
            })
        });
        
        if (!response.ok) {
            const text = await response.text();
            console.error('Response error:', text);
            showStatus('Lỗi từ server', 'error');
            return;
        }
        
        const data = await response.json();
        
        participants = [];
        excludedUsers.clear();
        winners.clear();
        participantCount.textContent = '0';
        renderParticipants();
        // Xóa khỏi localStorage
        localStorage.removeItem('giveaway_participants');
        closeWinnerPopup(); // Close winner popup if open
        showStatus(data.message, 'success');
    } catch (error) {
        console.error('Error clearing participants:', error);
        showStatus('Lỗi: ' + error.message, 'error');
    }
}

function exportParticipants() {
    if (participants.length === 0) {
        showStatus('Danh sách trống!', 'error');
        return;
    }
    
    const text = participants.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `giveaway-participants-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showStatus('Đã xuất danh sách!', 'success');
}

// Roll Function
async function rollWinner() {
    if (participants.length === 0) {
        showStatus('Danh sách trống, không thể roll!', 'error');
        return;
    }
    
    // Đợi socket kết nối nếu chưa có
    if (!socket.id) {
        showStatus('Đang kết nối với server, vui lòng đợi...', 'error');
        // Đợi socket kết nối
        await new Promise((resolve) => {
            if (socket.id) {
                resolve();
            } else {
                socket.once('connect', () => resolve());
                setTimeout(() => resolve(), 3000); // Timeout sau 3 giây
            }
        });
        
        if (!socket.id) {
            showStatus('Không thể kết nối với server', 'error');
            return;
        }
    }
    
    rollBtn.disabled = true;
    showStatus('Đang roll...', 'info');
    
    // Hiển thị popup ngay lập tức với animation xáo trộn
    // Sử dụng danh sách participants hiện tại để xáo trộn
    const currentParticipants = [...participants];
    
    // Hiển thị popup với placeholder winner (sẽ được cập nhật sau)
    showWinnerPopupWithShuffle(currentParticipants);
    
    try {
        console.log('Rolling with socketId:', socket.id);
        const response = await fetch('/api/giveaway/roll', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                socketId: socket.id
            })
        });
        
        const responseText = await response.text();
        console.log('Roll response:', responseText);
        
        if (!response.ok) {
            console.error('Response error:', responseText);
            showStatus('Lỗi từ server: ' + responseText.substring(0, 100), 'error');
            rollBtn.disabled = false;
            // Đóng popup nếu có lỗi
            closeWinnerPopup();
            return;
        }
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Response text:', responseText);
            showStatus('Lỗi parse response từ server', 'error');
            rollBtn.disabled = false;
            // Đóng popup nếu có lỗi
            closeWinnerPopup();
            return;
        }
        
        if (data.success) {
            showStatus(data.message, 'success');
            // Popup đã được hiển thị, chỉ cần cập nhật winner khi nhận được từ socket
            // Nếu socket event không đến, cập nhật trực tiếp sau khi animation xong
            if (data.winner && data.expiryTime) {
                // Cập nhật winner trong animation nếu chưa có
                updateShuffleWinner(data.winner, data.expiryTime);
            }
        } else {
            showStatus(data.message || 'Lỗi roll', 'error');
            rollBtn.disabled = false;
            // Đóng popup nếu có lỗi
            closeWinnerPopup();
        }
    } catch (error) {
        console.error('Error rolling:', error);
        console.error('Error stack:', error.stack);
        showStatus('Lỗi: ' + error.message, 'error');
        rollBtn.disabled = false;
        // Đóng popup nếu có lỗi
        closeWinnerPopup();
    }
}

// Biến để lưu winner và expiryTime khi nhận được từ server
let pendingWinner = null;
let pendingExpiryTime = null;

// Show Winner Popup với hiệu ứng xáo trộn ngay lập tức
function showWinnerPopupWithShuffle(participantsList) {
    // Close any existing popup first
    if (winnerPopup.classList.contains('show')) {
        closeWinnerPopup();
    }
    
    // Reset countdown UI
    countdown.textContent = '30';
    countdown.style.color = '';
    countdown.style.fontSize = '';
    const countdownSection = document.querySelector('.countdown-section');
    if (countdownSection) {
        const statusP = countdownSection.querySelector('p:first-of-type');
        if (statusP) {
            statusP.textContent = t('waitingComment');
            statusP.style.fontWeight = '';
            statusP.style.fontSize = '';
        }
    }
    
    winnerMessages.innerHTML = `<div style="text-align: center; color: #6c757d; padding: 20px;">${t('waitingMessage')}</div>`;
    
    // Hiển thị popup ngay lập tức
    winnerPopup.classList.add('show');
    
    // Bắt đầu animation xáo trộn với danh sách participants
    if (participantsList && participantsList.length > 0) {
        // Bắt đầu xáo trộn ngay, winner sẽ được cập nhật sau
        startShuffleAnimation(participantsList, null, null);
    } else {
        // Nếu không có danh sách, hiển thị "Đang roll..."
        winnerName.textContent = 'Đang roll...';
    }
}

// Cập nhật winner khi nhận được từ server
function updateShuffleWinner(winner, expiryTime) {
    pendingWinner = winner;
    pendingExpiryTime = expiryTime;
    
    // Nếu animation đã kết thúc, hiển thị winner ngay
    if (!shuffleInterval) {
        finishShuffleAnimation(winner, expiryTime);
    }
    // Nếu animation đang chạy, nó sẽ tự động cập nhật khi kết thúc
}

// Show Winner Popup với hiệu ứng xáo trộn (giữ lại cho tương thích)
function showWinnerPopup(winner, expiryTime, participantsList = []) {
    // Close any existing popup first
    if (winnerPopup.classList.contains('show')) {
        closeWinnerPopup();
    }
    
    // Reset countdown UI
    countdown.textContent = '30';
    countdown.style.color = '';
    countdown.style.fontSize = '';
    const countdownSection = document.querySelector('.countdown-section');
    if (countdownSection) {
        const statusP = countdownSection.querySelector('p:first-of-type');
        if (statusP) {
            statusP.textContent = t('waitingComment');
            statusP.style.fontWeight = '';
            statusP.style.fontSize = '';
        }
    }
    
    winnerMessages.innerHTML = `<div style="text-align: center; color: #6c757d; padding: 20px;">${t('waitingMessage')}</div>`;
    winnerPopup.classList.add('show');
    
    // Hiệu ứng xáo trộn
    if (participantsList && participantsList.length > 0) {
        startShuffleAnimation(participantsList, winner, expiryTime);
    } else {
        winnerName.textContent = winner;
        winnerExpiryTime = new Date(expiryTime);
        startCountdown();
    }
}

// Hiệu ứng xáo trộn tên
function startShuffleAnimation(participantsList, finalWinner, expiryTime) {
    let shuffleCount = 0;
    const shuffleDuration = 2000; // 2 giây xáo trộn
    const shuffleIntervalTime = 50; // Đổi tên mỗi 50ms
    const totalShuffles = shuffleDuration / shuffleIntervalTime;
    
    if (shuffleInterval) {
        clearInterval(shuffleInterval);
    }
    
    winnerName.style.transition = 'none';
    winnerName.style.transform = 'scale(1.2)';
    
    shuffleInterval = setInterval(() => {
        shuffleCount++;
        
        // Nếu đã có winner từ server, sử dụng nó
        const actualWinner = finalWinner || pendingWinner;
        
        // Chọn ngẫu nhiên một tên từ danh sách
        const randomIndex = Math.floor(Math.random() * participantsList.length);
        const randomName = participantsList[randomIndex];
        winnerName.textContent = randomName;
        
        // Gần cuối, chọn tên gần với winner (nếu đã có winner)
        if (actualWinner && shuffleCount > totalShuffles * 0.7) {
            // 30% cuối cùng, có 50% cơ hội hiển thị winner
            if (Math.random() > 0.5) {
                winnerName.textContent = actualWinner;
            }
        }
        
        if (shuffleCount >= totalShuffles) {
            clearInterval(shuffleInterval);
            shuffleInterval = null;
            
            // Sử dụng winner từ server nếu có, nếu không thì dùng finalWinner
            const winnerToShow = actualWinner || finalWinner;
            const expiryToUse = expiryTime || pendingExpiryTime;
            
            if (winnerToShow && expiryToUse) {
                finishShuffleAnimation(winnerToShow, expiryToUse);
            } else {
                // Nếu chưa có winner, tiếp tục hiển thị tên ngẫu nhiên và đợi
                // Kiểm tra lại sau 100ms
                setTimeout(() => {
                    if (pendingWinner && pendingExpiryTime) {
                        finishShuffleAnimation(pendingWinner, pendingExpiryTime);
                    }
                }, 100);
            }
        }
    }, shuffleIntervalTime);
}

// Hoàn thành animation và hiển thị winner
function finishShuffleAnimation(winner, expiryTime) {
    // Hiển thị winner cuối cùng
    winnerName.textContent = winner;
    winnerName.style.transition = 'all 0.3s ease';
    winnerName.style.transform = 'scale(1)';
    
    // Thêm hiệu ứng
    winnerName.style.animation = 'winnerReveal 0.5s ease';
    
    winnerExpiryTime = new Date(expiryTime);
    startCountdown();
    
    // Reset pending
    pendingWinner = null;
    pendingExpiryTime = null;
}

// Start Countdown
function startCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    countdownInterval = setInterval(() => {
        const now = new Date();
        const remaining = Math.max(0, Math.floor((winnerExpiryTime - now) / 1000));
        
        countdown.textContent = remaining;
        
        if (remaining === 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            countdown.textContent = '0';
            countdown.style.color = '#dc3545';
            showStatus('Hết thời gian chờ comment!', 'error');
        }
    }, 1000);
}

// Stop Countdown
function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

// Close Winner Popup
function closeWinnerPopup() {
    winnerPopup.classList.remove('show');
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    if (shuffleInterval) {
        clearInterval(shuffleInterval);
        shuffleInterval = null;
    }
    winnerExpiryTime = null;
    countdown.style.color = '';
    countdown.style.fontSize = '';
    countdown.textContent = '30';
    
    // Reset countdown section text
    const countdownSection = document.querySelector('.countdown-section');
    if (countdownSection) {
        const statusP = countdownSection.querySelector('p:first-of-type');
        if (statusP) {
            statusP.textContent = 'Đang chờ comment trong:';
            statusP.style.fontWeight = '';
            statusP.style.fontSize = '';
        }
    }
    
    rollBtn.disabled = false;
}

// Close popup when clicking outside
if (winnerPopup) {
    winnerPopup.addEventListener('click', (e) => {
        if (e.target === winnerPopup) {
            closeWinnerPopup();
        }
    });
}

// Add Winner Message
function addWinnerMessage(data) {
    if (winnerMessages.querySelector('div:first-child')?.textContent === 'Đang chờ comment...') {
        winnerMessages.innerHTML = '';
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'winner-message-item';
    
    const time = formatTime(data.timestamp);
    
    messageDiv.innerHTML = `
        <div class="winner-message-header">
            <span class="winner-message-username" style="color: ${data.color}">${escapeHtml(data.username)}</span>
            <span class="winner-message-time">${time}</span>
        </div>
        <div class="winner-message-content">${escapeHtml(data.message)}</div>
    `;
    
    winnerMessages.appendChild(messageDiv);
    winnerMessages.scrollTop = winnerMessages.scrollHeight;
}

// Giveaway Event Listeners
if (setKeywordBtn) {
    setKeywordBtn.addEventListener('click', setKeyword);
}
if (disableKeywordBtn) {
    disableKeywordBtn.addEventListener('click', disableKeyword);
}
if (exportBtn) {
    exportBtn.addEventListener('click', exportParticipants);
}
if (clearParticipantsBtn) {
    clearParticipantsBtn.addEventListener('click', clearParticipants);
}
if (rollBtn) {
    rollBtn.addEventListener('click', rollWinner);
}
if (closeWinnerBtn) {
    closeWinnerBtn.addEventListener('click', closeWinnerPopup);
}
if (closeWinnerPopupBtn) {
    closeWinnerPopupBtn.addEventListener('click', closeWinnerPopup);
}

// Roll again button - roll next winner without closing popup
if (rollAgainBtn) {
    rollAgainBtn.addEventListener('click', async () => {
        // Stop current countdown
        stopCountdown();
        
        // Reset winner messages
        winnerMessages.innerHTML = `<div style="text-align: center; color: #6c757d; padding: 20px;">${t('waitingMessage')}</div>`;
        
        // Reset countdown
        countdown.textContent = '30';
        countdown.style.color = '';
        
        // Reset countdown section text
        const countdownSection = document.querySelector('.countdown-section');
        if (countdownSection) {
            const statusP = countdownSection.querySelector('p:first-of-type');
            if (statusP) {
                statusP.textContent = t('waitingComment');
                statusP.style.fontWeight = '';
                statusP.style.fontSize = '';
            }
        }
        
        // Call rollWinner function
        await rollWinner();
    });
}

if (keywordInput) {
    keywordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            setKeyword();
        }
    });
}

// Socket.IO Giveaway Events
socket.on('giveaway-participant', (data) => {
    // Thêm vào danh sách local
    if (!participants.includes(data.username)) {
        participants.push(data.username);
        participantCount.textContent = participants.length;
        renderParticipants();
        // Lưu vào localStorage
        localStorage.setItem('giveaway_participants', JSON.stringify(participants));
    }
    
    // Show notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = `🎉 ${data.username} đã tham gia! (Tổng: ${data.total})`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
});

// Bot status events
socket.on('bot-status', (data) => {
    const statusType = data.connected ? 'success' : 'error';
    showStatus(data.message, statusType);
    
    // Cập nhật bot status indicator
    if (botStatus) {
        botStatus.textContent = data.message;
        botStatus.className = `bot-status show ${data.connected ? 'connected' : 'disconnected'}`;
    }
    
    // Hiển thị notification lớn hơn nếu bot kết nối thành công
    if (data.connected) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 30px 40px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            z-index: 10001;
            animation: slideIn 0.3s ease;
            text-align: center;
            font-size: 1.2em;
            font-weight: 600;
        `;
        notification.textContent = `✅ ${data.message}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
});

socket.on('giveaway-winner', (data) => {
    // Popup đã được hiển thị, chỉ cần cập nhật winner trong animation
    updateShuffleWinner(data.winner, data.expiryTime);
    
    // Thêm vào danh sách winners và cập nhật UI
    if (data.winner) {
        winners.add(data.winner);
        // Disable checkbox cho người đã trúng
        renderParticipants();
    }
    
    // Cập nhật danh sách participants (đã xóa người chiến thắng)
    if (data.remainingCount !== undefined) {
        loadParticipants();
        showStatus(`Đã xóa ${data.winner} khỏi danh sách. Còn lại: ${data.remainingCount} người`, 'info');
    }
});

socket.on('giveaway-participant-removed', (data) => {
    // Cập nhật danh sách khi có người bị xóa
    loadParticipants();
});

socket.on('winner-message', (data) => {
    addWinnerMessage(data);
});

socket.on('winner-commented', (data) => {
    // Dừng countdown khi người chiến thắng đã comment
    stopCountdown();
    
    // Cập nhật UI
    countdown.textContent = '✓';
    countdown.style.color = '#28a745';
    countdown.style.fontSize = '3em';
    
    // Hiển thị thông báo thành công
    const countdownSection = document.querySelector('.countdown-section');
    if (countdownSection) {
        const statusP = countdownSection.querySelector('p:first-of-type');
        if (statusP) {
            statusP.textContent = '✅ Người chiến thắng đã comment!';
            statusP.style.fontWeight = '700';
            statusP.style.fontSize = '1.3em';
        }
    }
    
    showStatus('Người chiến thắng đã comment!', 'success');
    
    // Hiển thị notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        padding: 30px 40px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        z-index: 10001;
        animation: slideIn 0.3s ease;
        text-align: center;
        font-size: 1.2em;
        font-weight: 600;
    `;
    notification.textContent = `🎉 ${data.username} đã comment!`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
});

// Bot Config Functions
async function setBotUsername() {
    const username = botUsernameInput.value.trim();
    
    if (!username) {
        showStatus('Vui lòng nhập tên bot!', 'error');
        return;
    }
    
    if (!socket.id) {
        showStatus('Đang kết nối với server...', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/bot/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                socketId: socket.id,
                username: username
            })
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
            showStatus('Đã lưu tên bot!', 'success');
            loadBotConfig();
        } else {
            showStatus(data.message || 'Lỗi lưu tên bot', 'error');
        }
    } catch (error) {
        showStatus('Lỗi: ' + error.message, 'error');
    }
}

async function setBotOAuth() {
    const oauth = botOAuthInput.value.trim();
    
    if (!oauth) {
        showStatus('Vui lòng nhập OAuth token!', 'error');
        return;
    }
    
    if (!socket.id) {
        showStatus('Đang kết nối với server...', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/bot/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                socketId: socket.id,
                oauth: oauth
            })
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
            showStatus('Đã lưu OAuth token!', 'success');
            loadBotConfig();
        } else {
            showStatus(data.message || 'Lỗi lưu OAuth token', 'error');
        }
    } catch (error) {
        showStatus('Lỗi: ' + error.message, 'error');
    }
}

async function setBotMessage() {
    const message = botMessageInput.value.trim();
    
    if (!message) {
        showStatus('Vui lòng nhập tin nhắn!', 'error');
        return;
    }
    
    if (!socket.id) {
        showStatus('Đang kết nối với server...', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/bot/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                socketId: socket.id,
                message: message
            })
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
            showStatus('Đã lưu tin nhắn!', 'success');
            loadBotConfig();
        } else {
            showStatus(data.message || 'Lỗi lưu tin nhắn', 'error');
        }
    } catch (error) {
        showStatus('Lỗi: ' + error.message, 'error');
    }
}

async function setBotParticipantMessage() {
    const message = botParticipantMessageInput.value.trim();
    
    if (!message) {
        showStatus('Vui lòng nhập tin nhắn!', 'error');
        return;
    }
    
    if (!socket.id) {
        showStatus('Đang kết nối với server...', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/bot/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                socketId: socket.id,
                participantMessage: message
            })
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
            showStatus('Đã lưu tin nhắn điểm danh!', 'success');
            loadBotConfig();
        } else {
            showStatus(data.message || 'Lỗi lưu tin nhắn', 'error');
        }
    } catch (error) {
        showStatus('Lỗi: ' + error.message, 'error');
    }
}

async function loadBotConfig() {
    if (!socket.id) {
        return;
    }
    
    try {
        const response = await fetch(`/api/bot/config?socketId=${encodeURIComponent(socket.id)}`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.config) {
                botUsernameInput.value = data.config.username || '';
                botMessageInput.value = data.config.message || '🎉 {winner} đã chiến thắng giveaway! Bạn có 30s để comment vào giveaway để nhận quà!';
                botParticipantMessageInput.value = data.config.participantMessage || '@{username} ✅ Bạn đã được thêm vào danh sách để roll quà! Chúc may mắn! 🎁';
                // Không hiển thị OAuth token vì lý do bảo mật
            }
        }
    } catch (error) {
        console.error('Error loading bot config:', error);
    }
}

// Bot Config Event Listeners
if (setBotBtn) {
    setBotBtn.addEventListener('click', setBotUsername);
}
if (setBotOAuthBtn) {
    setBotOAuthBtn.addEventListener('click', setBotOAuth);
}
if (setBotMessageBtn) {
    setBotMessageBtn.addEventListener('click', setBotMessage);
}
if (setBotParticipantMessageBtn) {
    setBotParticipantMessageBtn.addEventListener('click', setBotParticipantMessage);
}

// Game API Functions
async function callGameAPI(action, extraParams = {}) {
    // Lấy giá trị từ info-panel hoặc giveaway-panel (nếu có)
    const dvInput = gameDvInputInfo || gameDvInput;
    const keyInput = gameKeyInputInfo || gameKeyInput;
    
    if (!dvInput || !keyInput) {
        showStatus('Vui lòng nhập DV Login và API Key!', 'error');
        return;
    }
    
    const dv = dvInput.value.trim();
    const key = keyInput.value.trim();
    
    if (!dv || !key) {
        showStatus('Vui lòng nhập DV Login và API Key!', 'error');
        return;
    }
    
    try {
        const resultDiv = gameApiResultInfo || gameApiResult;
        if (resultDiv) {
            resultDiv.style.display = 'block';
            resultDiv.textContent = 'Đang gọi API...';
            resultDiv.style.color = '#6c757d';
        }
        
        const response = await fetch('/api/game/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                dv: dv,
                key: key,
                action: action,
                ...extraParams
            })
        });
        
        if (!response.ok) {
            const text = await response.text();
            console.error('Response error:', text);
            if (resultDiv) {
                resultDiv.style.color = '#721c24';
                resultDiv.style.background = '#f8d7da';
                resultDiv.style.borderColor = '#f5c6cb';
                resultDiv.textContent = `❌ Lỗi từ server: ${response.status} ${response.statusText}\n\n${text.substring(0, 200)}`;
            }
            showStatus(`Lỗi từ server: ${response.status}`, 'error');
            return;
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Expected JSON but got:', text.substring(0, 100));
            if (resultDiv) {
                resultDiv.style.color = '#721c24';
                resultDiv.style.background = '#f8d7da';
                resultDiv.style.borderColor = '#f5c6cb';
                resultDiv.textContent = `❌ Server trả về dữ liệu không đúng định dạng\n\n${text.substring(0, 200)}`;
            }
            showStatus('Lỗi: Server trả về dữ liệu không đúng định dạng', 'error');
            return;
        }
        
        const data = await response.json();
        console.log('Game API Response:', data);
        
        if (data.success) {
            if (resultDiv) {
                resultDiv.style.color = '#155724';
                resultDiv.style.background = '#d4edda';
                resultDiv.style.borderColor = '#c3e6cb';
                
                // Format kết quả đẹp hơn
                let resultText = `✅ ${data.message}\n\n`;
                resultText += JSON.stringify(data.data, null, 2);
                
                // Hiển thị thông tin chi tiết nếu có
                if (data.data.mp !== undefined) {
                    resultText = `💰 Số dư:\n`;
                    resultText += `MPoints: ${data.data.mp || 0}\n`;
                    resultText += `MCoins: ${data.data.mc || 0}\n`;
                    resultText += `MEGAVIP: ${data.data.megavip || 0} ngày\n\n`;
                    resultText += JSON.stringify(data.data, null, 2);
                } else if (data.data.name) {
                    resultText = `📝 Người donate cuối cùng:\n`;
                    resultText += `Tên: ${data.data.name}\n`;
                    resultText += `ID: ${data.data.id}\n\n`;
                    resultText += JSON.stringify(data.data, null, 2);
                } else if (data.data.awards && Array.isArray(data.data.awards)) {
                    resultText = `🏆 Danh sách giải thưởng (${data.data.awards.length}):\n\n`;
                    if (data.data.awards.length === 0) {
                        resultText += 'Không có giải thưởng nào.\n\n';
                    } else {
                        data.data.awards.forEach((award, index) => {
                            resultText += `${index + 1}. ${award.name || 'N/A'}\n`;
                            resultText += `   ID: ${award.id || 'N/A'}\n`;
                            resultText += `   Ngày: ${award.date || 'N/A'}\n`;
                            resultText += `\n`;
                        });
                    }
                    resultText += `\n--- JSON Response ---\n`;
                    resultText += JSON.stringify(data.data, null, 2);
                }
                
                resultDiv.textContent = resultText;
            }
            showStatus(data.message || 'Thành công', 'success');
        } else {
            if (resultDiv) {
                resultDiv.style.color = '#721c24';
                resultDiv.style.background = '#f8d7da';
                resultDiv.style.borderColor = '#f5c6cb';
                const errorMsg = data?.message || data?.error || 'Lỗi không xác định';
                resultDiv.textContent = `❌ ${errorMsg}\n\n${JSON.stringify(data.data || {}, null, 2)}`;
            }
            const errorMsg = data?.message || data?.error || 'Lỗi không xác định';
            showStatus(errorMsg, 'error');
        }
    } catch (error) {
        console.error('Game API Error:', error);
        const resultDiv = gameApiResultInfo || gameApiResult;
        if (resultDiv) {
            resultDiv.style.color = '#721c24';
            resultDiv.style.background = '#f8d7da';
            resultDiv.style.borderColor = '#f5c6cb';
            const errorMessage = error?.message || error?.toString() || 'Lỗi không xác định';
            resultDiv.textContent = `❌ Lỗi: ${errorMessage}`;
        }
        const errorMessage = error?.message || error?.toString() || 'Lỗi không xác định';
        showStatus('Lỗi: ' + errorMessage, 'error');
    }
}

async function getBalance() {
    await callGameAPI('getbalance');
}

async function getLastDonate() {
    await callGameAPI('getlastdonate');
}

async function getAwards() {
    await callGameAPI('getawards');
    // Tự động refresh danh sách awards sau khi get
    setTimeout(loadAwards, 500);
}

async function loadAwards() {
    // Lấy giá trị từ info-panel hoặc giveaway-panel (nếu có)
    const dvInput = gameDvInputInfo || gameDvInput;
    const keyInput = gameKeyInputInfo || gameKeyInput;
    
    if (!dvInput || !keyInput) {
        if (awardsList) {
            awardsList.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 40px;"><p>Nhập DV Login và API Key để xem danh sách phần thưởng</p></div>';
        }
        return;
    }
    
    const dv = dvInput.value.trim();
    const key = keyInput.value.trim();
    
    if (!dv || !key) {
        if (awardsList) {
            awardsList.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 40px;"><p>Nhập DV Login và API Key để xem danh sách phần thưởng</p></div>';
        }
        return;
    }
    
    // Hiển thị URL trong console
    const apiUrl = `https://megamu.net/dvapi.php?dv=${encodeURIComponent(dv)}&key=${encodeURIComponent(key)}&action=getawards`;
    console.log('=== Get Awards API Call ===');
    console.log('URL:', apiUrl);
    console.log('DV:', dv);
    console.log('Key:', key);
    console.log('Action: getawards');
    console.log('===========================');
    
    try {
        if (awardsList) {
            awardsList.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 40px;"><p>Đang tải danh sách phần thưởng...</p></div>';
        }
        
        const response = await fetch('/api/game/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                dv: dv,
                key: key,
                action: 'getawards'
            })
        });
        
        if (!response.ok) {
            const text = await response.text();
            console.error('Response error:', text);
            if (awardsList) {
                awardsList.innerHTML = `<div style="text-align: center; color: #dc3545; padding: 40px;"><p>❌ Lỗi từ server: ${response.status} ${response.statusText}</p></div>`;
            }
            return;
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Expected JSON but got:', text.substring(0, 100));
            if (awardsList) {
                awardsList.innerHTML = `<div style="text-align: center; color: #dc3545; padding: 40px;"><p>❌ Server trả về dữ liệu không đúng định dạng</p></div>`;
            }
            return;
        }
        
        const data = await response.json();
        console.log('Awards response data:', JSON.stringify(data, null, 2));
        
        // Kiểm tra response structure
        if (data.success && data.data) {
            // Server wrap response: { success: true, data: { awards: [...], result: 1 } }
            if (data.data.awards && Array.isArray(data.data.awards)) {
                console.log('Found awards array:', data.data.awards.length, 'items');
                renderAwardsList(data.data.awards);
            } else if (data.data.result === 1 && !data.data.awards) {
                // Trường hợp result = 1 nhưng không có awards (có thể là empty array)
                console.log('Result = 1 but no awards array, checking...');
                if (awardsList) {
                    awardsList.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 40px;"><p>Không có phần thưởng nào trong danh sách</p></div>';
                }
            } else {
                console.warn('Unexpected data structure:', data.data);
                const errorMsg = data?.message || 'Không thể tải danh sách phần thưởng';
                if (awardsList) {
                    awardsList.innerHTML = `<div style="text-align: center; color: #dc3545; padding: 40px;"><p>❌ ${errorMsg}</p><small>Response: ${JSON.stringify(data.data)}</small></div>`;
                }
            }
        } else {
            const errorMsg = data?.message || data?.error || 'Không thể tải danh sách phần thưởng';
            console.error('Error response:', data);
            
            // Kiểm tra nếu là HTML response
            let errorDisplay = `<div style="text-align: center; color: #dc3545; padding: 40px;"><p>❌ ${errorMsg}</p>`;
            if (data?.data && typeof data.data === 'string' && data.data.includes('<!DOCTYPE')) {
                errorDisplay += `<small style="display: block; margin-top: 10px; color: #6c757d;">API trả về HTML. Kiểm tra lại URL và thông tin đăng nhập.</small>`;
            }
            errorDisplay += `</div>`;
            if (awardsList) {
                awardsList.innerHTML = errorDisplay;
            }
        }
    } catch (error) {
        console.error('Error loading awards:', error);
        const errorMessage = error?.message || error?.toString() || 'Lỗi không xác định';
        if (awardsList) {
            awardsList.innerHTML = `<div style="text-align: center; color: #dc3545; padding: 40px;"><p>❌ Lỗi: ${errorMessage}</p></div>`;
        }
    }
}

function renderAwardsList(awards) {
    console.log('Rendering awards list:', awards);
    
    if (!awardsList) {
        console.error('awardsList element not found');
        return;
    }
    
    if (!awards || !Array.isArray(awards) || awards.length === 0) {
        awardsList.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 40px;"><p>Không có phần thưởng nào trong danh sách</p></div>';
        return;
    }
    
    awardsList.innerHTML = '';
    
    awards.forEach((award, index) => {
        // Đảm bảo award là object và có name
        if (!award || typeof award !== 'object') {
            console.warn('Invalid award at index', index, award);
            return;
        }
        
        const awardDiv = document.createElement('div');
        awardDiv.className = 'award-item';
        
        // Chỉ hiển thị tên phần thưởng
        const nameDiv = document.createElement('div');
        nameDiv.className = 'award-name';
        nameDiv.textContent = award.name || 'N/A';
        
        awardDiv.appendChild(nameDiv);
        awardsList.appendChild(awardDiv);
    });
    
    console.log('Rendered', awards.length, 'awards');
}

// Event listener cho nút refresh awards
if (refreshAwardsBtn) {
    refreshAwardsBtn.addEventListener('click', loadAwards);
}

// Tự động load awards khi có thay đổi DV hoặc Key
// Lưu ý: Các event listeners cho info-panel sẽ được thêm sau khi các biến được khai báo
let loadAwardsTimeout;

// Lắng nghe từ giveaway-panel inputs (nếu còn tồn tại)
if (gameDvInput) {
    gameDvInput.addEventListener('input', () => {
        clearTimeout(loadAwardsTimeout);
        const dv = gameDvInput.value.trim();
        const keyInput = gameKeyInputInfo || gameKeyInput;
        const key = keyInput ? keyInput.value.trim() : '';
        
        // Chỉ load nếu có đủ cả DV và Key
        if (dv && key) {
            loadAwardsTimeout = setTimeout(loadAwards, 1000);
        } else if (awardsList) {
            awardsList.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 40px;"><p>Nhập DV Login và API Key để xem danh sách phần thưởng</p></div>';
        }
    });
}

if (gameKeyInput) {
    gameKeyInput.addEventListener('input', () => {
        clearTimeout(loadAwardsTimeout);
        const dvInput = gameDvInputInfo || gameDvInput;
        const dv = dvInput ? dvInput.value.trim() : '';
        const key = gameKeyInput.value.trim();
        
        // Chỉ load nếu có đủ cả DV và Key
        if (dv && key) {
            loadAwardsTimeout = setTimeout(loadAwards, 1000);
        } else if (awardsList) {
            awardsList.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 40px;"><p>Nhập DV Login và API Key để xem danh sách phần thưởng</p></div>';
        }
    });
}

async function sendReward() {
    // Lấy giá trị từ info-panel hoặc giveaway-panel (nếu có)
    const dvInput = gameDvInputInfo || gameDvInput;
    const keyInput = gameKeyInputInfo || gameKeyInput;
    const rewardTypeInput = gameRewardTypeInfo || gameRewardType;
    const rewardValueInput = gameRewardValueInfo || gameRewardValue;
    const rewardPlayerInput = gameRewardPlayerInfo || gameRewardPlayer;
    const rewardDescInput = gameRewardDescInfo || gameRewardDesc;
    
    if (!dvInput || !keyInput || !rewardTypeInput || !rewardValueInput || !rewardPlayerInput) {
        showStatus('Vui lòng nhập đầy đủ thông tin!', 'error');
        return;
    }
    
    const dv = dvInput.value.trim();
    const key = keyInput.value.trim();
    const action = rewardTypeInput.value;
    const value = rewardValueInput.value.trim();
    const player = rewardPlayerInput.value.trim();
    const description = rewardDescInput ? rewardDescInput.value.trim() : '';
    
    if (!dv || !key) {
        showStatus('Vui lòng nhập DV Login và API Key!', 'error');
        return;
    }
    
    if (!value || !player) {
        showStatus('Vui lòng nhập số lượng và tên nhân vật!', 'error');
        return;
    }
    
    if (isNaN(value) || parseFloat(value) <= 0) {
        showStatus('Số lượng phải là số dương!', 'error');
        return;
    }
    
    const resultDiv = gameApiResultInfo || gameApiResult;
    
    try {
        if (resultDiv) {
            resultDiv.style.display = 'block';
            resultDiv.textContent = 'Đang gửi phần thưởng...';
            resultDiv.style.color = '#6c757d';
        }
        
        const response = await fetch('/api/game/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                dv: dv,
                key: key,
                action: action,
                value: value,
                player: player,
                description: description || undefined
            })
        });
        
        if (!response.ok) {
            const text = await response.text();
            console.error('Response error:', text);
            if (resultDiv) {
                resultDiv.style.color = '#721c24';
                resultDiv.style.background = '#f8d7da';
                resultDiv.style.borderColor = '#f5c6cb';
                resultDiv.textContent = `❌ Lỗi từ server: ${response.status} ${response.statusText}\n\n${text.substring(0, 200)}`;
            }
            showStatus(`Lỗi từ server: ${response.status}`, 'error');
            return;
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Expected JSON but got:', text.substring(0, 100));
            if (resultDiv) {
                resultDiv.style.color = '#721c24';
                resultDiv.style.background = '#f8d7da';
                resultDiv.style.borderColor = '#f5c6cb';
                resultDiv.textContent = `❌ Server trả về dữ liệu không đúng định dạng\n\n${text.substring(0, 200)}`;
            }
            showStatus('Lỗi: Server trả về dữ liệu không đúng định dạng', 'error');
            return;
        }
        
        const data = await response.json();
        console.log('Send reward response:', data);
        
        if (data.success) {
            if (resultDiv) {
                resultDiv.style.color = '#155724';
                resultDiv.style.background = '#d4edda';
                resultDiv.style.borderColor = '#c3e6cb';
                const rewardTypeText = rewardTypeInput.options[rewardTypeInput.selectedIndex]?.text || action;
                resultDiv.textContent = `✅ ${data.message}\n\nĐã gửi ${value} ${rewardTypeText} cho ${player}\n\n${JSON.stringify(data.data, null, 2)}`;
            }
            showStatus(`Đã gửi phần thưởng cho ${player}!`, 'success');
            
            // Clear form
            if (rewardValueInput) rewardValueInput.value = '';
            if (rewardPlayerInput) rewardPlayerInput.value = '';
            if (rewardDescInput) rewardDescInput.value = '';
            
            // Tự động refresh danh sách awards sau khi gửi thành công
            setTimeout(loadAwards, 500);
        } else {
            if (resultDiv) {
                resultDiv.style.color = '#721c24';
                resultDiv.style.background = '#f8d7da';
                resultDiv.style.borderColor = '#f5c6cb';
                const errorMsg = data?.message || data?.error || 'Lỗi không xác định';
                resultDiv.textContent = `❌ ${errorMsg}\n\n${JSON.stringify(data.data || {}, null, 2)}`;
            }
            const errorMsg = data?.message || data?.error || 'Lỗi không xác định';
            showStatus(errorMsg, 'error');
        }
    } catch (error) {
        console.error('Send reward error:', error);
        const resultDiv = gameApiResultInfo || gameApiResult;
        if (resultDiv) {
            resultDiv.style.color = '#721c24';
            resultDiv.style.background = '#f8d7da';
            resultDiv.style.borderColor = '#f5c6cb';
            resultDiv.textContent = `❌ Lỗi: ${error.message}`;
        }
        showStatus('Lỗi: ' + error.message, 'error');
    }
}

// Game API Event Listeners
if (getBalanceBtn) {
    getBalanceBtn.addEventListener('click', getBalance);
}
if (getLastDonateBtn) {
    getLastDonateBtn.addEventListener('click', getLastDonate);
}
if (getAwardsBtn) {
    getAwardsBtn.addEventListener('click', getAwards);
}
if (sendRewardBtn) {
    sendRewardBtn.addEventListener('click', sendReward);
}

// Info Panel Elements (duplicate functionality)
const keywordInputInfo = document.getElementById('keywordInputInfo');
const setKeywordBtnInfo = document.getElementById('setKeywordBtnInfo');
const disableKeywordBtnInfo = document.getElementById('disableKeywordBtnInfo');
const keywordStatusInfo = document.getElementById('keywordStatusInfo');
const botUsernameInputInfo = document.getElementById('botUsernameInputInfo');
const botOAuthInputInfo = document.getElementById('botOAuthInputInfo');
const botMessageInputInfo = document.getElementById('botMessageInputInfo');
const botParticipantMessageInputInfo = document.getElementById('botParticipantMessageInputInfo');
const setBotBtnInfo = document.getElementById('setBotBtnInfo');
const setBotOAuthBtnInfo = document.getElementById('setBotOAuthBtnInfo');
const setBotMessageBtnInfo = document.getElementById('setBotMessageBtnInfo');
const setBotParticipantMessageBtnInfo = document.getElementById('setBotParticipantMessageBtnInfo');
const botStatusInfo = document.getElementById('botStatusInfo');
const gameDvInputInfo = document.getElementById('gameDvInputInfo');
const gameKeyInputInfo = document.getElementById('gameKeyInputInfo');
const getBalanceBtnInfo = document.getElementById('getBalanceBtnInfo');
const getLastDonateBtnInfo = document.getElementById('getLastDonateBtnInfo');
const getAwardsBtnInfo = document.getElementById('getAwardsBtnInfo');
const gameRewardTypeInfo = document.getElementById('gameRewardTypeInfo');
const gameRewardValueInfo = document.getElementById('gameRewardValueInfo');
const gameRewardPlayerInfo = document.getElementById('gameRewardPlayerInfo');
const gameRewardDescInfo = document.getElementById('gameRewardDescInfo');
const sendRewardBtnInfo = document.getElementById('sendRewardBtnInfo');
const gameApiResultInfo = document.getElementById('gameApiResultInfo');

// Tự động load awards khi có thay đổi DV hoặc Key từ info-panel (sau khi các biến được khai báo)
// Lắng nghe từ info-panel inputs (ưu tiên)
if (gameDvInputInfo) {
    gameDvInputInfo.addEventListener('input', () => {
        clearTimeout(loadAwardsTimeout);
        const dv = gameDvInputInfo.value.trim();
        const keyInput = gameKeyInputInfo || gameKeyInput;
        const key = keyInput ? keyInput.value.trim() : '';
        
        // Chỉ load nếu có đủ cả DV và Key
        if (dv && key) {
            loadAwardsTimeout = setTimeout(loadAwards, 1000);
        } else if (awardsList) {
            awardsList.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 40px;"><p>Nhập DV Login và API Key để xem danh sách phần thưởng</p></div>';
        }
    });
}

if (gameKeyInputInfo) {
    gameKeyInputInfo.addEventListener('input', () => {
        clearTimeout(loadAwardsTimeout);
        const dvInput = gameDvInputInfo || gameDvInput;
        const dv = dvInput ? dvInput.value.trim() : '';
        const key = gameKeyInputInfo.value.trim();
        
        // Chỉ load nếu có đủ cả DV và Key
        if (dv && key) {
            loadAwardsTimeout = setTimeout(loadAwards, 1000);
        } else if (awardsList) {
            awardsList.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 40px;"><p>Nhập DV Login và API Key để xem danh sách phần thưởng</p></div>';
        }
    });
}

// Sync values between old and new inputs
function syncInputs() {
    if (keywordInput && keywordInputInfo) {
        keywordInputInfo.value = keywordInput.value;
        keywordInput.addEventListener('input', () => {
            if (keywordInputInfo) keywordInputInfo.value = keywordInput.value;
        });
        keywordInputInfo.addEventListener('input', () => {
            if (keywordInput) keywordInput.value = keywordInputInfo.value;
        });
    }
    if (botUsernameInput && botUsernameInputInfo) {
        botUsernameInputInfo.value = botUsernameInput.value;
        botUsernameInput.addEventListener('input', () => {
            if (botUsernameInputInfo) botUsernameInputInfo.value = botUsernameInput.value;
        });
        botUsernameInputInfo.addEventListener('input', () => {
            if (botUsernameInput) botUsernameInput.value = botUsernameInputInfo.value;
        });
    }
    if (botOAuthInput && botOAuthInputInfo) {
        botOAuthInputInfo.value = botOAuthInput.value;
        botOAuthInput.addEventListener('input', () => {
            if (botOAuthInputInfo) botOAuthInputInfo.value = botOAuthInput.value;
        });
        botOAuthInputInfo.addEventListener('input', () => {
            if (botOAuthInput) botOAuthInput.value = botOAuthInputInfo.value;
        });
    }
    if (botMessageInput && botMessageInputInfo) {
        botMessageInputInfo.value = botMessageInput.value;
        botMessageInput.addEventListener('input', () => {
            if (botMessageInputInfo) botMessageInputInfo.value = botMessageInput.value;
        });
        botMessageInputInfo.addEventListener('input', () => {
            if (botMessageInput) botMessageInput.value = botMessageInputInfo.value;
        });
    }
    if (botParticipantMessageInput && botParticipantMessageInputInfo) {
        botParticipantMessageInputInfo.value = botParticipantMessageInput.value;
        botParticipantMessageInput.addEventListener('input', () => {
            if (botParticipantMessageInputInfo) botParticipantMessageInputInfo.value = botParticipantMessageInput.value;
        });
        botParticipantMessageInputInfo.addEventListener('input', () => {
            if (botParticipantMessageInput) botParticipantMessageInput.value = botParticipantMessageInputInfo.value;
        });
    }
    if (gameDvInput && gameDvInputInfo) {
        gameDvInputInfo.value = gameDvInput.value;
        gameDvInput.addEventListener('input', () => {
            if (gameDvInputInfo) gameDvInputInfo.value = gameDvInput.value;
        });
        gameDvInputInfo.addEventListener('input', () => {
            if (gameDvInput) gameDvInput.value = gameDvInputInfo.value;
        });
    }
    if (gameKeyInput && gameKeyInputInfo) {
        gameKeyInputInfo.value = gameKeyInput.value;
        gameKeyInput.addEventListener('input', () => {
            if (gameKeyInputInfo) gameKeyInputInfo.value = gameKeyInput.value;
        });
        gameKeyInputInfo.addEventListener('input', () => {
            if (gameKeyInput) gameKeyInput.value = gameKeyInputInfo.value;
        });
    }
    if (gameRewardType && gameRewardTypeInfo) {
        gameRewardTypeInfo.value = gameRewardType.value;
        gameRewardType.addEventListener('change', () => {
            if (gameRewardTypeInfo) gameRewardTypeInfo.value = gameRewardType.value;
        });
        gameRewardTypeInfo.addEventListener('change', () => {
            if (gameRewardType) gameRewardType.value = gameRewardTypeInfo.value;
        });
    }
    if (gameRewardValue && gameRewardValueInfo) {
        gameRewardValueInfo.value = gameRewardValue.value;
        gameRewardValue.addEventListener('input', () => {
            if (gameRewardValueInfo) gameRewardValueInfo.value = gameRewardValue.value;
        });
        gameRewardValueInfo.addEventListener('input', () => {
            if (gameRewardValue) gameRewardValue.value = gameRewardValueInfo.value;
        });
    }
    if (gameRewardPlayer && gameRewardPlayerInfo) {
        gameRewardPlayerInfo.value = gameRewardPlayer.value;
        gameRewardPlayer.addEventListener('input', () => {
            if (gameRewardPlayerInfo) gameRewardPlayerInfo.value = gameRewardPlayer.value;
        });
        gameRewardPlayerInfo.addEventListener('input', () => {
            if (gameRewardPlayer) gameRewardPlayer.value = gameRewardPlayerInfo.value;
        });
    }
    if (gameRewardDesc && gameRewardDescInfo) {
        gameRewardDescInfo.value = gameRewardDesc.value;
        gameRewardDesc.addEventListener('input', () => {
            if (gameRewardDescInfo) gameRewardDescInfo.value = gameRewardDesc.value;
        });
        gameRewardDescInfo.addEventListener('input', () => {
            if (gameRewardDesc) gameRewardDesc.value = gameRewardDescInfo.value;
        });
    }
}

// Info Panel Event Listeners
if (setKeywordBtnInfo) {
    setKeywordBtnInfo.addEventListener('click', () => {
        if (keywordInputInfo) keywordInput.value = keywordInputInfo.value;
        setKeyword();
        if (keywordStatusInfo) keywordStatusInfo.textContent = keywordStatus.textContent;
        if (keywordStatusInfo) keywordStatusInfo.className = keywordStatus.className;
    });
}
if (disableKeywordBtnInfo) {
    disableKeywordBtnInfo.addEventListener('click', () => {
        disableKeyword();
        if (keywordStatusInfo) keywordStatusInfo.textContent = keywordStatus.textContent;
        if (keywordStatusInfo) keywordStatusInfo.className = keywordStatus.className;
    });
}
if (setBotBtnInfo) {
    setBotBtnInfo.addEventListener('click', () => {
        if (botUsernameInputInfo && botUsernameInput) botUsernameInput.value = botUsernameInputInfo.value;
        setBotUsername();
    });
}
if (setBotOAuthBtnInfo) {
    setBotOAuthBtnInfo.addEventListener('click', () => {
        if (botOAuthInputInfo && botOAuthInput) botOAuthInput.value = botOAuthInputInfo.value;
        setBotOAuth();
    });
}
if (setBotMessageBtnInfo) {
    setBotMessageBtnInfo.addEventListener('click', () => {
        if (botMessageInputInfo && botMessageInput) botMessageInput.value = botMessageInputInfo.value;
        setBotMessage();
    });
}
if (setBotParticipantMessageBtnInfo) {
    setBotParticipantMessageBtnInfo.addEventListener('click', () => {
        if (botParticipantMessageInputInfo && botParticipantMessageInput) botParticipantMessageInput.value = botParticipantMessageInputInfo.value;
        setBotParticipantMessage();
    });
}
if (getBalanceBtnInfo) {
    getBalanceBtnInfo.addEventListener('click', () => {
        if (gameDvInputInfo && gameDvInput) gameDvInput.value = gameDvInputInfo.value;
        if (gameKeyInputInfo && gameKeyInput) gameKeyInput.value = gameKeyInputInfo.value;
        getBalance();
        if (gameApiResultInfo && gameApiResult) {
            gameApiResultInfo.innerHTML = gameApiResult.innerHTML;
            gameApiResultInfo.style.display = gameApiResult.style.display;
        }
    });
}
if (getLastDonateBtnInfo) {
    getLastDonateBtnInfo.addEventListener('click', () => {
        if (gameDvInputInfo && gameDvInput) gameDvInput.value = gameDvInputInfo.value;
        if (gameKeyInputInfo && gameKeyInput) gameKeyInput.value = gameKeyInputInfo.value;
        getLastDonate();
        if (gameApiResultInfo && gameApiResult) {
            gameApiResultInfo.innerHTML = gameApiResult.innerHTML;
            gameApiResultInfo.style.display = gameApiResult.style.display;
        }
    });
}
if (getAwardsBtnInfo) {
    getAwardsBtnInfo.addEventListener('click', () => {
        if (gameDvInputInfo && gameDvInput) gameDvInput.value = gameDvInputInfo.value;
        if (gameKeyInputInfo && gameKeyInput) gameKeyInput.value = gameKeyInputInfo.value;
        getAwards();
        if (gameApiResultInfo && gameApiResult) {
            gameApiResultInfo.innerHTML = gameApiResult.innerHTML;
            gameApiResultInfo.style.display = gameApiResult.style.display;
        }
    });
}
if (sendRewardBtnInfo) {
    sendRewardBtnInfo.addEventListener('click', () => {
        if (gameDvInputInfo && gameDvInput) gameDvInput.value = gameDvInputInfo.value;
        if (gameKeyInputInfo && gameKeyInput) gameKeyInput.value = gameKeyInputInfo.value;
        if (gameRewardTypeInfo && gameRewardType) gameRewardType.value = gameRewardTypeInfo.value;
        if (gameRewardValueInfo && gameRewardValue) gameRewardValue.value = gameRewardValueInfo.value;
        if (gameRewardPlayerInfo && gameRewardPlayer) gameRewardPlayer.value = gameRewardPlayerInfo.value;
        if (gameRewardDescInfo && gameRewardDesc) gameRewardDesc.value = gameRewardDescInfo.value;
        sendReward();
        if (gameApiResultInfo && gameApiResult) {
            gameApiResultInfo.innerHTML = gameApiResult.innerHTML;
            gameApiResultInfo.style.display = gameApiResult.style.display;
        }
    });
}

// Enter key để gửi phần thưởng
if (gameRewardValue) {
    gameRewardValue.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendReward();
        }
    });
}
if (gameRewardPlayer) {
    gameRewardPlayer.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendReward();
        }
    });
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load saved language
    const savedLang = localStorage.getItem('app_language') || 'vi';
    setLanguage(savedLang);
    
    // Update language select
    if (languageSelect) {
        languageSelect.value = savedLang;
    }
    
    // Update active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.dataset.lang === savedLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update UI with translations
    updateUI();
    
    // Sync inputs between old and new panels
    syncInputs();
    
    // Ensure connect button event listeners are attached
    if (connectBtn) {
        connectBtn.addEventListener('click', connectToChannel);
    }
    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', disconnectFromChannel);
    }
    
    // Check if already connected (from previous session)
    // If connected, show main app, otherwise show language screen
    if (isConnected && mainApp) {
        languageScreen.style.display = 'none';
        mainApp.style.display = 'block';
    } else if (languageScreen && mainApp) {
        languageScreen.style.display = 'flex';
        mainApp.style.display = 'none';
    }
});

// Language select change handler
if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
        setLanguage(e.target.value);
    });
}

// Initial connect button (from language screen)
if (connectInitialBtn) {
    connectInitialBtn.addEventListener('click', async () => {
        const channel = channelInputInitial.value.trim();
        if (!channel) {
            showStatusInitial(t('channelInputPlaceholder'), 'error');
            return;
        }
        
        // Copy channel to main input
        channelInput.value = channel;
        
        // Connect
        await connectToChannel();
        
        // If connected successfully, show main app
        if (isConnected) {
            languageScreen.style.display = 'none';
            mainApp.style.display = 'block';
        }
    });
}

// Enter key on initial channel input
if (channelInputInitial) {
    channelInputInitial.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            connectInitialBtn.click();
        }
    });
}

function showStatusInitial(message, type) {
    if (!statusInitial) return;
    statusInitial.textContent = message;
    statusInitial.className = `status-message show ${type}`;
    setTimeout(() => {
        statusInitial.className = 'status-message';
    }, 5000);
}

// Load participants when connected
socket.on('connect', () => {
    console.log('Đã kết nối với server');
    showStatus('Đã kết nối với server', 'success');
    loadParticipants();
    loadBotConfig();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

