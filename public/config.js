// Configuration file for production deployment
// Update this file with your backend URL when deploying

const CONFIG = {
    // Backend server URL
    // For local development: leave empty or use 'http://localhost:3000'
    // For production: use your backend URL (e.g., 'https://your-backend.railway.app')
    BACKEND_URL: '', // Empty = same origin (for local development)
    
    // Socket.IO connection options
    SOCKET_OPTIONS: {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}


