const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// GET /api/agents - List all active agents (Admin only)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const agentsRes = await query(
      "SELECT id, name, email, phone, is_active FROM delivery_agents WHERE role = 'agent' AND is_active = 1 OR role = 'agent' AND is_active = true ORDER BY name ASC"
    );
    res.json({ agents: agentsRes.rows });
  } catch (error) {
    console.error('Fetch agents error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
