import { useState } from 'react';
import { Globe, Calendar, Calculator } from 'lucide-react';
import { useTimeZoneSync } from './hooks/useTimeZoneSync';
import { TimeCard } from './components/TimeCard';
import { Controls } from './components/Controls';
import { DateCalculator } from './components/DateCalculator';

function App() {
  const {
    baseTime,
    zones,
    updateBaseTime,
    addZone,
    removeZone,
    updateZone,
    use24Hour,
    setUse24Hour,
    showDate,
    setShowDate,
  } = useTimeZoneSync(['local', 'UTC']);

  const [activeTab, setActiveTab] = useState<'converter' | 'calculator'>('converter');

  return (
    <div className="min-h-screen bg-dark-900 text-white px-4 py-6 md:py-10 flex flex-col items-center">
      <div className="w-full max-w-md">
        <header className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">
              {activeTab === 'converter' ? 'Time Converter' : 'Date Calculator'}
            </h1>
            <p className="text-neutral-500 text-[10px] font-medium uppercase tracking-wider">
              {activeTab === 'converter' ? 'Stay in sync across worlds' : 'Calculate duration & dates'}
            </p>
          </div>
          <div className="p-2 bg-neutral-800 rounded-xl border border-neutral-700">
            {activeTab === 'converter' ? <Globe className="text-primary-500 w-5 h-5" /> : <Calculator className="text-primary-500 w-5 h-5" />}
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex bg-neutral-900/50 border border-neutral-800 p-1 rounded-xl mb-6 relative">
          <button
            onClick={() => setActiveTab('converter')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${activeTab === 'converter'
                ? 'bg-neutral-800 text-primary-500 shadow-lg shadow-black/20 ring-1 ring-white/5'
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
              }`}
          >
            <Globe size={14} /> Converter
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${activeTab === 'calculator'
                ? 'bg-neutral-800 text-primary-500 shadow-lg shadow-black/20 ring-1 ring-white/5'
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
              }`}
          >
            <Calendar size={14} /> Calculator
          </button>
        </div>

        <main>
          {activeTab === 'converter' ? (
            <>
              <Controls
                use24Hour={use24Hour}
                setUse24Hour={setUse24Hour}
                showDate={showDate}
                setShowDate={setShowDate}
                onAddZone={(zone) => addZone(zone || 'UTC')}
              />

              <div className="space-y-3">
                {zones.map((zone, index) => (
                  <TimeCard
                    key={zone.id}
                    id={zone.id}
                    zoneName={zone.zoneName}
                    baseTime={baseTime}
                    use24Hour={use24Hour}
                    showDate={showDate}
                    onTimeChange={(newTime) => updateBaseTime(newTime)}
                    onZoneChange={(newZone) => updateZone(zone.id, newZone)}
                    onRemove={() => removeZone(zone.id)}
                    isDeletable={zones.length > 2 || index >= 2}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex justify-center">
              <DateCalculator />
            </div>
          )}
        </main>

        <footer className="mt-10 text-center pb-6">
          <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">
            Built with React & Luxon • {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
