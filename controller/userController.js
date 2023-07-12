const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const CustomError = require("../errors");
const {
  setupTokenForUser,
  attachCookiesToResponse,
  checkPermissions,
} = require("../utils");

const getAllUser = async (req, res) => {
  // esse .select('-password') serve para remover o password do response, ou seja, o data enviado  tem assword, ja que isso é só um get para pegar os user para dar diplay
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json(users);
};

const getUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");

  if (!user) {
    throw new CustomError.NotFoundError(
      `user not found with that id : ${req.params.id}`
    );
  }

  // func para checar as permissions
  checkPermissions(req.user, user._id);

  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

//update
const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError("provide all values");
  }
  // const user = await User.findByIdAndUpdate(
  //   { _id: req.user.userId },
  //   { name, email },
  //   { new: true, runValidators: true }
  // );
  // substituindo a functinaliti do findByIdAndUpdate pelo save() method do mongoose
  const user = await User.findOne({ _id: req.user.userId });

  user.name = name;
  user.email = email;
  // o problema q esse method proca o harsh password, então temos de aplicar um statetment la no User.js para checar o q esta sendo modificado
  user.save();

  const tokenUser = setupTokenForUser(user);
  attachCookiesToResponse(res, tokenUser);
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

// new password
const updateUserPassword = async (req, res) => {
  const { newPassword, oldPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("provide all values");
  }
  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("invalid password");
  }
  user.password = newPassword;
  //esse cara aqui além de salvar a alteração ele triga a func bcrypt la no User.js, pre("save")
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "password updated" });
};
module.exports = {
  getAllUser,
  showCurrentUser,
  getUser,
  updateUserPassword,
  updateUser,
};
