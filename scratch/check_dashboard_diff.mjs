import fs from 'fs';

const sept20Csv = fs.readFileSync('scratch/tab_20_sept_live.csv', 'utf8');
const lines = sept20Csv.split('\n').filter(l => l.trim().length > 0);

const emailsInSept20 = new Set();
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',');
  const email = (parts[2] || parts[3] || '').replace(/["']/g, '').trim().toLowerCase();
  if (email) emailsInSept20.add(email);
}

const dashboardData = JSON.parse(fs.readFileSync('scratch/dashboard_tab_data.json', 'utf8'));

const missing = [];
for (let i = 1; i < dashboardData.length; i++) {
  const r = dashboardData[i];
  const fullname = r[1];
  const email = (r[2] || '').trim().toLowerCase();
  const mobile = r[3];
  if (email && email.includes('@') && !emailsInSept20.has(email)) {
    missing.push({ fullname, email, mobile });
  }
}

console.log(`Total Dashboard rows checked: ${dashboardData.length - 1}`);
console.log(`Total '20 sept live' rows now: ${lines.length - 1}`);
console.log(`Dashboard entries missing from '20 sept live': ${missing.length}`);
if (missing.length > 0) {
  console.log('Remaining missing Dashboard entries:');
  console.table(missing);
} else {
  console.log('🎉 ALL DASHBOARD ENTRIES ARE NOW 100% INCLUDED IN THE "20 sept live" TAB!');
}
