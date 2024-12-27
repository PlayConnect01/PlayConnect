const { PrismaClient } = require("@prisma/client");
const QRCode = require('qrcode');

const prisma = new PrismaClient();

const getAllEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const events = await prisma.event.findMany({
      where: {
        date: {
          gte: today,
        },
      },
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Error fetching events", details: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { event_id: parseInt(id) },
      include: {
        creator: true,
        event_participants: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Error fetching the event", details: error.message });
  }
};

const addParticipantWithQR = async (req, res) => {
  const { eventId, userId } = req.body;

  try {
    // Check if the user is already a participant in the event
    const existingParticipation = await prisma.eventParticipant.findFirst({
      where: { event_id: parseInt(eventId), user_id: parseInt(userId) },
    });

    if (existingParticipation) {
      return res.status(400).json({ error: "You already joined this event" });
    }

    // Fetch event and user details
    const event = await prisma.event.findUnique({ where: { event_id: parseInt(eventId) } });
    const user = await prisma.user.findUnique({ where: { user_id: parseInt(userId) } });

    if (!event || !user) {
      return res.status(404).json({ error: "Event or User not found" });
    }

    // Generate QR code data
    const qrData = {
      eventName: event.event_name,
      eventDate: event.date,
      userName: user.username,
      userProfilePicture: user.profile_picture,
    };

    // Generate QR code
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

    // Store participant with QR code
    const participant = await prisma.eventParticipant.create({
      data: {
        event_id: parseInt(eventId),
        user_id: parseInt(userId),
        qr_code: qrCode,
      },
    });

    res.status(201).json({ message: "Participant added and QR code generated", qrCode, participant });
  } catch (error) {
    console.error("Error adding participant:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

const removeParticipant = async (req, res) => {
  const { eventId, userId } = req.body;

  try {
    // Check if the user is a participant of the event
    const existingParticipation = await prisma.eventParticipant.findFirst({
      where: { event_id: parseInt(eventId), user_id: parseInt(userId) },
    });

    if (!existingParticipation) {
      return res.status(404).json({ error: "User is not a participant of this event" });
    }

    // Remove the participant from the event
    await prisma.eventParticipant.delete({
      where: {
        event_participant_id: existingParticipation.event_participant_id,
      },
    });

    res.status(200).json({ message: "Participant removed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error removing participant", details: error.message });
  }
};


const createEvent = async (req, res) => {
  try {
    const {
      eventName,
      note,
      date,
      startTime,
      endTime,
      location,
      latitude,
      longitude,
      category,
      participants,
      price,
      creator_id,
      image
    } = req.body;

    const eventDate = new Date(date);

    const newEvent = await prisma.event.create({
      data: {
        event_name: eventName,
        description: note,
        date: eventDate,
        start_time: startTime,
        end_time: endTime,
        location: location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        category: category,
        participants: parseInt(participants),
        price: parseFloat(price),
        image: image,
        creator: {
          connect: {
            user_id: creator_id
          }
        }
      }
    });

    res.status(201).json({
      message: "Event created successfully",
      event: newEvent
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      error: "Error creating event",
      details: error.toString()
    });
  }
};



const EventWithCreator = async (req, res) => {
  try {
    const event = await prisma.event.findFirst({
      include: {
        creator: true
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      event_name,
      location,
      date,
      start_time,
      end_time,
      description,
      category,
      participants,
      price,
    } = req.body;

    const updatedEvent = await prisma.event.update({
      where: { event_id: parseInt(id) },
      data: {
        event_name,
        location,
        date: new Date(date),
        start_time: start_time ? new Date(start_time) : null,
        end_time: end_time ? new Date(end_time) : null,
        description,
        category,
        participants: parseInt(participants),
        price: parseFloat(price),
      },
    });


    res.json(updatedEvent);


  } catch (error) {

    res.status(500).json({ error: "Error updating the event", details: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {

    const { id } = req.params;

    await prisma.event.delete({
      where: { event_id: parseInt(id) },
    });


    res.status(204).send();
  } catch (error) {
 
    res.status(500).json({ error: "Error deleting the event", details: error.message });
  }
};

const getEventsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await prisma.event.findMany({
      where: {
        date: {
          gte: today,
          equals: selectedDate,
        },
      },
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Error fetching events by date", details: error.message });
  }
};

const getParticipatedEvents = async (req, res) => {
  const { userId } = req.params;

  try {
    const events = await prisma.eventParticipant.findMany({
      where: { user_id: parseInt(userId) },
      include: { event: true }, // Include event details
    });

    res.json(events.map(ep => ep.event)); // Return only event details
  } catch (error) {
    res.status(500).json({ error: "Error fetching participated events", details: error.message });
  }
};

const isUserParticipant = async (req, res) => {
  const { eventId, userId } = req.params;

  try {
    const existingParticipation = await prisma.eventParticipant.findFirst({
      where: { event_id: parseInt(eventId), user_id: parseInt(userId) },
    });

    if (existingParticipation) {
      return res.status(200).json({ isParticipant: true });
    } else {
      return res.status(200).json({ isParticipant: false });
    }
  } catch (error) {
    res.status(500).json({ error: "Error checking participation", details: error.message });
  }
};

const getParticipantQR = async (req, res) => {
  const { eventId, userId } = req.params;

  try {
    const participant = await prisma.eventParticipant.findFirst({
      where: { event_id: parseInt(eventId), user_id: parseInt(userId) },
    });

    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.status(200).json({ qrCode: participant.qr_code });
  } catch (error) {
    res.status(500).json({ error: "Error fetching QR code", details: error.message });
  }
};

module.exports = { 
  EventWithCreator, 
  getAllEvents, 
  getEventById, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  getEventsByDate, 
  addParticipantWithQR, 
  getParticipatedEvents, 
  removeParticipant, 
  isUserParticipant,
  getParticipantQR // Add this line
};