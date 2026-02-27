use crate::dfa::{DFA, State, Symbol};
use std::collections::{HashMap, HashSet, VecDeque};

/// Minimizes a DFA using the table-filling algorithm (Myhill-Nerode theorem)
/// This removes unreachable states and merges equivalent states
pub fn minimize_dfa(dfa: &DFA) -> DFA {
    // Step 1: Remove unreachable states
    let reachable_states = find_reachable_states(dfa);
    
    // Step 2: Remove non-accepting sink states (optional optimization)
    let useful_states: HashSet<State> = reachable_states.iter()
        .filter(|&&s| dfa.f.contains(&s) || has_path_to_accept(dfa, s, &reachable_states))
        .cloned()
        .collect();
    
    if useful_states.is_empty() {
        // Return a minimal DFA with just the start state (rejecting everything)
        return create_minimal_rejecting_dfa(dfa);
    }
    
    // Step 3: Partition states into equivalence classes
    let equivalence_classes = partition_states(dfa, &useful_states);
    
    // Step 4: Build the minimized DFA
    build_minimized_dfa(dfa, &equivalence_classes)
}

/// Find all states reachable from the start state
fn find_reachable_states(dfa: &DFA) -> HashSet<State> {
    let mut reachable = HashSet::new();
    let mut queue = VecDeque::new();
    
    queue.push_back(dfa.q0);
    reachable.insert(dfa.q0);
    
    while let Some(state) = queue.pop_front() {
        for &symbol in &dfa.alphabet {
            if let Some(&next_state) = dfa.trxn.get(&(state, symbol)) {
                if !reachable.contains(&next_state) {
                    reachable.insert(next_state);
                    queue.push_back(next_state);
                }
            }
        }
    }
    
    reachable
}

/// Check if there's a path from state to any accept state
fn has_path_to_accept(dfa: &DFA, state: State, reachable: &HashSet<State>) -> bool {
    let mut visited = HashSet::new();
    let mut queue = VecDeque::new();
    
    queue.push_back(state);
    visited.insert(state);
    
    while let Some(current) = queue.pop_front() {
        if dfa.f.contains(&current) {
            return true;
        }
        
        for &symbol in &dfa.alphabet {
            if let Some(&next_state) = dfa.trxn.get(&(current, symbol)) {
                if reachable.contains(&next_state) && !visited.contains(&next_state) {
                    visited.insert(next_state);
                    queue.push_back(next_state);
                }
            }
        }
    }
    
    false
}

