# Configuration Guide

This directory contains the API configuration and environment management for the app.

## Files

- **`environments.js`** - Defines development and production environment configs
- **`api.js`** - Exports the API configuration based on current environment

## How It Works

The app automatically selects the correct environment based on React Native's `__DEV__` flag:

- **Development Mode** (`npm start` / `expo start`): Uses `http://localhost:8080/api`
- **Production Build** (`expo build`): Uses production URL

## Testing on Different Platforms

### iOS Simulator
✅ Works out of the box with `localhost:8080`

```javascript
// environments.js - development config (default)
BASE_URL: 'http://localhost:8080/api'
```

### Android Emulator
⚠️ Android emulator can't access `localhost` - use `10.0.2.2` instead

```javascript
// environments.js - modify development config
BASE_URL: 'http://10.0.2.2:8080/api'
```

### Physical Device (iPhone/Android)
⚠️ Physical devices need your computer's IP address

1. Find your computer's IP:
   - **Mac/Linux**: Run `ifconfig` and look for your local network IP (usually 192.168.x.x)
   - **Windows**: Run `ipconfig` and look for IPv4 Address

2. Update the development config:
   ```javascript
   // environments.js - modify development config
   BASE_URL: 'http://192.168.1.100:8080/api'  // Replace with your IP
   ```

3. Make sure your phone and computer are on the same WiFi network

## Quick Setup Examples

### Example 1: Testing on iOS Simulator (Default)
No changes needed! Just run:
```bash
npm start
# or
expo start
```

### Example 2: Testing on Android Emulator
Edit `src/config/environments.js`:
```javascript
development: {
  BASE_URL: 'http://10.0.2.2:8080/api',  // Changed from localhost
  TIMEOUT: 30000,
  LOG_LEVEL: 'debug',
},
```

### Example 3: Testing on Physical Device
1. Find your IP: `ifconfig` (look for something like 192.168.1.100)
2. Edit `src/config/environments.js`:
```javascript
development: {
  BASE_URL: 'http://192.168.1.100:8080/api',  // Your computer's IP
  TIMEOUT: 30000,
  LOG_LEVEL: 'debug',
},
```

## Environment Variables

For team development, you can optionally use a `.env` file:

1. Copy `.env.example` to `.env`
2. Uncomment and set your values
3. Install `react-native-dotenv` if you want to use .env files

## Switching Between Environments

### Development → Production
Just build the app for production:
```bash
expo build:android
# or
expo build:ios
```

The `__DEV__` flag will automatically be `false`, switching to production URL.

### Force Production Mode in Development
Edit `environments.js` and add a manual override:
```javascript
const FORCE_PRODUCTION = false;  // Set to true to test production API

const getEnvVars = () => {
  if (FORCE_PRODUCTION || !__DEV__) {
    return ENV.production;
  }
  return ENV.development;
};
```

## Debugging

Check the console when the app starts. You should see:
```
🔧 Running in DEVELOPMENT mode
📡 API URL: http://localhost:8080/api
```

or

```
🚀 Running in PRODUCTION mode
📡 API URL: https://tkt-backend-186443551052.asia-south1.run.app/api
```

## Troubleshooting

### "Network Error" or "Connection Refused"

1. **Check backend is running**: Ensure your Spring Boot backend is running on port 8080
2. **Check URL matches your platform**:
   - iOS Simulator → `localhost:8080`
   - Android Emulator → `10.0.2.2:8080`
   - Physical Device → `<YOUR_IP>:8080`
3. **Check firewall**: Make sure port 8080 is not blocked
4. **Same network**: For physical devices, ensure phone and computer are on same WiFi

### "Request failed with status code 500"

The connection is working, but there's a backend error. Check:
1. Backend console logs (IntelliJ IDEA)
2. Mobile app console for detailed error response
3. Check if endpoint exists and is properly configured

### Wrong API being called

Check the console output - it shows which API URL is being used. If it's wrong:
1. Verify `__DEV__` flag is set correctly
2. Check `environments.js` configuration
3. Try restarting the bundler: `expo start -c` (clear cache)
