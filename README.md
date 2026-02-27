# Finite Automaton Visualizer

A Rust-based web service for converting Non-deterministic Finite Automata (NFA) to Deterministic Finite Automata (DFA) using the subset construction algorithm.

## Features

- **NFA to DFA Conversion**: Convert any NFA (including those with ε-transitions) to an equivalent DFA
- **REST API**: Simple HTTP API for automaton conversion
- **Subset Construction Algorithm**: Implements the classic powerset construction method
- **Epsilon Closure**: Handles ε-transitions properly during conversion

## Project Structure

```
src/
├── main.rs          # Entry point and HTTP server setup
├── nfa.rs           # NFA data structure and operations
├── dfa.rs           # DFA data structure
├── converter.rs     # NFA to DFA conversion algorithm
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

## Algorithm

The conversion uses the **subset construction** algorithm:

1. **Epsilon Closure**: Compute the set of states reachable via ε-transitions
2. **Subset Construction**: Each DFA state represents a set of NFA states
3. **Transition Computation**: For each DFA state and input symbol, compute the set of reachable NFA states
4. **Accept States**: A DFA state is accepting if it contains at least one NFA accept state

### Time Complexity

- **Worst case**: O(2^n) where n is the number of NFA states
- **Space**: O(2^n) for storing DFA states

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

- [ ] Add visualization capabilities
- [ ] Support for DFA minimization
- [ ] Regular expression to NFA conversion
- [ ] Interactive web interface
- [ ] More comprehensive test suite
