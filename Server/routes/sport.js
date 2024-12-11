const express = require('express');
const {
  getAllSports,
  getSportById,
  createSport,
  updateSport,
  deleteSport,
} = require("../controllers/sport");

const router = express.Router();


router.get('/', getAllSports); 
router.get('/:id', getSportById); 
router.post('/', createSport); 
router.put('/:id', updateSport); 
router.delete('/:id', deleteSport); 

module.exports = router;
