const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermission,
} = require("../middleware/authentication");
const {
  getAllUser,
  getUser,
  updateUser,
  updateUserPassword,
  showCurrentUser,
} = require("../controller/userController");
//authorizePermission é para checar se o user é admin, bem legal esse middlware, com ele da para ter roles dentro do site, e atribuir essas role para quem vc quiser
router
  .route("/")
  .get(authenticateUser, authorizePermission("admin"), getAllUser);

// como o authenticateUser armazena o user no req do express, da para pegar esse user e usar as infos para dar algum display, seja nome, foto e etc
router.route("/showMe").get(authenticateUser, showCurrentUser);
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/updateUserPassword").patch(authenticateUser, updateUserPassword);

//É importante esse cara ser o ultimo, pois, caso ele esteja acima dos outros ele reconhce que qualquer coisa depois do path do app é uma ID
//esse cara fica no params do express req.params
router.route("/:id").get(authenticateUser, getUser);
module.exports = router;
