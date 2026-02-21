import 'dotenv/config';
import handler from './api/install/db-sync';

async function run() {
  console.log('Starting manual migration...');
  const result = await handler();
  console.log('Migration result:', result);
  process.exit(result.success ? 0 : 1);
}

run();
