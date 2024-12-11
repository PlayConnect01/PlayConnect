const prisma = require('../prisma');

// Get all sports
const getAllSports = async (req, res) => {
  try {
    const sports = await prisma.sport.findMany();
    res.status(200).json(sports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a sport by ID
const getSportById = async (req, res) => {
  const { id } = req.params;
  try {
    const sport = await prisma.sport.findUnique({
      where: { id: parseInt(id) },
    });
    if (!sport) {
      return res.status(404).json({ message: 'Sport not found' });
    }
    res.status(200).json(sport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new sport
const createSport = async (req, res) => {
  const { name, category, description } = req.body;
  try {
    const newSport = await prisma.sport.create({
      data: { name, category, description },
    });
    res.status(201).json(newSport);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a sport
const updateSport = async (req, res) => {
  const { id } = req.params;
  const { name, category, description } = req.body;
  try {
    const updatedSport = await prisma.sport.update({
      where: { id: parseInt(id) },
      data: { name, category, description },
    });
    res.status(200).json(updatedSport);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a sport
const deleteSport = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.sport.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllSports,
  getSportById,
  createSport,
  updateSport,
  deleteSport,
};
