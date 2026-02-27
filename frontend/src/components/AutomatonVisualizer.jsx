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
      // Increase radius based on number of states for better spacing
      const baseRadius = 150;
      const radiusIncrement = Math.max(40, states.length * 15);
      const radius = baseRadius + radiusIncrement;
      const x = 300 + radius * Math.cos(angle);
      const y = 250 + radius * Math.sin(angle);

      const isStart = state === start;
      const isAccept = accept.includes(state);

      return {
        id: `${state}`,
        type: 'default',
        data: { label: `q${state}` },
        position: { x, y },
        style: {
          background: isAccept ? '#a855f7' : '#3b82f6',
          color: 'white',
          border: isStart ? '4px solid #f59e0b' : '2px solid #1e40af',
          borderRadius: '50%',
          width: 60,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
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

    // Create edges with better spacing for bidirectional transitions
    const edges = [];
    const edgeSet = new Set();
    
    transitionMap.forEach((symbols, key) => {
      const [from, to] = key.split('-').map(Number);
      const label = symbols.join(', ');
      const reverseKey = `${to}-${from}`;
      const isBidirectional = transitionMap.has(reverseKey) && from !== to;
      
      // Determine edge type and curvature to prevent overlap
      let edgeType = 'smoothstep';
      let animated = false;
      
      if (from === to) {
        // Self-loop
        edgeType = 'default';
      } else if (isBidirectional && !edgeSet.has(reverseKey)) {
        // For bidirectional edges, add curvature to first one
        edgeType = 'default';
      }
      
      edges.push({
        id: `e${from}-${to}`,
        source: `${from}`,
        target: `${to}`,
        label,
        type: edgeType,
        animated,
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
          fillOpacity: 0.9,
          padding: 4,
        },
        labelBgPadding: [8, 4],
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#64748b',
          width: 20,
          height: 20,
        },
      });
      
      edgeSet.add(key);
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
            <Controls />
            <MiniMap 
              nodeColor={(node) => {
                if (automaton.accept.includes(parseInt(node.id))) return '#a855f7';
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
              <div className="w-4 h-4 rounded-full bg-purple-500"></div>
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
