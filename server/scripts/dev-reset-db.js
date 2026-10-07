const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const readline = require('readline');

dotenv.config({ path: path.join(__dirname, '../.env') });

const confirmPrompt = () => {
  return new Promise((resolve) => {
    if (process.env.CONFIRM_WIPE === 'true' || process.argv.includes('--confirm-reset')) {
      return resolve(true);
    }
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(
      '⚠️  WARNING: You are about to WIPING the entire MongoDB database. Type "YES I WANT TO WIPE DB" to proceed: ',
      (answer) => {
        rl.close();
        resolve(answer.trim() === 'YES I WANT TO WIPE DB');
      }
    );
  });
};

const devResetDb = async () => {
  const confirmed = await confirmPrompt();
  if (!confirmed) {
    console.log('❌ Database reset aborted. Safeguard active.');
    process.exit(0);
  }

  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kitcommunity';
    console.log('Connecting to MongoDB:', mongoUri);
    await mongoose.connect(mongoUri);

    console.log('Wiping entire MongoDB database (all collections)...');
    await mongoose.connection.dropDatabase();
    console.log('✅ Database wiped cleanly.');

    process.exit(0);
  } catch (error) {
    console.error('Error during DB reset:', error);
    process.exit(1);
  }
};

devResetDb();
