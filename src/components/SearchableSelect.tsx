import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Option {
    value: string;
    label: string;
    description?: string; // e.g. "GMT+01:00"
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Select...",
    className
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get selected option label
    const selectedOption = useMemo(() =>
        options.find(o => o.value === value),
        [options, value]
    );

    // Filter options
    const filteredOptions = useMemo(() => {
        if (!search) return options;
        const lowerSearch = search.toLowerCase();
        return options.filter(option =>
            option.label.toLowerCase().includes(lowerSearch) ||
            option.value.toLowerCase().includes(lowerSearch)
        );
    }, [options, search]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, []);

    // Focus input on open
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Calculate dropdown position
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    }, [isOpen]);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 bg-neutral-900/50 text-neutral-300 font-bold py-2 px-3 rounded-lg border border-transparent focus:border-primary-500/50 hover:bg-neutral-800/50 transition-all text-xs text-left"
            >
                <div className="truncate flex-1">
                    {selectedOption ? selectedOption.label : placeholder}
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
            </button>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'absolute',
                        top: coords.top,
                        left: coords.left,
                        width: Math.max(coords.width, 300), // Min width to see content
                        maxHeight: '300px',
                        zIndex: 9999
                    }}
                    className="fixed bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100"
                >
                    <div className="p-2 border-b border-neutral-800 sticky top-0 bg-neutral-900/95 backdrop-blur-sm z-10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full bg-neutral-800/50 text-white border-none rounded-lg py-2 pl-9 pr-8 text-xs font-medium focus:ring-1 focus:ring-primary-500/50 placeholder:text-neutral-600"
                                placeholder="Search country, city, or time zone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="p-4 text-center text-neutral-500 text-xs">
                                No results found
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex flex-col gap-0.5 ${option.value === value
                                            ? 'bg-primary-900/20 text-primary-400'
                                            : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                                        }`}
                                >
                                    <span className="font-bold truncate">{option.label}</span>
                                    <span className="text-[10px] text-neutral-600 truncate font-mono">{option.value}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
