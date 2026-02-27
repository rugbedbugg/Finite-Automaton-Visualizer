use std::collections::{HashMap, HashSet};

pub type State = u32;
pub type Symbol = char;

pub struct DFA {
    pub q: HashSet<State>,           // Set of states
    pub alphabet: HashSet<Symbol>,   // Alphabet
    pub trxn: HashMap<(State, Symbol), State>, // Transitions
    pub q0: State,                   // Start state
    pub f: HashSet<State>,           // Accept states
}
