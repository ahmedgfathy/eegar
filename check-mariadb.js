require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkMariaDBTables() {
  console.log('🔍 Checking MariaDB database structure...');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'zerocall',
    database: 'eegar'
  });

  try {
    // List all tables
    console.log('📋 Available tables:');
    const [tables] = await connection.execute('SHOW TABLES');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    // Check each table's structure and count
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\n🔍 Table: ${tableName}`);
      
      // Get column structure
      const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
      console.log('   Columns:');
      columns.forEach(col => {
        console.log(`     - ${col.Field} (${col.Type})`);
      });
      
      // Get row count
      const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`   Row count: ${count[0].count}`);
      
      // Show sample data if exists
      if (count[0].count > 0) {
        const [sample] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 3`);
        console.log('   Sample data:');
        sample.forEach((row, index) => {
          console.log(`     Row ${index + 1}:`, Object.keys(row).slice(0, 5).map(key => `${key}: ${row[key]}`).join(', '));
        });
      }
    }

  } catch (error) {
    console.error('❌ Error checking MariaDB:', error);
  } finally {
    await connection.end();
  }
}

checkMariaDBTables();
