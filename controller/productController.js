const { StatusCodes } = require("http-status-codes");
const CunstomErr = require("../errors");
const Product = require("../models/Product");
const path = require("path");

const creteProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
  const queryObject = {};
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products, count: products.length });
};

const getProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId }).populate("reviews");
  if (!product) {
    throw new CunstomErr.NotFoundError(`Not found ${productId}`);
  }
  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findByIdAndUpdate(
    { _id: productId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!product) {
    throw new CunstomErr.NotFoundError(`Not found ${productId}`);
  }
  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });
  if (!product) {
    throw new CunstomErr.NotFoundError(`Not found ${productId}`);
  }

  await product.deleteOne();
  res.status(StatusCodes.OK).json({ msg: "removed" });
};
const uploadImage = async (req, res) => {
  console.log(req.files);
  if (!req.files) {
    throw new CunstomErr.BadRequestError("no image found");
  }
  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith("image")) {
    throw new CunstomErr.BadRequestError("please upload image");
  }
  const maxSize = 1024 * 1024;
  if (productImage.sez > maxSize) {
    throw new CunstomErr.BadRequestError("image is to big");
  }
  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  creteProduct,
};
