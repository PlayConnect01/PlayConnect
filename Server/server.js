const express = require('express');
const http = require('http');
const path = require('path');
const { initializeSocket } = require('./config/socket');
const cors = require('cors');

// Import Routers
const eventRoutes = require('./routes/events');
const userRouter = require('./routes/user');
const matchRouter = require('./routes/match');
const chatRouter = require('./routes/chat'); 
const sportRoutes = require('./routes/sport');
const competetionRouter = require('./routes/competetion');
const passwordRouter = require('./routes/handlePasswordReset ');
const passport = require('./config/passport.js');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create HTTP server
const server = http.createServer(app);


// Initialize other socket connections
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
app.use(passport.initialize());
app.use(passport.session());

app.use('/chats', chatRouter);

const PORT = process.env.PORT || 3000;
passport.serializeUser((user, done) => {
    done(null, user.user_id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prismaClient.user.findUnique({
        where: { user_id: id }
      });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
