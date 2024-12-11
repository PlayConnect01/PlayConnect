const express = require("express");
const cors = require("cors");
const sportRoutes= require("./routes/sport")
const userRouter = require('./routes/user');
const matchRouter = require('./routes/match');


const app = express()

app.use(cors());
app.use(express.json());

const PORT = 3000;


app.use('/sports', sportRoutes); 
app.use('/users', userRouter); 
app.use('/api/matches', matchRouter);




app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});



