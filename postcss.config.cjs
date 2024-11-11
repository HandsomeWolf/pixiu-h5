module.exports = {
  plugins: {
    "postcss-px-to-viewport-8-plugin": {
      viewportWidth: 750,
      exclude: [/node_modules\/vant/],
    },
  },
};
