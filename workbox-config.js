module.exports = {
  skipWaiting: true,
  clientsClaim: true,
  globDirectory: "public/",
  globPatterns: ["**/*.{css,js,html}"],
  swDest: "public/sw.js",
};