/// Partition states into equivalence classes using table-filling algorithm
fn partition_states(dfa: &DFA, useful_states: &HashSet<State>) -> Vec<HashSet<State>> {
    let states: Vec<State> = useful_states.iter().cloned().collect();
    let n = states.len();
    
    // Create distinguishability table
    let mut distinguishable: HashMap<(State, State), bool> = HashMap::new();
    
    // Mark pairs where one is accepting and one is not
    for i in 0..n {
        for j in (i + 1)..n {
            let s1 = states[i];
            let s2 = states[j];
            
            if dfa.f.contains(&s1) != dfa.f.contains(&s2) {
                distinguishable.insert((s1, s2), true);
            } else {
                distinguishable.insert((s1, s2), false);
            }
        }
    }
    
    // Iteratively mark distinguishable pairs
    let mut changed = true;
    while changed {
        changed = false;
        
        for i in 0..n {
            for j in (i + 1)..n {
                let s1 = states[i];
                let s2 = states[j];
                
                if *distinguishable.get(&(s1, s2)).unwrap_or(&false) {
                    continue;
                }
                
                // Check if s1 and s2 transition to distinguishable states
                for &symbol in &dfa.alphabet {
                    let t1 = dfa.trxn.get(&(s1, symbol));
                    let t2 = dfa.trxn.get(&(s2, symbol));
                    
                    match (t1, t2) {
                        (Some(&ts1), Some(&ts2)) => {
                            if ts1 != ts2 {
                                let pair = if ts1 < ts2 { (ts1, ts2) } else { (ts2, ts1) };
                                if *distinguishable.get(&pair).unwrap_or(&false) {
                                    distinguishable.insert((s1, s2), true);
                                    changed = true;
                                    break;
                                }
                            }
                        }
                        (None, Some(_)) | (Some(_), None) => {
                            distinguishable.insert((s1, s2), true);
                            changed = true;
                            break;
                        }
                        (None, None) => {}
                    }
                }
            }
        }
    }
    
    // Build equivalence classes using Union-Find
    let mut parent: HashMap<State, State> = states.iter().map(|&s| (s, s)).collect();
    
    fn find(parent: &mut HashMap<State, State>, s: State) -> State {
        if parent[&s] != s {
            let root = find(parent, parent[&s]);
            parent.insert(s, root);
        }
        parent[&s]
    }
    
    fn union(parent: &mut HashMap<State, State>, s1: State, s2: State) {
        let root1 = find(parent, s1);
        let root2 = find(parent, s2);
        if root1 != root2 {
            parent.insert(root2, root1);
        }
    }
    
    // Union equivalent states
    for i in 0..n {
        for j in (i + 1)..n {
            let s1 = states[i];
            let s2 = states[j];
            if !*distinguishable.get(&(s1, s2)).unwrap_or(&false) {
                union(&mut parent, s1, s2);
            }
        }
    }
    
    // Group states by their root
    let mut classes: HashMap<State, HashSet<State>> = HashMap::new();
    for &state in &states {
        let root = find(&mut parent, state);
        classes.entry(root).or_insert_with(HashSet::new).insert(state);
    }
    
    classes.into_values().collect()
}

/// Build the minimized DFA from equivalence classes
fn build_minimized_dfa(dfa: &DFA, equivalence_classes: &[HashSet<State>]) -> DFA {
    // Map each state to its equivalence class representative
    let mut state_to_class: HashMap<State, State> = HashMap::new();
    for (i, class) in equivalence_classes.iter().enumerate() {
        let representative = i as State;
        for &state in class {
            state_to_class.insert(state, representative);
        }
    }
    
    // Build new transitions
    let mut new_transitions: HashMap<(State, Symbol), State> = HashMap::new();
    for class in equivalence_classes {
        let representative = *state_to_class.get(class.iter().next().unwrap()).unwrap();
        let any_state = *class.iter().next().unwrap();
        
        for &symbol in &dfa.alphabet {
            if let Some(&next_state) = dfa.trxn.get(&(any_state, symbol)) {
                let next_class = *state_to_class.get(&next_state).unwrap();
                new_transitions.insert((representative, symbol), next_class);
            }
        }
    }
    
    // Find new start and accept states
    let new_start = *state_to_class.get(&dfa.q0).unwrap();
    let new_accept: HashSet<State> = equivalence_classes.iter()
        .enumerate()
        .filter(|(_, class)| class.iter().any(|s| dfa.f.contains(s)))
        .map(|(i, _)| i as State)
        .collect();
    
    let new_states: HashSet<State> = (0..equivalence_classes.len()).map(|i| i as State).collect();
    
    DFA {
        q: new_states,
        alphabet: dfa.alphabet.clone(),
        trxn: new_transitions,
        q0: new_start,
        f: new_accept,
    }
}

/// Create a minimal rejecting DFA (single start state, no accept states)
fn create_minimal_rejecting_dfa(dfa: &DFA) -> DFA {
    let mut transitions = HashMap::new();
    for &symbol in &dfa.alphabet {
        transitions.insert((0, symbol), 0);
    }
    
    DFA {
        q: HashSet::from([0]),
        alphabet: dfa.alphabet.clone(),
        trxn: transitions,
        q0: 0,
        f: HashSet::new(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_minimize_dfa() {
        // TODO: Add test cases
    }
}
