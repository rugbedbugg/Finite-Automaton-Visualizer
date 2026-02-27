use std::collections::{HashMap, HashSet};

pub type State = u32;
pub type Symbol = char;

pub struct NFA {
    pub q: HashSet<State>,           // Set of states
    pub alphabet: HashSet<Symbol>,   // Alphabet
    pub trxn: HashMap<(State, Option<Symbol>), HashSet<State>>, // Transitions
    pub q0: State,                   // Start state
    pub f: HashSet<State>,           // Accept states
}

impl NFA {
    /// epsilon-closure of states is the set of all states reachable from any of the given states
    /// by following zero or more epsilon transitions.
    pub fn epsilon_closure(&self, states: &HashSet<State>) -> HashSet<State> {
        let mut closure = states.clone();
        let mut stack: Vec<State> = states.iter().cloned().collect();

        while let Some(state) = stack.pop() {
            if let Some(next_states) = self.trxn.get(&(state, None)) {
                for &next in next_states {
                    if closure.insert(next) {
                        stack.push(next);
                    }
                }
            }
        }

        closure
    }

    /// Takes in a set of states and a symbol, and returns the set of states
    /// reachable by a single transition on that symbol.
    pub fn step_over(&self, states: &HashSet<State>, symbol: Symbol) -> HashSet<State> {
        let mut result = HashSet::new();

        for &state in states {
            if let Some(next_states) = self.trxn.get(&(state, Some(symbol))) {
                result.extend(next_states);
            }
        }

        result
    }
}
