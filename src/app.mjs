import express from "express";
import router from "./routes/users.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import "./strategies/local-strategy.mjs";
import { ensureAuthenticated } from "./utils/middlewares.mjs";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(router);

app.post("/api/auth", passport.authenticate("local"), (req, res) => {
  res.sendStatus(200);
});

app.get('/protected', ensureAuthenticated, (req, res) => {
  res.send('This is a protected route, only for logged-in users.');
});

app.get("/api/auth/status", (req, res) => {
  console.log(`Inside auth/status endpoint, req.user:`, req.user);
  return req.user ? res.sendStatus(200) : res.sendStatus(401);
});

app.post("/api/logout", (req, res) => {
  if (!req.user) return res.sendStatus(401);
  req.logout(err => {
    if (err) return res.sendStatus(400);
    return res.sendStatus(200);
  });
});

const run = async () => {
  try {
    console.log("Starting server...");
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  } catch (error) {
    console.log("Error starting the server:", error);
  }
};

run().catch(console.dir);
