const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authentication");
const {
  getAllReviews,
  getReviews,
  deleteReviews,
  updateReviews,
  createReviews,
} = require("../controller/reviewController");

router.route("/").get(getAllReviews).post(authenticateUser, createReviews);

router
  .route("/:id")
  .get(getReviews)
  .patch(authenticateUser, updateReviews)
  .delete(authenticateUser, deleteReviews);

module.exports = router;
