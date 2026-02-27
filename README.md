# Finite Automaton Visualizer

A Rust-based web service for converting Non-deterministic Finite Automata (NFA) to Deterministic Finite Automata (DFA) using the subset construction algorithm.

## Features

- **NFA to DFA Conversion**: Convert any NFA (including those with ε-transitions) to an equivalent DFA
- **DFA Minimization**: Minimize DFAs using the table-filling algorithm (Myhill-Nerode theorem)
- **Complete Pipeline**: NFA → DFA → Minimized DFA in one API call
- **REST API**: Simple HTTP API for automaton conversion and minimization
- **Subset Construction Algorithm**: Implements the classic powerset construction method
- **Epsilon Closure**: Handles ε-transitions properly during conversion
- **Input Validation**: Comprehensive validation of automaton inputs

## Project Structure

```
src/
├── main.rs          # Entry point and HTTP server setup
├── nfa.rs           # NFA data structure and operations
├── dfa.rs           # DFA data structure
├── converter.rs     # NFA to DFA conversion algorithm
├── minimizer.rs     # DFA minimization algorithm
└── api/
    ├── mod.rs       # API module definition
    └── convert.rs   # HTTP endpoint handlers
```

## Installation

### Prerequisites

- Rust (1.70 or later)
- Cargo

### Build

```bash
cargo build --release
```

## Usage

### Running the Server

```bash
cargo run
```

The server will start on `http://127.0.0.1:8080`

### API Endpoints

#### Health Check
```
GET /health
```

Returns: `"Server is running"`

#### Convert NFA to DFA
```
POST /convert
Content-Type: application/json
```

Converts an NFA to an equivalent DFA using subset construction.

**Request Body:**
```json
{
  "states": [0, 1, 2],
  "alphabet": ["a", "b"],
  "transitions": [
    [0, "a", [0, 1]],
    [0, null, [2]],
    [1, "b", [2]],
    [2, "a", [2]]
  ],
  "start": 0,
  "accept": [2]
}
```

**Response:**
```json
{
  "states": [0, 1, 2],
  "alphabet": ["a", "b"],
  "transitions": [
    [0, "a", 1],
    [0, "b", 2],
    [1, "a", 1],
    [1, "b", 2]
  ],
  "start": 0,
  "accept": [0, 1, 2]
}
```

**Note:** Use `null` for ε-transitions in the input.

#### Convert NFA to Minimized DFA
```
POST /minimize
Content-Type: application/json
```

Converts an NFA to a minimized DFA in one step (applies subset construction followed by minimization).

**Request Body:** Same format as `/convert` endpoint

**Response:**
```json
{
  "states": [0, 1],
  "alphabet": ["a", "b"],
  "transitions": [
    [0, "a", 0],
    [0, "b", 1],
    [1, "a", 1],
    [1, "b", 1]
  ],
  "start": 0,
  "accept": [1]
}
```

The minimized DFA will have:
- Unreachable states removed
- Equivalent states merged
- Minimal number of states while preserving language recognition

## Algorithms

### NFA to DFA Conversion (Subset Construction)

The conversion uses the **subset construction** algorithm:

1. **Epsilon Closure**: Compute the set of states reachable via ε-transitions
2. **Subset Construction**: Each DFA state represents a set of NFA states
3. **Transition Computation**: For each DFA state and input symbol, compute the set of reachable NFA states
4. **Accept States**: A DFA state is accepting if it contains at least one NFA accept state

**Time Complexity:**
- **Worst case**: O(2^n) where n is the number of NFA states
- **Space**: O(2^n) for storing DFA states

### DFA Minimization (Table-Filling Algorithm)

The minimization uses the **Myhill-Nerode theorem** and table-filling algorithm:

1. **Unreachable State Removal**: Remove states not reachable from the start state
2. **Dead State Removal**: Remove states that cannot reach any accept state (optional)
3. **State Partitioning**: Use table-filling to identify distinguishable state pairs
   - Initially mark pairs where one accepts and one rejects
   - Iteratively mark pairs that transition to distinguishable states
4. **Equivalence Classes**: Group indistinguishable states using Union-Find
5. **DFA Construction**: Build minimized DFA with one state per equivalence class

**Time Complexity:**
- **Worst case**: O(n²·|Σ|) where n is the number of states and |Σ| is alphabet size
- **Space**: O(n²) for the distinguishability table

## Data Structures

### NFA (Non-deterministic Finite Automaton)
```rust
pub struct NFA {
    pub q: HashSet<State>,          // Set of states
    pub alphabet: HashSet<Symbol>,   // Input alphabet
    pub trxn: HashMap<(State, Option<Symbol>), HashSet<State>>, // Transitions
    pub q0: State,                   // Start state
    pub f: HashSet<State>,           // Accept states
}
```

### DFA (Deterministic Finite Automaton)
```rust
pub struct DFA {
    pub q: HashSet<State>,           // Set of states
    pub alphabet: HashSet<Symbol>,   // Input alphabet
    pub trxn: HashMap<(State, Symbol), State>, // Transitions
    pub q0: State,                   // Start state
    pub f: HashSet<State>,           // Accept states
}
```

## Development

### Running Tests

```bash
cargo test
```

### Code Style

This project follows Rust naming conventions:
- `snake_case` for functions and variables
- `PascalCase` for types and structs

## Dependencies

- `actix-web` - Web framework for the REST API
- `serde` - Serialization/deserialization framework
- Standard Rust collections (`HashMap`, `HashSet`, `BTreeSet`, etc.)

## License

[Specify your license here]

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Future Enhancements

- [ ] Add visualization capabilities (graphical automaton diagrams)
- [ ] Regular expression to NFA conversion (Thompson's construction)
- [ ] Interactive web interface (frontend UI)
- [ ] DFA equivalence checking
- [ ] More comprehensive test suite
- [ ] Export to various formats (DOT, JSON, XML)
