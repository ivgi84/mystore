const express = require('express');
const { body } = require('express-validator'); 

const feedController = require('../controllers/feed');

const router = express.Router();

const postValidation = [
  body('title')
  .trim()
  .isLength({min: 5}),
  body('content')
  .trim()
  .isLength({min: 5}),
];

// GET /feed/posts
router.get('/posts', feedController.getPosts);

// POST /feed/post
router.post('/post', postValidation ,feedController.createPost);

router.get('/post/:postId', feedController.getPost);

router.put('/post/:postId',postValidation, feedController.updatePost);

router.delete('/post/:postId', feedController.deletePost);

module.exports = router;