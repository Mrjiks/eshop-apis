import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authJwt from "./helpers/jwt.js";
import errorHandler from "./helpers/error-handlers.js";

//Routes
import categoriesRoutes from "./routes/categories.js";
import productsRoutes from "./routes/products.js";
import usersRoutes from "./routes/users.js";
import ordersRoutes from "./routes/orders.js";

const app = express();
dotenv.config();
app.use(cors());
app.options("*", cors());

//middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use(errorHandler);

//Database
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "eshop-database",
  })
  .then(() => {
    console.log("Database is connected and ready to be queried!");
  })
  .catch((err) => {
    console.log(err);
  });

const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

//Server
app.listen(3000, () => {
  console.log("server is running http://localhost:3000");
});
