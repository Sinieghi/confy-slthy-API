const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "provide rating please"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "provide review title please"],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, "provide review title please"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);
// essa sintax traz a possibilidade de limitar 1 review por user em cada produto, ou seja, evita usuarios estressados que queriam flodar as reviews
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

/*esse aproach funciona igual ao da comparePassword(), a diferença é que vc não precisa criar uma instancia ex: const user = User.find(), onde o user vira uma instância, na function 
e qual a vantagem de usar esse method? bom basicamente todos os methos citados abaixo dela vai trigar sua functionality, quais methods esses? "save, deleteOne", acredito que de
para usar em outros tambem, mas nesse caso só vamos usar esses 2. Equal é a functionality dentro desse cara? É conhecido como pipe line, onde basicamente vc tem acesso a varios
methods providos pelo mongoDB, no meu caso usei sum e avg onde um soma o numero de review e o outro avg tira media da avaliação do produto*/
reviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  console.log(result);
  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

reviewSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await this.constructor.calculateAverageRating(this.product);
  }
);

module.exports = mongoose.model("Reviews", reviewSchema);
