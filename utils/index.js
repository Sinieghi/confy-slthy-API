const checkPermissions = require("./checkPermissios");
const setupTokenForUser = require("./createTokenUser");
const { creatJWT, isTokenValid, attachCookiesToResponse } = require("./jwt");

module.exports = {
  creatJWT,
  isTokenValid,
  attachCookiesToResponse,
  setupTokenForUser,
  checkPermissions,
};
