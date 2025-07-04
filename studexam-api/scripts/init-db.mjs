import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leggi config.json dalla root
const config = JSON.parse(
  readFileSync(resolve(__dirname, '../config.json'), 'utf8')
);

const sql = `CREATE DATABASE ${config.DB_NAME};`;

// Esegui il comando da scripts/ (o da /database se vuoi spostarlo)
try {
  execSync(`psql -U ${config.DB_USER} -d postgres -c "${sql}"`, {
  stdio: 'inherit',
  env: { ...process.env, PGPASSWORD: config.DB_PASS }
});

} catch (e) {
  console.error('Errore nella creazione del database:', e.message);
}
