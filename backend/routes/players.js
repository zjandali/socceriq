const express = require('express');
const router = express.Router();
const { auth } = require('./auth');
const Player = require('../models/Player');
const Team = require('../models/Team');

// Get a specific player
router.get('/:id', auth, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Check if user has access to this player's team
    const team = await Team.findOne({
      _id: player.teamId,
      coaches: req.user._id
    });
    
    if (!team) {
      return res.status(403).json({ message: 'Not authorized to access this player' });
    }
    
    res.json({ player });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new player
router.post('/', auth, async (req, res) => {
  try {
    const { teamId, name, position, jerseyNumber, physicalProfile, deviceId } = req.body;
    
    // Check if user has access to this team
    const team = await Team.findOne({
      _id: teamId,
      coaches: req.user._id
    });
    
    if (!team) {
      return res.status(403).json({ message: 'Not authorized to add players to this team' });
    }
    
    const player = new Player({
      teamId,
      name,
      position,
      jerseyNumber,
      physicalProfile,
      deviceId
    });
    
    await player.save();
    
    // Add player to team's players
    team.players.push(player._id);
    await team.save();
    
    res.status(201).json({ player });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a player
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'position', 'jerseyNumber', 'physicalProfile', 'baselineMetrics', 'deviceId'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }
    
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Check if user has access to this player's team
    const team = await Team.findOne({
      _id: player.teamId,
      coaches: req.user._id
    });
    
    if (!team) {
      return res.status(403).json({ message: 'Not authorized to update this player' });
    }
    
    updates.forEach(update => {
      player[update] = req.body[update];
    });
    
    await player.save();
    
    res.json({ player });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a player
router.delete('/:id', auth, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Check if user has access to this player's team
    const team = await Team.findOne({
      _id: player.teamId,
      coaches: req.user._id
    });
    
    if (!team) {
      return res.status(403).json({ message: 'Not authorized to delete this player' });
    }
    
    await player.remove();
    
    // Remove player from team's players
    team.players = team.players.filter(playerId => playerId.toString() !== req.params.id);
    await team.save();
    
    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
