const NotificationRule = require('../models/NotificationRule');

// GET /api/notification-rules — list all (admin)
exports.listRules = async (req, res) => {
  try {
    const rules = await NotificationRule.find().sort({ createdAt: -1 });
    res.json({ success: true, rules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/notification-rules — create
exports.createRule = async (req, res) => {
  try {
    const { name, eventTrigger, channel, active } = req.body;
    const rule = await NotificationRule.create({ name, eventTrigger, channel, active });
    res.status(201).json({ success: true, rule });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/notification-rules/:id — update
exports.updateRule = async (req, res) => {
  try {
    const { name, eventTrigger, channel, active } = req.body;
    const rule = await NotificationRule.findByIdAndUpdate(
      req.params.id,
      { name, eventTrigger, channel, active },
      { new: true, runValidators: true }
    );
    if (!rule) return res.status(404).json({ success: false, message: 'Rule not found' });
    res.json({ success: true, rule });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/notification-rules/:id — delete
exports.deleteRule = async (req, res) => {
  try {
    const rule = await NotificationRule.findByIdAndDelete(req.params.id);
    if (!rule) return res.status(404).json({ success: false, message: 'Rule not found' });
    res.json({ success: true, message: 'Rule deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
