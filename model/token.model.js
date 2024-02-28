const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 900,
  },
  email: {
    type: String,
  },
});

module.exports = mongoose.model("Token", tokenSchema);