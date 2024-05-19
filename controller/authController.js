const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

//jwt token creator
const maxAge = 3 * 24 * 60 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_TOKEN, {
    expiresIn: maxAge,
  });
};

//handle authentication errors
const handleLoginErrors = (err) => {
  // console.log(err.message, err.code);
  let errors = { email: "", password: "" };

  // incorrect email during login
  if (err.message === "Incorrect Email") {
    errors.email = "Provided email is not registered";
  }

  // incorrect password during login
  if (err.message === "Incorrect Password") {
    errors.password = "Password is incorrect";
  }

  //empty email case for login
  if (err.message == "Both Empty" || err.message == "Email Empty") {
    errors.email = "Please enter your email.";
  }

  //empty password case for login
  if (err.message == "Both Empty" || err.message == "Password Empty") {
    errors.password = "Please enter your password.";
  }
  return errors;
};

//handling errors that might occur during registration
const handleSignInErrors = (err) => {
  let errors = {
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    password: "",
  };
  //duplicate error code during signup
  if (err.code === 11000) {
    errors.email = "Provided email is already registered";
    return errors;
  }

  //validation errors during signup
  if (err.message.includes("UserCreds validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

module.exports.register = async (req, res) => {
  try {
    //get and store form data  inside variables
    const { firstName, lastName, emailAddress, number, password } = req.body;
    //create a user in the database
    const user = await User.create({
      firstName: firstName,
      lastName: lastName,
      email: emailAddress,
      contact: number,
      password: password,
    });
    //logger
    console.log("New User Signed in as: ");
    const {
      firstName: _firstName,
      lastName: _lastName,
      email: _email,
      contact: _mobileNumber,
    } = user;
    const userData = { _firstName, _lastName, _email, _mobileNumber };
    console.log(userData);
    //create a unique token and send it to client
    const token = createToken(user._id);
    res.cookie("authToken", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: maxAge * 1000,
    });
    res.status(200).json({ userData });
  } catch (error) {
    const signInErrors = handleSignInErrors(error);
    res.status(200).json({ signInErrors });
  }
};

module.exports.login = async (req, res) => {
  try {
    //get and store form data inside variables
    const { emailAddress, password } = req.body;
    const user = await User.login(emailAddress, password);
    //logger
    console.log("Logged in as: ");
    const {
      firstName: _firstName,
      lastName: _lastName,
      email: _email,
      contact: _mobileNumber,
    } = user;
    const userData = { _firstName, _lastName, _email, _mobileNumber };
    console.log(userData);
    //create a unique token and send it to client
    const token = createToken(user._id);
    res.cookie("authToken", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: maxAge * 1000,
    });
    res.status(200).json({ userData });
  } catch (error) {
    const logInErrors = handleLoginErrors(error);
    res.status(200).json({ logInErrors });
  }
};

module.exports.verifysUser = (req, res) => {
  const token = req.cookies.authToken;
  if (token) {
    jwt.verify(token, process.env.SECRET_TOKEN, async (err, decodedToken) => {
      if (err) {
        res.status(200).json({ userData: null });
      } else {
        const user = await User.findById(decodedToken.id);
        const {
          firstName: _firstName,
          lastName: _lastName,
          email: _email,
          contact: _mobileNumber,
        } = user;
        const userData = { _firstName, _lastName, _email, _mobileNumber };
        res.status(200).json({ userData });
      }
    });
  } else {
    res.status(200).json({ userData: null });
  }
};

module.exports.logout = (req, res) => {
  try {
    res.clearCookie("authToken", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    res.status(200).json({ message: "Logout Successful" });
  } catch (error) {
    res.status(200).json({ message: "Unable to send cookie" });
  }
};

//health check
module.exports.Welcome = (req, res) => {
  res.status(200).json("OK");
};
