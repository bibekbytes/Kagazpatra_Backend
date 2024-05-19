const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please enter your first name"],
    lowercase: true,
  },
  lastName: {
    type: String,
    required: [true, "Please enter your last name"],
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Please enter a valid email"],
  },
  contact: {
    type: String,
    required: [true, "Please enter your number"],
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: [6, "Minimum password length is 6 characters"],
  },
});

UserSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//static method to login user
//static method to login user
UserSchema.statics.login = async function (email, password) {
  if (!email && !password) {
    throw Error("Both Empty");
  } else if (!email) {
    throw Error("Email Empty");
  } else if (!password) {
    throw Error("Password Empty");
  } else {
    const user = await this.findOne({ email });
    if (user) {
      const auth = await bcrypt.compare(password, user.password);
      if (auth) {
        return user;
      }
      throw Error("Incorrect Password");
    }
    throw Error("Incorrect Email");
  }
};

const User = mongoose.model("UserCreds", UserSchema);
module.exports = User;
