const express = require("express");
const cors = require("cors");
const eventRoutes = require("./routes/events");
const sportRoutes= require("./routes/sport")
const userRouter = require('./routes/user');
const competetionRouter = require('./routes/competetion');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;


app.use('/sports', sportRoutes); 
app.use('/users', userRouter); 
app.use('/competetion', competetionRouter); 


app.use("/events", eventRoutes);


app.listen(PORT,  () => {
  console.log('Server is running on port 3000');
});