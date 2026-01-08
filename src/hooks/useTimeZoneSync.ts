import { useState, useCallback, useEffect, useMemo } from 'react';
import { DateTime } from 'luxon';
import { top17Zones } from '../utils/timeUtils';

export interface TimeZoneEntry {
    id: string;
    zoneName: string; // e.g., 'America/New_York'
}



export const useTimeZoneSync = (initialZones: string[] = ['local', 'UTC']) => {
    // We'll store the time as a Unix timestamp (milliseconds) to ensure clean React state updates
    const [baseMillis, setBaseMillis] = useState<number>(DateTime.now().toMillis());
    const [zones, setZones] = useState<TimeZoneEntry[]>(
        initialZones.map((z) => ({
            id: Math.random().toString(36).substr(2, 9),
            zoneName: z === 'local' ? DateTime.local().zoneName || 'UTC' : z
        }))
    );

    const baseTime = useMemo(() => {
        const dt = DateTime.fromMillis(baseMillis).toUTC();
        return dt;
    }, [baseMillis]);
    const [use24Hour, setUse24Hour] = useState(true);
    const [showDate, setShowDate] = useState(true);

    // Update base time to current time every minute to keep it fresh
    useEffect(() => {
        const interval = setInterval(() => {
            // Only auto-update if the user hasn't manually adjusted time recently?
            // For now, let's just keep it simple.
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const updateBaseTime = useCallback((newTime: DateTime) => {
        if (newTime.isValid) {
            const newMillis = newTime.toMillis();
            setBaseMillis(newMillis);
        } else {
            console.warn('[useTimeZoneSync] Attempted to update with invalid DateTime', newTime);
        }
    }, []);

    const addZone = useCallback((zoneName: string) => {
        let newZone = zoneName;
        // Check if explicit string 'random' or if event object was passed (default arg in some contexts)
        // or if explicitly undefined/empty.
        if (!newZone || newZone === 'random' || typeof newZone !== 'string') {
            const randomZone = top17Zones[Math.floor(Math.random() * top17Zones.length)];
            newZone = randomZone;
        }
        setZones((prev) => [...prev, { id: Math.random().toString(36).substr(2, 9), zoneName: newZone }]);
    }, []);

    const removeZone = useCallback((id: string) => {
        setZones((prev) => prev.filter((z) => z.id !== id));
    }, []);

    const updateZone = useCallback((id: string, newZoneName: string) => {
        // Find the card being updated
        const cardIndex = zones.findIndex((z) => z.id === id);
        if (cardIndex === -1) return;

        const currentZoneName = zones[cardIndex].zoneName;

        // Calculate the current local time components (year, month, day, hour, minute)
        // using the OLD zone.
        const currentLocalTime = DateTime.fromMillis(baseMillis).setZone(currentZoneName);

        // Create a new DateTime with the SAME local components but in the NEW zone.
        // `setZone(newZone, { keepLocalTime: true })` does exactly this.
        const newTimeInNewZone = currentLocalTime.setZone(newZoneName, { keepLocalTime: true });

        if (newTimeInNewZone.isValid) {
            // Update the global baseMillis to match this new absolute time
            setBaseMillis(newTimeInNewZone.toMillis());
        }

        // Finally, update the zone list
        setZones((prev) => prev.map((z) => z.id === id ? { ...z, zoneName: newZoneName } : z));

        // This effectively "anchors" the time display of the modified card, forcing all other cards
        // to shift to match the new global timeline.
    }, [baseMillis, zones]);

    return {
        baseTime,
        zones,
        updateBaseTime,
        addZone,
        removeZone,
        updateZone,
        use24Hour,
        setUse24Hour,
        showDate,
        setShowDate,
        baseMillis // Expose for debugging if needed
    };
};
