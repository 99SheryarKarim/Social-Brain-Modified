const express = require('express');
const router = express.Router();
const postGenerationController = require('../controllers/postGenerationController');

// Post Generation Routes
router.post('/generate', postGenerationController.generatePost);
router.get('/', postGenerationController.getAllPosts);
router.get('/:postId', postGenerationController.getPostById);
router.put('/:postId', postGenerationController.updatePost);
router.delete('/:postId', postGenerationController.deletePost);
router.patch('/:postId/facebook', postGenerationController.markAsPostedToFacebook);

module.exports = router;

