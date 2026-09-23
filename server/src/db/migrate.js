import { runMigrations } from './client.js';

console.log('[MIGRATE] Iniciando migrações do banco de dados...');
runMigrations()
  .then(() => {
    console.log('[MIGRATE] Migrações finalizadas com sucesso.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[MIGRATE] Erro nas migrações:', err);
    process.exit(1);
  });
