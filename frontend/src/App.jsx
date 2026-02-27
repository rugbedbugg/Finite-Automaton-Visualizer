import { useState } from 'react';
import axios from 'axios';
import NFAInput from './components/NFAInput';
import AutomatonVisualizer from './components/AutomatonVisualizer';
import { Activity } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8080';

function App() {
  const [nfa, setNfa] = useState(null);
  const [dfa, setDfa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('minimize'); // 'convert' or 'minimize'

  const handleSubmit = async (nfaData, minimize) => {
    setLoading(true);
    setError(null);
    setMode(minimize ? 'minimize' : 'convert');

    try {
      const endpoint = minimize ? '/minimize' : '/convert';
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, nfaData);
      setNfa(response.data.nfa);
      setDfa(response.data.dfa);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while processing the automaton');
      setNfa(null);
      setDfa(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Finite Automaton Visualizer
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Convert NFA to DFA with minimization
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Section */}
        <div className="mb-8">
          <NFAInput onSubmit={handleSubmit} />
          
          {/* Info Card */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">How to use:</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Add states (numbers) and alphabet symbols</li>
              <li>• Define transitions (use ε for epsilon transitions)</li>
              <li>• Select start state and accept states</li>
              <li>• Choose "Convert to DFA" or "Convert to Minimized DFA"</li>
            </ul>
          </div>
        </div>

        {/* Visualization Section */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                {mode === 'minimize' ? 'Converting and minimizing...' : 'Converting to DFA...'}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">Error</h3>
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {!loading && !error && nfa && dfa && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* NFA Visualization */}
            <AutomatonVisualizer
              automaton={nfa}
              title="Input NFA"
            />

            {/* DFA Visualization */}
            <AutomatonVisualizer
              automaton={dfa}
              title={mode === 'minimize' ? 'Minimized DFA' : 'Converted DFA'}
            />
          </div>
        )}

        {!loading && !error && !nfa && !dfa && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No automaton to display</p>
              <p className="text-sm mt-2">Define an NFA and submit to see the visualization</p>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}

export default App;
