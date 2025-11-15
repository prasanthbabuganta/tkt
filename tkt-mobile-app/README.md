# The King's Temple - Vehicle Management App

A modern React Native app built with Expo for managing vehicle attendance at The King's Temple.

## 🚀 Tech Stack

- **Expo SDK 54** (React Native 0.81.4)
- **React 19.1.0**
- **Redux Toolkit 2.10.1** for state management
- **React Navigation 7** for navigation
- **Axios 1.7.9** for API calls
- **Expo Secure Store** for secure token storage

## 📱 Features

### 🏠 Home Screen
- Real-time dashboard with today's statistics
- Search vehicles by number with live results
- View total arrivals, registered vehicles, and pending count

### ➕ Register Vehicle
- Register new vehicles with owner details
- Support for both CAR and BIKE types
- Indian vehicle number format validation (e.g., KA01AB1234)
- Form validation with user-friendly error messages

### ✅ Attendance/Ticking
- View all unmarked vehicles for today
- Quick one-tap marking of vehicle arrivals
- Real-time list updates after marking
- Pull-to-refresh functionality

### 📅 Daily History
- View attendance records by date
- Date picker for historical data
- Summary statistics (arrivals, total vehicles, absent)
- Detailed visit information with timestamps

## 🔐 Authentication

- **Login**: Mobile number (10 digits) + PIN (6 digits)
- **JWT Tokens**: Access token (30 days) + Refresh token (60 days)
- **Auto Token Refresh**: Handles expired tokens automatically
- **Secure Storage**: All tokens stored in Expo Secure Store

**Default Admin Credentials:**
- Mobile: `9133733197`
- PIN: `777777`

## ⚙️ Configuration

### 1. Backend URL

Update the backend URL in `src/config/api.js`:

\`\`\`javascript
export const API_CONFIG = {
  BASE_URL: 'http://your-server:8080/api', // Change this
  TIMEOUT: 30000,
};
\`\`\`

### 2. App Branding

Update app name and package identifiers in `app.json`:

\`\`\`json
{
  "expo": {
    "name": "The King's Temple",
    "slug": "the-kings-temple-app",
    "ios": {
      "bundleIdentifier": "com.kingstemple.app"
    },
    "android": {
      "package": "com.kingstemple.app"
    }
  }
}
\`\`\`

### 3. Splash Screen & Icons

Replace default assets in the `assets/` folder:
- `splash.png` - Splash screen image
- `icon.png` - App icon
- `adaptive-icon.png` - Android adaptive icon
- `favicon.png` - Web favicon

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 20+ installed
- Expo CLI installed globally: \`npm install -g expo-cli\`
- Expo Go app on your mobile device (for testing)

### Installation Steps

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd the-kings-temple-app
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install --legacy-peer-deps
   \`\`\`

3. **Configure backend URL**
   - Edit \`src/config/api.js\`
   - Update \`BASE_URL\` to your backend server

4. **Start the development server**
   \`\`\`bash
   npm start
   \`\`\`

5. **Run on device**
   - Scan QR code with Expo Go app (Android)
   - Or scan with Camera app (iOS)

   Or use:
   - \`npm run android\` - Run on Android emulator
   - \`npm run ios\` - Run on iOS simulator
   - \`npm run web\` - Run in web browser

## 📁 Project Structure

\`\`\`
the-kings-temple-app/
├── src/
│   ├── config/          # Configuration files
│   │   └── api.js       # API base URL and settings
│   ├── services/        # API service layer
│   │   └── api.js       # Axios instance and API calls
│   ├── store/           # Redux store
│   │   └── store.js     # Store configuration
│   ├── slices/          # Redux slices
│   │   ├── authSlice.js
│   │   ├── vehicleSlice.js
│   │   └── attendanceSlice.js
│   ├── screens/         # App screens
│   │   ├── SplashScreen.js
│   │   ├── LoginScreen.js
│   │   ├── HomeScreen.js
│   │   ├── RegisterVehicleScreen.js
│   │   ├── AttendanceScreen.js
│   │   └── HistoryScreen.js
│   └── navigation/      # Navigation setup
│       └── MainNavigator.js
├── assets/              # Images and icons
├── App.js              # Root component
├── app.json            # Expo configuration
├── package.json        # Dependencies
└── README.md           # This file
\`\`\`

## 🎨 Design System

### Colors
- **Primary**: #6366F1 (Indigo)
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Amber)
- **Background**: #F9FAFB (Gray 50)
- **Text Primary**: #1F2937 (Gray 800)
- **Text Secondary**: #6B7280 (Gray 500)

### Typography
- **Title**: 24-32px, Bold
- **Heading**: 18-20px, Bold
- **Body**: 14-16px, Regular
- **Small**: 12px, Regular

## 🔄 State Management

The app uses Redux Toolkit for state management:

- **Auth State**: User authentication, tokens, login/logout
- **Vehicle State**: Vehicle list, search results, registration
- **Attendance State**: Unmarked vehicles, today's visits, marking

## 🌐 API Integration

All API endpoints are defined in \`src/services/api.js\`:

- **Auth**: Login, token refresh
- **Vehicles**: List, search, register
- **Attendance**: Mark arrival, get unmarked, get visits
- **Reports**: Daily reports, date range reports
- **Users**: User management (Admin only)

Refer to \`API_GUIDE.md\` for complete API documentation.

## 🐛 Troubleshooting

### Network Error
- Ensure backend server is running
- Check \`BASE_URL\` in \`src/config/api.js\`
- Verify you're on the same network (for local development)

### Login Issues
- Verify credentials (default: 9133733197 / 777777)
- Check backend logs for errors
- Ensure tokens are being returned correctly

### Build Issues
- Clear npm cache: \`npm cache clean --force\`
- Delete \`node_modules\` and reinstall: \`rm -rf node_modules && npm install --legacy-peer-deps\`
- Clear Expo cache: \`expo start -c\`

## 📝 Development Notes

- **Legacy Peer Deps**: Use \`--legacy-peer-deps\` flag due to React 19 compatibility
- **Token Security**: Never commit real credentials or tokens to version control
- **Error Handling**: All API errors are displayed via Alert dialogs
- **Offline Support**: App requires network connection for all features

## 🚢 Building for Production

### Android APK
\`\`\`bash
expo build:android
\`\`\`

### iOS IPA
\`\`\`bash
expo build:ios
\`\`\`

### Using EAS Build (Recommended)
\`\`\`bash
eas build --platform android
eas build --platform ios
\`\`\`

## 📄 License

Private - The King's Temple Church

## 🤝 Support

For issues or questions, please refer to the API documentation or contact the development team.

---

**Built with ❤️ for The King's Temple**
