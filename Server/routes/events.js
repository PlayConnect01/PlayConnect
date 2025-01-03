const express = require("express");
const {getAllEvents,getEventById,createEvent,updateEvent, deleteEvent, getEventsByDate , EventWithCreator , addParticipantWithQR , removeParticipant, getParticipatedEvents, isUserParticipant, getParticipantQR,getUpcomingEvents} = require("../controllers/events");


const router = express.Router();

router.get("/getAll", getAllEvents);
router.get("/getUpcomingEvents", getUpcomingEvents);
router.get("/getById/:id", getEventById);
router.post("/create", createEvent);
router.put("/update/:id", updateEvent);
router.delete("/delete/:id", deleteEvent);
router.get("/getByDate/:date", getEventsByDate);
router.get("/getEventWithCreator" , EventWithCreator )
router.post('/addParticipant', addParticipantWithQR);
router.get("/getParticipated/:userId", getParticipatedEvents);
router.post("/removeParticipant", removeParticipant);
router.get("/isUserParticipant/:eventId/:userId", isUserParticipant);
router.get("/getParticipantQR/:eventId/:userId", getParticipantQR);

module.exports = router;
