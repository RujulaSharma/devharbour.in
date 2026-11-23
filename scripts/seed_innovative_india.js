#!/usr/bin/env node
const fs = require('node:fs');
const crypto = require('node:crypto');
require('dotenv').config({ quiet: true });
const { pool } = require('../server/db-postgres');

const EVENT = 'innovative-india-2026';
const idPattern = /^IN-26-\d{7}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readRegistry(file) {
  const rows = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('Expected a nonempty registry array.');
  const emails = new Set();
  const ids = new Set();
  return rows.map((row, index) => {
    const email = row.email?.trim().toLowerCase();
    const name = row.name;
    const id = row.credential_id || null;
    if (!emailPattern.test(email) || typeof name !== 'string' || !name.trim() || emails.has(email) ||
        (id && (!idPattern.test(id) || ids.has(id)))) {
      throw new Error('Invalid or duplicate registration at row ' + (index + 1) + '.');
    }
    emails.add(email);
    if (id) ids.add(id);
    return { email, name, id };
  });
}

async function importRegistry(file, apply) {
  const registry = readRegistry(file);
  if (!apply) {
    console.log('Validated ' + registry.length + ' registrations, including ' + registry.filter(row => row.id).length + ' assigned IDs.');
    return;
  }
  if (!pool) throw new Error('Configure DATABASE_URL for the target PostgreSQL database.');
  const client = await pool.connect();
  let changed = 0;
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext('innovative-india-2026-issuance'))");
    const type = await client.query("SELECT data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'event_participants' AND column_name = 'id'");
    const textIds = type.rows[0]?.data_type === 'text';
    for (const [index, row] of registry.entries()) {
      const existing = await client.query(
        "SELECT id, certificate_credential_id FROM public.event_participants WHERE event_slug = $1 AND lower(trim(candidate_email)) = $2",
        [EVENT, row.email]
      );
      if (row.id) {
        const conflict = await client.query(
          "SELECT 1 FROM public.issued_certificates WHERE (credential_id = $1 AND (event_slug <> $2 OR lower(trim(recipient_email)) <> $3)) OR (event_slug = $2 AND lower(trim(recipient_email)) = $3 AND credential_id <> $1) UNION ALL SELECT 1 FROM public.event_participants WHERE event_slug = $2 AND certificate_credential_id = $1 AND lower(trim(candidate_email)) <> $3",
          [row.id, EVENT, row.email]
        );
        if (conflict.rowCount || (existing.rows[0]?.certificate_credential_id && existing.rows[0].certificate_credential_id !== row.id)) {
          throw new Error('Registry ID conflicts with an existing assignment at row ' + (index + 1) + '. No records were imported.');
        }
      }
      if (!existing.rowCount) {
        const fields = 'event_slug, candidate_name, candidate_email, certificate_credential_id';
        const values = [EVENT, row.name, row.email, row.id];
        if (textIds) {
          await client.query('INSERT INTO public.event_participants (' + fields + ', id) VALUES ($1,$2,$3,$4,$5)',
            [...values, 'in-' + crypto.randomUUID()]);
        } else {
          await client.query('INSERT INTO public.event_participants (' + fields + ') VALUES ($1,$2,$3,$4)', values);
        }
        changed++;
      } else if (row.id && !existing.rows[0].certificate_credential_id) {
        await client.query('UPDATE public.event_participants SET certificate_credential_id = $1 WHERE id = $2', [row.id, existing.rows[0].id]);
        changed++;
      }
    }
    await client.query('COMMIT');
    console.log('Validated ' + registry.length + ' registrations. Added or reserved ' + changed + ' records.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  const [, , file, flag] = process.argv;
  if (!file || ![undefined, '--apply'].includes(flag)) {
    console.error('Usage: node scripts/seed_innovative_india.js PRIVATE_REGISTRY.json [--apply]');
    process.exitCode = 1;
  } else {
    importRegistry(file, flag === '--apply').catch(error => {
      console.error(error.code ? 'Registry import failed (' + error.code + ').' : error.message);
      process.exitCode = 1;
    }).finally(() => pool?.end());
  }
}
