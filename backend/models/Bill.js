// File: backend/models/Bill.js
const mongoose = require('mongoose');

const billSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },  
    name: {
      type: String,
      required: [true, 'Please add a bill name'],
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Please add a due date'],
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    category: {
        type: String,
        default: 'Utilities'
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Bill', billSchema);
