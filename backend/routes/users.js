const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get user profile
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update profile
router.put('/profile', protect, async (req, res) => {
    try {
        const { fullName, bio, website } = req.body;
        
        const user = await User.findById(req.user._id);
        if (fullName) user.fullName = fullName;
        if (bio) user.bio = bio;
        if (website) user.website = website;
        
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Follow user
router.put('/follow/:userId', protect, async (req, res) => {
    try {
        if (req.params.userId === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        const userToFollow = await User.findById(req.params.userId);
        const currentUser = await User.findById(req.user._id);

        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (currentUser.following.includes(req.params.userId)) {
            currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.userId);
            userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== req.user._id.toString());
        } else {
            currentUser.following.push(req.params.userId);
            userToFollow.followers.push(req.user._id);
        }

        await currentUser.save();
        await userToFollow.save();

        res.json({ 
            following: currentUser.following.length,
            followers: userToFollow.followers.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Search users
router.get('/search/:query', async (req, res) => {
    try {
        const users = await User.find({
            $or: [
                { username: { $regex: req.params.query, $options: 'i' } },
                { fullName: { $regex: req.params.query, $options: 'i' } }
            ]
        }).select('-password').limit(20);
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
