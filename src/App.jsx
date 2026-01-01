import React, { useState } from 'react';
import Layout from './components/Layout';
import { HistoryProvider } from './context/HistoryContext';

// Features
import TVMCalculator from './features/tvm/TVMCalculator';
import LoanCalculator from './features/loan/LoanCalculator';
import CashFlowCalculator from './features/flow/CashFlowCalculator';
import BondCalculator from './features/bond/BondCalculator';
import RateConverter from './features/rates/RateConverter';
import HistoryView from './features/history/HistoryView';

function App() {
    const [activeTab, setActiveTab] = useState('tvm');

    const renderContent = () => {
        switch (activeTab) {
            case 'tvm': return <TVMCalculator />;
            case 'loan': return <LoanCalculator />;
            case 'flow': return <CashFlowCalculator />;
            case 'bond': return <BondCalculator />;
            case 'rates': return <RateConverter />;
            case 'history': return <HistoryView />;
            default: return <TVMCalculator />;
        }
    };

    return (
        <HistoryProvider>
            <Layout activeTab={activeTab} onTabChange={setActiveTab}>
                {renderContent()}
            </Layout>
        </HistoryProvider>
    );
}

export default App;
