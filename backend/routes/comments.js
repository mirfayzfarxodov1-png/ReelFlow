const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Video = require('../models/Video');
const { protect } = require('../middleware/auth');

// Add comment to video
router.post('/:videoId', protect, async (req, res) => {
    try {
        const { text } = req.body;
        
        const comment = await Comment.create({
            text,
            user: req.user._id,
            video: req.params.videoId
        });

        await Video.findByIdAndUpdate(req.params.videoId, {
            $push: { comments: comment._id }
        });

        const populatedComment = await comment.populate('user', 'username avatar');
        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get comments for video
router.get('/:videoId', async (req, res) => {
    try {
        const comments = await Comment.find({ video: req.params.videoId, parentComment: null })
            .populate('user', 'username avatar')
            .sort({ createdAt: -1 });
        
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Like comment
router.put('/:commentId/like', protect, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.likes.includes(req.user._id)) {
            comment.likes = comment.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            comment.likes.push(req.user._id);
        }

        await comment.save();
        res.json({ likes: comment.likes.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete comment
router.delete('/:commentId', protect, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await comment.deleteOne();
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
