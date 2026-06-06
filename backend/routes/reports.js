const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// GET /api/reports/summary - Summary cards statistics
router.get('/summary', authenticateToken, isAdmin, async (req, res) => {
  try {
    const summaryRes = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status IN ('Created', 'Picked Up', 'Out For Delivery') THEN 1 ELSE 0 END) as pending
      FROM dispatches
    `);

    const summary = {
      total: parseInt(summaryRes.rows[0].total || 0),
      delivered: parseInt(summaryRes.rows[0].delivered || 0),
      failed: parseInt(summaryRes.rows[0].failed || 0),
      pending: parseInt(summaryRes.rows[0].pending || 0)
    };

    res.json(summary);
  } catch (error) {
    console.error('Fetch reports summary error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/reports/status-distribution - Charts: Status Distribution
router.get('/status-distribution', authenticateToken, isAdmin, async (req, res) => {
  try {
    const distRes = await query(`
      SELECT status, COUNT(*) as count 
      FROM dispatches 
      GROUP BY status
    `);

    // Ensure all statuses are represented in response
    const statuses = ['Created', 'Picked Up', 'Out For Delivery', 'Delivered', 'Failed'];
    const distMap = {};
    statuses.forEach(s => distMap[s] = 0);
    distRes.rows.forEach(row => {
      distMap[row.status] = parseInt(row.count || 0);
    });

    const data = statuses.map(s => ({
      status: s,
      count: distMap[s]
    }));

    res.json(data);
  } catch (error) {
    console.error('Fetch status distribution error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/reports/agent-performance - Charts: Agent Performance
router.get('/agent-performance', authenticateToken, isAdmin, async (req, res) => {
  try {
    const perfRes = await query(`
      SELECT 
        a.id, 
        a.name, 
        COUNT(d.id) as total,
        SUM(CASE WHEN d.status = 'Delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN d.status = 'Failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN d.status IN ('Created', 'Picked Up', 'Out For Delivery') THEN 1 ELSE 0 END) as pending
      FROM delivery_agents a
      LEFT JOIN dispatches d ON d.agent_id = a.id
      WHERE a.role = 'agent'
      GROUP BY a.id, a.name
      ORDER BY total DESC
    `);

    const data = perfRes.rows.map(row => ({
      agent_id: row.id,
      agent_name: row.name,
      total: parseInt(row.total || 0),
      delivered: parseInt(row.delivered || 0),
      failed: parseInt(row.failed || 0),
      pending: parseInt(row.pending || 0)
    }));

    res.json(data);
  } catch (error) {
    console.error('Fetch agent performance error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/reports/daily - Generate and export data for report downloads
router.get('/daily', authenticateToken, isAdmin, async (req, res) => {
  const { date } = req.query; // optional date filter, defaults to today
  
  let targetDate = date;
  if (!targetDate) {
    const today = new Date();
    targetDate = today.toISOString().split('T')[0];
  }

  try {
    const dispatchesRes = await query(`
      SELECT 
        d.id,
        d.order_id, 
        d.recipient_name, 
        d.delivery_address, 
        a.name as agent_name, 
        d.status, 
        d.scheduled_date, 
        d.last_updated,
        d.notes
      FROM dispatches d
      LEFT JOIN delivery_agents a ON d.agent_id = a.id
      WHERE d.scheduled_date = $1
      ORDER BY d.last_updated DESC
    `, [targetDate]);

    res.json({
      date: targetDate,
      total: dispatchesRes.rowCount,
      records: dispatchesRes.rows
    });
  } catch (error) {
    console.error('Fetch daily report error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
