const jwt = require("jsonwebtoken");

//transformar esse parametros em objeto faz com q o parametro aceite os argumentos em qualuqer ordem
const creatJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

//aqui eu recebi parametro ao invés de objetos no parametro da func, isso acontece quando vc invoca ela sem os {} ou [], só tem que prestar atenção q desse jeito tem de estar na ordem certa os arugumento
const attachCookiesToResponse = (res, user) => {
  const token = creatJWT({ payload: user });
  const oneDay = 1000 * 60 * 60 * 24;
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

module.exports = { creatJWT, isTokenValid, attachCookiesToResponse };
