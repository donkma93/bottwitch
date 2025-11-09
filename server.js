const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const tmi = require('tmi.js');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware để debug
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`${req.method} ${req.path} - socketId: ${req.body?.socketId || req.query?.socketId || req.headers['socket-id'] || 'none'}`);
  }
  next();
});

// Store active Twitch client connections
const twitchClients = new Map();

// Store giveaway data for each socket
const giveawayData = new Map(); // { socketId: { keyword: string, participants: Set, winner: string, winnerExpiry: Date, winnerCommented: boolean, winners: Set, excluded: Set } }

// Store bot configuration for each socket
const botConfigs = new Map(); // { socketId: { username: string, oauth: string, message: string, participantMessage: string } }

// Store bot clients for sending messages
const botClients = new Map(); // { socketId: tmi.Client }

// Store channel names for each socket
const channelNames = new Map(); // { socketId: channelName }

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working' });
});

// API endpoint để kết nối với Twitch chat
app.post('/api/connect', (req, res) => {
  const { channel, username } = req.body;
  
  if (!channel) {
    return res.status(400).json({ error: 'Channel name is required' });
  }

  const channelName = channel.startsWith('#') ? channel : `#${channel}`;
  const socketId = req.headers['socket-id'] || 'default';
  
  // Lưu channel name
  channelNames.set(socketId, channelName);

  // Nếu đã có kết nối, disconnect trước
  if (twitchClients.has(socketId)) {
    twitchClients.get(socketId).disconnect();
  }

  // Tạo client Twitch mới (chỉ đọc chat)
  const client = new tmi.Client({
    options: { debug: false },
    connection: {
      reconnect: true,
      secure: true
    },
    channels: [channelName]
  });
  
  // Tạo bot client để gửi tin nhắn (nếu có cấu hình)
  if (botConfigs.has(socketId)) {
    const botConfig = botConfigs.get(socketId);
    if (botConfig.username && botConfig.oauth) {
      try {
        const botClient = new tmi.Client({
          options: { debug: false },
          connection: {
            reconnect: true,
            secure: true
          },
          identity: {
            username: botConfig.username,
            password: botConfig.oauth
          },
          channels: [channelName]
        });
        
        // Bot connection events
        botClient.on('connected', (addr, port) => {
          console.log(`Bot ${botConfig.username} connected to ${addr}:${port}`);
          io.to(socketId).emit('bot-status', {
            connected: true,
            message: `Bot ${botConfig.username} đã kết nối thành công!`
          });
        });
        
        botClient.on('disconnected', (reason) => {
          console.log(`Bot ${botConfig.username} disconnected: ${reason}`);
          io.to(socketId).emit('bot-status', {
            connected: false,
            message: `Bot ${botConfig.username} đã ngắt kết nối: ${reason}`
          });
        });
        
        botClient.on('join', (channel, username, self) => {
          if (self) {
            console.log(`Bot ${botConfig.username} joined ${channel}`);
            io.to(socketId).emit('bot-status', {
              connected: true,
              message: `Bot ${botConfig.username} đã vào kênh ${channel.replace('#', '')}!`
            });
          }
        });
        
        botClient.connect().catch(err => {
          console.error('Bot connection error:', err);
          io.to(socketId).emit('bot-status', {
            connected: false,
            message: `Lỗi kết nối bot: ${err.message}`
          });
        });
        
        botClients.set(socketId, botClient);
      } catch (error) {
        console.error('Error creating bot client:', error);
        io.to(socketId).emit('bot-status', {
          connected: false,
          message: `Lỗi tạo bot client: ${error.message}`
        });
      }
    }
  }

  // Xử lý khi nhận được message
  client.on('message', (channel, tags, message, self) => {
    const username = tags['display-name'] || tags.username;
    const chatData = {
      channel: channel.replace('#', ''),
      username: username,
      message: message,
      color: tags.color || '#FFFFFF',
      badges: tags.badges || {},
      emotes: tags.emotes || {},
      timestamp: new Date().toISOString(),
      subscriber: tags.subscriber === '1',
      mod: tags.mod === '1',
      vip: tags.vip === '1',
      turbo: tags.turbo === '1'
    };

    // Gửi message đến client qua socket.io
    io.to(socketId).emit('chat-message', chatData);
    
    // Kiểm tra nếu đây là message từ người chiến thắng trong thời gian chờ
    if (giveawayData.has(socketId)) {
      try {
        const giveaway = giveawayData.get(socketId);
        if (giveaway && giveaway.winner && 
            giveaway.winnerExpiry && 
            username === giveaway.winner) {
          // Kiểm tra thời gian hết hạn
          const expiryTime = giveaway.winnerExpiry instanceof Date 
            ? giveaway.winnerExpiry 
            : new Date(giveaway.winnerExpiry);
          
          if (new Date() < expiryTime) {
            // Gửi message của người chiến thắng
            io.to(socketId).emit('winner-message', {
              username: username,
              message: message,
              timestamp: new Date().toISOString(),
              color: tags.color || '#FFFFFF'
            });
            
            // Dừng countdown và đánh dấu đã comment
            if (!giveaway.winnerCommented) {
              giveaway.winnerCommented = true;
              io.to(socketId).emit('winner-commented', {
                username: username,
                message: message,
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      } catch (error) {
        console.error('Error processing winner message:', error);
      }
    }

    // Kiểm tra giveaway keyword
    if (giveawayData.has(socketId)) {
      try {
        const giveaway = giveawayData.get(socketId);
        if (giveaway && giveaway.keyword && message.toLowerCase().includes(giveaway.keyword.toLowerCase())) {
          const username = tags['display-name'] || tags.username;
          
          if (!username) {
            return; // Bỏ qua nếu không có username
          }
          
          // Kiểm tra xem user có phải là broadcaster (owner) của kênh không
          const badges = tags.badges || {};
          // Badges có thể là object như { broadcaster: '1' } hoặc { broadcaster: '1', subscriber: '12' }
          const isBroadcaster = badges.broadcaster !== undefined && badges.broadcaster !== null;
          
          // Bỏ qua nếu là broadcaster (owner của kênh)
          if (isBroadcaster) {
            return;
          }
          
          // Đảm bảo participants là Set
          if (!giveaway.participants || !(giveaway.participants instanceof Set)) {
            giveaway.participants = new Set();
          }
          
          // Không thêm nếu đã trúng quà trước đó
          if (giveaway.winners && giveaway.winners.has(username)) {
            // Có thể gửi tin nhắn nhắc nhở nếu muốn
            if (botClients.has(socketId) && botConfigs.has(socketId) && channelNames.has(socketId)) {
              const botClient = botClients.get(socketId);
              const channelName = channelNames.get(socketId);
              
              if (botClient && channelName) {
                const reminderMessage = `@${username} Bạn đã trúng quà rồi, không thể tham gia lại! 🎁`;
                botClient.say(channelName, reminderMessage).catch(err => {
                  console.error('Error sending winner reminder:', err);
                });
              }
            }
            return;
          }
          
          // Chỉ thêm nếu chưa có trong danh sách
          if (!giveaway.participants.has(username)) {
            giveaway.participants.add(username);
            
            // Gửi tin nhắn bot thông báo cho người dùng (nếu có bot)
            if (botClients.has(socketId) && botConfigs.has(socketId) && channelNames.has(socketId)) {
              const botClient = botClients.get(socketId);
              const channelName = channelNames.get(socketId);
              const botConfig = botConfigs.get(socketId);
              
              console.log(`[Bot Check] socketId: ${socketId}, hasBotClient: ${!!botClient}, hasChannel: ${!!channelName}, hasConfig: ${!!botConfig}`);
              
              if (botClient && channelName && botConfig) {
                const notificationMessage = (botConfig.participantMessage || '@{username} ✅ Bạn đã được thêm vào danh sách để roll quà! Chúc may mắn! 🎁')
                  .replace(/{username}/g, username);
                
                // Thử gửi tin nhắn - tmi.js sẽ tự xử lý nếu chưa connected
                botClient.say(channelName, notificationMessage).then(() => {
                  console.log(`✅ Bot notification sent to ${username}: ${notificationMessage}`);
                }).catch(err => {
                  console.error(`❌ Error sending participant notification to ${username}:`, err.message || err);
                  // Nếu lỗi do chưa connected, log thông tin debug
                  if (err.message && err.message.includes('Not connected')) {
                    console.warn(`⚠️ Bot client not connected yet. Bot username: ${botConfig.username}, Channel: ${channelName}`);
                  }
                });
              } else {
                console.warn(`⚠️ Missing bot components - botClient: ${!!botClient}, channelName: ${!!channelName}, botConfig: ${!!botConfig}`);
              }
            } else {
              console.log(`ℹ️ Bot not configured - hasBotClient: ${botClients.has(socketId)}, hasConfig: ${botConfigs.has(socketId)}, hasChannel: ${channelNames.has(socketId)}`);
            }
            
            // Gửi thông báo participant mới
            io.to(socketId).emit('giveaway-participant', {
              username: username,
              message: message,
              timestamp: new Date().toISOString(),
              total: giveaway.participants.size
            });
          } else {
            // Nếu đã có trong danh sách, có thể gửi tin nhắn nhắc nhở
            if (botClients.has(socketId) && botConfigs.has(socketId) && channelNames.has(socketId)) {
              const botClient = botClients.get(socketId);
              const channelName = channelNames.get(socketId);
              
              if (botClient && channelName) {
                const reminderMessage = `@${username} Bạn đã có trong danh sách rồi! Chờ roll quà nhé! 🎲`;
                
                botClient.say(channelName, reminderMessage).catch(err => {
                  console.error('Error sending reminder notification:', err);
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing giveaway keyword:', error);
      }
    }
  });

  // Xử lý khi có người join
  client.on('join', (channel, username, self) => {
    if (self) {
      io.to(socketId).emit('status', { 
        type: 'connected', 
        message: `Đã kết nối với ${channel}` 
      });
    }
  });

  // Xử lý khi có người leave
  client.on('part', (channel, username, self) => {
    if (self) {
      io.to(socketId).emit('status', { 
        type: 'disconnected', 
        message: `Đã ngắt kết nối với ${channel}` 
      });
    }
  });

  // Xử lý lỗi
  client.on('error', (error) => {
    console.error('Twitch client error:', error);
    io.to(socketId).emit('status', { 
      type: 'error', 
      message: `Lỗi: ${error.message}` 
    });
  });

  // Kết nối
  client.connect().catch(err => {
    console.error('Connection error:', err);
    res.status(500).json({ error: err.message });
  });

  // Lưu client
  twitchClients.set(socketId, client);

  res.json({ 
    success: true, 
    message: `Đang kết nối với ${channelName}...` 
  });
});

// API endpoint để disconnect
app.post('/api/disconnect', (req, res) => {
  const socketId = req.headers['socket-id'] || 'default';
  
  if (twitchClients.has(socketId)) {
    twitchClients.get(socketId).disconnect();
    twitchClients.delete(socketId);
    // Xóa giveaway data khi disconnect
    giveawayData.delete(socketId);
    res.json({ success: true, message: 'Đã ngắt kết nối' });
  } else {
    res.json({ success: false, message: 'Không có kết nối nào' });
  }
});

// API endpoint để set giveaway keyword
app.post('/api/giveaway/set-keyword', (req, res) => {
  const { keyword, socketId: clientSocketId } = req.body;
  const socketId = clientSocketId || req.headers['socket-id'] || 'default';
  
  if (!giveawayData.has(socketId)) {
    giveawayData.set(socketId, {
      keyword: keyword || '',
      participants: new Set()
    });
  } else {
    const giveaway = giveawayData.get(socketId);
    giveaway.keyword = keyword || '';
  }
  
  res.json({ 
    success: true, 
    message: keyword ? `Đã cài đặt từ khóa: "${keyword}"` : 'Đã tắt giveaway',
    keyword: keyword || ''
  });
});

// API endpoint để lấy danh sách participants
app.get('/api/giveaway/participants', (req, res) => {
  try {
    const socketId = req.query.socketId || req.headers['socket-id'] || 'default';
    
    if (giveawayData.has(socketId)) {
      const giveaway = giveawayData.get(socketId);
      
      // Đảm bảo participants là Set
      if (!giveaway.participants || !(giveaway.participants instanceof Set)) {
        giveaway.participants = new Set();
      }
      
      // Đảm bảo excluded và winners là Set
      if (!giveaway.excluded || !(giveaway.excluded instanceof Set)) {
        giveaway.excluded = new Set();
      }
      if (!giveaway.winners || !(giveaway.winners instanceof Set)) {
        giveaway.winners = new Set();
      }
      
      res.json({
        success: true,
        keyword: giveaway.keyword || '',
        participants: Array.from(giveaway.participants),
        count: giveaway.participants.size,
        excluded: Array.from(giveaway.excluded),
        winners: Array.from(giveaway.winners)
      });
    } else {
      res.json({
        success: true,
        keyword: '',
        participants: [],
        count: 0
      });
    }
  } catch (error) {
    console.error('Error in participants endpoint:', error);
    res.status(500).json({
      success: false,
      keyword: '',
      participants: [],
      count: 0,
      error: error.message
    });
  }
});

// API endpoint để toggle excluded status của participant
app.post('/api/giveaway/toggle-excluded', (req, res) => {
  try {
    const { socketId: clientSocketId, username } = req.body;
    const socketId = clientSocketId || req.headers['socket-id'] || 'default';
    
    if (!username) {
      return res.json({ success: false, message: 'Thiếu username' });
    }
    
    if (!giveawayData.has(socketId)) {
      return res.json({ success: false, message: 'Không có dữ liệu giveaway' });
    }
    
    const giveaway = giveawayData.get(socketId);
    
    // Đảm bảo excluded là Set
    if (!giveaway.excluded || !(giveaway.excluded instanceof Set)) {
      giveaway.excluded = new Set();
    }
    
    // Toggle excluded status
    if (giveaway.excluded.has(username)) {
      giveaway.excluded.delete(username);
      res.json({ success: true, excluded: false, message: `Đã thêm ${username} vào danh sách roll` });
    } else {
      giveaway.excluded.add(username);
      res.json({ success: true, excluded: true, message: `Đã loại ${username} khỏi danh sách roll` });
    }
  } catch (error) {
    console.error('Error toggling excluded status:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
});

// API endpoint để xóa danh sách participants
app.post('/api/giveaway/clear', (req, res) => {
  const { socketId: clientSocketId } = req.body;
  const socketId = clientSocketId || req.headers['socket-id'] || 'default';
  
  if (giveawayData.has(socketId)) {
    const giveaway = giveawayData.get(socketId);
    giveaway.participants.clear();
    giveaway.winner = null;
    giveaway.winnerExpiry = null;
    giveaway.winnerCommented = false;
    if (giveaway.winners) {
      giveaway.winners.clear();
    }
    if (giveaway.excluded) {
      giveaway.excluded.clear();
    }
    res.json({ success: true, message: 'Đã xóa danh sách participants, danh sách người đã trúng và danh sách người bị loại' });
  } else {
    res.json({ success: false, message: 'Không có dữ liệu giveaway' });
  }
});

// API endpoint để cấu hình bot
app.post('/api/bot/config', (req, res) => {
  try {
    const { socketId: clientSocketId, username, oauth, message, participantMessage } = req.body;
    const socketId = clientSocketId || req.headers['socket-id'] || 'default';
    
    if (!botConfigs.has(socketId)) {
      botConfigs.set(socketId, {});
    }
    
    const botConfig = botConfigs.get(socketId);
    
    if (username !== undefined) botConfig.username = username;
    if (oauth !== undefined) botConfig.oauth = oauth;
    if (message !== undefined) botConfig.message = message;
    if (participantMessage !== undefined) botConfig.participantMessage = participantMessage;
    
    // Nếu có bot client cũ, disconnect
    if (botClients.has(socketId)) {
      botClients.get(socketId).disconnect();
      botClients.delete(socketId);
    }
    
    // Nếu có username và oauth, tạo bot client mới
    if (botConfig.username && botConfig.oauth && channelNames.has(socketId)) {
      const channelName = channelNames.get(socketId);
      
      if (channelName) {
        try {
          const botClient = new tmi.Client({
            options: { debug: false },
            connection: {
              reconnect: true,
              secure: true
            },
            identity: {
              username: botConfig.username,
              password: botConfig.oauth
            },
            channels: [channelName]
          });
          
          // Bot connection events
          botClient.on('connected', (addr, port) => {
            console.log(`Bot ${botConfig.username} connected to ${addr}:${port}`);
            io.to(socketId).emit('bot-status', {
              connected: true,
              message: `Bot ${botConfig.username} đã kết nối thành công!`
            });
          });
          
          botClient.on('disconnected', (reason) => {
            console.log(`Bot ${botConfig.username} disconnected: ${reason}`);
            io.to(socketId).emit('bot-status', {
              connected: false,
              message: `Bot ${botConfig.username} đã ngắt kết nối: ${reason}`
            });
          });
          
          botClient.on('join', (channel, username, self) => {
            if (self) {
              console.log(`Bot ${botConfig.username} joined ${channel}`);
              io.to(socketId).emit('bot-status', {
                connected: true,
                message: `Bot ${botConfig.username} đã vào kênh ${channel.replace('#', '')}!`
              });
            }
          });
          
          botClient.connect().catch(err => {
            console.error('Bot connection error:', err);
            io.to(socketId).emit('bot-status', {
              connected: false,
              message: `Lỗi kết nối bot: ${err.message}`
            });
          });
          
          botClients.set(socketId, botClient);
        } catch (error) {
          console.error('Error creating bot client:', error);
        }
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Đã lưu cấu hình bot',
      config: {
        username: botConfig.username || '',
        hasOAuth: !!botConfig.oauth,
        message: botConfig.message || '',
        participantMessage: botConfig.participantMessage || ''
      }
    });
  } catch (error) {
    console.error('Error in bot config endpoint:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
});

// API endpoint để lấy cấu hình bot
app.get('/api/bot/config', (req, res) => {
  try {
    const socketId = req.query.socketId || req.headers['socket-id'] || 'default';
    
    if (botConfigs.has(socketId)) {
      const botConfig = botConfigs.get(socketId);
      res.json({
        success: true,
        config: {
          username: botConfig.username || '',
          hasOAuth: !!botConfig.oauth,
          message: botConfig.message || '🎉 {winner} đã chiến thắng giveaway! Bạn có 30s để comment vào giveaway để nhận quà! 🎉 {winner} ganhou o sorteio! Você tem 30s para comentar no sorteio para receber o prêmio!',
          participantMessage: botConfig.participantMessage || '@{username} ✅ Bạn đã được thêm vào danh sách để roll quà! Chúc may mắn! 🎁'
        }
      });
    } else {
      res.json({
        success: true,
        config: {
          username: '',
          hasOAuth: false,
          message: '🎉 {winner} đã chiến thắng giveaway! Bạn có 30s để comment vào giveaway để nhận quà! 🎉 {winner} ganhou o sorteio! Você tem 30s para comentar no sorteio para receber o prêmio!',
          participantMessage: '@{username} ✅ Bạn đã được thêm vào danh sách để roll quà! Chúc may mắn! 🎁'
        }
      });
    }
  } catch (error) {
    console.error('Error getting bot config:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
});

// API endpoint để roll ngẫu nhiên
app.post('/api/giveaway/roll', (req, res) => {
  try {
    const { socketId: clientSocketId } = req.body;
    const socketId = clientSocketId || req.headers['socket-id'] || 'default';
    
    console.log('Roll request - socketId:', socketId);
    
    if (!giveawayData.has(socketId)) {
      console.log('No giveaway data for socketId:', socketId);
      return res.json({ success: false, message: 'Không có dữ liệu giveaway' });
    }
    
    const giveaway = giveawayData.get(socketId);
    
    if (!giveaway) {
      console.log('Giveaway is null/undefined');
      return res.json({ success: false, message: 'Dữ liệu giveaway không hợp lệ' });
    }
    
    // Đảm bảo participants là Set
    if (!giveaway.participants) {
      giveaway.participants = new Set();
    }
    
    if (!(giveaway.participants instanceof Set)) {
      console.log('Converting participants to Set');
      giveaway.participants = new Set(Array.isArray(giveaway.participants) ? giveaway.participants : []);
    }
    
    // Đảm bảo excluded là Set
    if (!giveaway.excluded) {
      giveaway.excluded = new Set();
    }
    if (!(giveaway.excluded instanceof Set)) {
      giveaway.excluded = new Set(Array.isArray(giveaway.excluded) ? giveaway.excluded : []);
    }
    
    // Lọc ra những người không bị loại (excluded) và chưa trúng (winners)
    const eligibleParticipants = Array.from(giveaway.participants).filter(
      username => !giveaway.excluded.has(username) && (!giveaway.winners || !giveaway.winners.has(username))
    );
    
    console.log('Total participants:', giveaway.participants.size);
    console.log('Excluded:', giveaway.excluded.size);
    console.log('Winners:', giveaway.winners ? giveaway.winners.size : 0);
    console.log('Eligible participants:', eligibleParticipants.length);
    
    if (eligibleParticipants.length === 0) {
      return res.json({ success: false, message: 'Không có người nào đủ điều kiện để roll (tất cả đã bị loại hoặc đã trúng)' });
    }
    
    // Roll ngẫu nhiên từ những người đủ điều kiện
    const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
    const winner = eligibleParticipants[randomIndex];
    
    if (!winner) {
      console.error('Winner is null/undefined');
      return res.json({ success: false, message: 'Lỗi khi chọn người chiến thắng' });
    }
    
    console.log('Winner selected:', winner);
    
    // Lưu thông tin winner và thời gian hết hạn (30 giây)
    giveaway.winner = winner;
    giveaway.winnerExpiry = new Date(Date.now() + 30000); // 30 giây
    giveaway.winnerCommented = false; // Reset trạng thái comment
    
    // Xóa người chiến thắng khỏi danh sách participants
    giveaway.participants.delete(winner);
    
    // Thêm vào danh sách những người đã trúng (để tránh roll lại nếu họ được thêm lại)
    if (!giveaway.winners) {
      giveaway.winners = new Set();
    }
    giveaway.winners.add(winner);
    
    console.log(`Removed ${winner} from participants. Remaining: ${giveaway.participants.size}`);
    
    // Gửi tin nhắn bot nếu có cấu hình
    if (botClients.has(socketId) && botConfigs.has(socketId) && channelNames.has(socketId)) {
      const botClient = botClients.get(socketId);
      const botConfig = botConfigs.get(socketId);
      const channelName = channelNames.get(socketId);
      
      if (botClient && channelName) {
        const message = (botConfig.message || '🎉 {winner} đã chiến thắng giveaway! Bạn có 30s để comment vào giveaway để nhận quà! 🎉 {winner} ganhou o sorteio! Você tem 30s para comentar no sorteio para receber o prêmio!')
          .replace(/{winner}/g, winner);
        
        botClient.say(channelName, message).catch(err => {
          console.error('Error sending bot message:', err);
        });
        console.log('Bot message sent:', message);
      }
    }
    
    // Gửi thông báo qua socket - kiểm tra socket có tồn tại không
    try {
      const expiryTimeStr = giveaway.winnerExpiry.toISOString();
      io.to(socketId).emit('giveaway-winner', {
        winner: winner,
        expiryTime: expiryTimeStr,
        participants: eligibleParticipants, // Gửi danh sách đủ điều kiện để xáo trộn
        remainingCount: giveaway.participants.size
      });
      console.log('Socket event emitted successfully');
      
      // Gửi event để cập nhật danh sách participants (đã xóa winner)
      io.to(socketId).emit('giveaway-participant-removed', {
        username: winner,
        total: giveaway.participants.size
      });
    } catch (socketError) {
      console.error('Error emitting socket event:', socketError);
      // Vẫn trả về response dù socket emit lỗi
    }
    
    res.json({ 
      success: true, 
      winner: winner,
      expiryTime: giveaway.winnerExpiry.toISOString(),
      participants: eligibleParticipants, // Gửi danh sách đủ điều kiện để xáo trộn
      message: `Người chiến thắng: ${winner}` 
    });
  } catch (error) {
    console.error('Error in roll endpoint:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message,
      error: error.toString()
    });
  }
});

// Game API endpoints
let axios;
try {
  axios = require('axios');
} catch (e) {
  console.warn('axios not installed. Run: npm install axios');
}

// API endpoint để gọi Game API
app.post('/api/game/request', async (req, res) => {
  try {
    if (!axios) {
      return res.status(500).json({ success: false, message: 'axios chưa được cài đặt. Chạy: npm install axios' });
    }
    
    const { dv, key, action, value, player, description, sec } = req.body;
    
    if (!dv || !key || !action) {
      return res.json({ success: false, message: 'Thiếu tham số bắt buộc (dv, key, action)' });
    }
    
    const params = new URLSearchParams({
      dv: dv,
      key: key,
      action: action
    });
    
    // Thêm các tham số tùy chọn
    if (value !== undefined && value !== '') params.append('value', value);
    if (player !== undefined && player !== '') params.append('player', player);
    if (description !== undefined && description !== '') params.append('description', description);
    if (sec !== undefined && sec !== '') params.append('sec', sec);
    
    const apiUrl = `https://megamu.net/dvapi.php?${params.toString()}`;
    
    // Log URL đầy đủ để debug (ẩn key vì bảo mật)
    console.log('=== Game API Call ===');
    console.log('URL:', apiUrl.replace(key, '***'));
    console.log('Full URL (with key):', apiUrl);
    console.log('DV:', dv);
    console.log('Action:', action);
    console.log('Extra params:', { value, player, description, sec });
    console.log('===================');
    
    let response;
    try {
      // Đây là endpoint PHP trả về JSON dạng text, không phải REST API
      // Content-Type có thể là text/html nhưng nội dung là JSON string
      // Phải disable hoàn toàn việc axios tự động parse JSON
      response = await axios.get(apiUrl, {
        timeout: 10000,
        headers: {
          // Sử dụng User-Agent giống browser để tránh bị chặn
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*', // Chấp nhận mọi loại content-type
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://megamu.net/'
        },
        // QUAN TRỌNG: Disable transform response để giữ nguyên string
        // Axios có thể tự động parse JSON ngay cả khi Content-Type là text/html
        transformResponse: [(data) => {
          // Luôn trả về string, không bao giờ parse
          return typeof data === 'string' ? data : String(data);
        }],
        // Disable responseType để không tự động parse
        responseType: 'text', // Bắt buộc axios trả về string
        // Validate status - chấp nhận mọi status code
        validateStatus: function (status) {
          return status >= 200 && status < 600; // Chấp nhận cả 4xx, 5xx để xử lý
        }
      });
    } catch (axiosError) {
      console.error('Axios error:', axiosError.message);
      if (axiosError.code === 'ECONNABORTED') {
        return res.json({ success: false, message: 'API timeout (quá 10 giây)', error: 'TIMEOUT' });
      } else if (axiosError.response) {
        // Server trả về response nhưng status code không phải 2xx
        console.error('API returned error status:', axiosError.response.status);
        return res.json({ 
          success: false, 
          message: `API trả về lỗi: ${axiosError.response.status} ${axiosError.response.statusText}`,
          error: axiosError.response.data 
        });
      } else if (axiosError.request) {
        // Request đã được gửi nhưng không nhận được response
        console.error('No response from API');
        return res.json({ success: false, message: 'Không nhận được phản hồi từ API', error: 'NO_RESPONSE' });
      } else {
        return res.json({ success: false, message: 'Lỗi khi gọi API: ' + axiosError.message, error: axiosError.message });
      }
    }
    
    // Endpoint PHP này trả về JSON dạng text string (không phải JSON object)
    // Content-Type thường là text/html nhưng nội dung là JSON string
    console.log('Response Status:', response.status);
    console.log('Response Status Text:', response.statusText);
    console.log('Response Content-Type:', response.headers['content-type'] || 'not set');
    console.log('Response data type:', typeof response.data);
    console.log('Response data length:', String(response.data).length);
    console.log('Response data (first 500 chars):', String(response.data).substring(0, 500));
    
    // Kiểm tra status code
    if (response.status >= 400) {
      console.error('API returned error status:', response.status);
      return res.json({ 
        success: false, 
        message: `API trả về lỗi HTTP ${response.status}: ${response.statusText}`,
        data: String(response.data).substring(0, 1000),
        error: `HTTP_${response.status}`
      });
    }
    
    let data;
    // Response.data phải là string (đã set responseType: 'text')
    // Nhưng vẫn đảm bảo convert thành string để an toàn
    let responseText;
    if (typeof response.data === 'string') {
      responseText = response.data.trim();
    } else if (typeof response.data === 'object') {
      // Nếu axios vẫn tự parse (trường hợp đặc biệt), convert lại thành string
      console.warn('Response.data is object, converting to string:', typeof response.data);
      responseText = JSON.stringify(response.data);
    } else {
      responseText = String(response.data).trim();
    }
    
    console.log('Response text type:', typeof responseText);
    console.log('Response text length:', responseText.length);
    
    if (!responseText) {
      console.error('Empty response from API');
      return res.json({ success: false, message: 'API trả về dữ liệu rỗng', raw: '' });
    }
    
    // Kiểm tra nếu response là HTML (thường là lỗi hoặc redirect)
    if (responseText.toLowerCase().includes('<!doctype html') || 
        responseText.toLowerCase().includes('<html') ||
        responseText.toLowerCase().startsWith('<')) {
      console.error('API trả về HTML thay vì JSON - có thể là lỗi hoặc redirect');
      // Tìm thông báo lỗi trong HTML nếu có
      const errorMatch = responseText.match(/<title>(.*?)<\/title>/i) || 
                        responseText.match(/<h1>(.*?)<\/h1>/i) ||
                        responseText.match(/error[^<]*/i);
      const errorMsg = errorMatch ? errorMatch[1] || errorMatch[0] : 'API trả về HTML thay vì JSON';
      
      return res.json({ 
        success: false, 
        message: `API trả về HTML: ${errorMsg}`,
        data: responseText.substring(0, 1000), // Trả về HTML để debug
        error: 'HTML_RESPONSE'
      });
    }
    
    try {
      // Parse JSON string thành object
      data = JSON.parse(responseText);
      console.log('Parsed JSON successfully:', JSON.stringify(data));
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError.message);
      console.error('Response text (first 500 chars):', responseText.substring(0, 500));
      
      // Kiểm tra xem có phải HTML không
      if (responseText.toLowerCase().includes('<!doctype') || responseText.toLowerCase().includes('<html')) {
        return res.json({ 
          success: false, 
          message: 'API trả về HTML thay vì JSON (có thể URL không đúng hoặc server lỗi)', 
          raw: responseText.substring(0, 500),
          error: 'HTML_RESPONSE'
        });
      }
      
      return res.json({ 
        success: false, 
        message: 'API trả về dữ liệu không phải JSON hợp lệ: ' + parseError.message, 
        raw: responseText.substring(0, 500),
        error: parseError.message
      });
    }
    
    // Kiểm tra nếu data không phải object sau khi parse
    if (!data || typeof data !== 'object') {
      console.error('Invalid parsed data type:', typeof data, data);
      return res.json({ 
        success: false, 
        message: 'API trả về JSON không đúng định dạng (không phải object)', 
        raw: responseText.substring(0, 500) 
      });
    }
    
    console.log('Final parsed data:', JSON.stringify(data, null, 2));
    
    // Kiểm tra nếu không có trường result
    if (data.result === undefined) {
      console.warn('Response không có trường result:', data);
      // Vẫn trả về success nếu có dữ liệu hợp lệ (trường hợp đặc biệt)
      if (data.awards || data.mp !== undefined || data.name) {
        res.json({ success: true, data: data, message: 'Thành công (không có result field)' });
        return;
      } else {
        res.json({ success: false, message: 'Response không có trường result và không có dữ liệu hợp lệ', data: data });
        return;
      }
    }
    
    // Kiểm tra kết quả
    if (data.result === 1) {
      res.json({ success: true, data: data, message: 'Thành công' });
    } else if (data.result === 0) {
      res.json({ success: false, message: 'Hành động không hợp lệ', data: data });
    } else if (data.result === -100) {
      res.json({ success: false, message: 'Tham số không đúng', data: data });
    } else if (data.result === -101) {
      res.json({ success: false, message: 'Xác thực không hợp lệ (kiểm tra lại DV login và API key)', data: data });
    } else if (data.result === -1) {
      res.json({ success: false, message: 'Số dư không đủ', data: data });
    } else if (data.result === -2) {
      res.json({ success: false, message: 'Người chơi không tồn tại', data: data });
    } else {
      res.json({ success: false, message: `Lỗi không xác định: ${data.result}`, data: data });
    }
  } catch (error) {
    console.error('Error calling Game API:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi gọi API: ' + (error.message || 'Unknown error'),
      error: error.toString()
    });
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Khởi tạo giveaway data cho socket mới
  giveawayData.set(socket.id, {
    keyword: '',
    participants: new Set(),
    winner: null,
    winnerExpiry: null,
    winnerCommented: false,
    winners: new Set(), // Danh sách những người đã trúng quà
    excluded: new Set() // Danh sách những người bị loại khỏi roll
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Cleanup Twitch client khi socket disconnect
    if (twitchClients.has(socket.id)) {
      twitchClients.get(socket.id).disconnect();
      twitchClients.delete(socket.id);
    }
    // Cleanup bot client
    if (botClients.has(socket.id)) {
      botClients.get(socket.id).disconnect();
      botClients.delete(socket.id);
    }
    // Cleanup giveaway data
    giveawayData.delete(socket.id);
    // Cleanup bot config
    botConfigs.delete(socket.id);
  });
});

// Serve static files - đặt sau API routes
app.use(express.static('public'));

// Route để serve trang chính - phải đặt sau tất cả API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler middleware - phải đặt sau tất cả routes
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler - phải đặt sau tất cả routes
app.use((req, res) => {
  console.log(`404 - ${req.method} ${req.path}`);
  if (req.path.startsWith('/api/')) {
    // Trả về JSON cho API routes không tìm thấy
    res.status(404).json({
      success: false,
      message: 'API endpoint not found',
      path: req.path,
      method: req.method
    });
  } else {
    // Trả về HTML cho các routes khác
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  console.log('Mở trình duyệt và truy cập địa chỉ trên để sử dụng!');
});

