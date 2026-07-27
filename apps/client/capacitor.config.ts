import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "no.norsklaere.app",
  appName: "Norsk Lære",
  webDir: "dist",
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: "Library/CapacitorDatabase",
      iosIsEncryption: false,
      androidIsEncryption: false,
      androidBiometric: {
        biometricAuth: false,
      },
    },
  },
};

export default config;
