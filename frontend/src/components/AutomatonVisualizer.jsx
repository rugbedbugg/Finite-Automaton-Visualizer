import { useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

const AutomatonVisualizer = ({ automaton, title }) => {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!automaton) return { nodes: [], edges: [] };

    const { states, transitions, start, accept } = automaton;
    
    // Create nodes in a circular layout
    const nodes = states.map((state, index) => {
      const angle = (2 * Math.PI * index) / states.length;
      const radius = Math.min(200, states.length * 30);
      const x = 400 + radius * Math.cos(angle);
      const y = 300 + radius * Math.sin(angle);

      const isStart = state === start;
      const isAccept = accept.includes(state);

      return {
        id: `${state}`,
        type: 'default',
        data: { label: `q${state}` },
        position: { x, y },
        style: {
          background: isAccept ? '#9333ea' : '#3b82f6',
          color: 'white',
          border: isStart ? '4px solid #f59e0b' : 'none',
          borderRadius: '50%',
          width: 60,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '16px',
        },
      };
    });

    // Group transitions by (from, to) for better labeling
    const transitionMap = new Map();
    
    // Handle both NFA (with array of target states) and DFA (single target state)
    transitions.forEach((transition) => {
      if (transition.length === 3 && Array.isArray(transition[2])) {
        // NFA format: [from, symbol, [to1, to2, ...]]
        const [from, symbol, toStates] = transition;
        toStates.forEach(to => {
          const key = `${from}-${to}`;
          if (!transitionMap.has(key)) {
            transitionMap.set(key, []);
          }
          transitionMap.get(key).push(symbol || 'ε');
        });
      } else {
        // DFA format: [from, symbol, to]
        const [from, symbol, to] = transition;
        const key = `${from}-${to}`;
        if (!transitionMap.has(key)) {
          transitionMap.set(key, []);
        }
        transitionMap.get(key).push(symbol || 'ε');
      }
    });

    // Create edges
    const edges = [];
    transitionMap.forEach((symbols, key) => {
      const [from, to] = key.split('-').map(Number);
      const label = symbols.join(', ');
      
      edges.push({
        id: `e${from}-${to}`,
        source: `${from}`,
        target: `${to}`,
        label,
        type: from === to ? 'default' : 'smoothstep',
        animated: false,
        style: { stroke: '#64748b', strokeWidth: 2 },
        labelStyle: { 
          fill: '#1e293b', 
          fontWeight: 600,
          fontSize: 14,
        },
        labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#64748b',
        },
      });
    });

    return { nodes, edges };
  }, [automaton]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        {automaton && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            States: {automaton.states.length} | Transitions: {automaton.transitions.length}
          </p>
        )}
      </div>
      <div style={{ height: '600px' }}>
        {automaton ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <MiniMap 
              nodeColor={(node) => {
                if (automaton.accept.includes(parseInt(node.id))) return '#9333ea';
                if (parseInt(node.id) === automaton.start) return '#f59e0b';
                return '#3b82f6';
              }}
            />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            Submit an NFA to visualize the result
          </div>
        )}
      </div>
      {automaton && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-600 border-4 border-amber-500"></div>
              <span className="text-gray-700 dark:text-gray-300">Start State</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-600"></div>
              <span className="text-gray-700 dark:text-gray-300">Accept State</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-600"></div>
              <span className="text-gray-700 dark:text-gray-300">Regular State</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomatonVisualizer;
