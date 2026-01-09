import React from 'react';
import { DateTime } from 'luxon';
import { Trash2, Sun, Moon, ChevronUp, ChevronDown } from 'lucide-react';
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
    use24Hour,
    showDate,
    onTimeChange,
    onZoneChange,
    onRemove,
    isDeletable
}) => {
    const localDateTime = baseTime.setZone(zoneName);
    const status = getDayNightStatus(localDateTime);
    const allZones = getAllTimeZones();

    // Local state for the 24H input value
    const [inputValue, setInputValue] = React.useState('');

    // Local state for 12H split inputs
    const [hour12, setHour12] = React.useState('12');
    const [minute12, setMinute12] = React.useState('00');
    const [period, setPeriod] = React.useState<'AM' | 'PM'>('AM');

    // Sync local input with global time
    React.useEffect(() => {
        if (use24Hour) {
            setInputValue(localDateTime.toFormat('HH:mm'));
        } else {
            setHour12(localDateTime.toFormat('hh'));
            setMinute12(localDateTime.toFormat('mm'));
            setPeriod(localDateTime.hour >= 12 ? 'PM' : 'AM');
        }
    }, [baseTime.toMillis(), zoneName, use24Hour]);

    // Handle 24H time change
    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        const [hours, minutes] = val.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
            const newTime = localDateTime.set({ hour: hours, minute: minutes });
            if (newTime.isValid) {
                onTimeChange(newTime);
            }
        }
    };

    // Handle 12H split input changes
    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) val = val.slice(-2);

        let numVal = parseInt(val, 10);
        if (isNaN(numVal)) {
            setHour12(val);
            return;
        }

        // Clamp to 1-12
        if (numVal > 12) numVal = 12;
        if (numVal < 1 && val.length === 2) numVal = 1;

        const displayVal = val.length === 2 ? numVal.toString().padStart(2, '0') : val;
        setHour12(displayVal);

        if (val.length === 2 || numVal >= 2) {
            updateTime12(numVal, parseInt(minute12, 10), period);
        }
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) val = val.slice(-2);

        let numVal = parseInt(val, 10);
        if (isNaN(numVal)) {
            setMinute12(val);
            return;
        }

        // Clamp to 0-59
        if (numVal > 59) numVal = 59;

        const displayVal = val.length === 2 ? numVal.toString().padStart(2, '0') : val;
        setMinute12(displayVal);

        if (val.length === 2 || numVal >= 6) {
            updateTime12(parseInt(hour12, 10), numVal, period);
        }
    };

    const handlePeriodToggle = () => {
        const newPeriod = period === 'AM' ? 'PM' : 'AM';
        setPeriod(newPeriod);
        updateTime12(parseInt(hour12, 10), parseInt(minute12, 10), newPeriod);
    };

    const updateTime12 = (h: number, m: number, p: 'AM' | 'PM') => {
        if (isNaN(h) || isNaN(m) || h < 1 || h > 12 || m < 0 || m > 59) return;

        // Convert 12H to 24H
        let hour24 = h;
        if (p === 'AM') {
            hour24 = h === 12 ? 0 : h;
        } else {
            hour24 = h === 12 ? 12 : h + 12;
        }

        const newTime = localDateTime.set({ hour: hour24, minute: m });
        if (newTime.isValid) {
            onTimeChange(newTime);
        }
    };

    // Increment/decrement handlers for 12H mode
    const incrementHour = () => {
        let h = parseInt(hour12, 10);
        if (isNaN(h)) h = 12;
        h = h >= 12 ? 1 : h + 1;
        setHour12(h.toString().padStart(2, '0'));
        updateTime12(h, parseInt(minute12, 10), period);
    };

    const decrementHour = () => {
        let h = parseInt(hour12, 10);
        if (isNaN(h)) h = 12;
        h = h <= 1 ? 12 : h - 1;
        setHour12(h.toString().padStart(2, '0'));
        updateTime12(h, parseInt(minute12, 10), period);
    };

    const incrementMinute = () => {
        let m = parseInt(minute12, 10);
        if (isNaN(m)) m = 0;
        m = m >= 59 ? 0 : m + 1;
        setMinute12(m.toString().padStart(2, '0'));
        updateTime12(parseInt(hour12, 10), m, period);
    };

    const decrementMinute = () => {
        let m = parseInt(minute12, 10);
        if (isNaN(m)) m = 0;
        m = m <= 0 ? 59 : m - 1;
        setMinute12(m.toString().padStart(2, '0'));
        updateTime12(parseInt(hour12, 10), m, period);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (!value) return;

        const dateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (dateMatch) {
            const [_, year, month, day] = dateMatch.map(Number);
            const newTime = localDateTime.set({ year, month, day });
            onTimeChange(newTime);
        } else {
            const dt = DateTime.fromISO(value);
            if (dt.isValid) {
                const newTime = localDateTime.set({ year: dt.year, month: dt.month, day: dt.day });
                onTimeChange(newTime);
            }
        }
    };

    // Handle blur to format inputs properly
    const handleHourBlur = () => {
        let h = parseInt(hour12, 10);
        if (isNaN(h) || h < 1) h = 12;
        if (h > 12) h = 12;
        setHour12(h.toString().padStart(2, '0'));
        updateTime12(h, parseInt(minute12, 10), period);
    };

    const handleMinuteBlur = () => {
        let m = parseInt(minute12, 10);
        if (isNaN(m) || m < 0) m = 0;
        if (m > 59) m = 59;
        setMinute12(m.toString().padStart(2, '0'));
        updateTime12(parseInt(hour12, 10), m, period);
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
                <div className="relative w-full flex justify-center">
                    <div className="absolute -top-4 flex items-center justify-center pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity">
                        {status === 'day' ? <Sun className="text-primary-500" size={20} /> : <Moon className="text-primary-500" size={20} />}
                    </div>

                    {use24Hour ? (
                        /* 24H Mode - Native time input with overlay */
                        <div className="relative w-full flex justify-center">
                            <span className="absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl md:text-6xl font-mono font-black text-white pointer-events-none">
                                {inputValue}
                            </span>
                            <input
                                type="time"
                                value={inputValue}
                                onChange={handleTimeChange}
                                className="text-4xl sm:text-5xl md:text-6xl font-mono font-black bg-transparent text-white text-center focus:outline-none opacity-0 cursor-pointer w-full"
                            />
                        </div>
                    ) : (
                        /* 12H Mode - Split inputs for Hour, Minute, AM/PM */
                        <div className="flex items-center gap-1 sm:gap-2">
                            {/* Hour Input */}
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={incrementHour}
                                    className="p-1 text-neutral-500 hover:text-primary-400 transition-colors active:scale-90"
                                    aria-label="Increment hour"
                                >
                                    <ChevronUp size={18} />
                                </button>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={hour12}
                                    onChange={handleHourChange}
                                    onBlur={handleHourBlur}
                                    className="w-14 sm:w-20 text-3xl sm:text-5xl md:text-6xl font-mono font-black bg-neutral-900/50 text-white text-center rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:text-primary-400 transition-all border border-neutral-700 hover:border-neutral-600"
                                    maxLength={2}
                                />
                                <button
                                    onClick={decrementHour}
                                    className="p-1 text-neutral-500 hover:text-primary-400 transition-colors active:scale-90"
                                    aria-label="Decrement hour"
                                >
                                    <ChevronDown size={18} />
                                </button>
                            </div>

                            {/* Colon Separator */}
                            <span className="text-3xl sm:text-5xl md:text-6xl font-mono font-black text-neutral-500">:</span>

                            {/* Minute Input */}
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={incrementMinute}
                                    className="p-1 text-neutral-500 hover:text-primary-400 transition-colors active:scale-90"
                                    aria-label="Increment minute"
                                >
                                    <ChevronUp size={18} />
                                </button>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={minute12}
                                    onChange={handleMinuteChange}
                                    onBlur={handleMinuteBlur}
                                    className="w-14 sm:w-20 text-3xl sm:text-5xl md:text-6xl font-mono font-black bg-neutral-900/50 text-white text-center rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:text-primary-400 transition-all border border-neutral-700 hover:border-neutral-600"
                                    maxLength={2}
                                />
                                <button
                                    onClick={decrementMinute}
                                    className="p-1 text-neutral-500 hover:text-primary-400 transition-colors active:scale-90"
                                    aria-label="Decrement minute"
                                >
                                    <ChevronDown size={18} />
                                </button>
                            </div>

                            {/* AM/PM Toggle */}
                            <button
                                onClick={handlePeriodToggle}
                                className="ml-1 sm:ml-2 flex flex-col items-center justify-center bg-neutral-900/50 border border-neutral-700 hover:border-primary-500/50 rounded-xl px-2 sm:px-3 py-2 transition-all active:scale-95 hover:bg-neutral-800/50"
                            >
                                <span className={`text-xs sm:text-sm font-bold transition-colors ${period === 'AM' ? 'text-primary-400' : 'text-neutral-600'}`}>
                                    AM
                                </span>
                                <span className={`text-xs sm:text-sm font-bold transition-colors ${period === 'PM' ? 'text-primary-400' : 'text-neutral-600'}`}>
                                    PM
                                </span>
                            </button>
                        </div>
                    )}
                </div>

                {showDate && (
                    <input
                        type="date"
                        value={localDateTime.toFormat('yyyy-MM-dd')}
                        onChange={handleDateChange}
                        className="text-xs font-bold text-neutral-500 bg-transparent border-none focus:outline-none focus:text-primary-500 text-center cursor-pointer mt-2"
                    />
                )}

                {/* Zone Label Display */}
                <div className="mt-4 text-center">
                    <span className="text-[10px] font-bold text-neutral-600 tracking-wider uppercase bg-neutral-900/40 px-3 py-1 rounded-full border border-neutral-800">
                        {(() => {
                            const zone = allZones.find(z => z.value === zoneName);
                            if (zone) return zone.label;

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
