const express = require("express");
const cors = require("cors");
const http = require('http');
const { initializeSocket } = require('./config/socket');
const eventRoutes = require("./routes/events");
const sportRoutes = require("./routes/sport");
const userRouter = require('./routes/user');
const matchRouter = require('./routes/match');
const chatRouter = require('./routes/chat');

const app = express();

// Créer le serveur HTTP
const server = http.createServer(app);

// Initialiser Socket.IO
initializeSocket(server);

app.use(cors());
app.use(express.json());

const PORT = 3000;

app.use('/sports', sportRoutes); 
app.use('/users', userRouter); 
app.use('/api/matches', matchRouter);
app.use("/events", eventRoutes);
app.use('/chat', chatRouter);

// Utiliser server.listen au lieu de app.listen
server.listen(PORT, () => {
  console.log(`Server and Socket.IO running on port ${PORT}`);
});