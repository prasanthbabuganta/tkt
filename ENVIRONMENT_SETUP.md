# Environment Configuration Setup

This document explains the improved environment configuration system for the TKT mobile application.

## Overview

The application now uses an **automatic environment detection system** that switches between local development and production APIs based on the React Native `__DEV__` flag.

## Architecture

### File Structure

```
tkt-mobile-app/
├── src/
│   └── config/
│       ├── environments.js     # Environment-specific configs (dev/prod)
│       ├── api.js             # Main API config (uses environments.js)
│       └── README.md          # Detailed configuration guide
├── .env.example               # Example environment variables
└── .gitignore                 # Ensures .env is not committed
```

### How It Works

1. **`environments.js`** - Defines configurations for each environment:
   - **Development**: `http://localhost:8080/api`
   - **Production**: `https://tkt-backend-186443551052.asia-south1.run.app/api`

2. **`api.js`** - Imports and uses the environment config:
   ```javascript
   import getEnvVars from './environments';
   const ENV = getEnvVars();
   export const API_CONFIG = {
     BASE_URL: ENV.BASE_URL,
     TIMEOUT: ENV.TIMEOUT,
   };
   ```

3. **Automatic Detection**:
   - When running `expo start` → `__DEV__ = true` → Uses development config
   - When building for production → `__DEV__ = false` → Uses production config

## Usage

### Default Setup (iOS Simulator)

No configuration needed! Just run:

```bash
cd tkt-mobile-app
npm start
```

The app will automatically use `http://localhost:8080/api`

### Android Emulator Setup

Android emulator cannot access `localhost`. Edit `src/config/environments.js`:

```javascript
development: {
  BASE_URL: 'http://10.0.2.2:8080/api',  // ← Change this line
  TIMEOUT: 30000,
  LOG_LEVEL: 'debug',
},
```

### Physical Device Setup

1. **Find your computer's IP address**:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1

   # Windows
   ipconfig
   ```
   Look for something like `192.168.1.100`

2. **Update the development config** in `src/config/environments.js`:
   ```javascript
   development: {
     BASE_URL: 'http://192.168.1.100:8080/api',  // ← Your computer's IP
     TIMEOUT: 30000,
     LOG_LEVEL: 'debug',
   },
   ```

3. **Ensure both devices are on the same WiFi network**

## Verification

When you start the app, check the console output:

**Development Mode:**
```
🔧 Running in DEVELOPMENT mode
📡 API URL: http://localhost:8080/api
```

**Production Mode:**
```
🚀 Running in PRODUCTION mode
📡 API URL: https://tkt-backend-186443551052.asia-south1.run.app/api
```

## Benefits

✅ **Automatic Switching** - No manual config changes when building for production
✅ **Type Safety** - Centralized configuration
✅ **Clear Documentation** - README in config folder
✅ **Git Safe** - `.env` files are gitignored
✅ **Team Friendly** - `.env.example` for team members
✅ **Debug Friendly** - Console logs show which environment is active

## Troubleshooting

### "Network Error" or Cannot Connect

1. ✅ Check backend is running on port 8080
2. ✅ Verify the URL in `environments.js` matches your platform:
   - iOS Simulator → `localhost:8080`
   - Android Emulator → `10.0.2.2:8080`
   - Physical Device → `<YOUR_IP>:8080`
3. ✅ Check firewall settings (allow port 8080)
4. ✅ For physical devices, ensure same WiFi network

### Wrong API URL Being Used

1. Check console output when app starts
2. Verify `__DEV__` flag is correct
3. Try clearing cache: `expo start -c`

### Need to Test Production API in Development

Edit `src/config/environments.js` and add a manual override:

```javascript
const FORCE_PRODUCTION = true;  // ← Add this line

const getEnvVars = () => {
  if (FORCE_PRODUCTION || !__DEV__) {
    return ENV.production;
  }
  return ENV.development;
};
```

## Migration Notes

### Before (Old System)
- Hardcoded production URL
- Required manual code changes to test locally
- Comments everywhere for different configurations

### After (New System)
- Automatic environment detection
- Single place to configure (`environments.js`)
- Clear documentation
- Git-safe with `.env` support

## Future Enhancements

Potential additions:
- **Staging Environment**: Add a third environment for staging/UAT
- **Feature Flags**: Add environment-specific feature toggles
- **API Versioning**: Support multiple API versions
- **Dynamic Configuration**: Load config from remote source

## See Also

- `tkt-mobile-app/src/config/README.md` - Detailed configuration guide
- `.env.example` - Environment variables template
