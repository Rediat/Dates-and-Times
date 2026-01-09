
import { zoneToCountry } from './src/utils/zoneToCountry.ts';

const supportedZones = Intl.supportedValuesOf('timeZone');
const missing = [];

supportedZones.forEach(zone => {
    if (!zoneToCountry[zone]) {
        // Exclude generic/Etc zones maybe? No, user wants everything.
        // But maybe ignore Etc/GMT...
        if (!zone.startsWith('Etc/')) {
            missing.push(zone);
        }
    }
});

console.log(`Total supported zones: ${supportedZones.length}`);
console.log(`Missing mappings: ${missing.length}`);
console.log('--- Missing Zones ---');
console.log(JSON.stringify(missing, null, 2));
