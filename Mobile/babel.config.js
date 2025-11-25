module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": "./",
          },
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        },
      ],
    ],
  };
};
// suggerer par chatgpt prompt: "in a react native project using typescript, how to configure babel to use absolute imports with @ as root alias" pour regler mes erreurs de routing.