import { useCallback, useMemo } from 'react';
import ReactFlow, {
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
    
    // Create nodes in a circular layout with better spacing
    const nodes = states.map((state, index) => {
      const angle = (2 * Math.PI * index) / states.length;
      // Increase radius based on number of states for better spacing
      // Offset starting angle to avoid vertical overlap
      const offsetAngle = angle - Math.PI / 2; // Start from top instead of right
      const baseRadius = 180;
      const radiusIncrement = Math.max(50, states.length * 20);
      const radius = baseRadius + radiusIncrement;
      const x = 350 + radius * Math.cos(offsetAngle);
      const y = 250 + radius * Math.sin(offsetAngle);

      const isStart = state === start;
      const isAccept = accept.includes(state);

      return {
        id: `${state}`,
        type: 'default',
        data: { label: `q${state}` },
        position: { x, y },
        style: {
          background: isAccept ? '#10b981' : '#6366f1',
          color: 'white',
          border: isStart ? '4px solid #f97316' : '2px solid rgba(255,255,255,0.3)',
          borderRadius: '50%',
          width: 60,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
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

    // Create edges with proper routing to avoid overlap
    const edges = [];
    const processedPairs = new Set();
    
    transitionMap.forEach((symbols, key) => {
      const [from, to] = key.split('-').map(Number);
      const label = symbols.join(', ');
      const reverseKey = `${to}-${from}`;
      const pairKey = from < to ? `${from}-${to}` : `${to}-${from}`;
      
      // Check if there's a reverse transition
      const hasReverse = transitionMap.has(reverseKey) && from !== to;
      const isFirstOfPair = !processedPairs.has(pairKey);
      
      let edgeConfig = {
        id: `e${from}-${to}`,
        source: `${from}`,
        target: `${to}`,
        label,
        animated: false,
        style: { 
          stroke: '#64748b', 
          strokeWidth: 2.5,
        },
        labelStyle: { 
          fill: '#1e293b', 
          fontWeight: 600,
          fontSize: 13,
        },
        labelBgStyle: { 
          fill: '#ffffff', 
          fillOpacity: 0.95,
          padding: 4,
        },
        labelBgPadding: [8, 4],
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#64748b',
          width: 20,
          height: 20,
        },
      };
      
      if (from === to) {
        // Self-loop
        edgeConfig.type = 'default';
      } else if (hasReverse) {
        // Bidirectional edges - use bezier with offset
        edgeConfig.type = 'default';
        // Add curvature offset for the second edge
        if (!isFirstOfPair) {
          edgeConfig.style.strokeDasharray = '0';
        }
        processedPairs.add(pairKey);
      } else {
        // Single direction - use smooth step
        edgeConfig.type = 'smoothstep';
      }
      
      edges.push(edgeConfig);
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
      <div style={{ height: '500px' }}>
        {automaton ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            fitViewOptions={{ padding: 0.2, maxZoom: 1.2 }}
            attributionPosition="bottom-left"
          >
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
              <div className="w-4 h-4 rounded-full bg-indigo-500 border-4 border-orange-500"></div>
              <span className="text-gray-700 dark:text-gray-300">Start State</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
              <span className="text-gray-700 dark:text-gray-300">Accept State</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
              <span className="text-gray-700 dark:text-gray-300">Regular State</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomatonVisualizer;
