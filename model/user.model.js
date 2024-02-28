const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
   email: {
      type: String,
      required: [true, "Please Provide Email"],
      unique: [true, "Email Already Exist"]
   },

   password: {
      type: String,
      required: [true, "Please Enter the Password"],
      unique: false
   },
   verified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetToken: String,
    resetTokenExpiration: Date,
});

module.exports = mongoose.model.Users || mongoose.model("Users", UserSchema);