require("dotenv").config();
const express = require("express");
// import { express } from "express";
const app = express();
const jwt = require("jsonwebtoken");
const verifyToken = require("./middleware/auth");

app.use(express.json());

const posts = [
  {
    userId: 1,
    post: "post henry",
  },
  {
    userId: 2,
    post: "post jim",
  },
];

app.get("/posts", verifyToken, (req, res) => {
  res.json(posts.filter((post) => post.userId === req.userId));
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server chay o port ${PORT}`);
});
