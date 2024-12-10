const db = require('../database');

exports.createPost = async (req, res) => {
  try {
    const { content, image, userId } = req.body;
    const post = await db.posts.create({
      content,
      image,
      UserId: userId
    });
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await db.posts.findAll({
      where: { UserId: userId }
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
};