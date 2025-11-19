import getEnvVars from './environments';

/**
 * API Configuration
 *
 * Automatically uses the correct API URL based on environment:
 * - Development (__DEV__ = true): http://localhost:8080/api
 * - Production (__DEV__ = false): https://tkt-backend-186443551052.asia-south1.run.app/api
 *
 * Note: If testing on Android Emulator or Physical Device, you may need to manually
 * override the BASE_URL in environments.js development config:
 * - Android Emulator: http://10.0.2.2:8080/api
 * - Physical Device: http://<YOUR_COMPUTER_IP>:8080/api (e.g., http://192.168.1.100:8080/api)
 */

const ENV = getEnvVars();

export const API_CONFIG = {
  BASE_URL: ENV.BASE_URL,
  TIMEOUT: ENV.TIMEOUT,
};

// Default admin credentials (for reference)
export const DEFAULT_ADMIN = {
  MOBILE: '9133733197',
  PIN: '777777',
};
