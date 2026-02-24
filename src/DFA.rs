use std::collections::{Hashmap, HashSet};

pub type State = u32;
pub type Symmbol = char;

pub struct DFA {
    Q       : HashSet<State>,
    alphbet : HashSet<Symbol>,
    trxn    : HashMap<(State, Symbol), State>,
    q0      : State,
    F       : HashSet<State>,
}
// 1. trxn(0, 'a') = 1
// =================
// DFA1.trxn((0,'a'), 1);

// 2. trxn(0, ['a','b','c']) = 1
// ===========================
// DFA2.trxn((0, 'a'), 1);
// DFA2.trxn((0, 'b'), 1);
// DFA2.trxn((0, 'c'), 1);


