const { PrismaClient } = require("@prisma/client");
const QRCode = require('qrcode');

const prisma = new PrismaClient();

const getUpcomingEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        creator: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Error fetching events", details: error.message });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany();
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
    const event = await prisma.event.findUnique({ 
      where: { event_id: parseInt(eventId) },
      include: {
        creator: true
      }
    });
    const user = await prisma.user.findUnique({ where: { user_id: parseInt(userId) } });

    if (!event || !user) {
      return res.status(404).json({ error: "Event or User not found" });
    }

    // Generate QR code data with essential information
    const qrData = {
      eventId: event.event_id,
      userId: user.user_id,
    };

    // Generate QR code
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

    // Store participant with QR code and update user points
    const [participant, updatedUser, notification] = await prisma.$transaction([
      // Create participant
      prisma.eventParticipant.create({
        data: {
          event_id: parseInt(eventId),
          user_id: parseInt(userId),
          qr_code: qrCode,
        },
      }),
      // Update user points
      prisma.user.update({
        where: { user_id: parseInt(userId) },
        data: {
          points: {
            increment: 100
          }
        },
      }),
      // Create notification
      prisma.notification.create({
        data: {
          user_id: parseInt(userId),
          title: "Points Earned!",
          content: `Congratulations! You have successfully joined "${event.event_name}" and earned 100 points. The event will be held at ${event.location} on ${new Date(event.date).toLocaleDateString()}. Don't forget to check your QR code for entry!`,
          type: "GENERAL",
          is_read: false,
          action_url: `/events/${eventId}`
        },
      })
    ]);

    res.status(201).json({ 
      qrCode, 
      participant,
      pointsEarned: 100
    });
  } catch (error) {
    console.error("Error adding participant:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

const removeParticipant = async (req, res) => {
  const { eventId, userId } = req.params;

  try {
    // Check if the participant exists
    const participant = await prisma.eventParticipant.findFirst({
      where: {
        event_id: parseInt(eventId),
        user_id: parseInt(userId),
      },
      include: {
        event: true
      }
    });

    if (!participant) {
      return res.status(404).json({ error: "Participant not found in this event" });
    }

    // First delete the participant record
    await prisma.eventParticipant.deleteMany({
      where: {
        AND: [
          { event_id: parseInt(eventId) },
          { user_id: parseInt(userId) }
        ]
      }
    });

    // Then update user points
    await prisma.user.update({
      where: { 
        user_id: parseInt(userId)
      },
      data: {
        points: {
          decrement: 100
        }
      }
    });

    // Finally create notification
    await prisma.notification.create({
      data: {
        user_id: parseInt(userId),
        title: "Points Deducted",
        content: `You have left the event "${participant.event.event_name}" and 100 points have been deducted from your account.`,
        type: "GENERAL",
        is_read: false,
        action_url: `/events/${eventId}`
      }
    });

    res.json({ 
      pointsDeducted: 100 
    });
  } catch (error) {
    console.error("Error removing participant:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
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

// Update or add this function to your event controller
const deleteEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    // First, delete all event participants
    await prisma.eventParticipant.deleteMany({
      where: {
        event_id: parseInt(eventId)
      }
    });

    // Then delete the event itself
    const deletedEvent = await prisma.event.delete({
      where: {
        event_id: parseInt(eventId)
      }
    });

    res.status(200).json({
      message: "Event and all its participants deleted successfully",
      event: deletedEvent
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      error: "Failed to delete event",
      details: error.message
    });
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

const getTomorrowEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const events = await prisma.event.findMany({
      where: {
        AND: [
          {
            date: {
              gte: today,
              lt: dayAfterTomorrow,
            }
          },
          {
            status: "approved"  // Only get approved events
          }
        ]
      },
      include: {
        creator: true,
      },
      orderBy: {
        date: 'asc'  // Order by date ascending
      }
    });

    // Add a label to each event indicating if it's today or tomorrow
    const eventsWithLabel = events.map(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      
      const isToday = eventDate.getTime() === today.getTime();
      const isTomorrow = eventDate.getTime() === tomorrow.getTime();

      return {
        ...event,
        timeLabel: isToday ? "Today" : isTomorrow ? "Tomorrow" : ""
      };
    });

    res.json(eventsWithLabel);
  } catch (error) {
    res.status(500).json({ error: "Error fetching events", details: error.message });
  }
};

const getTotalEvents = async (req, res) => {
  try {
    const count = await prisma.event.count();
    res.json({ total: count });
  } catch (error) {
    res.status(500).json({ error: "Error fetching event count", details: error.message });
  }
};

const getPendingEvents = async (req, res) => {
  try {
    const pendingEvents = await prisma.event.findMany({
      where: {
        status: "pending"
      },
      include: {
        creator: true
      }
    });
    res.json(pendingEvents);
  } catch (error) {
    res.status(500).json({ error: "Error fetching pending events", details: error.message });
  }
};

const approveEvent = async (req, res) => {
  const { eventId } = req.params;
  try {
    // Use a transaction to ensure both event update and points update succeed or fail together
    const updatedEvent = await prisma.$transaction(async (prisma) => {
      // First, update the event status
      const event = await prisma.event.update({
        where: { event_id: parseInt(eventId) },
        data: { 
          status: "approved",
          reviewed_at: new Date(),
        },
        include: {
          creator: true // Include creator details
        }
      });

      // Update the user's points
      await prisma.user.update({
        where: { user_id: event.creator_id },
        data: {
          points: {
            increment: 500
          }
        }
      });

      // Create points log entry
      await prisma.pointsLog.create({
        data: {
          user_id: event.creator_id,
          activity: 'EVENT_APPROVAL',
          points: 500,
        }
      });

      // Create notification for the user
      await prisma.notification.create({
        data: {
          user_id: event.creator_id,
          title: "Event Approved!",
          content: `Your event "${event.event_name}" has been approved! You've earned 500 points.`,
          type: "GENERAL",
          action_url: `/events/${event.event_id}`
        }
      });

      return event;
    });

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error approving event:', error);
    res.status(500).json({ error: "Error approving event", details: error.message });
  }
};

const rejectEvent = async (req, res) => {
  const { eventId } = req.params;
  try {
    const updatedEvent = await prisma.event.update({
      where: { event_id: parseInt(eventId) },
      data: { status: "rejected" }
    });
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: "Error rejecting event", details: error.message });
  }
};

// New endpoint for homepage (approved events only)
const getApprovedEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: "approved"
      },
      include: {
        creator: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Error fetching events", details: error.message });
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
  getParticipantQR ,
  getUpcomingEvents,
  getTomorrowEvents,
  getTotalEvents,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getApprovedEvents
}