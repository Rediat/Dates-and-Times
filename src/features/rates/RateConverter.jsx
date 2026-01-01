import React, { useState } from 'react';
import { calculateEAR } from '../../utils/financial-utils';
import { useHistory } from '../../context/HistoryContext';

const RateConverter = () => {
    const { addToHistory } = useHistory();
    const [nominal, setNominal] = useState(5);
    const [compounding, setCompounding] = useState(12); // Monthly default
    const [result, setResult] = useState(null);

    const handleCalculate = () => {
        const res = calculateEAR(nominal, compounding);
        setResult(res);
        addToHistory('RATES', { nominal, compounding }, res);
    };

    const frequencies = [
        { n: 1, label: 'Annually' },
        { n: 2, label: 'Semiannually' },
        { n: 4, label: 'Quarterly' },
        { n: 12, label: 'Monthly' },
        { n: 365, label: 'Daily' },
    ];

    return (
        <div className="flex flex-col h-full">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent mb-6">
                Interest Rates
            </h1>
            <p className="text-neutral-500 text-sm mb-8">Convert Nominal Rate to Effective Annual Rate (EAR)</p>

            <div className="space-y-6 flex-1">
                <div className="bg-neutral-800/50 rounded-xl p-6">
                    <label className="block text-sm font-bold text-neutral-400 mb-2">Nominal Rate (%)</label>
                    <input
                        type="number"
                        value={nominal}
                        onChange={(e) => setNominal(parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent text-4xl font-mono text-white focus:outline-none border-b border-neutral-700 focus:border-primary-500 transition-colors pb-2"
                    />
                </div>

                <div className="bg-neutral-800/50 rounded-xl p-6">
                    <label className="block text-sm font-bold text-neutral-400 mb-4">Compounding Frequency</label>
                    <div className="grid grid-cols-2 gap-2">
                        {frequencies.map(freq => (
                            <button
                                key={freq.n}
                                onClick={() => setCompounding(freq.n)}
                                className={`py-3 px-4 rounded-lg text-sm font-bold text-left transition-all ${compounding === freq.n
                                        ? 'bg-primary-600/20 text-primary-400 ring-1 ring-primary-500/50'
                                        : 'bg-neutral-900/50 text-neutral-500 hover:bg-neutral-900'
                                    }`}
                            >
                                {freq.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {result !== null && (
                <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl p-6 border border-neutral-700 mb-6 text-center">
                    <span className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Effective Annual Rate</span>
                    <div className="text-4xl font-bold text-white mt-2 font-mono">
                        {result.toFixed(4)}%
                    </div>
                </div>
            )}

            <button
                onClick={handleCalculate}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-neutral-900 font-bold text-lg py-4 rounded-2xl shadow-lg"
            >
                CALCULATE
            </button>
        </div>
    );
};

export default RateConverter;
