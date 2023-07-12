const CustomErr = require("../errors");

/* basicamente todos que tiverm a role de ADIN consegue ter acesso depois da 
invocação dessa func, um exemplo dela esta la no get, 
onde somente o admin pode ver os outros user acessando a id */
const checkPermissions = (requestUser, resourceUserId) => {
  console.log(requestUser);
  console.log(resourceUserId);
  console.log(typeof resourceUserId);
  // user é admin? se sim ja pode retornar, se não continua pra proxima verificação
  if (requestUser.role === "admin") return;
  //como a userId vem como string tem de transformar em string
  if (requestUser.userId === resourceUserId.toString()) return;
  throw new CustomErr.UnauthorizedError("acesso não authorizado");
};

module.exports = checkPermissions;
