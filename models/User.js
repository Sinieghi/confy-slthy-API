const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const userSchemar = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "provide name"],
    minlength: 3,
  },
  password: {
    type: String,
    required: [true, "provide password"],
    minlength: 6,
  },
  email: {
    type: String,
    required: [true, "provide email"],
    unique: true,
    //outro aproach para email unico
    validate: {
      validator: validator.isEmail,
      message: "please provide valid email",
    },
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});
//"pre save" isso sempre acontece antes de salvar
userSchemar.pre("save", async function () {
  // aqui checa qual esta sendo modificado
  console.log(this.modifiedPaths());
  //aqui aponta se o value no parametro esta sendo modificado
  console.log(this.isModified("password"));

  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

userSchemar.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);

  return isMatch;
};

module.exports = mongoose.model("User", userSchemar);
