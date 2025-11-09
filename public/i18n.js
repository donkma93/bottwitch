// Internationalization (i18n) translations
const translations = {
    vi: {
        // Header
        title: "🎁 Hệ Thống Giveaway Twitch",
        subtitle: "Hệ thống quản lý giveaway với bot tự động",
        
        // Channel Input
        channelInputLabel: "Tên kênh Twitch:",
        channelInputPlaceholder: "Nhập tên kênh (ví dụ: xqcow, pokimane)",
        connectBtn: "Kết nối",
        disconnectBtn: "Ngắt kết nối",
        channelNotConnected: "Chưa kết nối",
        
        // Giveaway
        giveawayTitle: "🎁 Giveaway",
        keywordAndBotTitle: "⚙️ Cài đặt Từ khóa & Bot",
        keywordLabel: "Từ khóa giveaway:",
        keywordPlaceholder: "Nhập từ khóa (ví dụ: !join, giveaway)",
        setKeywordBtn: "Cài đặt",
        disableKeywordBtn: "Tắt",
        keywordActive: "Từ khóa đang hoạt động:",
        keywordInactive: "Giveaway đã tắt",
        
        // Bot Config
        botUsernameLabel: "Bot Username (để gửi thông báo):",
        botUsernamePlaceholder: "Tên bot Twitch",
        botOAuthLabel: "Bot OAuth Token:",
        botOAuthPlaceholder: "oauth:xxxxx (từ https://twitchtokengenerator.com)",
        botOAuthLink: "Lấy token tại:",
        botMessageLabel: "Tin nhắn khi roll (người chiến thắng):",
        botMessagePlaceholder: "🎉 {winner} đã chiến thắng giveaway! Bạn có 30s để comment vào giveaway để nhận quà! 🎉 {winner} ganhou o sorteio! Você tem 30s para comentar no sorteio para receber o prêmio!",
        botMessageHint: "Sử dụng {winner} để thay thế tên người chiến thắng",
        botParticipantMessageLabel: "Tin nhắn khi điểm danh:",
        botParticipantMessagePlaceholder: "@{username} ✅ Bạn đã được thêm vào danh sách để roll quà! Chúc may mắn! 🎁",
        botParticipantMessageHint: "Sử dụng {username} để thay thế tên người điểm danh",
        saveBtn: "Lưu",
        
        // Participants
        participantsTitle: "Danh sách tham gia",
        rollBtn: "🎲 Roll",
        exportBtn: "Xuất danh sách",
        clearBtn: "Xóa danh sách",
        noParticipants: "Chưa có người tham gia",
        
        // Awards
        awardsTitle: "🏆 Danh Sách Phần Thưởng",
        refreshAwardsBtn: "🔄 Làm mới",
        awardsInstructions: "Nhập DV Login và API Key, sau đó click \"🔄 Làm mới\" để xem danh sách phần thưởng",
        loadingAwards: "Đang tải danh sách phần thưởng...",
        noAwards: "Không có phần thưởng nào trong danh sách",
        
        // Game API
        gameAPITitle: "🎮 Game API Integration",
        gameDvLabel: "DV Login:",
        gameDvPlaceholder: "DV login",
        gameKeyLabel: "API Key:",
        gameKeyPlaceholder: "API key",
        getBalanceBtn: "💰 Get Balance",
        getLastDonateBtn: "📝 Last Donate",
        getAwardsBtn: "🏆 Get Awards",
        sendRewardLabel: "Gửi phần thưởng:",
        rewardTypeLabel: "Loại:",
        rewardValueLabel: "Số lượng:",
        rewardPlayerLabel: "Tên nhân vật:",
        rewardDescLabel: "Mô tả (tối đa 15 ký tự):",
        sendRewardBtn: "Gửi phần thưởng",
        
        // Chat
        chatTitle: "Chat",
        hideChatBtn: "Ẩn",
        showChatBtn: "Hiện",
        clearChatBtn: "Xóa",
        
        // Winner Popup
        winnerTitle: "🎉 Người Chiến Thắng 🎉",
        waitingComment: "Đang chờ comment trong:",
        seconds: "giây",
        winnerMessagesTitle: "Tin nhắn từ người chiến thắng:",
        waitingMessage: "Đang chờ comment...",
        winnerCommented: "✅ Người chiến thắng đã comment!",
        rollAgainBtn: "🎲 Roll Tiếp",
        closeBtn: "Đóng",
        
        // Status Messages
        connected: "Đã kết nối",
        disconnected: "Đã ngắt kết nối",
        error: "Lỗi",
        success: "Thành công",
        info: "Thông tin"
    },
    en: {
        title: "🎁 Twitch Giveaway System",
        subtitle: "Giveaway management system with automated bot",
        channelInputLabel: "Twitch Channel Name:",
        channelInputPlaceholder: "Enter channel name (e.g., xqcow, pokimane)",
        connectBtn: "Connect",
        disconnectBtn: "Disconnect",
        channelNotConnected: "Not connected",
        giveawayTitle: "🎁 Giveaway",
        keywordAndBotTitle: "⚙️ Keyword & Bot Settings",
        keywordLabel: "Giveaway keyword:",
        keywordPlaceholder: "Enter keyword (e.g., !join, giveaway)",
        setKeywordBtn: "Set",
        disableKeywordBtn: "Disable",
        keywordActive: "Active keyword:",
        keywordInactive: "Giveaway disabled",
        botUsernameLabel: "Bot Username (for notifications):",
        botUsernamePlaceholder: "Twitch bot name",
        botOAuthLabel: "Bot OAuth Token:",
        botOAuthPlaceholder: "oauth:xxxxx (from https://twitchtokengenerator.com)",
        botOAuthLink: "Get token at:",
        botMessageLabel: "Message when rolling (winner):",
        botMessagePlaceholder: "🎉 {winner} won the giveaway!",
        botMessageHint: "Use {winner} to replace winner name",
        botParticipantMessageLabel: "Message when joining:",
        botParticipantMessagePlaceholder: "@{username} ✅ You've been added to the giveaway list! Good luck! 🎁",
        botParticipantMessageHint: "Use {username} to replace participant name",
        saveBtn: "Save",
        participantsTitle: "Participants",
        rollBtn: "🎲 Roll",
        exportBtn: "Export list",
        clearBtn: "Clear list",
        noParticipants: "No participants yet",
        awardsTitle: "🏆 Awards List",
        refreshAwardsBtn: "🔄 Refresh",
        awardsInstructions: "Enter DV Login and API Key, then click \"🔄 Refresh\" to view awards list",
        loadingAwards: "Loading awards list...",
        noAwards: "No awards in the list",
        gameAPITitle: "🎮 Game API Integration",
        gameDvLabel: "DV Login:",
        gameDvPlaceholder: "DV login",
        gameKeyLabel: "API Key:",
        gameKeyPlaceholder: "API key",
        getBalanceBtn: "💰 Get Balance",
        getLastDonateBtn: "📝 Last Donate",
        getAwardsBtn: "🏆 Get Awards",
        sendRewardLabel: "Send reward:",
        rewardTypeLabel: "Type:",
        rewardValueLabel: "Amount:",
        rewardPlayerLabel: "Character name:",
        rewardDescLabel: "Description (max 15 chars):",
        sendRewardBtn: "Send reward",
        chatTitle: "Chat",
        hideChatBtn: "Hide",
        showChatBtn: "Show",
        clearChatBtn: "Clear",
        winnerTitle: "🎉 Winner 🎉",
        waitingComment: "Waiting for comment in:",
        seconds: "seconds",
        winnerMessagesTitle: "Messages from winner:",
        waitingMessage: "Waiting for comment...",
        winnerCommented: "✅ Winner has commented!",
        rollAgainBtn: "🎲 Roll Again",
        closeBtn: "Close",
        connected: "Connected",
        disconnected: "Disconnected",
        error: "Error",
        success: "Success",
        info: "Info"
    },
    pt: {
        title: "🎁 Sistema de Sorteio Twitch",
        subtitle: "Sistema de gerenciamento de sorteios com bot automatizado",
        channelInputLabel: "Nome do Canal Twitch:",
        channelInputPlaceholder: "Digite o nome do canal (ex: xqcow, pokimane)",
        connectBtn: "Conectar",
        disconnectBtn: "Desconectar",
        channelNotConnected: "Não conectado",
        giveawayTitle: "🎁 Sorteio",
        keywordAndBotTitle: "⚙️ Configurações de Palavra-chave e Bot",
        keywordLabel: "Palavra-chave do sorteio:",
        keywordPlaceholder: "Digite a palavra-chave (ex: !join, sorteio)",
        setKeywordBtn: "Definir",
        disableKeywordBtn: "Desativar",
        keywordActive: "Palavra-chave ativa:",
        keywordInactive: "Sorteio desativado",
        botUsernameLabel: "Nome de Usuário do Bot (para notificações):",
        botUsernamePlaceholder: "Nome do bot Twitch",
        botOAuthLabel: "Token OAuth do Bot:",
        botOAuthPlaceholder: "oauth:xxxxx (de https://twitchtokengenerator.com)",
        botOAuthLink: "Obter token em:",
        botMessageLabel: "Mensagem ao sortear (vencedor):",
        botMessagePlaceholder: "🎉 {winner} ganhou o sorteio!",
        botMessageHint: "Use {winner} para substituir o nome do vencedor",
        botParticipantMessageLabel: "Mensagem ao participar:",
        botParticipantMessagePlaceholder: "@{username} ✅ Você foi adicionado à lista do sorteio! Boa sorte! 🎁",
        botParticipantMessageHint: "Use {username} para substituir o nome do participante",
        saveBtn: "Salvar",
        participantsTitle: "Participantes",
        rollBtn: "🎲 Sortear",
        exportBtn: "Exportar lista",
        clearBtn: "Limpar lista",
        noParticipants: "Ainda não há participantes",
        awardsTitle: "🏆 Lista de Prêmios",
        refreshAwardsBtn: "🔄 Atualizar",
        awardsInstructions: "Digite DV Login e API Key, depois clique em \"🔄 Atualizar\" para ver a lista de prêmios",
        loadingAwards: "Carregando lista de prêmios...",
        noAwards: "Não há prêmios na lista",
        gameAPITitle: "🎮 Integração API do Jogo",
        gameDvLabel: "DV Login:",
        gameDvPlaceholder: "DV login",
        gameKeyLabel: "Chave API:",
        gameKeyPlaceholder: "Chave API",
        getBalanceBtn: "💰 Ver Saldo",
        getLastDonateBtn: "📝 Última Doação",
        getAwardsBtn: "🏆 Ver Prêmios",
        sendRewardLabel: "Enviar prêmio:",
        rewardTypeLabel: "Tipo:",
        rewardValueLabel: "Quantidade:",
        rewardPlayerLabel: "Nome do personagem:",
        rewardDescLabel: "Descrição (máx. 15 caracteres):",
        sendRewardBtn: "Enviar prêmio",
        chatTitle: "Chat",
        hideChatBtn: "Ocultar",
        showChatBtn: "Mostrar",
        clearChatBtn: "Limpar",
        winnerTitle: "🎉 Vencedor 🎉",
        waitingComment: "Aguardando comentário em:",
        seconds: "segundos",
        winnerMessagesTitle: "Mensagens do vencedor:",
        waitingMessage: "Aguardando comentário...",
        winnerCommented: "✅ Vencedor comentou!",
        rollAgainBtn: "🎲 Sortear Novamente",
        closeBtn: "Fechar",
        connected: "Conectado",
        disconnected: "Desconectado",
        error: "Erro",
        success: "Sucesso",
        info: "Informação"
    },
    es: {
        title: "🎁 Sistema de Sorteo Twitch",
        subtitle: "Sistema de gestión de sorteos con bot automatizado",
        channelInputLabel: "Nombre del Canal Twitch:",
        channelInputPlaceholder: "Ingrese el nombre del canal (ej: xqcow, pokimane)",
        connectBtn: "Conectar",
        disconnectBtn: "Desconectar",
        channelNotConnected: "No conectado",
        giveawayTitle: "🎁 Sorteo",
        keywordAndBotTitle: "⚙️ Configuración de Palabra Clave y Bot",
        keywordLabel: "Palabra clave del sorteo:",
        keywordPlaceholder: "Ingrese palabra clave (ej: !join, sorteo)",
        setKeywordBtn: "Establecer",
        disableKeywordBtn: "Desactivar",
        keywordActive: "Palabra clave activa:",
        keywordInactive: "Sorteo desactivado",
        botUsernameLabel: "Nombre de Usuario del Bot (para notificaciones):",
        botUsernamePlaceholder: "Nombre del bot Twitch",
        botOAuthLabel: "Token OAuth del Bot:",
        botOAuthPlaceholder: "oauth:xxxxx (de https://twitchtokengenerator.com)",
        botOAuthLink: "Obtener token en:",
        botMessageLabel: "Mensaje al sortear (ganador):",
        botMessagePlaceholder: "🎉 ¡{winner} ganó el sorteo!",
        botMessageHint: "Use {winner} para reemplazar el nombre del ganador",
        botParticipantMessageLabel: "Mensaje al unirse:",
        botParticipantMessagePlaceholder: "@{username} ✅ ¡Has sido agregado a la lista del sorteo! ¡Buena suerte! 🎁",
        botParticipantMessageHint: "Use {username} para reemplazar el nombre del participante",
        saveBtn: "Guardar",
        participantsTitle: "Participantes",
        rollBtn: "🎲 Sortear",
        exportBtn: "Exportar lista",
        clearBtn: "Limpiar lista",
        noParticipants: "Aún no hay participantes",
        awardsTitle: "🏆 Lista de Premios",
        refreshAwardsBtn: "🔄 Actualizar",
        awardsInstructions: "Ingrese DV Login y API Key, luego haga clic en \"🔄 Actualizar\" para ver la lista de premios",
        loadingAwards: "Cargando lista de premios...",
        noAwards: "No hay premios en la lista",
        gameAPITitle: "🎮 Integración API del Juego",
        gameDvLabel: "DV Login:",
        gameDvPlaceholder: "DV login",
        gameKeyLabel: "Clave API:",
        gameKeyPlaceholder: "Clave API",
        getBalanceBtn: "💰 Ver Saldo",
        getLastDonateBtn: "📝 Última Donación",
        getAwardsBtn: "🏆 Ver Premios",
        sendRewardLabel: "Enviar premio:",
        rewardTypeLabel: "Tipo:",
        rewardValueLabel: "Cantidad:",
        rewardPlayerLabel: "Nombre del personaje:",
        rewardDescLabel: "Descripción (máx. 15 caracteres):",
        sendRewardBtn: "Enviar premio",
        chatTitle: "Chat",
        hideChatBtn: "Ocultar",
        showChatBtn: "Mostrar",
        clearChatBtn: "Limpiar",
        winnerTitle: "🎉 Ganador 🎉",
        waitingComment: "Esperando comentario en:",
        seconds: "segundos",
        winnerMessagesTitle: "Mensajes del ganador:",
        waitingMessage: "Esperando comentario...",
        winnerCommented: "✅ ¡El ganador ha comentado!",
        rollAgainBtn: "🎲 Sortear Nuevamente",
        closeBtn: "Cerrar",
        connected: "Conectado",
        disconnected: "Desconectado",
        error: "Error",
        success: "Éxito",
        info: "Información"
    }
};

