const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String,
    default: '/default-team-logo.png'
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  coaches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  subscription: {
    plan: {
      type: String,
      enum: ['essential', 'professional', 'elite'],
      default: 'essential'
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 days from now
    }
  },
  settings: {
    defaultFormation: {
      type: String,
      default: '4-4-2'
    },
    metricPreferences: {
      type: Map,
      of: Boolean,
      default: {
        distance: true,
        sprints: true,
        heartRate: true,
        workRate: true
      }
    },
    alertThresholds: {
      type: Map,
      of: Number,
      default: {
        fatigue: 80,
        sprintDecline: 20,
        heartRateMax: 90
      }
    }
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
teamSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
