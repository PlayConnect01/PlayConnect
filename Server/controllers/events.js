const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();


const getAllEvents = async (req, res) => {
  try {
    console.log("Request received: GET /getAll");
    const events = await prisma.event.findMany();
    console.log("Events fetched successfully:", events);
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Error fetching events", details: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    console.log("Request received: GET /getById", req.params);
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { event_id: parseInt(id) },
    });

    if (!event) {
      console.warn("Event not found for ID:", id);
      return res.status(404).json({ error: "Event not found" });
    }
    console.log("Event fetched successfully:", event);
    res.json(event);
  } catch (error) {
    console.error("Error fetching the event:", error);
    res.status(500).json({ error: "Error fetching the event", details: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    console.log("Request received: POST /create", req.body);
    const {
      eventName, // This is the field from the request body
      note, // Assuming you want to use this field as well
      date,
      startTime,
      endTime,
      location,
      category,
      participants,
      price,
      isFree,
    } = req.body;

    const newEvent = await prisma.event.create({
      data: {
        event_name: eventName, // Map eventName to event_name
        location,
        date: new Date(date),
        start_time: startTime ? new Date(startTime) : null,
        end_time: endTime ? new Date(endTime) : null,
        description: note, // Assuming you want to save the note as description
        category,
        participants: parseInt(participants), // Ensure this is an integer
        price: parseFloat(price), // Ensure this is a float
        is_free: isFree, // Map isFree to is_free
        creator_id: 1, // Assuming you want to set this to a default user
      },
    });

    console.log("Event created successfully:", newEvent);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Error creating event", details: error.message });
  }
};
const updateEvent = async (req, res) => {
  try {
    console.log("Request received: PUT /update", req.params, req.body);
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
      is_free,
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
        is_free,
      },
    });

    console.log("Event updated successfully:", updatedEvent);
    res.json(updatedEvent);
  } catch (error) {
    console.error("Error updating the event:", error);
    res.status(500).json({ error: "Error updating the event", details: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    console.log("Request received: DELETE /delete", req.params);
    const { id } = req.params;

    await prisma.event.delete({
      where: { event_id: parseInt(id) },
    });

    console.log("Event deleted successfully for ID:", id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting the event:", error);
    res.status(500).json({ error: "Error deleting the event", details: error.message });
  }
};

module.exports = {getAllEvents,getEventById,createEvent,updateEvent,deleteEvent};
