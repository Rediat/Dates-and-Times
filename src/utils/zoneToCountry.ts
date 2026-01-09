// Mapping of common IANA timezones to Country Names
export const zoneToCountry: Record<string, string> = {
    // Africa
    'Africa/Cairo': 'Egypt',
    'Africa/Johannesburg': 'South Africa',
    'Africa/Lagos': 'Nigeria',
    'Africa/Nairobi': 'Kenya',
    'Africa/Accra': 'Ghana',
    'Africa/Casablanca': 'Morocco',

    // Americas
    'America/New_York': 'United States',
    'America/Chicago': 'United States',
    'America/Denver': 'United States',
    'America/Los_Angeles': 'United States',
    'America/Phoenix': 'United States',
    'America/Anchorage': 'United States',
    'America/Toronto': 'Canada',
    'America/Vancouver': 'Canada',
    'America/Mexico_City': 'Mexico',
    'America/Sao_Paulo': 'Brazil',
    'America/Argentina/Buenos_Aires': 'Argentina',
    'America/Bogota': 'Colombia',
    'America/Lima': 'Peru',
    'America/Santiago': 'Chile',
    'America/Caracas': 'Venezuela',

    // Asia
    'Asia/Tokyo': 'Japan',
    'Asia/Shanghai': 'China',
    'Asia/Hong_Kong': 'Hong Kong',
    'Asia/Singapore': 'Singapore',
    'Asia/Seoul': 'South Korea',
    'Asia/Bangkok': 'Thailand',
    'Asia/Dubai': 'United Arab Emirates',
    'Asia/Kolkata': 'India',
    'Asia/Jakarta': 'Indonesia',
    'Asia/Ho_Chi_Minh': 'Vietnam',
    'Asia/Taipei': 'Taiwan',
    'Asia/Manila': 'Philippines',
    'Asia/Kuala_Lumpur': 'Malaysia',
    'Asia/Riyadh': 'Saudi Arabia',
    'Asia/Tel_Aviv': 'Israel',
    'Asia/Baghdad': 'Iraq',
    'Asia/Tehran': 'Iran',
    'Asia/Karachi': 'Pakistan',

    // Europe
    'Europe/London': 'United Kingdom',
    'Europe/Paris': 'France',
    'Europe/Berlin': 'Germany',
    'Europe/Rome': 'Italy',
    'Europe/Madrid': 'Spain',
    'Europe/Moscow': 'Russia',
    'Europe/Istanbul': 'Turkey',
    'Europe/Amsterdam': 'Netherlands',
    'Europe/Brussels': 'Belgium',
    'Europe/Zurich': 'Switzerland',
    'Europe/Vienna': 'Austria',
    'Europe/Stockholm': 'Sweden',
    'Europe/Oslo': 'Norway',
    'Europe/Copenhagen': 'Denmark',
    'Europe/Helsinki': 'Finland',
    'Europe/Warsaw': 'Poland',
    'Europe/Prague': 'Czech Republic',
    'Europe/Budapest': 'Hungary',
    'Europe/Athens': 'Greece',
    'Europe/Lisbon': 'Portugal',
    'Europe/Dublin': 'Ireland',
    'Europe/Kyiv': 'Ukraine',
    'Europe/Bucharest': 'Romania',

    // Oceania
    'Australia/Sydney': 'Australia',
    'Australia/Melbourne': 'Australia',
    'Australia/Brisbane': 'Australia',
    'Australia/Perth': 'Australia',
    'Australia/Adelaide': 'Australia',
    'Pacific/Auckland': 'New Zealand',
    'Pacific/Fiji': 'Fiji',

    // Default/Fallback
    'UTC': 'Universal Time',
};

export const getCountryName = (zone: string): string => {
    if (zoneToCountry[zone]) {
        return zoneToCountry[zone];
    }
    // Fallback: try to extract from zone name
    if (zone.includes('/')) {
        const parts = zone.split('/');
        // e.g. "Europe/Andorra" -> "Andorra"
        return parts[parts.length - 1].replace(/_/g, ' ');
    }
    return zone;
};
