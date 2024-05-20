const express = require("express");
const routes = require("./routes/authRoutes");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const db_URI = process.env.DB_URI;

const start = async () => {
  try {
    await mongoose.connect(db_URI).then((result) => {
      app.listen(4000, "0.0.0.0");
      app.use(
        cors({
          origin: process.env.ORIGIN,
          credentials: true,
        })
      );
      app.use(express.json());
      app.use(cookieParser());
      app.use(routes);
    });
  } catch (error) {
    console.log(error);
    console.log("Error occured while connecting to database");
  }
};

start();
