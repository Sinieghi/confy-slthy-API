const CustomErr = require("../errors");
const { isTokenValid } = require("../utils");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new CustomErr.UnauthenticatedError("Authentication invalid");
  }

  try {
    const { name, userId, role } = isTokenValid({ token });
    req.user = { name, userId, role };
  } catch (error) {
    throw new CustomErr.UnauthenticatedError("Authentication invalid");
  }
  next();
};
// com essa func precisa de argumento na invocação usa-se essa abordagem, on armazena todos os args dentro do objeto que tomou o spread...
const authorizePermission = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomErr.UnauthorizedError("Unauthorized");
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermission,
};
