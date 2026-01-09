import React from 'react';
import { DateTime } from 'luxon';
import { Trash2, Sun, Moon } from 'lucide-react';
import { getDayNightStatus, getAllTimeZones } from '../utils/timeUtils';
import { SearchableSelect } from './SearchableSelect';

interface TimeCardProps {
    id: string;
    zoneName: string;
    baseTime: DateTime;
    use24Hour: boolean;
    showDate: boolean;
    onTimeChange: (newTime: DateTime) => void;
    onZoneChange: (newZone: string) => void;
    onRemove: () => void;
    isDeletable: boolean;
}

export const TimeCard: React.FC<TimeCardProps> = ({
    zoneName,
    baseTime,
    use24Hour, // Used by the parent to control global time format
    showDate,
    onTimeChange,
    onZoneChange,
    onRemove,
    isDeletable
}) => {
    const localDateTime = baseTime.setZone(zoneName);
    const status = getDayNightStatus(localDateTime);
    const allZones = getAllTimeZones();

    // Local state for the input value to allow for seamless typing
    const [inputValue, setInputValue] = React.useState('');

    // Sync local input with global time when global time changes (and we're not focused? No, aggressive sync might interrupt.
    // Better: Sync when formatting changes or baseTime changes significantly?)
    // Actually, to avoid fighting the user, we can rely on standard React controlled input pattern
    // but allow intermediate invalid states.
    // However, since baseTime updates every minute or from other cards, we MUST sync.
    React.useEffect(() => {
        setInputValue(use24Hour ? localDateTime.toFormat('HH:mm') : localDateTime.toFormat('hh:mm a'));
    }, [baseTime.toMillis(), zoneName, use24Hour]);

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val); // Always update local state immediately so typing flows

        let newTime: DateTime | null = null;
        let isValidUpdate = false;

        if (use24Hour) {
            // Browser native time input gives HH:mm
            const [hours, minutes] = val.split(':').map(Number);
            if (!isNaN(hours) && !isNaN(minutes)) {
                newTime = localDateTime.set({ hour: hours, minute: minutes });
                isValidUpdate = true;
            }
        } else {
            // Text input: try parsing "hh:mm a" or just "hh:mm" (assume AM/PM if missing?)
            // Let's use Luxon's loose parsing or specific formats
            let dt = DateTime.fromFormat(val, 'hh:mm a');
            if (!dt.isValid) dt = DateTime.fromFormat(val, 'hh:mm a'); // retry exact? no
            if (!dt.isValid) dt = DateTime.fromFormat(val, 'h:mm a');
            // Support partial typing for real-time feel if it's a valid time
            if (dt.isValid) {
                newTime = localDateTime.set({ hour: dt.hour, minute: dt.minute });
                isValidUpdate = true;
            }
        }

        if (isValidUpdate && newTime && newTime.isValid) {
            onTimeChange(newTime);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (!value) return;

        // Standard date inputs provide YYYY-MM-DD
        const dateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (dateMatch) {
            const [_, year, month, day] = dateMatch.map(Number);
            const newTime = localDateTime.set({ year, month, day });
            onTimeChange(newTime);
        } else {
            // Fallback for non-standard formats if any
            const dt = DateTime.fromISO(value);
            if (dt.isValid) {
                const newTime = localDateTime.set({ year: dt.year, month: dt.month, day: dt.day });
                onTimeChange(newTime);
            }
        }
    };

    // Track cursor position to restore it after updates
    const inputRef = React.useRef<HTMLInputElement>(null);
    const cursorRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (cursorRef.current !== null && inputRef.current) {
            inputRef.current.setSelectionRange(cursorRef.current, cursorRef.current);
            cursorRef.current = null;
        }
    }, [inputValue]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (use24Hour) return; // Native input handles this for 24H

        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const input = e.currentTarget;
            const cursor = input.selectionStart || 0;
            const val = inputValue;

            // Expected format: "hh:mm a" (e.g., "04:30 PM")
            let dt = DateTime.fromFormat(val, 'hh:mm a');
            if (!dt.isValid) return;

            const step = e.key === 'ArrowUp' ? 1 : -1;

            // Heuristic for cursor position:
            // 0-2: Hour
            // 3-5: Minute
            // 6+: AM/PM
            let newDt = dt;
            if (cursor <= 2) {
                newDt = dt.plus({ hours: step });
                cursorRef.current = cursor <= 2 ? cursor : 0; // Keep cursor in hour
            } else if (cursor >= 3 && cursor <= 5) {
                newDt = dt.plus({ minutes: step });
                cursorRef.current = cursor; // Keep cursor
            } else {
                // AM/PM toggle - adding 12 hours works
                newDt = dt.plus({ hours: 12 });
                cursorRef.current = cursor;
            }

            // Update parent
            const newTime = localDateTime.set({
                hour: newDt.hour,
                minute: newDt.minute
            });
            onTimeChange(newTime);
            // Also update local state immediately to avoid flickers and allow cursor restore effectiveness
            setInputValue(newDt.toFormat('hh:mm a'));
        }
    };

    return (
        <div className="bg-neutral-800/40 rounded-2xl p-4 transition-all duration-300 border border-transparent hover:border-neutral-700 relative group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col flex-1 min-w-0 mr-4">
                    <div className="relative z-10">
                        <SearchableSelect
                            options={allZones}
                            value={zoneName}
                            onChange={onZoneChange}
                            className="w-full"
                        />
                    </div>
                    <span className="text-[9px] uppercase tracking-tighter text-neutral-500 font-bold mt-2 ml-1 self-start">
                        GMT {localDateTime.toFormat('ZZ')} • {status}
                    </span>
                </div>

                {isDeletable && (
                    <button
                        onClick={onRemove}
                        className="p-1.5 bg-neutral-900/50 border border-neutral-800 text-neutral-600 hover:text-red-400 hover:border-red-500/30 rounded-lg transition-all active:scale-95"
                    >
                        <Trash2 size={14} strokeWidth={2.5} />
                    </button>
                )}
            </div>

            <div className="flex flex-col items-center">
                <div className="relative group w-full flex justify-center">
                    {/* Overlay Text for 24H mode to ensure strict formatting on mobile */}
                    {use24Hour && (
                        <span className="absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl md:text-6xl font-mono font-black text-white pointer-events-none">
                            {inputValue}
                        </span>
                    )}

                    <input
                        key={use24Hour ? '24h' : '12h'}
                        ref={inputRef}
                        type={use24Hour ? "time" : "text"}
                        value={inputValue}
                        onChange={handleTimeChange}
                        onKeyDown={handleKeyDown}
                        className={`text-4xl sm:text-5xl md:text-6xl font-mono font-black bg-transparent text-white text-center focus:outline-none focus:text-primary-400 transition-colors cursor-pointer w-full relative z-10 ${use24Hour ? 'opacity-0' : ''}`}
                        spellCheck={false}
                    />
                    <div className="absolute -top-4 flex items-center justify-center pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity">
                        {status === 'day' ? <Sun className="text-primary-500" size={20} /> : <Moon className="text-primary-500" size={20} />}
                    </div>
                </div>

                {showDate && (
                    <input
                        type="date"
                        value={localDateTime.toFormat('yyyy-MM-dd')}
                        onChange={handleDateChange}
                        className="text-xs font-bold text-neutral-500 bg-transparent border-none focus:outline-none focus:text-primary-500 text-center cursor-pointer mt-2"
                    />
                )}



                {/* Zone Label Display as requested */}
                <div className="mt-4 text-center">
                    <span className="text-[10px] font-bold text-neutral-600 tracking-wider uppercase bg-neutral-900/40 px-3 py-1 rounded-full border border-neutral-800">
                        {(() => {
                            const zone = allZones.find(z => z.value === zoneName);
                            if (zone) return zone.label;

                            // Fallback
                            if (localDateTime.toFormat('z') === localDateTime.zoneName) {
                                return localDateTime.zoneName.replace(/_/g, ' ');
                            }
                            return localDateTime.toFormat('ZZZZ');
                        })()}
                    </span>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 h-0.5 bg-primary-500/30 w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl" />
        </div>
    );
};
