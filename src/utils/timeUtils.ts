import { DateTime } from 'luxon';

// A subset of common/popular time zones for quick selection
export const popularTimeZones = [
    { name: 'Local Time', value: 'local' },
    { name: 'UTC / GMT', value: 'UTC' },
    { name: 'New York (EDT/EST)', value: 'America/New_York' },
    { name: 'Los Angeles (PDT/PST)', value: 'America/Los_Angeles' },
    { name: 'London (BST/GMT)', value: 'Europe/London' },
    { name: 'Paris (CEST/CET)', value: 'Europe/Paris' },
    { name: 'Tokyo (JST)', value: 'Asia/Tokyo' },
    { name: 'Dubai (GST)', value: 'Asia/Dubai' },
    { name: 'Singapore (SGT)', value: 'Asia/Singapore' },
    { name: 'Sydney (AEST/AEDT)', value: 'Australia/Sydney' },
    { name: 'Mumbai (IST)', value: 'Asia/Kolkata' },
    { name: 'Sao Paulo (BRT)', value: 'America/Sao_Paulo' },
];

// Top 17 Time Zones for random selection (excluding local/UTC if desired, or mixing them in)
// The user asked for "top 17 time zones from the drop down".
// I'll define a robust list here.
export const top17Zones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Dubai',
    'Asia/Singapore',
    'Australia/Sydney',
    'Asia/Kolkata',
    'America/Sao_Paulo',
    'Asia/Shanghai', // China
    'Europe/Moscow',
    'Asia/Hong_Kong',
    'America/Chicago',
    'America/Toronto',
    'Europe/Berlin'
];

// Common abbreviations mapped to IANA zone names
export const abbreviations = [
    { name: 'EAT - Eastern Africa Time', value: 'Africa/Nairobi' },
    { name: 'WET - Western European Time', value: 'Europe/Lisbon' },
    { name: 'CET - Central European Time', value: 'Europe/Paris' },
    { name: 'EET - Eastern European Time', value: 'Europe/Athens' },
    { name: 'AST - Arabia Standard Time', value: 'Asia/Riyadh' },
    { name: 'GST - Gulf Standard Time', value: 'Asia/Dubai' },
    { name: 'IST - India Standard Time', value: 'Asia/Kolkata' },
    { name: 'SGT - Singapore Time', value: 'Asia/Singapore' },
    { name: 'CST - China Standard Time', value: 'Asia/Shanghai' },
    { name: 'JST - Japan Standard Time', value: 'Asia/Tokyo' },
    { name: 'KST - Korea Standard Time', value: 'Asia/Seoul' },
    { name: 'AEST - Australian Eastern Standard Time', value: 'Australia/Sydney' },
    { name: 'PST - Pacific Standard Time', value: 'America/Los_Angeles' },
    { name: 'MST - Mountain Standard Time', value: 'America/Denver' },
    { name: 'CST - Central Standard Time', value: 'America/Chicago' },
    { name: 'EST - Eastern Standard Time', value: 'America/New_York' },
    { name: 'BRT - Brasilia Time', value: 'America/Sao_Paulo' },
];

import { getCountryName } from './zoneToCountry';

export interface TimeZoneOption {
    value: string;
    label: string;
    country: string;
    offset: string;
    offsetMinutes: number; // for sorting
}

// Helper to get all available time zones from Luxon/Intl
export const getAllTimeZones = (): TimeZoneOption[] => {
    const supportedZones = Intl.supportedValuesOf('timeZone');

    // Add UTC if not present
    if (!supportedZones.includes('UTC')) {
        supportedZones.push('UTC');
    }

    const zonesWithData = supportedZones.map(zone => {
        const dt = DateTime.now().setZone(zone);
        const offset = dt.toFormat('ZZ');
        const offsetMinutes = dt.offset;
        const country = getCountryName(zone);

        // Format: "Country (GMT+XX:XX)" 
        // Or if user wants specifically "Country Name and thier GMT time zone in bracket"
        // Let's do: "Country - City (GMT+XX:XX)" for clarity if multiple cities, 
        // or just "Country (GMT+XX:XX)" if we only care about country.
        // User asked: "add on the drop down items list their country name and thier GMT time zone in bracket."
        // Example: "United Kingdom (GMT+01:00)"

        // We might want to include the City if it's significant, but let's stick to the request.
        // However, many zones map to the same country (e.g. US). 
        // Distinguishing them is important.
        // Let's format as: "Country - City (GMT+XX:XX)"

        let label = '';
        if (zone === 'UTC') {
            label = 'Universal Time (GMT+00:00)';
        } else {
            const city = zone.split('/').pop()?.replace(/_/g, ' ') || zone;
            // If country name is basically the city or just a continent, handle gracefully
            if (country === city) {
                label = `${country} (GMT${offset})`;
            } else {
                label = `${country} - ${city} (GMT${offset})`;
            }
        }

        return {
            value: zone,
            label,
            country,
            offset,
            offsetMinutes
        };
    });

    // Sort by offset? Or by Country? 
    // Usually offset is good for time zones, but country search is requested. 
    // Let's sort by Country Name then City.
    return zonesWithData.sort((a, b) => {
        if (a.country !== b.country) return a.country.localeCompare(b.country);
        return a.value.localeCompare(b.value);
    });
};

export const formatTime = (dt: DateTime, use24Hour: boolean) => {
    return dt.toFormat(use24Hour ? 'HH:mm' : 'h:mm a');
};

export const formatDate = (dt: DateTime) => {
    return dt.toFormat('ccc, LLL d, yyyy');
};

export const getDayNightStatus = (dt: DateTime) => {
    const hour = dt.hour;
    if (hour >= 6 && hour < 18) return 'day';
    return 'night';
};
