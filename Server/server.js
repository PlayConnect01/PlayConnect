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

// Initialize Socket.IO
initializeSocket(server);

// CORS Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// JSON Body Parser Middleware
app.use(express.json());

// Express Session Middleware
app.use(
  session({
    secret: "your-secret-key", // Replace with a strong secret key
    resave: false, // Avoid resaving session if not modified
    saveUninitialized: false, // Do not save uninitialized sessions
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      httpOnly: true, // Prevent access to cookies via JavaScript
    },
  })
);

// Initialize Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport Serialization/Deserialization
passport.serializeUser((user, done) => {
  done(null, user.user_id); // Serialize user ID into the session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prismaClient.user.findUnique({
      where: { user_id: id },
    });
    done(null, user); // Attach user object to the request
  } catch (error) {
    done(error, null);
  }
});

// Routes
app.use("/sports", sportRoutes);
app.use("/users", userRouter);
app.use("/matches", matchRouter);
app.use("/events", eventRoutes);
app.use("/chats", chatRoutes);
app.use("/competetion", competetionRouter);
app.use("/password", passwordRouter);

// Server Listener
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server and Socket.IO running on port ${PORT}`);
});
