use actix_web::{web, Responder, HttpResponse};
use serde::{Deserialize, Serialize};
use crate::nfa::{NFA, Symbol, State};
use crate::converter::nfa_to_dfa;
use crate::minimizer::minimize_dfa;
use std::collections::{HashMap, HashSet};

#[derive(Deserialize)]
pub struct NFAInput {
    pub states: Vec<State>,
    pub alphabet: Vec<Symbol>,
    pub transitions: Vec<(State, Option<Symbol>, Vec<State>)>,
    pub start: State,
    pub accept: Vec<State>,
}

#[derive(Serialize)]
pub struct NFAOutput {
    pub states: Vec<State>,
    pub alphabet: Vec<Symbol>,
    pub transitions: Vec<(State, Option<Symbol>, Vec<State>)>,
    pub start: State,
    pub accept: Vec<State>,
}

#[derive(Serialize)]
pub struct DFAOutput {
    pub states: Vec<State>,
    pub alphabet: Vec<Symbol>,
    pub transitions: Vec<(State, Symbol, State)>,
    pub start: State,
    pub accept: Vec<State>,
}

#[derive(Serialize)]
pub struct ConversionResponse {
    pub nfa: NFAOutput,
    pub dfa: DFAOutput,
}

pub async fn convert_nfa_to_dfa(input: web::Json<NFAInput>) -> impl Responder {
    // Validate input
    if let Err(error_msg) = validate_nfa_input(&input) {
        #[derive(Serialize)]
        struct ErrorResponse {
            error: String,
        }
        return HttpResponse::BadRequest().json(ErrorResponse { error: error_msg });
    }
    
    let nfa = build_nfa(&input);
    let dfa = nfa_to_dfa(&nfa);
    let response = ConversionResponse {
        nfa: build_nfa_output(&input),
        dfa: build_dfa_output(&dfa),
    };
    HttpResponse::Ok().json(response)
}

pub async fn convert_nfa_to_minimized_dfa(input: web::Json<NFAInput>) -> impl Responder {
    // Validate input
    if let Err(error_msg) = validate_nfa_input(&input) {
        #[derive(Serialize)]
        struct ErrorResponse {
            error: String,
        }
        return HttpResponse::BadRequest().json(ErrorResponse { error: error_msg });
    }
    
    let nfa = build_nfa(&input);
    let dfa = nfa_to_dfa(&nfa);
    let minimized_dfa = minimize_dfa(&dfa);
    let response = ConversionResponse {
        nfa: build_nfa_output(&input),
        dfa: build_dfa_output(&minimized_dfa),
    };
    HttpResponse::Ok().json(response)
}

fn build_nfa(input: &NFAInput) -> NFA {
    let mut transitions: HashMap<(State, Option<Symbol>), HashSet<State>> = HashMap::new();
    for (from, symbol, to) in &input.transitions {
        transitions.insert((*from, *symbol), to.iter().cloned().collect());
    }
    NFA {
        q: input.states.iter().cloned().collect(),
        alphabet: input.alphabet.iter().cloned().collect(),
        trxn: transitions,
        q0: input.start,
        f: input.accept.iter().cloned().collect(),
    }
}

fn build_nfa_output(input: &NFAInput) -> NFAOutput {
    NFAOutput {
        states: input.states.clone(),
        alphabet: input.alphabet.clone(),
        transitions: input.transitions.clone(),
        start: input.start,
        accept: input.accept.clone(),
    }
}

fn build_dfa_output(dfa: &crate::dfa::DFA) -> DFAOutput {
    let transitions = dfa.trxn.iter()
        .map(|(&(from, symbol), &to)| (from, symbol, to))
        .collect();
    DFAOutput {
        states: dfa.q.iter().cloned().collect(),
        alphabet: dfa.alphabet.iter().cloned().collect(),
        transitions,
        start: dfa.q0,
        accept: dfa.f.iter().cloned().collect(),
    }
}

fn validate_nfa_input(input: &NFAInput) -> Result<(), String> {
    // Check if states list is not empty
    if input.states.is_empty() {
        return Err("States list cannot be empty".to_string());
    }
    
    // Check if alphabet is not empty
    if input.alphabet.is_empty() {
        return Err("Alphabet cannot be empty".to_string());
    }
    
    // Check if start state is in states list
    if !input.states.contains(&input.start) {
        return Err(format!("Start state {} is not in the states list", input.start));
    }
    
    // Check if all accept states are in states list
    for &accept_state in &input.accept {
        if !input.states.contains(&accept_state) {
            return Err(format!("Accept state {} is not in the states list", accept_state));
        }
    }
    
    // Check transitions validity
    let state_set: HashSet<State> = input.states.iter().cloned().collect();
    let alphabet_set: HashSet<Symbol> = input.alphabet.iter().cloned().collect();
    
    for (from, symbol, to_states) in &input.transitions {
        // Check if 'from' state exists
        if !state_set.contains(from) {
            return Err(format!("Transition from state {} which is not in states list", from));
        }
        
        // Check if symbol is valid (either in alphabet or epsilon/null)
        if let Some(sym) = symbol {
            if !alphabet_set.contains(sym) {
                return Err(format!("Transition uses symbol '{}' which is not in alphabet", sym));
            }
        }
        
        // Check if 'to' states exist
        for to_state in to_states {
            if !state_set.contains(to_state) {
                return Err(format!("Transition to state {} which is not in states list", to_state));
            }
        }
        
        // Check if to_states is not empty
        if to_states.is_empty() {
            return Err(format!("Transition from state {} has empty target states", from));
        }
    }
    
    Ok(())
}
