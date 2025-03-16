const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['tactical', 'physical', 'substitution'],
    required: true
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  message: {
    type: String,
    required: true
  },
  relatedPlayers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  acknowledged: {
    type: Boolean,
    default: false
  }
});

// Index for efficient queries
insightSchema.index({ matchId: 1, timestamp: -1 });

const Insight = mongoose.model('Insight', insightSchema);

module.exports = Insight;
