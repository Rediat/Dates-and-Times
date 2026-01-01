import React, { useState, useEffect } from 'react';
import { calculateTVM } from '../../utils/financial-utils';
import { useHistory } from '../../context/HistoryContext';
import { ChevronDown } from 'lucide-react';

const TVMCalculator = () => {
    const { addToHistory } = useHistory();
    const [mode, setMode] = useState('END');
    const [target, setTarget] = useState('fv');
    const [frequency, setFrequency] = useState(12); // Default Monthly
    const [values, setValues] = useState({
        n: 360, // Default 30 years monthly
        i: 6,   // 6% Annual
        pv: -100000,
        pmt: 0,
        fv: 0
    });

    const [calculatedValue, setCalculatedValue] = useState(null);

    const handleCalculate = () => {
        try {
            const result = calculateTVM(target, values, mode, frequency);
            setCalculatedValue(result);
            addToHistory('TVM', { ...values, mode, target, frequency }, result);

            // Update the target value in the inputs to show the result
            setValues(prev => ({
                ...prev,
                [target]: parseFloat(result.toFixed(2))
            }));
        } catch (error) {
            console.error("Calculation error", error);
            setCalculatedValue("Error");
        }
    };

    const handleChange = (field, val) => {
        setValues(prev => ({
            ...prev,
            [field]: parseFloat(val) || 0
        }));
        // Reset calculated state if user edits
        if (field === target) {
            // If user edits the target field, maybe we should switch target? 
            // For now, just let them edit, but it will be overwritten on calc.
        }
    };

    const fields = [
        { id: 'n', label: 'N', sub: 'Total Periods' },
        { id: 'i', label: 'I/Y', sub: 'Annual %' },
        { id: 'pv', label: 'PV', sub: 'Pres Val' },
        { id: 'pmt', label: 'PMT', sub: 'Payment' },
        { id: 'fv', label: 'FV', sub: 'Fut Val' },
    ];

    const frequencies = [
        { label: 'Annual (1)', value: 1 },
        { label: 'Semi-Annual (2)', value: 2 },
        { label: 'Quarterly (4)', value: 4 },
        { label: 'Monthly (12)', value: 12 },
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                        TVM Calculator
                    </h1>
                    <p className="text-neutral-500 text-sm font-medium">Time Value of Money</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <button
                        onClick={() => setMode(m => m === 'END' ? 'BEGIN' : 'END')}
                        className="flex items-center gap-1 bg-neutral-800 border border-neutral-700 rounded-full px-3 py-1 text-xs font-semibold text-primary-500 hover:bg-neutral-700 transition-colors"
                    >
                        Mode: {mode}
                    </button>
                    <select
                        value={frequency}
                        onChange={(e) => setFrequency(Number(e.target.value))}
                        className="bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1 text-xs font-semibold text-neutral-300 focus:outline-none"
                    >
                        {frequencies.map(f => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Target Selector */}
            <div className="flex bg-neutral-900/50 p-1 rounded-xl mb-8 overflow-x-auto scrollbar-hide">
                {fields.map(field => (
                    <button
                        key={field.id}
                        onClick={() => setTarget(field.id)}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${target === field.id
                            ? 'bg-neutral-700 text-white shadow-md'
                            : 'text-neutral-500 hover:text-neutral-300'
                            }`}
                    >
                        Solve {field.label}
                    </button>
                ))}
            </div>

            {/* Inputs */}
            <div className="space-y-4 flex-1">
                {fields.map(field => (
                    <div key={field.id} className={`group relative bg-neutral-800/50 rounded-xl p-4 transition-all duration-300 border ${target === field.id ? 'border-primary-500/50 ring-1 ring-primary-500/20' : 'border-transparent hover:border-neutral-700'
                        }`}>
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <label className={`text-base font-bold transition-colors ${target === field.id ? 'text-primary-400' : 'text-neutral-300'
                                    }`}>
                                    {field.label}
                                </label>
                                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">{field.sub}</span>
                            </div>

                            <div className="relative">
                                {target === field.id && calculatedValue === null ? (
                                    <span className="text-neutral-500 italic text-sm font-medium px-2">Calculated...</span>
                                ) : (
                                    <input
                                        type="number"
                                        value={values[field.id]}
                                        onChange={(e) => handleChange(field.id, e.target.value)}
                                        className={`bg-transparent text-right text-xl font-mono focus:outline-none w-32 placeholder-neutral-600 transition-colors ${target === field.id ? 'text-primary-400 font-bold' : 'text-white'
                                            }`}
                                        placeholder="0"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Button */}
            <div className="mt-8">
                <button
                    onClick={handleCalculate}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-neutral-900 font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary-900/20 active:scale-[0.98] transition-all hover:brightness-110 flex items-center justify-center gap-2"
                >
                    <CalculateIcon className="w-6 h-6" />
                    CALCULATE
                </button>
            </div>
        </div>
    );
};

// Simple icon for the button
const CalculateIcon = ({ className }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className={className}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="16" y1="14" x2="16" y2="14" />
        <line x1="8" y1="14" x2="8" y2="14" />
        <line x1="12" y1="14" x2="12" y2="14" />
        <line x1="16" y1="18" x2="16" y2="18" />
        <line x1="8" y1="18" x2="8" y2="18" />
        <line x1="12" y1="18" x2="12" y2="18" />
    </svg>
)

export default TVMCalculator;
