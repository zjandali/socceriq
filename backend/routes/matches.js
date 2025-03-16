const express = require('express');
const router = express.Router();
const { auth } = require('./auth');
const Match = require('../models/Match');
const Team = require('../models/Team');
const PerformanceData = require('../models/PerformanceData');
const Insight = require('../models/Insight');

// Get all matches for a team
router.get('/team/:teamId', auth, async (req, res) => {
  try {
    // Check if user has access to this team
    const team = await Team.findOne({
      _id: req.params.teamId,
      coaches: req.user._id
    });
    
    if (!team) {
      return res.status(403).json({ message: 'Not authorized to access this team' });
    }
    
    const matches = await Match.find({ teamId: req.params.teamId })
      .sort({ date: -1 });
    
    res.json({ matches });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific match
router.get('/:id', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('lineups.starters')
      .populate('lineups.substitutes');
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Check if user has access to this match's team
    const team = await Team.findOne({
      _id: match.teamId,
      coaches: req.user._id
    });
    
    if (!team) {
      return res.status(403).json({ message: 'Not authorized to access this match' });
    }
    
    res.json({ match });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new match
router.post('/', auth, async (req, res) => {
  try {
    const { teamId, opponent, date, location, formation, lineups } = req.body;
    
    // Check if user has access to this team
    const team = await Team.findOne({
      _id: teamId,
      coaches: req.user._id
    });
    
    if (!team) {
      return res.status(403).json({ message: 'Not authorized to create matches for this team' });
    }
    
    const match = new Match({
      teamId,
      opponent,
      date,
      location,
      formation,
      lineups
    });
    
    await match.save();
    
    res.status(201).json({ match });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a match
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['opponent', 'date', 'location', 'formation', 'lineups', 'status'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }
    
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Check if user has access to this match's team
    const team = await Team.findOne({
      _id: match.teamId,
      coaches: req.user._id
    });
    
    if (!team) {
      return res.status(403).json({ message: 'Not authorized to update this match' });
    }
    
    updates.forEach(update => {
      match[update] = req.body[update];
    });
    
    await match.save();
    
    res.json({ match });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a match
router.delete('/:id', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Check if user has access to this match's team
    const team = await Team.findOne({
      _id: match.teamId,
      coaches: req.user._id
    });
    
    if (!team) {
      return res.status(403).json({ message: 'Not authorized to delete this match' });
    }
    
    await Match.deleteOne({ _id: match._id });
    
    // Delete all performance data and insights for this match
    await PerformanceData.deleteMany({ matchId: match._id });
    await Insight.deleteMany({ matchId: match._id });
    
    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start a match
router.post('/:id/start', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Check if user has access to this match's team
    const team = await Team.findOne({
      _id: match.teamId,
      coaches: req.user._id
    });
    
    if (!team) {
      return res.status(403).json({ message: 'Not authorized to start this match' });
    }
    
    match.status = 'live';
    await match.save();
    
    res.json({ match });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// End a match
router.post('/:id/end', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Check if user has access to this match's team
    const team = await Team.findOne({
      _id: match.teamId,
      coaches: req.user._id
    });
    
    if (!team) {
      return res.status(403).json({ message: 'Not authorized to end this match' });
    }
    
    match.status = 'completed';
    await match.save();
    
    res.json({ match });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add performance data for a player in a match
router.post('/:id/performance', auth, async (req, res) => {
  try {
    const { playerId, metrics } = req.body;
    
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Check if user has access to this match's team
    const team = await Team.findOne({
      _id: match.teamId,
      coaches: req.user._id
    });
    
    if (!team) {
      return res.status(403).json({ message: 'Not authorized to add data to this match' });
    }
    
    const performanceData = new PerformanceData({
      matchId: match._id,
      playerId,
      metrics
    });
    
    await performanceData.save();
    
    res.status(201).json({ performanceData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get performance data for a match
router.get('/:id/performance', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Check if user has access to this match's team
    const team = await Team.findOne({
      _id: match.teamId,
      coaches: req.user._id
    });
    
    if (!team) {
      return res.status(403).json({ message: 'Not authorized to access this match data' });
    }
    
    const performanceData = await PerformanceData.find({ matchId: match._id });
    
    res.json({ performanceData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get insights for a match
router.get('/:id/insights', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Check if user has access to this match's team
    const team = await Team.findOne({
      _id: match.teamId,
      coaches: req.user._id
    });
    
    if (!team) {
      return res.status(403).json({ message: 'Not authorized to access this match insights' });
    }
    
    const insights = await Insight.find({ matchId: match._id })
      .sort({ timestamp: -1, priority: -1 });
    
    res.json({ insights });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create an insight for a match
router.post('/:id/insights', auth, async (req, res) => {
  try {
    const { type, priority, message, relatedPlayers, data } = req.body;
    
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Check if user has access to this match's team
    const team = await Team.findOne({
      _id: match.teamId,
      coaches: req.user._id
    });
    
    if (!team) {
      return res.status(403).json({ message: 'Not authorized to add insights to this match' });
    }
    
    const insight = new Insight({
      matchId: match._id,
      type,
      priority,
      message,
      relatedPlayers,
      data
    });
    
    await insight.save();
    
    res.status(201).json({ insight });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
