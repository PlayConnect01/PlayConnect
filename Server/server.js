const express = require("express");
const cors = require("cors");
const http = require('http');
const path = require('path');
const { initializeSocket } = require('./config/socket');
const eventRoutes = require("./routes/events");
const sportRoutes = require("./routes/sport");
const userRouter = require('./routes/user');
const matchRouter = require('./routes/match');
const chatRoutes = require('./routes/chat');
const competetionRouter = require('./routes/competetion');
const passwordRouter = require('./routes/handlePasswordReset ');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
initializeSocket(server);

// Routes
app.use('/sports', sportRoutes);
app.use('/users', userRouter);
app.use('/matches', matchRouter);
app.use('/events', eventRoutes);
app.use('/chats', chatRoutes);
app.use('/competetion', competetionRouter);
app.use('/password', passwordRouter);



server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});