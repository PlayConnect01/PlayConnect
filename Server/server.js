const express = require("express");
const cors = require("cors");
const http = require('http');
const { initializeSocket } = require('./config/socket');
const eventRoutes = require("./routes/events");
const sportRoutes = require("./routes/sport");
const userRouter = require('./routes/user');
const matchRouter = require('./routes/match');
const chatRoutes = require('./routes/chat');
 const  competetionRouter = require ('./routes/competetion.js')
 const  passwordRouter = require ('./routes/handlePasswordReset .js')
  const passport = require ('./config/passport.js')
const app = express();

// Créer le serveur HTTP
const server = http.createServer(app);

// Initialiser Socket.IO
initializeSocket(server);

app.use(cors({
  origin: '*', // À modifier en production
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));app.use(express.json());

const PORT = 3000;

app.use('/sports', sportRoutes); 
app.use('/users', userRouter); 
app.use('/matches', matchRouter);
app.use('/events', eventRoutes);
app.use('/chats', chatRoutes);  
app.use('/competetion', competetionRouter); 
app.use('/password', passwordRouter);
app.use(passport.initialize());
app.use(passport.session());

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



// Utiliser server.listen au lieu de app.listen
server.listen(PORT, () => {
  console.log(`Server and Socket.IO running on port ${PORT}`);
});