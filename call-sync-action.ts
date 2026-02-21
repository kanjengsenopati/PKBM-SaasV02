import 'dotenv/config';
import { performDatabaseSync } from './actions/dashboard';
import { AppRole } from './services/rbac-service';

const session = {
  id: 'admin_ph',
  email: 'admin@penahikmah.com',
  role: 'ADMIN' as AppRole,
  tenantId: 'pkbm-pena-hikmah',
  permissions: ['ALL']
};

async function run() {
  console.log('Calling performDatabaseSync with Admin session...');
  const result = await performDatabaseSync(session);
  console.log('Result:', result);
}

run();
