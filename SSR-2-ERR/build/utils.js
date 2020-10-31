const path = require("path");
exports.resolve = dir => {
  return  path.resolve(__dirname, dir);
};
