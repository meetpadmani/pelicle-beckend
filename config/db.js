const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    const c = { reset: '\x1b[0m', bold: '\x1b[1m', green: '\x1b[38;2;80;200;120m', cyan: '\x1b[38;2;100;210;210m', gray: '\x1b[90m', dim: '\x1b[2m' };
    const edge = `${c.gray}│${c.reset}`;
    console.log(`${edge}  🍃  ${c.dim}${c.gray}MongoDB ${c.reset}      ${c.green}${c.bold}CONNECTED${c.reset}`);
    console.log(`${edge}  🌐  ${c.dim}${c.gray}Cluster ${c.reset}      ${c.cyan}${conn.connection.host}${c.reset}`);
    console.log(`${c.gray}╰${'─'.repeat(52)}╯${c.reset}\n`);

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
