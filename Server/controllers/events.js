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
      eventName,
      note,
      date,
      startTime,
      endTime,
      location,
      category,
      participants,
      price,
      isFree,
      creator_id // Ensure this is being passed correctly in the request body
    } = req.body;

    if (!creator_id) {
      return res.status(400).json({ error: "Creator ID is required" });
    }

    // Create the event, including the creator relation
    const newEvent = await prisma.event.create({
      data: {
        event_name: eventName,
        location,
        date: new Date(date),
        start_time: startTime ? new Date(startTime) : null,
        end_time: endTime ? new Date(endTime) : null,
        description: note,
        category,
        participants: parseInt(participants),
        price: parseFloat(price),
        is_free: isFree,
        creator: {
          connect: {
            user_id: creator_id, // Ensure creator_id is passed as a valid user ID
          },
        },
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

const getEventsByDate = async (req, res) => {
  try {
    console.log("GET /getByDate", req.params);
    const { date } = req.params;

    // Fetch events for the specified date
    const events = await prisma.event.findMany({
      where: {
        date: new Date(date), // Ensure the date is in the correct format
      },
    });

    if (events.length === 0) {
      console.warn("No events found for date:", date);
      return res.status(404).json({ error: "No events found for this date" });
    }

    console.log("Events fetched successfully for date:", date, events);
    res.json(events);
  } catch (error) {
    console.error("Error fetching events by date:", error);
    res.status(500).json({ error: "Error fetching events by date", details: error.message });
  }
};

module.exports = {getAllEvents,getEventById,createEvent,updateEvent,deleteEvent,getEventsByDate};
