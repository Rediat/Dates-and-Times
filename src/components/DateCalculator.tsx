import React, { useState, useEffect } from 'react';
import { DateTime, Duration } from 'luxon';
import { Calendar, Plus, Minus, RotateCcw } from 'lucide-react';

export const DateCalculator: React.FC = () => {
    // Mode: 'difference' or 'add-subtract'
    const [mode, setMode] = useState<'difference' | 'add-subtract'>('add-subtract'); // Default matches user screenshot

    // --- Difference Mode State ---
    const [diffStart, setDiffStart] = useState<string>(DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm"));
    const [diffEnd, setDiffEnd] = useState<string>(DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm"));
    const [diffResult, setDiffResult] = useState<string>('');

    // --- Add/Subtract Mode State ---
    const [addStart, setAddStart] = useState<string>(DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm"));
    const [operation, setOperation] = useState<'add' | 'subtract'>('add');
    const [years, setYears] = useState(0);
    const [months, setMonths] = useState(0);
    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [addResult, setAddResult] = useState<string>('');

    // Calculate Difference
    useEffect(() => {
        if (mode !== 'difference') return;

        const start = DateTime.fromISO(diffStart);
        const end = DateTime.fromISO(diffEnd);

        if (start.isValid && end.isValid) {
            const diff = end.diff(start, ['years', 'months', 'days', 'hours', 'minutes', 'seconds']);

            // Format result logic
            // We want something like "same dates" or "X years, Y months..."
            if (diff.as('milliseconds') === 0) {
                setDiffResult('Same dates');
            } else {
                // Normalize to human readable
                // Note: diff values can be negative if end < start.
                // We typically show absolute difference, or indicate "Past/Future".
                // The Windows Calculator screenshot shows "Same dates". 
                // Let's format nicely.
                const d = end.diff(start, ['years', 'months', 'days', 'hours', 'minutes', 'seconds']).toObject();

                // Construct string parts
                const parts = [];
                if (d.years) parts.push(`${Math.abs(d.years)} years`);
                if (d.months) parts.push(`${Math.abs(d.months)} months`);
                if (d.days) parts.push(`${Math.abs(d.days)} days`);
                if (d.hours) parts.push(`${Math.abs(d.hours)} hours`);
                if (d.minutes) parts.push(`${Math.abs(d.minutes)} minutes`);
                if (d.seconds) parts.push(`${Math.round(Math.abs(d.seconds || 0))} seconds`); // Round seconds

                if (parts.length === 0) {
                    setDiffResult('Same dates');
                } else {
                    setDiffResult((end < start ? '-' : '') + parts.join(', '));
                }
            }
        }
    }, [diffStart, diffEnd, mode]);

    // Calculate Add/Subtract
    useEffect(() => {
        if (mode !== 'add-subtract') return;

        const start = DateTime.fromISO(addStart);
        if (start.isValid) {
            const duration = Duration.fromObject({
                years, months, days, hours, minutes, seconds
            });

            const result = operation === 'add' ? start.plus(duration) : start.minus(duration);

            // Format: "Thursday, January 13, 2026"
            // Also show time if it's not 00:00:00? The user asked for "Date calculation" but also "add hours or minute".
            // So we should show full date time.
            setAddResult(result.toFormat('cccc, LLLL d, yyyy \n h:mm:ss a'));
        }
    }, [addStart, operation, years, months, days, hours, minutes, seconds, mode]);

    const resetAddSubtract = () => {
        setYears(0); setMonths(0); setDays(0);
        setHours(0); setMinutes(0); setSeconds(0);
    };

    return (
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
            {/* Mode Selector */}
            <div className="flex bg-neutral-900/50 border border-neutral-800 p-1 rounded-xl mb-8">
                <button
                    onClick={() => setMode('add-subtract')}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${mode === 'add-subtract' ? 'bg-neutral-800 text-primary-500 shadow-md' : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                >
                    Add / Subtract
                </button>
                <button
                    onClick={() => setMode('difference')}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${mode === 'difference' ? 'bg-neutral-800 text-primary-500 shadow-md' : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                >
                    Difference
                </button>
            </div>

            {/* ADD / SUBTRACT MODE */}
            {mode === 'add-subtract' && (
                <div className="space-y-6">
                    {/* From Date */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider ml-1">From</label>
                        <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-xl p-3 flex items-center gap-3">
                            <Calendar size={16} className="text-primary-500" />
                            <input
                                type="datetime-local"
                                value={addStart}
                                onChange={(e) => setAddStart(e.target.value)}
                                className="bg-transparent text-white font-mono text-sm focus:outline-none w-full"
                            />
                        </div>
                    </div>

                    {/* Operation Toggle */}
                    <div className="flex gap-4">
                        <label
                            className="flex items-center gap-2 cursor-pointer group"
                            onClick={() => setOperation('add')}
                        >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${operation === 'add' ? 'border-primary-500' : 'border-neutral-600 group-hover:border-neutral-500'}`}>
                                {operation === 'add' && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                            </div>
                            <span className={`text-sm font-medium ${operation === 'add' ? 'text-white' : 'text-neutral-500'}`}>Add</span>
                        </label>
                        <label
                            className="flex items-center gap-2 cursor-pointer group"
                            onClick={() => setOperation('subtract')}
                        >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${operation === 'subtract' ? 'border-primary-500' : 'border-neutral-600 group-hover:border-neutral-500'}`}>
                                {operation === 'subtract' && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                            </div>
                            <span className={`text-sm font-medium ${operation === 'subtract' ? 'text-white' : 'text-neutral-500'}`}>Subtract</span>
                        </label>
                    </div>

                    {/* Duration Inputs Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <DurationInput label="Years" value={years} onChange={setYears} />
                        <DurationInput label="Months" value={months} onChange={setMonths} />
                        <DurationInput label="Days" value={days} onChange={setDays} />
                        <DurationInput label="Hours" value={hours} onChange={setHours} />
                        <DurationInput label="Minutes" value={minutes} onChange={setMinutes} />
                        <DurationInput label="Seconds" value={seconds} onChange={setSeconds} />
                    </div>

                    {/* Reset Button */}
                    <div className="flex justify-end">
                        <button onClick={resetAddSubtract} className="text-[10px] text-neutral-500 hover:text-primary-500 flex items-center gap-1 transition-colors">
                            <RotateCcw size={10} /> RESET DURATION
                        </button>
                    </div>


                    {/* Result */}
                    <div className="mt-8 pt-6 border-t border-neutral-800">
                        <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Date</label>
                        <div className="mt-2 text-xl font-bold text-white whitespace-pre-line leading-relaxed">
                            {addResult}
                        </div>
                    </div>
                </div>
            )}

            {/* DIFFERENCE MODE */}
            {mode === 'difference' && (
                <div className="space-y-6">
                    {/* From Date */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider ml-1">From</label>
                        <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-xl p-3 flex items-center gap-3">
                            <Calendar size={16} className="text-primary-500" />
                            <input
                                type="datetime-local"
                                value={diffStart}
                                onChange={(e) => setDiffStart(e.target.value)}
                                className="bg-transparent text-white font-mono text-sm focus:outline-none w-full"
                            />
                        </div>
                    </div>

                    {/* To Date */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider ml-1">To</label>
                        <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-xl p-3 flex items-center gap-3">
                            <Calendar size={16} className="text-primary-500" />
                            <input
                                type="datetime-local"
                                value={diffEnd}
                                onChange={(e) => setDiffEnd(e.target.value)}
                                className="bg-transparent text-white font-mono text-sm focus:outline-none w-full"
                            />
                        </div>
                    </div>

                    {/* Difference Result */}
                    <div className="mt-8 pt-6 border-t border-neutral-800">
                        <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Difference</label>
                        <div className="mt-2 text-lg font-medium text-white break-words">
                            {diffResult}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper Component for Duration Inputs
const DurationInput: React.FC<{ label: string; value: number; onChange: (val: number) => void }> = ({ label, value, onChange }) => (
    <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-xl p-2 flex flex-col">
        <label className="text-[9px] uppercase font-bold text-neutral-500 mb-1">{label}</label>
        <div className="flex items-center justify-between">
            <input
                type="number"
                min="0"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                className="bg-transparent text-white font-bold w-full focus:outline-none"
            />
            <div className="flex flex-col gap-0.5">
                <button onClick={() => onChange(value + 1)} className="text-neutral-500 hover:text-white"><Plus size={10} /></button>
                <button onClick={() => onChange(Math.max(0, value - 1))} className="text-neutral-500 hover:text-white"><Minus size={10} /></button>
            </div>
        </div>
    </div>
);
