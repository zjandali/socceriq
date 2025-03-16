const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  opponent: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed'],
    default: 'upcoming'
  },
  formation: {
    type: String,
    default: '4-4-2'
  },
  lineups: {
    starters: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    }],
    substitutes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    }]
  },
  events: [{
    type: {
      type: String,
      enum: ['substitution', 'goal', 'card', 'injury', 'tactical']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    },
    data: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  }],
  statistics: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
matchSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
