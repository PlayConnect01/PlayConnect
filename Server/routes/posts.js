const express = require('express');
const router = express.Router();
const { createPost, getUserPosts } = require('../controllers/posts');

router.post('/create', createPost);
router.get('/user/:userId', getUserPosts);

module.exports = router;
