require("dotenv").config();
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const express = require("express");

const morgan = require("morgan");
const cors = require("cors");
const bodyParse = require("body-parser");

const connectDB = require("./Config/db");

const { readdirSync } = require("fs");
// const productRouters = require('./Routes/product')
// const authRouters = require('./Routes/auth')

const app = express();
const port = 6000 || process.env.PORT;

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    //cookie: { maxAge: new Date ( Date.now() + (3600000) ) }
    // Date.now() - 30 * 24 * 60 * 60 * 1000
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
// Conntect to Database
connectDB();

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParse.json({ limit: "10mb" }));

app.use(express.static("public"));

app.use(expressLayouts);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

readdirSync("./Routes").map((r) => app.use("/api", require("./Routes/" + r)));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
