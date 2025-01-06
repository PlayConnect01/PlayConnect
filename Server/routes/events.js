const express = require("express");
const {getAllEvents,getEventById,createEvent,updateEvent, deleteEvent, getEventsByDate , EventWithCreator , addParticipantWithQR , removeParticipant, getParticipatedEvents, isUserParticipant, getParticipantQR, getTomorrowEvents, getTotalEvents, getPendingEvents, approveEvent, rejectEvent, getApprovedEvents, getUpcomingEvents} = require("../controllers/events");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.get("/getAll", getAllEvents);
router.get("/getUpcomingEvents", getUpcomingEvents);
router.get("/getById/:id", getEventById);
router.post("/create", createEvent);
router.put("/update/:id", updateEvent);
router.delete("/delete-event/:eventId", deleteEvent);
router.get("/getByDate/:date", getEventsByDate);
router.get("/getEventWithCreator" , EventWithCreator )
router.post('/addParticipant', addParticipantWithQR);
router.get("/getParticipated/:userId", getParticipatedEvents);
router.delete("/removeParticipant/:eventId/:userId", removeParticipant);
router.get("/isUserParticipant/:eventId/:userId", isUserParticipant);
router.get("/getParticipantQR/:eventId/:userId", getParticipantQR);
router.get("/getTomorrowEvents", getTomorrowEvents);
router.get("/count/total", getTotalEvents);
router.get("/pending", getPendingEvents);
router.put("/approve/:eventId", approveEvent);
router.put("/reject/:eventId", rejectEvent);
router.get("/approved", getApprovedEvents);

module.exports = router;