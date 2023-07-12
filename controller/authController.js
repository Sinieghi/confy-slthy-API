const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse, setupTokenForUser } = require("../utils");

const register = async (req, res) => {
  const { email, name, password } = req.body;
  const emailAlreadyExiste = await User.findOne({ email });
  if (emailAlreadyExiste) {
    throw new CustomError.BadRequestError("email already existe");
  }
  //first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const user = await User.create({ email, name, password, role });

  const tokenUser = setupTokenForUser(user);

  // const token = creatJWT({ payload: tokenUser });, o cookie vai atribuir esse valor agora, esta la no utils essa atribuição

  //atribuindo o cookie ao usuario registrado
  // const oneDay = 1000 * 60 * 60 * 24;
  // res.cookie("token", token, {
  //   httpOnly: true,
  //   expires: new Date(Date.now() + oneDay),
  // });

  //resolvi invocar essa func mandando parametro do argumeto ao invés de objects, a diferença é que aqui tem de estar na ordem certa, e no caso do objeto tem de estar com o mesmo nome
  attachCookiesToResponse(res, tokenUser);

  // só para lembrar nã é esse cara que manda para o servidor, o responsavel por mandar para o server é o User, ou seja, User.creat
  res.status(StatusCodes.CREATED).json({ user });
};
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError("provide all values");
  }

  let user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError("invalid credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("password does not match");
  }

  const tokenUser = setupTokenForUser(user);
  attachCookiesToResponse(res, tokenUser);

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "user logout" });
};

module.exports = { login, register, logout };
