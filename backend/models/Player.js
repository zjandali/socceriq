const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']
  },
  jerseyNumber: {
    type: Number,
    required: true
  },
  physicalProfile: {
    height: {
      type: Number,
      default: 0
    },
    weight: {
      type: Number,
      default: 0
    },
    maxHeartRate: {
      type: Number,
      default: 200
    },
    maxSpeed: {
      type: Number,
      default: 0
    }
  },
  baselineMetrics: {
    avgDistance: {
      type: Number,
      default: 0
    },
    avgSprints: {
      type: Number,
      default: 0
    },
    avgWorkRate: {
      type: Number,
      default: 0
    }
  },
  deviceId: {
    type: String,
    default: ''
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
playerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;
