const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name please"],
      tirm: true,
      maxlength: [100, "max 100 characters"],
    },
    price: { type: Number, required: [true, "price please"], default: 0 },
    description: {
      type: String,
      required: [true, "description please"],
      maxlength: [1000, "max 1000 characters"],
    },
    image: { type: String, default: "/uploads/example.jpeg" },
    category: {
      type: String,
      required: [true, "category please"],
      enum: ["office", "kitchen", "bedroom"],
    },
    company: {
      type: String,
      required: [true, "company please"],
      enum: { values: ["ikea", "liddy", "marcos"] },
      message: "{VALUE} is not supported",
    },
    colors: {
      type: [String],
      default: ["#222"],
      required: true,
    },
    featured: {
      type: [Boolean],
      default: false,
    },
    freeShiping: {
      type: [Boolean],
      default: false,
    },
    inventory: { type: Number, required: true, default: 15 },
    averageRating: { type: Number, default: 0 },
    numOfReviews: { type: Number, default: 0 },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// e aqui esta a logica para conseguir usar o populate do revies dentro do product, ja que não tem neunha ref ao reviews dentro desse schema
productSchema.virtual("reviews", {
  ref: "Reviews",
  localField: "_id",
  foreignField: "product",
  justOne: false,
  //tem como fazer um comparativo e checar por valores especificos que atendo instipulado nesse match
  // match:{rating:5}, isso buscaria pelos rating 5
});

//esse cara aqui quando o method deleteOne(), ele faz com que a review vinculada ao produto tambem seja removida, ja q o produto não existe mais
productSchema.pre("remove", async function (next) {
  await this.model("Reviews").deleteMany({ product: this._id });
});

module.exports = mongoose.model("Product", productSchema);
