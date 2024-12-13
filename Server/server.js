const express = require("express");
const cors = require("cors");
const http = require('http');
const { initializeSocket } = require('./config/socket');
const eventRoutes = require("./routes/events");
const sportRoutes = require("./routes/sport");
const userRouter = require('./routes/user');
const matchRouter = require('./routes/match');
const chatRoutes = require('./routes/chat');
const competetionRouter = require('./routes/competetion');
const passwordRouter = require('./routes/handlePasswordReset ');

const app = express();

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const server = http.createServer(app);

initializeSocket(server);

app.use(express.json());

const PORT = 3000;

app.use('/sports', sportRoutes); 
app.use('/users', userRouter); 
app.use('/matches', matchRouter);
app.use('/events', eventRoutes);
app.use('/chats', chatRoutes);  
app.use('/competetion', competetionRouter); 
app.use('/password', passwordRouter);
server.listen(PORT, () => {
  console.log(`Server and Socket.IO running on port ${PORT}`);
});

