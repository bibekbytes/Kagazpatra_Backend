const { Router } = require("express");
const authController = require("../controller/authController");

const route = Router();

route.post("/register", authController.register);
route.post("/login", authController.login);
route.get("/verifyUser", authController.verifysUser);
route.get("/logout", authController.logout);
route.get("/welcome", authController.Welcome);

module.exports = route;
