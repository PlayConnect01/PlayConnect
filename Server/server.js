const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const { initializeSocket } = require('./config/socket');
const passport = require('./config/passport.js');

// Import Prisma for Passport
const { PrismaClient } = require('@prisma/client');
const prismaClient = new PrismaClient();

// Import Routers
const eventRoutes = require('./routes/events');
const userRouter = require('./routes/user');
const matchRouter = require('./routes/match');
const chatRoutes = require('./routes/chat');
const passwordRouter = require('./routes/handlePasswordReset.js')
const leaderboardRoutes = require('./routes/leaderboard.js')
const sportRoutes = require('./routes/sport');
const competetionRouter = require('./routes/competetion');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const favorites = require('./routes/favoriteRoutes');
const notificationRoutes = require('./routes/notification');
const paymentRoutes = require('./routes/Paymentrouter');



const app = express();

// Middleware
app.use(cors());
app.use(express.json({limit: '50mb', extended: true}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// Session middleware
app.use(
  session({
    secret: 'your_secret_key', // Replace with a strong secret
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Passport Serialization
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

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server for video calls and other socket connections
initializeSocket(server);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Routers
app.use('/sports', sportRoutes);
app.use('/users', userRouter);
app.use('/matches', matchRouter);
app.use('/events', eventRoutes);
app.use('/competetion', competetionRouter);
app.use('/password', passwordRouter);
app.use('/product', productRoutes);
app.use('/cart', cartRoutes);
app.use('/favorites', favorites);
// Mount Chat Router
app.use('/payments',paymentRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/chats', chatRoutes);
app.use('/notifications', notificationRoutes);

// Start the Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 
