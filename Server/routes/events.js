const express = require("express");
const {getAllEvents,getEventById,createEvent,updateEvent, deleteEvent, getEventsByDate} = require("../controllers/events");

const router = express.Router();

router.get("/getAll", getAllEvents);
router.get("/getById/:id", getEventById);
router.post("/create", createEvent);
router.put("/update/:id", updateEvent);
router.delete("/delete/:id", deleteEvent);
router.get("/getByDate/:date", getEventsByDate);

module.exports = router;
