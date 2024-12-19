const express = require("express");
const cors = require("cors");
const http = require("http");
const session = require("express-session");
const passport = require("./config/passport.js");
const { initializeSocket } = require("./config/socket");

const eventRoutes = require("./routes/events");
const sportRoutes = require("./routes/sport");
const userRouter = require("./routes/user");
const matchRouter = require("./routes/match");
const chatRoutes = require("./routes/chat");
const competetionRouter = require("./routes/competetion.js");
const passwordRouter = require("./routes/handlePasswordReset .js");

const app = express();
const server = http.createServer(app);

initializeSocket(server);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prismaClient.user.findUnique({
      where: { user_id: id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

app.use("/sports", sportRoutes);
app.use("/users", userRouter);
app.use("/matches", matchRouter);
app.use("/events", eventRoutes);
app.use("/chats", chatRoutes);
app.use("/competetion", competetionRouter);
app.use("/password", passwordRouter);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server and Socket.IO running on port ${PORT}`);
});