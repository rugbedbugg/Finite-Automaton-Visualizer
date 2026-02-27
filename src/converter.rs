use crate::nfa::{NFA, State, Symbol};
use crate::dfa::DFA;
use std::collections::{HashMap, HashSet, BTreeSet, VecDeque};

/// Converts an NFA to an equivalent DFA using subset construction
pub fn nfa_to_dfa(nfa: &NFA) -> DFA {
    let mut dfa_states: HashMap<BTreeSet<State>, State> = HashMap::new();
    let mut dfa_transitions: HashMap<(State, Symbol), State> = HashMap::new();
    let mut state_counter: State = 0;
    let mut queue: VecDeque<BTreeSet<State>> = VecDeque::new();
    
    // Start with epsilon closure of NFA start state
    let start_closure: BTreeSet<State> = nfa.epsilon_closure(&HashSet::from([nfa.q0]))
        .into_iter().collect();
    dfa_states.insert(start_closure.clone(), state_counter);
    queue.push_back(start_closure.clone());
    
    let mut dfa_accept_states: HashSet<State> = HashSet::new();
    
    // Process each DFA state
    while let Some(nfa_states) = queue.pop_front() {
        let current_dfa_state = *dfa_states.get(&nfa_states).unwrap();
        
        // Check if this DFA state is accepting (contains any NFA accept state)
        if nfa_states.iter().any(|s| nfa.f.contains(s)) {
            dfa_accept_states.insert(current_dfa_state);
        }
        
        // For each input symbol in the alphabet
        for &symbol in &nfa.alphabet {
            // Compute move(nfa_states, symbol)
            let next_states_set = nfa.step_over(&nfa_states.iter().cloned().collect(), symbol);
            
            if !next_states_set.is_empty() {
                // Take epsilon closure of the result
                let next_states: BTreeSet<State> = nfa.epsilon_closure(&next_states_set)
                    .into_iter().collect();
                
                // Get or create DFA state for this set of NFA states
                let next_dfa_state = match dfa_states.get(&next_states) {
                    Some(&state) => state,
                    None => {
                        state_counter += 1;
                        dfa_states.insert(next_states.clone(), state_counter);
                        queue.push_back(next_states);
                        state_counter
                    }
                };
                
                // Add transition
                dfa_transitions.insert((current_dfa_state, symbol), next_dfa_state);
            }
        }
    }
    
    // Build the DFA
    let dfa_q: HashSet<State> = dfa_states.values().cloned().collect();
    
    DFA {
        q: dfa_q,
        alphabet: nfa.alphabet.clone(),
        trxn: dfa_transitions,
        q0: *dfa_states.get(&start_closure).unwrap(),
        f: dfa_accept_states,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_simple_nfa_to_dfa() {
        // TODO: Add test cases
    }
}