// Get current language from localStorage or default to Vietnamese
let currentLang = localStorage.getItem('app_language') || 'vi';

// Function to get translation
function t(key) {
    return translations[currentLang]?.[key] || translations['vi'][key] || key;
}

// Function to set language
function setLanguage(lang) {
    if (translations[lang]) {
        currentLang = lang;
        localStorage.setItem('app_language', lang);
        updateUI();
    }
}

// Function to update all UI text
function updateUI() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = t(key);
        if (el.tagName === 'INPUT' && el.type !== 'submit' && el.type !== 'button' && el.type !== 'password') {
            el.placeholder = text;
        } else if (el.tagName === 'LABEL' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'P' || el.tagName === 'SPAN' || el.tagName === 'SMALL' || el.tagName === 'BUTTON') {
            el.textContent = text;
        } else {
            el.textContent = text;
        }
    });
    
    // Update title and subtitle (both in language screen and main app)
    document.querySelectorAll('header h1, .language-content h1').forEach(titleEl => {
        titleEl.textContent = t('title');
    });
    document.querySelectorAll('header .subtitle, .language-content .subtitle').forEach(subtitleEl => {
        subtitleEl.textContent = t('subtitle');
    });
    
    // Update language select option text (keep values, update display)
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
        Array.from(langSelect.options).forEach(option => {
            const lang = option.value;
            if (lang === 'vi') option.textContent = '🇻🇳 Tiếng Việt';
            else if (lang === 'en') option.textContent = '🇺🇸 English';
            else if (lang === 'pt') option.textContent = '🇵🇹 Português';
            else if (lang === 'es') option.textContent = '🇪🇸 Español';
        });
    }
}

