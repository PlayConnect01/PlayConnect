const  express  = require('express');
const {signup,login,logout} = require('../controllers/user.js') ;

const router = express.Router();

// Auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);


module.exports =  router;  // Ensure you are exporting the router here
