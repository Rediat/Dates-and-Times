import React from 'react';
import { useHistory } from '../../context/HistoryContext';
import { Trash2, Clock } from 'lucide-react';

const HistoryView = () => {
    const { history, clearHistory } = useHistory();

    const formatResult = (result) => {
        if (typeof result === 'object') {
            return Object.entries(result)
                .map(([k, v]) => `${k}: ${v.toFixed(2)}`)
                .join(', ');
        }
        return Number(result).toFixed(2);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                    History
                </h1>
                {history.length > 0 && (
                    <button
                        onClick={clearHistory}
                        className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-neutral-800 transition-colors"
                    >
                        <Trash2 size={20} />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-neutral-600">
                        <Clock size={48} className="mb-4 opacity-50" />
                        <p>No calculations yet.</p>
                    </div>
                ) : (
                    history.map((item) => (
                        <div key={item.id} className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700/50">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-primary-500 font-bold text-xs uppercase tracking-wider">{item.module}</span>
                                <span className="text-neutral-500 text-xs">
                                    {new Date(item.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="mb-2">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-neutral-400">
                                    {Object.entries(item.inputs).map(([k, v]) => (
                                        <div key={k} className="flex justify-between">
                                            <span>{k}:</span>
                                            <span className="text-neutral-300">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-neutral-700 flex justify-between items-center">
                                <span className="text-xs font-bold text-neutral-300">Result</span>
                                <span className="text-lg font-mono text-white">{formatResult(item.result)}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HistoryView;
