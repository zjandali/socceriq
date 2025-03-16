const express = require('express');
const router = express.Router();
const { auth } = require('./auth');
const Team = require('../models/Team');
const Player = require('../models/Player');

// Get all teams for current user
router.get('/', auth, async (req, res) => {
  try {
    const teams = await Team.find({ coaches: req.user._id });
    res.json({ teams });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific team
router.get('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findOne({ 
      _id: req.params.id,
      coaches: req.user._id 
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json({ team });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new team
router.post('/', auth, async (req, res) => {
  try {
    const { name, logo, settings } = req.body;
    
    const team = new Team({
      name,
      logo,
      coaches: [req.user._id],
      settings
    });
    
    await team.save();
    
    // Add team to user's teams
    req.user.teams.push(team._id);
    await req.user.save();
    
    res.status(201).json({ team });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a team
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'logo', 'settings'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }
    
    const team = await Team.findOne({ 
      _id: req.params.id,
      coaches: req.user._id 
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    updates.forEach(update => {
      team[update] = req.body[update];
    });
    
    await team.save();
    
    res.json({ team });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a team
router.delete('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findOneAndDelete({ 
      _id: req.params.id,
      coaches: req.user._id 
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Remove team from user's teams
    req.user.teams = req.user.teams.filter(teamId => teamId.toString() !== req.params.id);
    await req.user.save();
    
    // Delete all players associated with this team
    await Player.deleteMany({ teamId: req.params.id });
    
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all players for a team
router.get('/:id/players', auth, async (req, res) => {
  try {
    const team = await Team.findOne({ 
      _id: req.params.id,
      coaches: req.user._id 
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    const players = await Player.find({ teamId: req.params.id });
    
    res.json({ players });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
