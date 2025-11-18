# Build Environments Configuration

This document explains how to build and run the mobile app with different environment configurations.

## Overview

The app now supports three build environments:
- **Development**: Uses local backend server (`http://192.168.29.224:8080/api`)
- **Preview**: Uses production backend for testing (`https://tkt-backend-186443551052.asia-south1.run.app/api`)
- **Production**: Uses production backend (`https://tkt-backend-186443551052.asia-south1.run.app/api`)

## Configuration Files

### `app.config.js`
Dynamic configuration that reads the `APP_VARIANT` environment variable and sets the appropriate API URL.

### `eas.json`
Defines build profiles with environment variables:
- `development`: Sets `APP_VARIANT=development`
- `preview`: Sets `APP_VARIANT=preview`
- `production`: Sets `APP_VARIANT=production`

### `src/config/api.js`
Reads configuration from `expo-constants` and provides fallback for local Expo Go development.

## Local Development (Expo Go)

For local development with Expo Go, the app automatically uses the development API URL.

```bash
npm start
# or
npx expo start
```

The app will connect to `http://192.168.29.224:8080/api` in development mode.

**Note**: Make sure your backend server is running locally on port 8080.

## Building with EAS

### Development Build

Build a development client that connects to your local backend:

```bash
eas build --profile development --platform android
# or for iOS
eas build --profile development --platform ios
```

### Preview Build

Build a preview version that connects to production backend for testing:

```bash
eas build --profile preview --platform android
# or for iOS
eas build --profile preview --platform ios
```

### Production Build

Build the production version:

```bash
eas build --profile production --platform android
# or for iOS
eas build --profile production --platform ios
```

## Updating Local Network IP

If your local network IP changes, update the development API URL in two places:

1. **`app.config.js`** (line 38):
   ```javascript
   development: {
     apiUrl: 'http://YOUR_NEW_IP:8080/api',
     environment: 'development'
   }
   ```

2. **`src/config/api.js`** (line 12):
   ```javascript
   ? 'http://YOUR_NEW_IP:8080/api'  // Local development server
   ```

To find your current local IP:
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1
```

## Environment Verification

When running in development mode, you'll see console logs showing the current API configuration:

```
API Configuration: {
  baseUrl: 'http://192.168.29.224:8080/api',
  environment: 'development'
}
```

## Troubleshooting

### Cannot connect to local backend

1. Verify your backend is running on port 8080
2. Check your local network IP hasn't changed
3. Ensure your device/emulator is on the same network
4. For Android emulator, you may need to use `10.0.2.2` instead of the local IP

### Wrong API URL in build

1. Check that the correct `APP_VARIANT` is set in `eas.json`
2. Clear EAS cache: `eas build --clear-cache`
3. Verify `app.config.js` is exporting the correct configuration

## Backend Requirements

Make sure the backend is configured for the corresponding environment:

### Development Backend
```bash
cd tkt-backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Production Backend
The production backend runs on Google Cloud Run and is automatically configured.

## Additional Resources

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [EAS Build Configuration](https://docs.expo.dev/build/eas-json/)
- [Expo Constants API](https://docs.expo.dev/versions/latest/sdk/constants/)
