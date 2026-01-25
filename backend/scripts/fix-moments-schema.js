// fix moments man wtffffff
require('dotenv').config();
const db = require('../db.js');

async function main() {
  try {
    console.log('\n--- 1. Current indexes on Moments ---');
    const [indexes] = await db.query('SHOW INDEX FROM Moments');
    console.table(indexes);

    console.log('\n--- 2. Full table definition ---');
    const [create] = await db.query('SHOW CREATE TABLE Moments');
    console.log(create[0]['Create Table']);
    console.log('');

    const keyNames = [...new Set(indexes.map((r) => r.Key_name))];
    const hasUserIdIndex = keyNames.some((k) => k === 'user_id');

    if (hasUserIdIndex) {
      console.log("Dropping index 'user_id' (allows multiple moments per user)...");
      await db.query('ALTER TABLE Moments DROP INDEX user_id');
      console.log('✅ Dropped index user_id.');
    } else {
      console.log("No index named 'user_id' found.");
      const nonPrimary = keyNames.filter((k) => k !== 'PRIMARY');
      if (nonPrimary.length) {
        console.log('Other non-PRIMARY indexes:', nonPrimary.join(', '));
      }
    }

    console.log('\n--- 3. Indexes after fix ---');
    const [after] = await db.query('SHOW INDEX FROM Moments');
    console.table(after);

    console.log('\nDone. Try creating a moment again.\n');
  } catch (e) {
    console.error('Error:', e.message);
    if (e.sql) console.error('SQL:', e.sql);
  } finally {
    await db.end();
  }
}

main();
