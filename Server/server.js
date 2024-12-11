const  express  = require('express');
const cors = require ('cors');
// import sportRoutes from './routes/sport.js';
const userRouter = require ('./routes/user.js') ;

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

// app.use('/sports', sportRoutes);
app.use('/users', userRouter);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});