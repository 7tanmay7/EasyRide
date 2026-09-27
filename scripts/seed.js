const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('[EasyRide Seed] Running Bengaluru Mobility Dataset Generator...');

try {
  execSync('python scripts/generate_dataset.py', { stdio: 'inherit' });
  console.log('[EasyRide Seed] Seed dataset generated successfully!');
} catch (e) {
  console.error('[EasyRide Seed] Error running python script:', e.message);
}
