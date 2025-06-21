// Environment-specific configuration
const config = {
    development: {
        API_BASE_URL: 'http://localhost:8000',
        ENVIRONMENT: 'development'
    },
    production: {
        API_BASE_URL: '/api',  // Use proxy for all non-local environments
        ENVIRONMENT: 'production'
    }
};

// Simple environment detection - localhost or production
const getEnvironment = () => {
    // Check if running on localhost
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
        return 'development';
    }
    
    // Everything else is production (Docker, K8s, etc.)
    return 'production';
};

// Get current configuration
const getCurrentConfig = () => {
    const environment = getEnvironment();
    console.log(`Environment detected: ${environment}`);
    return config[environment];
};

// Export configuration
window.APP_CONFIG = getCurrentConfig();
