// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const reactNative = require("eslint-plugin-react-native");

module.exports = defineConfig([
  ...expoConfig, // Giải nén mảng expoConfig
  {
    plugins: {
      "react-native": reactNative,
    },
    rules: {
      // Quy tắc quan trọng nhất để sửa lỗi "Text strings must be rendered within a <Text> component"
      "react-native/no-raw-text": [
        "error",
        {
          skip: ["CustomButton", "SafeText"], // Bỏ qua các component tùy chỉnh nếu bạn chắc chắn chúng đã bọc Text bên trong
        },
      ],
      "react-native/no-inline-styles": "warn",
      "react-native/no-color-literals": "warn",
    },
  },
  {
    ignores: ["dist/*", ".expo/*", "node_modules/*"],
  },
]);
