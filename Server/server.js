const express = require('express');
const http = require('http');
const path = require('path');
const { initializeSocket } = require('./config/socket');
// const handleVideoCall = require('./controllers/videoCallController');
const cors = require('cors');

// Import Routers
const eventRoutes = require('./routes/events');
const userRouter = require('./routes/user');
const matchRouter = require('./routes/match');
// const chatRouter = require('./routes/chat'); 
const sportRoutes = require('./routes/sport');
const competetionRouter = require('./routes/competetion');
const passwordRouter = require('./routes/handlePasswordReset ');
const passport = require('./config/passport.js');
const  productRoutes = require('./routes/productRoutes.js')
 const cartRoutes = require ('./routes/cartRoutes.js')
 const favorites= require("./routes/favoriteRoutes.js")
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

// app.use(
//   session({
//     secret: "your-secret-key",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: process.env.NODE_ENV === "production",
//       httpOnly: true,
//     },
//   })
// );

// Mount Routers
app.use('/sports', sportRoutes);
app.use('/users', userRouter);
app.use('/matches', matchRouter);
app.use('/events', eventRoutes);
app.use('/competetion', competetionRouter);
app.use('/password', passwordRouter);
app.use('/product',productRoutes)
app.use('/cart',cartRoutes)
app.use('/favorites',favorites)
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
// app.use("/chats", chatRoutes);
app.use("/competetion", competetionRouter);
app.use("/password", passwordRouter);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server and Socket.IO running on port ${PORT}`);
});