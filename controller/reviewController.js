const { StatusCodes } = require("http-status-codes");
const CustomErr = require("../errors");
const Review = require("../models/reviews");
const Product = require("../models/Product");
const { checkPermissions } = require("../utils");

const createReviews = async (req, res) => {
  const { product: productId } = req.body;

  //trousse o Product para checar se o usuario realmante adquiriu tal produto
  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct) {
    throw new CustomErr.NotFoundError("user does not match");
  }
  //checar se o usuario ja deixou uma review no produto
  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });
  if (alreadySubmitted) {
    throw new CustomErr.BadRequestError("already submitted");
  }

  // so lembrando que esse cara coloca a id do user dentro do user criado nesse req.body.user
  req.body.user = req.user.userId;
  console.log(req.body.user, isValidProduct);
  const review = await Review.create(req.body);
  res.status(StatusCodes.OK).json({ review });
};

const getAllReviews = async (req, res) => {
  /*method novo "populate", ele basicamente pega as ref:"xxx" setadas la no schema para atribuir ao array novo, como nesse get, pegando essa ref no path
  tu usa o select para pegar as props do schema referenciado, mas para isso acontecer vc tem de referenciar eles no schema no caso 
  como acontece no schema das reviews, tem a ref do user e do products nele, por isso esse link. Caso não tenha a ref no schema
  existe um outro metodo, vou aplicalo no schema do product que não tem ref ao reviews, começa na linha 50, logo depois do timeStamp */
  const reviews = await Review.find({})
    .populate({ path: "product", select: "name company price" })
    .populate({ path: "user", select: "name" });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getReviews = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomErr.NotFoundError("no reviews found");
  }

  res.status(StatusCodes.OK).json({ review });
};

const deleteReviews = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomErr.NotFoundError("no reviews found");
  }

  checkPermissions(req.user, review.user);

  await review.deleteOne();
  res.status(StatusCodes.OK).json("review deleted");
};

const updateReviews = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;

  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomErr.NotFoundError("no reviews found");
  }
  checkPermissions(req.user, review.user);
  review.rating = rating;
  review.title = title;
  review.comment = comment;
  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

/*esse controller esta com a rota la no product, graças ao
.populete("reviews") la no getProduct, 
assim então pode-se ter acesso a reviw do product sem 
precisar linkar no schema, ou seja, caso o 
link não tenh sido estabelecido no inicio para evitar buggs no 
servidor e perdas de data usa-se esse aproach para 'linkar' os schemas */
const getSingleProductReview = async (req, res) => {
  const { id: productId } = req.params;
  const review = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ review, count: review.length });
};

module.exports = {
  getAllReviews,
  getReviews,
  deleteReviews,
  updateReviews,
  createReviews,
  getSingleProductReview,
};
