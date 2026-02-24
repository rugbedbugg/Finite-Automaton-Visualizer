use std::collections::{Hashmap, HashSet};

pub type State = u32;
pub type Symmbol = char;

pub struct NFA {
    Q       : HashSet<State>,
    alphbet : HashSet<Symbol>,
    trxn    : HashMap<(State, Option<Symbol>), HashSet<State>>, 
            // Using 'Option' allows for None
            // to be represented as e-transition
    q0      : State,
    F       : HashSet<State>,
}
// 1. trxn(0, 'a') = {1,2}
// =================
// DFA1.trxn((0,Some('a')), HashSet::from[1,2]);

// 2. trxn(0, e) = {1}
// ===========================
// DFA2.trxn((0, None), HashSet::from[1]);


impl NFA {
    pub fn epsilon_closure(&self, states: &HashSet<State>) -> HashSet<State> {
        """
        epsilon-closure of a state q is the set of all states
        reachable from q by following zero or more epsilon transitions.
        """
        let mut closure = states.clone();
        let mur stack: Vec<State> = states.iter().cloned().collect();

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
}
