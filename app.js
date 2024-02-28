const express = require('express');
const dbconnect = require('./db/dbconnection');
const bodyParser = require("body-parser");
const userRouter = require('./router/user.router');
const recipeRouter = require('./router/recipe.router');
const cookieParser = require('cookie-parser');

const app = express();

dbconnect();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(userRouter);
app.use(recipeRouter);



module.exports = app;