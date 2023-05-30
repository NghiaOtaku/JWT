require("dotenv").config();
const express = require("express");
// import { express } from "express";
const app = express();
const jwt = require("jsonwebtoken");
const verifyToken = require("./middleware/auth");

app.use(express.json());

let users = [
  {
    id: 1,
    username: "henry",
    refreshToken: null,
  },
  {
    id: 2,
    username: "jim",
    refreshToken: null,
  },
];

const generateToken = (payload) => {
  const { id, username } = payload;
  const accessToken = jwt.sign(
    { id, username },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "5m",
    }
  );

  const refreshToken = jwt.sign(
    { id, username },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1h",
    }
  );

  return { accessToken, refreshToken };
};

const updateRefreshToken = (username, refreshToken) => {
  users = users.map((user) => {
    if (user.username === username) {
      return {
        ...user,
        refreshToken,
      };
    }

    return user;
  });
};

app.post("/login", (req, res) => {
  const username = req.body.username;
  const user = users.find((user) => user.username === username);

  if (!user) return res.sendStatus(401);

  //Tao token de gui ve client
  const tokens = generateToken(user);

  updateRefreshToken(username, tokens.refreshToken);

  return res.json(tokens);
});

app.post("/token", (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.sendStatus(401);
  }

  const user = users.find((user) => user.refreshToken === refreshToken);
  if (!user) {
    return res.sendStatus(403);
  }

  try {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const tokens = generateToken(user);

    updateRefreshToken(user.username, tokens.refreshToken);
    res.json(tokens);
  } catch (error) {
    console.log(error);
    res.sendStatus(403);
  }
});

app.delete("/logout", verifyToken, (req, res) => {
  const user = users.find((user) => user.id === req.userId);
  updateRefreshToken(user.username, null);
  console.log(users);
  res.json({ loggout: "Logged Out!!!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server chay o port ${PORT}`);
});
