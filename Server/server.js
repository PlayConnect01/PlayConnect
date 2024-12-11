const express = require("express");
const cors = require("cors");
const eventRoutes = require("./routes/events");


const app = express()

app.use(cors());
app.use(express.json());

const PORT = 3000;

app.use("/events", eventRoutes);


app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});



