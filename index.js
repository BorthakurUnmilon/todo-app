const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require('express-session');

const session_secret = "newton";

const app = express();
app.use(express.json());
app.use(cors({
  credentials: true,
  origin: "http://localhost:8080"
}));
app.use(session({
  secret: session_secret,
  cookie: {maxAge: 1*60*60*1000}
}))

const db = mongoose.createConnection("mongodb://localhost:27017/TodoApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema
const userSchema = new mongoose.Schema({
  userName: String,
  password: String,
});

const todoSchema = new mongoose.Schema({
  task: String,
  done: Boolean,
  creationTime: Date,
  userId: mongoose.Schema.Types.ObjectId,
});

// Models
const userModel = db.model("user", userSchema);
const todoModel = db.model("todo", todoSchema);

// backend apis
const isNullOrUndefined = (val) => val === null || val === undefined;
const SALT = 5;

// Signup
app.post("/signup", async (req, res) => {
  const { userName, password } = req.body;
  const existingUser = await userModel.findOne({ userName });
  if (isNullOrUndefined(existingUser)) {
    const hashedPwd = bcrypt.hashSync(password, SALT);
    const newUser = new userModel({ userName, password: hashedPwd });

    await newUser.save();
    req.session.userId = newUser._id;
    res.status(201).send({ success: "User signed up" });
  } else {
    res.status(400).send({ err: `Username already exists` });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { userName, password } = req.body;
  const existingUser = await userModel.findOne({
    userName,
  });
  if (isNullOrUndefined(existingUser)) {
    res.status(401).send({ err: "Username/password incorrect" });
  } else {
    const hashedPwd = existingUser.password;
    if (bcrypt.compareSync(password, hashedPwd)) {
      req.session.userId = existingUser._id;
      res.status(200).send({ success: "Logged in" });
    } else {
      res.status(401).send({ err: `password incorrect.` });
    }
  }
});

const AuthMiddleware = async (req, res, next) => {

  if (isNullOrUndefined(req.session) || isNullOrUndefined(req.session.userId)) {
    res.status(401).send({ err: "Not logged in!" });
  } else {
    next();
  }
};

app.get("/todo", AuthMiddleware, async (req, res) => {
  const allTodos = await todoModel.find({ userId: req.session.userId });
  res.send(allTodos);
});

app.post("/todo", AuthMiddleware, async (req, res) => {
  const todo = req.body;
  todo.creationTime = new Date();
  todo.done = false;
  todo.userId = req.session.userId;
  const newTodo = new todoModel(todo);
  await newTodo.save();
  res.status(201).send(newTodo);
});

app.put("/todo/:todoid", AuthMiddleware, async (req, res) => {
  const { task } = req.body;
  const todoid = req.params.todoid;

  try {
    const todo = await todoModel.findOne({ _id: todoid, userid: req.session.userId });
    if (isNullOrUndefined(todo)) {
      res.sendStatus(404);
    } else {
      todo.task = task;
      await todo.save();
      res.send(todo);
    }
  } catch (e) {
    res.sendStatus(404);
  }
});

app.delete("/todo/:todoid", AuthMiddleware, async (req, res) => {
  const todoid = req.params.todoid;

  try {
    await todoModel.deleteOne({ _id: todoid, userid: req.session.userId });
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(404);
  }
});

app.get('/logout', async (req,res,next) => {
  if(!isNullOrUndefined(req.session)){
    req.session.destroy(() => {
      res.sendStatus(200);
    });
  } else{
    res.sendStatus(200);
  }
})

app.get('/userinfo',AuthMiddleware, async (req,res) => {
  const user = await userModel.findById(req.session.userId);
  res.send({userName: user.userName});
})

app.listen(9999);
