import type {
  CapacitorConfig,
} from "@capacitor/cli";

const config:
  CapacitorConfig = {
    appId:
      "com.vortex.music",

    appName:
      "Vortex",

    webDir:
      "mobile-dist",

    loggingBehavior:
      "debug",

    backgroundColor:
      "#070709",

    plugins: {
      CapacitorHttp: {
        enabled: true,
      },
    },
  };

export default config;
