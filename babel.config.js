module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      ['@babel/plugin-transform-class-properties', {loose: true}],
      ['@babel/plugin-transform-private-methods', {loose: true}],
      ['@babel/plugin-transform-private-property-in-object', {loose: true}],
      ['transform-inline-environment-variables'],
      [
        'module:react-native-dotenv',
        {
          moduleName: 'react-native-dotenv',
          path: '.env',
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
