const mongoose = require('mongoose');

const goalSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please add a goal name'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please add a target amount'],
    },
    currentAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    deadline: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Goal', goalSchema);