const {
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  creteProduct,
} = require("../controller/productController");

// file de router vindo de outro controller, abordagem para conseguir implementar a reviews no array do products, ja que não estão linkados no schema
const { getSingleProductReview } = require("../controller/reviewController");

const express = require("express");
const {
  authenticateUser,
  authorizePermission,
} = require("../middleware/authentication");
const router = express.Router();

router
  .route("/")
  .post([authenticateUser, authorizePermission("admin")], creteProduct)
  .get(getAllProducts);

router
  .route("/uploadImage")
  .post([authenticateUser, authorizePermission("admin")], uploadImage);

router
  .route("/:id")
  .get(getProduct)
  .patch([authenticateUser, authorizePermission("admin")], updateProduct)
  .delete([authenticateUser, authorizePermission("admin")], deleteProduct);

//interação dificil essa, tem de colocar o .populate("reviews") no productController e com isso vc pode trazer uma rota direta do controller review para ca
router.route("/:id/reviews").get(getSingleProductReview);

// router.route("/:id/reviews").get(getSingleProductReviews);

module.exports = router;
