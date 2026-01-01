import React, { useState } from 'react';
import { calculateNPV, calculateIRR } from '../../utils/financial-utils';
import { useHistory } from '../../context/HistoryContext';
import { Plus, Trash2 } from 'lucide-react';

const CashFlowCalculator = () => {
    const { addToHistory } = useHistory();
    const [rate, setRate] = useState(10);
    const [flows, setFlows] = useState([-10000, 2000, 3000, 4000, 5000]); // CF0, CF1, etc.
    const [result, setResult] = useState(null);

    const handleCalculate = () => {
        const npv = calculateNPV(rate, flows);
        const irr = calculateIRR(flows); // Initial guess 0.1
        const res = { npv, irr };
        setResult(res);
        addToHistory('FLOW', { rate, flows: flows.join(', ') }, res);
    };

    const updateFlow = (index, val) => {
        const newFlows = [...flows];
        newFlows[index] = parseFloat(val) || 0;
        setFlows(newFlows);
    };

    const addFlow = () => setFlows([...flows, 0]);
    const removeFlow = (index) => setFlows(flows.filter((_, i) => i !== index));

    return (
        <div className="flex flex-col h-full">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent mb-4">
                Cash Flow
            </h1>

            <div className="bg-neutral-800/50 p-4 rounded-xl mb-4 flex justify-between items-center">
                <label className="font-bold text-neutral-300">Discount Rate (%)</label>
                <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                    className="bg-transparent text-right text-lg font-mono text-primary-400 focus:outline-none w-24 border-b border-primary-500/50"
                />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 mb-4 scrollbar-hide">
                {flows.map((flow, i) => (
                    <div key={i} className="flex items-center gap-3 bg-neutral-800/30 p-3 rounded-lg border border-transparent focus-within:border-neutral-700">
                        <span className="text-xs font-bold text-neutral-500 w-8">CF {i}</span>
                        <input
                            type="number"
                            value={flow}
                            onChange={(e) => updateFlow(i, e.target.value)}
                            className="flex-1 bg-transparent text-right font-mono text-white focus:outline-none"
                        />
                        {i > 0 && (
                            <button onClick={() => removeFlow(i)} className="text-neutral-600 hover:text-red-400">
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                ))}
                <button
                    onClick={addFlow}
                    className="w-full py-3 border border-dashed border-neutral-700 rounded-lg text-neutral-500 hover:text-primary-500 hover:border-primary-500/50 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={16} /> Add Cash Flow
                </button>
            </div>

            {result && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800">
                        <div className="text-neutral-500 text-xs mb-1">NPV</div>
                        <div className="text-xl font-bold text-white font-mono">
                            {result.npv.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </div>
                    </div>
                    <div className="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800">
                        <div className="text-neutral-500 text-xs mb-1">IRR</div>
                        <div className="text-xl font-bold text-primary-500 font-mono">
                            {result.irr.toFixed(2)}%
                        </div>
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

export default CashFlowCalculator;
