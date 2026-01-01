import React, { useState } from 'react';
import { calculateLoan } from '../../utils/financial-utils';
import { useHistory } from '../../context/HistoryContext';

const LoanCalculator = () => {
    const { addToHistory } = useHistory();
    const [useDateBased, setUseDateBased] = useState(false);
    const [values, setValues] = useState({
        amount: 250000,
        rate: 5.5,
        years: 30,
        paymentsMade: 0,
        startDate: new Date().toISOString().split('T')[0],
        asOfDate: new Date().toISOString().split('T')[0]
    });
    const [result, setResult] = useState(null);

    const calculateMonthsBetween = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (isNaN(startDate) || isNaN(endDate)) return 0;

        const years = endDate.getFullYear() - startDate.getFullYear();
        const months = endDate.getMonth() - startDate.getMonth();
        const totalMonths = (years * 12) + months;
        return Math.max(0, totalMonths);
    };

    const handleCalculate = () => {
        const termMonths = values.years * 12;
        let payments = values.paymentsMade;

        if (useDateBased) {
            payments = calculateMonthsBetween(values.startDate, values.asOfDate);
            // Cap payments at term
            payments = Math.min(payments, termMonths);
        }

        const res = calculateLoan(values.amount, values.rate, termMonths, payments);
        setResult({ ...res, calculatedPayments: payments });
        addToHistory('LOAN', { ...values, useDateBased, actualPayments: payments }, res);
    };

    const handleChange = (field, val) => {
        setValues(prev => ({
            ...prev,
            [field]: field.includes('Date') ? val : (parseFloat(val) || 0)
        }));
    };

    const inputFields = [
        { id: 'amount', label: 'Loan Amount', sub: 'Principal' },
        { id: 'rate', label: 'Interest Rate', sub: '% per year' },
        { id: 'years', label: 'Loan Term', sub: 'Years' },
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                    Loan Calculator
                </h1>
                <button
                    onClick={() => setUseDateBased(!useDateBased)}
                    className="text-[10px] font-bold uppercase tracking-tighter bg-neutral-800 border border-neutral-700 rounded-full px-3 py-1 text-primary-500 hover:bg-neutral-700 transition-all"
                >
                    {useDateBased ? 'Use Manual Count' : 'Use Dates'}
                </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                {inputFields.map(field => (
                    <div key={field.id} className="bg-neutral-800/50 rounded-xl p-4 border border-transparent hover:border-neutral-700 transition-all">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <label className="text-sm font-bold text-neutral-300">{field.label}</label>
                                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">{field.sub}</span>
                            </div>
                            <input
                                type="number"
                                value={values[field.id]}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                className="bg-transparent text-right text-lg font-mono text-white focus:outline-none w-32 placeholder-neutral-600"
                            />
                        </div>
                    </div>
                ))}

                {useDateBased ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-neutral-800/50 rounded-xl p-4 border border-transparent hover:border-neutral-700 transition-all">
                            <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">Start Date</label>
                            <input
                                type="date"
                                value={values.startDate}
                                onChange={(e) => handleChange('startDate', e.target.value)}
                                className="bg-transparent text-white text-sm font-mono focus:outline-none w-full"
                            />
                        </div>
                        <div className="bg-neutral-800/50 rounded-xl p-4 border border-transparent hover:border-neutral-700 transition-all">
                            <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">As Of Date</label>
                            <input
                                type="date"
                                value={values.asOfDate}
                                onChange={(e) => handleChange('asOfDate', e.target.value)}
                                className="bg-transparent text-white text-sm font-mono focus:outline-none w-full"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="bg-neutral-800/50 rounded-xl p-4 border border-transparent hover:border-neutral-700 transition-all">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <label className="text-sm font-bold text-neutral-300">Payments Made</label>
                                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Count</span>
                            </div>
                            <input
                                type="number"
                                value={values.paymentsMade}
                                onChange={(e) => handleChange('paymentsMade', e.target.value)}
                                className="bg-transparent text-right text-lg font-mono text-white focus:outline-none w-32"
                            />
                        </div>
                    </div>
                )}
            </div>

            {result && (
                <div className="bg-neutral-900/50 rounded-2xl p-6 border border-primary-900/30 mb-6 mt-4">
                    <div className="flex justify-between items-end mb-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Monthly Payment</span>
                            <span className="text-3xl font-bold text-primary-500">
                                {result.monthlyPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </span>
                        </div>
                        {useDateBased && (
                            <div className="text-right">
                                <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold block">Age</span>
                                <span className="text-neutral-300 font-mono text-sm">{result.calculatedPayments} Months</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs border-t border-neutral-800/50 pt-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-neutral-500 uppercase tracking-tighter font-bold">Total Interest</span>
                            <span className="text-white font-mono text-sm">
                                {result.totalInterest.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 text-right">
                            <span className="text-neutral-500 uppercase tracking-tighter font-bold">Total Cost</span>
                            <span className="text-white font-mono text-sm">
                                {result.totalPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </span>
                        </div>

                        <div className="col-span-2 pt-2 border-t border-neutral-800 flex justify-between items-center mt-2">
                            <span className="text-neutral-400 font-bold">Outstanding Balance</span>
                            <span className="text-white font-mono font-bold text-base">
                                {result.outstandingBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={handleCalculate}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-neutral-900 font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary-900/20 active:scale-[0.98] transition-all hover:brightness-110 mt-auto"
            >
                CALCULATE
            </button>
        </div>
    );
};

export default LoanCalculator;
