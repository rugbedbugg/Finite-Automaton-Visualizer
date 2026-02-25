use std::collections::{Hashmap, HashSet};

pub type State = u32;
pub type Symmbol = char;

pub struct DFA {
    pub Q       : HashSet<State>,
    pub alphbet : HashSet<Symbol>,
    pub trxn    : HashMap<(State, Symbol), State>,
    pub q0      : State,
    pub F       : HashSet<State>,
}
// 1. trxn(0, 'a') = 1
// =================
// DFA1.trxn((0,'a'), 1);

// 2. trxn(0, ['a','b','c']) = 1
// ===========================
// DFA2.trxn((0, 'a'), 1);
// DFA2.trxn((0, 'b'), 1);
// DFA2.trxn((0, 'c'), 1);

impl DFA {
    pub fn step_over(&self, state: State, symbol: Symbol) -> Option<State> {
        /// Can return None (Incomplete DFA)
        /// Takes in 1 state & 1 symbol
        /// Returns 1 state OR no state
        self.trxn.get(&(state, symbol)).cloned()
    }
}
