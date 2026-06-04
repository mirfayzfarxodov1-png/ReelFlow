module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    ['@babel/plugin-transform-runtime', {
      helpers: true,
      regenerator: true,
    }],
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
