const mongoose = require('mongoose');

const performanceDataSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metrics: {
    position: {
      x: {
        type: Number,
        required: true
      },
      y: {
        type: Number,
        required: true
      }
    },
    speed: {
      type: Number,
      default: 0
    },
    heartRate: {
      type: Number,
      default: 0
    },
    distance: {
      type: Number,
      default: 0
    },
    acceleration: {
      type: Number,
      default: 0
    },
    workRate: {
      type: Number,
      default: 0
    }
  }
});

// Index for efficient queries
performanceDataSchema.index({ matchId: 1, playerId: 1, timestamp: 1 });

const PerformanceData = mongoose.model('PerformanceData', performanceDataSchema);

module.exports = PerformanceData;
