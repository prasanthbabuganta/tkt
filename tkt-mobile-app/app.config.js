// Dynamic configuration based on build environment
const getConfig = () => {
  const APP_VARIANT = process.env.APP_VARIANT || 'development';

  // Base configuration from app.json
  const baseConfig = {
    name: "The King's Temple",
    slug: "the-kings-temple-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#000000"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.kingstemple.app"
    },
    android: {
      icon: "./assets/icon.png",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#000000"
      },
      package: "com.kingstemple.app"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "e5bbdf31-05f4-4874-a34f-85cc84712b3f"
      }
    },
    owner: "yuwatechsolutions"
  };

  // Environment-specific configuration
  const envConfig = {
    development: {
      apiUrl: 'http://192.168.29.224:8080/api',
      environment: 'development'
    },
    preview: {
      apiUrl: 'https://tkt-backend-186443551052.asia-south1.run.app/api',
      environment: 'preview'
    },
    production: {
      apiUrl: 'https://tkt-backend-186443551052.asia-south1.run.app/api',
      environment: 'production'
    }
  };

  // Merge environment-specific config into base config
  return {
    ...baseConfig,
    extra: {
      ...baseConfig.extra,
      ...envConfig[APP_VARIANT]
    }
  };
};

export default ({ config }) => {
  return getConfig();
};
