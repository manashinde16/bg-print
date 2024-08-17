module.exports = {
  root: true,
  extends: '@react-native',
  parser: '@babel/eslint-parser', // Use Babel's parser
  parserOptions: {
    requireConfigFile: false, // Disable the need for a Babel config file
    babelOptions: {
      presets: ['module:metro-react-native-babel-preset'], // Ensure Babel uses the correct preset
    },
  },
  plugins: ['react', 'react-native'], // Add React and React Native plugins
  env: {
    'react-native/react-native': true,
  },
  rules: {
    // You can add custom rules here if needed
  },
};
