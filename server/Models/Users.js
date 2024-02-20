const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: String,
    password: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
    },
    picture: String,
    displayName: String,
    ip: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("users", userSchema);
