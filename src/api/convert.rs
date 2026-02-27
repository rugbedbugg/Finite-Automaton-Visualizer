use actix_web::{web, Responder, HttpResponse};
use serde::{Deserialize, Serialize};
use crate::nfa::{NFA, Symbol, State};
use crate::converter::nfa_to_dfa;
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
pub struct DFAOutput {
    pub states: Vec<State>,
    pub alphabet: Vec<Symbol>,
    pub transitions: Vec<(State, Symbol, State)>,
    pub start: State,
    pub accept: Vec<State>,
}

pub async fn convert_nfa_to_dfa(input: web::Json<NFAInput>) -> impl Responder {
    let nfa = build_nfa(&input);
    let dfa = nfa_to_dfa(&nfa);
    let response = build_dfa_output(&dfa);
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
