const express = require('express');
const router = express.Router();
const { listRules, createRule, updateRule, deleteRule } = require('../controllers/notificationRuleController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/',    protect, adminOnly, listRules);
router.post('/',   protect, adminOnly, createRule);
router.put('/:id', protect, adminOnly, updateRule);
router.delete('/:id', protect, adminOnly, deleteRule);

module.exports = router;
