const {
  getAllOrders,
  getOrders,
  getCurrentUserOrder,
  createOrder,
  updateOrder,
} = require("../controller/orderController");
const {
  authenticateUser,
  authorizePermission,
} = require("../middleware/authentication");

const express = require("express");
const router = express.Router();

router
  .route("/")
  .get(authenticateUser, authorizePermission("admin"), getAllOrders)
  .post(authenticateUser, createOrder);

router.route("/showAllMyOrder").get(authenticateUser, getCurrentUserOrder);

router
  .route("/:id")
  .get(authenticateUser, getOrders)
  .patch(authenticateUser, updateOrder);

module.exports = router;
