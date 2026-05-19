const mongoose = require('mongoose');

const notificationRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Rule name is required'],
      trim: true,
    },
    eventTrigger: {
      type: String,
      required: [true, 'Event trigger is required'],
      enum: ['order_placed', 'order_shipped', 'payment_failed', 'user_signup'],
    },
    channel: {
      type: String,
      required: [true, 'Channel is required'],
      enum: ['email', 'sms', 'push'],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('NotificationRule', notificationRuleSchema);
