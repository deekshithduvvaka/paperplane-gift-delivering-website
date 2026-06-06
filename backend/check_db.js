const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'paperplane.sqlite');
console.log('Opening DB at:', dbPath);

const db = new sqlite3.Database(dbPath);

db.all('SELECT id, name, email, password_hash, role, is_active FROM delivery_agents', [], async (err, rows) => {
  if (err) {
    console.error('Error fetching agents:', err);
    process.exit(1);
  }
  console.log('Agents count:', rows.length);
  for (const row of rows) {
    console.log(`Agent: ${row.name} <${row.email}>, Role: ${row.role}, Active: ${row.is_active}`);
    const isMatched = await bcrypt.compare('adminpassword', row.password_hash);
    console.log('  Verifying "adminpassword" comparison:', isMatched);
    const isMatched2 = await bcrypt.compare('agentpassword', row.password_hash);
    console.log('  Verifying "agentpassword" comparison:', isMatched2);
  }
  db.close();
});
