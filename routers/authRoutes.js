const { login, logout, register } = require("../controller/authController");
const express = require("express");
const router = express.Router();

router.get("/logout", logout);
router.post("/register", register);
router.post("/login", login);
module.exports = router;
