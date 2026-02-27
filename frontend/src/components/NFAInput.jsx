import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';

const NFAInput = ({ onSubmit }) => {
  const [states, setStates] = useState([0, 1, 2]);
  const [alphabet, setAlphabet] = useState(['a', 'b']);
  const [transitions, setTransitions] = useState([
    { from: 0, symbol: 'a', to: [0, 1] },
    { from: 0, symbol: 'b', to: [0] },
    { from: 1, symbol: 'b', to: [2] },
  ]);
  const [startState, setStartState] = useState(0);
  const [acceptStates, setAcceptStates] = useState([2]);
  const [newState, setNewState] = useState('');
  const [newSymbol, setNewSymbol] = useState('');

  const handleAddState = () => {
    const stateNum = parseInt(newState);
    if (newState && !states.includes(stateNum)) {
      setStates([...states, stateNum]);
      setNewState('');
    }
  };

  const handleRemoveState = (state) => {
    const newStates = states.filter(s => s !== state);
    setStates(newStates);
    // Remove transitions that reference this state
    setTransitions(transitions.filter(t => {
      // Remove if from state is deleted
      if (t.from === state) return false;
      // Remove if any to state is deleted
      if (t.to.includes(state)) {
        // Filter out the deleted state from to array
        const newTo = t.to.filter(s => s !== state);
        // Only keep transition if there are still target states
        return newTo.length > 0;
      }
      return true;
    }).map(t => ({
      ...t,
      to: t.to.filter(s => s !== state) // Clean up to arrays
    })));
    // Update start state if it was deleted
    if (startState === state) {
      setStartState(newStates.length > 0 ? newStates[0] : 0);
    }
    // Update accept states
    setAcceptStates(acceptStates.filter(s => s !== state));
  };

  const handleAddSymbol = () => {
    if (newSymbol && !alphabet.includes(newSymbol)) {
      setAlphabet([...alphabet, newSymbol]);
      setNewSymbol('');
    }
  };

  const handleRemoveSymbol = (symbol) => {
    setAlphabet(alphabet.filter(s => s !== symbol));
    setTransitions(transitions.filter(t => t.symbol !== symbol));
  };

  const handleAddTransition = () => {
    if (states.length === 0 || alphabet.length === 0) {
      alert('Please add at least one state and one symbol first');
      return;
    }
    setTransitions([...transitions, { from: states[0], symbol: alphabet[0], to: [] }]);
  };

  const handleUpdateTransition = (index, field, value) => {
    const updated = [...transitions];
    if (field === 'to') {
      // Handle comma-separated target states
      if (value.trim() === '') {
        updated[index][field] = [];
      } else {
        const toStates = value.split(',').map(s => parseInt(s.trim())).filter(s => !isNaN(s));
        updated[index][field] = toStates;
      }
    } else if (field === 'from') {
      const parsedValue = parseInt(value);
      updated[index][field] = isNaN(parsedValue) ? states[0] || 0 : parsedValue;
    } else {
      // Handle symbol field
      updated[index][field] = value === 'ε' || value === '' ? null : value;
    }
    setTransitions(updated);
  };

  const handleRemoveTransition = (index) => {
    setTransitions(transitions.filter((_, i) => i !== index));
  };

  const toggleAcceptState = (state) => {
    if (acceptStates.includes(state)) {
      setAcceptStates(acceptStates.filter(s => s !== state));
    } else {
      setAcceptStates([...acceptStates, state]);
    }
  };

  const handleSubmit = (minimize = false) => {
    // Validation
    if (states.length === 0) {
      alert('Please add at least one state');
      return;
    }
    if (alphabet.length === 0) {
      alert('Please add at least one symbol to the alphabet');
      return;
    }
    if (!states.includes(startState)) {
      alert('Start state is not in the states list');
      return;
    }
    
    // Validate and filter transitions
    const validTransitions = transitions.filter(t => {
      // Check if from state exists
      if (!states.includes(t.from)) {
        console.warn(`Transition from state ${t.from} removed - state does not exist`);
        return false;
      }
      // Check if symbol is valid (in alphabet or epsilon)
      if (t.symbol !== null && !alphabet.includes(t.symbol)) {
        console.warn(`Transition with symbol ${t.symbol} removed - symbol not in alphabet`);
        return false;
      }
      // Check if to states exist
      const validToStates = t.to.filter(s => states.includes(s));
      if (validToStates.length === 0) {
        console.warn(`Transition removed - no valid target states`);
        return false;
      }
      return true;
    }).map(t => ({
      ...t,
      to: t.to.filter(s => states.includes(s)) // Clean up to states
    }));
    
    const nfaData = {
      states: states.sort((a, b) => a - b),
      alphabet,
      transitions: validTransitions.map(t => [t.from, t.symbol, t.to]),
      start: startState,
      accept: acceptStates.filter(s => states.includes(s)).sort((a, b) => a - b),
    };
    onSubmit(nfaData, minimize);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Define NFA</h2>

      {/* States */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          States
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            value={newState}
            onChange={(e) => setNewState(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddState()}
            placeholder="Add state (number)"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleAddState}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {states.map(state => (
            <div key={state} className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">q{state}</span>
              <button onClick={() => handleRemoveState(state)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Alphabet */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Alphabet (use ε for epsilon)
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSymbol()}
            placeholder="Add symbol"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleAddSymbol}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {alphabet.map(symbol => (
            <div key={symbol} className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full">
              <span className="text-sm font-medium text-green-800 dark:text-green-200">{symbol}</span>
              <button onClick={() => handleRemoveSymbol(symbol)} className="text-green-600 dark:text-green-400 hover:text-green-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Start State */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Start State
        </label>
        <select
          value={startState}
          onChange={(e) => setStartState(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          {states.map(state => (
            <option key={state} value={state}>q{state}</option>
          ))}
        </select>
      </div>

      {/* Accept States */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Accept States
        </label>
        <div className="flex flex-wrap gap-2">
          {states.map(state => (
            <button
              key={state}
              onClick={() => toggleAcceptState(state)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                acceptStates.includes(state)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              q{state}
            </button>
          ))}
        </div>
      </div>

      {/* Transitions */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Transitions
          </label>
          <button
            onClick={handleAddTransition}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
          >
            <Plus className="w-4 h-4 inline mr-1" /> Add Transition
          </button>
        </div>
        <div className="space-y-2">
          {transitions.map((transition, index) => (
            <div key={index} className="flex gap-2 items-center">
              <select
                value={transition.from}
                onChange={(e) => handleUpdateTransition(index, 'from', e.target.value)}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
              >
                {states.map(state => (
                  <option key={state} value={state}>q{state}</option>
                ))}
              </select>
              <span className="text-gray-500">→</span>
              <input
                type="text"
                value={transition.symbol === null ? 'ε' : transition.symbol}
                onChange={(e) => handleUpdateTransition(index, 'symbol', e.target.value)}
                placeholder="Symbol (ε for epsilon)"
                className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
              />
              <span className="text-gray-500">→</span>
              <input
                type="text"
                value={transition.to.join(', ')}
                onChange={(e) => handleUpdateTransition(index, 'to', e.target.value)}
                placeholder="Target states (comma-separated)"
                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
              />
              <button
                onClick={() => handleRemoveTransition(index)}
                className="px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={() => handleSubmit(false)}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-lg"
        >
          Convert to DFA
        </button>
        <button
          onClick={() => handleSubmit(true)}
          className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium shadow-lg"
        >
          Convert to Minimized DFA
        </button>
      </div>
    </div>
  );
};

export default NFAInput;
