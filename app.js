require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();

//DB
const connectDB = require("./db/connect");
//custom middleware
const notFound = require("./middleware/not-found");
const errorHandler = require("./middleware/error-handler");
//rest of packages
const morgan = require("morgan");
const cookieParse = require("cookie-parser");
const fileUpload = require("express-fileupload");
const rateLimite = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");

//router
const authRouter = require("./routers/authRoutes");
const userRouter = require("./routers/userRouters");
const productRouter = require("./routers/productRoutes");
const reviewRouter = require("./routers/reviewsRoutes");
const orderRouter = require("./routers/orderRouter");

app.set("trust proxy", 1);
app.use(
  rateLimite({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

//esse morgan serve para mostrar a rota que vc esta usando get,post e etc, muito bom para procurar bugs
app.use(morgan("tiny"));
//express middleware
app.use(express.json());
//aqui vc ganha acesso aos cookies no req.cookies, cookies é um armazenamento de dados no browser, parece o local storage
app.use(cookieParse(process.env.JWT_SECRET));

app.use(express.static("./public"));
app.use(fileUpload());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);
//esses erros ele só acontece se as rotas da router section n estiverem rorretas no navegador, caso esteja essa parte do code n chega a ser lida, por isso eles fica aqui embaixo
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log(`on ${port}`));
  } catch (error) {
    console.log(error);
  }
};
start();
