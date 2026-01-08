import React from 'react';
import { Plus, Clock, CalendarDays, Settings } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ControlsProps {
    use24Hour: boolean;
    setUse24Hour: (val: boolean) => void;
    showDate: boolean;
    setShowDate: (val: boolean) => void;
    onAddZone: (zone?: string) => void;
}

export const Controls: React.FC<ControlsProps> = ({
    use24Hour,
    setUse24Hour,
    showDate,
    setShowDate,
    onAddZone
}) => {
    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex bg-neutral-900/50 border border-neutral-800 p-1 rounded-xl">
                    <button
                        onClick={() => setUse24Hour(false)}
                        className={cn(
                            "px-3 py-1 rounded-lg text-[10px] font-black transition-all",
                            !use24Hour ? "bg-neutral-700 text-white shadow-md" : "text-neutral-500 hover:text-neutral-300"
                        )}
                    >
                        12H
                    </button>
                    <button
                        onClick={() => setUse24Hour(true)}
                        className={cn(
                            "px-3 py-1 rounded-lg text-[10px] font-black transition-all",
                            use24Hour ? "bg-neutral-700 text-white shadow-md" : "text-neutral-500 hover:text-neutral-300"
                        )}
                    >
                        24H
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowDate(!showDate)}
                        className={cn(
                            "border rounded-full px-2.5 py-1 text-[10px] font-bold transition-all",
                            showDate
                                ? "bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-900/20"
                                : "bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700"
                        )}
                    >
                        {showDate ? 'DATE ON' : 'DATE OFF'}
                    </button>

                    <button
                        onClick={() => onAddZone('random')}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-primary-600 to-primary-500 text-neutral-900 rounded-full px-3 py-1 text-[10px] font-black shadow-lg shadow-primary-900/20 active:scale-[0.95] transition-all hover:brightness-110"
                    >
                        <Plus size={12} strokeWidth={4} />
                        ADD ZONE
                    </button>
                </div>
            </div>
        </div>
    );
};
