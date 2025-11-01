const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    plaidAccessToken: {
      type: String,
      required: false, // Not required at registration
    },
    plaidItemId: {
      type: String,
      required: false,
    },
    // --- ADD THIS NEW FIELD FOR BUDGETS ---
    budgets: [
      {
        category: { type: String, required: true },
        limit: { type: Number, required: true },
      },
    ],

    notificationPreferences: {
      sendBillAlerts: { type: Boolean, default: true },
      sendBudgetAlerts: { type: Boolean, default: true },
    },

    twoFactorSecret: {
      base32: { type: String },
      otpauth_url: { type: String },
    },
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },

  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('User', userSchema);