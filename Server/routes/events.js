const express = require("express");
const {getAllEvents,getEventById,createEvent,updateEvent, deleteEvent} = require("../controllers/events");

const router = express.Router();

router.get("/getAll", getAllEvents);
router.get("/getById/:id", getEventById);
router.post("/create", createEvent);
router.put("/update/:id", updateEvent);
router.delete("/delete/:id", deleteEvent);

module.exports = router;
