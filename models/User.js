const mongoose = require("mongoose");

// Importing password decrypting library
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provde name"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, "Please Provide E-mail"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please Provide Valid E-mail",
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
  },
});

// Encrypting the password! "salt - combination" by middleware
UserSchema.pre("save", async function(next){
  
  // Here, this keyword indicates UserSchema class
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Generating the token in schema itself - Middleware!
UserSchema.methods.createJWT = function () {
  return jwt.sign(
    //We are getting the info from the above schema class!
    { userId: this._id, name: this.name },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
}

// Comparing the password which is used to logged in with the password in the database(Using Bcrypt JS).
UserSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

// Collection name
module.exports = mongoose.model("User", UserSchema)