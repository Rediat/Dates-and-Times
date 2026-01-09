import { DateTime } from 'luxon';

const zones = [
    'Africa/Nairobi',
    'Europe/Lisbon',
    'America/Chicago',
    'Asia/Tokyo',
    'UTC',
    'Europe/London',
    'Australia/Sydney',
    'Europe/Paris'
];

console.log('Testing timezone abbreviations...\n');

zones.forEach(zone => {
    const dt = DateTime.now().setZone(zone);
    const abbr = dt.toFormat('z');
    const full = dt.toFormat('ZZZZ');
    const offset = dt.toFormat('ZZ');

    console.log(`Zone: ${zone}`);
    console.log(`  Abbreviation (z): ${abbr}`);
    console.log(`  Full Name (ZZZZ): ${full}`);
    console.log(`  Offset: GMT${offset}`);
    console.log('---');
});
