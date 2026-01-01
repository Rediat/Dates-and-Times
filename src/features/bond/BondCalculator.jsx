import React, { useState } from 'react';
import { calculateBond } from '../../utils/financial-utils';
import { useHistory } from '../../context/HistoryContext';

const BondCalculator = () => {
    const { addToHistory } = useHistory();
    const [values, setValues] = useState({
        faceValue: 1000,
        couponRate: 5,
        ytm: 4,
        years: 10,
        frequency: 2 // 1=Annual, 2=Semi
    });
    const [price, setPrice] = useState(null);

    const handleCalculate = () => {
        const res = calculateBond(
            values.faceValue,
            values.couponRate,
            values.ytm,
            values.years,
            values.frequency
        );
        setPrice(res);
        addToHistory('BOND', values, res);
    };

    const handleChange = (field, val) => {
        setValues(prev => ({
            ...prev,
            [field]: parseFloat(val) || 0
        }));
    };

    return (
        <div className="flex flex-col h-full">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent mb-6">
                Bond Pricing
            </h1>

            <div className="space-y-4 flex-1">
                {[
                    { id: 'faceValue', label: 'Face Value', sub: 'Par' },
                    { id: 'couponRate', label: 'Coupon Rate', sub: '%' },
                    { id: 'ytm', label: 'Yield to Maturity', sub: '%' },
                    { id: 'years', label: 'Years to Maturity', sub: 'Years' }
                ].map(field => (
                    <div key={field.id} className="bg-neutral-800/50 rounded-xl p-4 flex justify-between items-center">
                        <div className="flex flex-col">
                            <label className="text-base font-bold text-neutral-300">{field.label}</label>
                            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">{field.sub}</span>
                        </div>
                        <input
                            type="number"
                            value={values[field.id]}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className="bg-transparent text-right text-xl font-mono text-white focus:outline-none w-32 placeholder-neutral-600"
                        />
                    </div>
                ))}

                <div className="bg-neutral-800/50 rounded-xl p-4 flex justify-between items-center">
                    <label className="text-base font-bold text-neutral-300">Frequency</label>
                    <div className="flex bg-neutral-900 rounded-lg p-1">
                        {[
                            { val: 1, label: 'Annual' },
                            { val: 2, label: 'Semi' }
                        ].map(opt => (
                            <button
                                key={opt.val}
                                onClick={() => handleChange('frequency', opt.val)}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${values.frequency === opt.val
                                        ? 'bg-neutral-700 text-white shadow'
                                        : 'text-neutral-500 hover:text-neutral-300'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {price !== null && (
                <div className="bg-neutral-900/50 rounded-2xl p-6 border border-primary-900/30 mb-6 flex justify-between items-end">
                    <span className="text-sm font-medium text-neutral-400">Bond Price</span>
                    <span className="text-3xl font-bold text-primary-500 font-mono">
                        {price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </span>
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

export default BondCalculator;
