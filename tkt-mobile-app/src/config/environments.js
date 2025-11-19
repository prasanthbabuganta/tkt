/**
 * Environment Configuration
 *
 * This file manages environment-specific configurations.
 * The environment is determined by the __DEV__ flag (React Native's built-in development flag).
 */

const ENV = {
  development: {
    BASE_URL: 'http://192.168.29.224:8080/api',
    TIMEOUT: 30000,
    LOG_LEVEL: 'debug',
  },
  production: {
    BASE_URL: 'https://tkt-backend-186443551052.asia-south1.run.app/api',
    TIMEOUT: 30000,
    LOG_LEVEL: 'error',
  },
};

/**
 * Get the current environment configuration
 * In React Native, __DEV__ is true when running in development mode
 */
const getEnvVars = () => {
  if (__DEV__) {
    console.log('🔧 Running in DEVELOPMENT mode');
    console.log('📡 API URL:', ENV.development.BASE_URL);
    return ENV.development;
  } else {
    console.log('🚀 Running in PRODUCTION mode');
    console.log('📡 API URL:', ENV.production.BASE_URL);
    return ENV.production;
  }
};

export default getEnvVars;
