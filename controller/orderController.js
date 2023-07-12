const Order = require("../models/Order");
const Product = require("../models/Product");
const { BadRequestError, NotFoundError } = require("../errors");
const { StatusCodes } = require("http-status-codes");
const { checkPermissions } = require("../utils");

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "someRandomValue";
  return { client_secret, amount };
};

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;
  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError("no item in the cart");
  }
  if (!tax || !shippingFee) {
    throw new BadRequestError("please provide tax and shipping fee");
  }
  let orderItems = [];
  let subtotal = 0;

  //aqui usa o for of, por conta de ter uma func async, map e foreach n aceita await, item é o arary que vai conter o cartItem dentro
  for (const item of cartItems) {
    /*item vira o cartItems, cartItems era o items, items é o que vem do front, e ao chegar aqui passamos ele para cartitems items:cartItms e depois para item com o for of
    e com isso monta essa nova const com a ref da ID que esta vindo do front*/
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new NotFoundError(`No product with id: ${item.product}`);
    }
    const { name, price, image, _id } = dbProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    //add item to order
    orderItems = [...orderItems, singleOrderItem];
    //calculate subtotal
    subtotal += item.amount * price;
  }
  //calculate total paymente
  const total = tax + shippingFee + subtotal;
  // get client secret, simulando uma stripe func, essa func esta nesse file linha 8, isso é para simuar o stripe
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "brl",
  });
  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};

//aqui basicamente é para confirmar o pagamento do user
const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new NotFoundError("no order found");
  }
  checkPermissions(req.user, order.user);
  order.paymentIntent = paymentIntentId;
  order.status = "paid";
  await order.save();
  res.status(StatusCodes.OK).json({ order });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find(req.body);

  res.status(StatusCodes.OK).json({ orders });
};

const getOrders = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new NotFoundError("no order found");
  }
  checkPermissions(req.user, order.user);

  res.status(StatusCodes.OK).json({ order });
};
const getCurrentUserOrder = async (req, res) => {
  const order = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ order, count: order.length });
};

module.exports = {
  getAllOrders,
  getOrders,
  getCurrentUserOrder,
  createOrder,
  updateOrder,
};
