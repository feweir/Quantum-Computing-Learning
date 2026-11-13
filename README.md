# Quantum Computing Learning

A hands-on crash course in quantum computing with Python: interactive HTML chapters (KaTeX math, canvas demos),
runnable simulations in Qiskit / Cirq / PennyLane, and a path to real cloud quantum hardware.
Dependencies are managed with [uv](https://docs.astral.sh/uv/).

## Quick start

```bash
# 1. Install uv once (macOS/Linux): https://docs.astral.sh/uv/getting-started/installation/
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. Sync the Python environment (creates .venv from pyproject.toml + uv.lock)
uv sync

# 3. Start the learning server
uv run python -m http.server 8770
```

Then open <http://localhost:8770> and start with the roadmap, then Chapter 1.
Formulas and fonts load from CDNs (KaTeX, Google Fonts), so you need internet access.

Run any simulation script with `uv run`:

```bash
uv run python 01-qubits-and-gates/code/01_bloch_sphere.py
uv run python 01-qubits-and-gates/code/02_measurement_qiskit.py
uv run python 01-qubits-and-gates/code/03_exercises_worked.py
uv run jupyter lab        # optional notebooks
```

## Contents

| Path | What it is |
|------|------------|
| `index.html` | Course home |
| `00-roadmap/` | 11-chapter roadmap, cloud accounts, notation cheat sheet |
| `01-qubits-and-gates/` | Chapter 1: qubits, gates, Bloch sphere, measurement, interference, worked exercises |
| `assets/` | Shared theme (Vercel-style black), KaTeX loader, code highlighter, quantum toolkit |
| `exer/` | Your own exercise solutions (scratch space) |

Each chapter folder follows the same layout:

```
NN-topic/
  index.html   the chapter (rendered LaTeX + interactive demos)
  demos.js     demo code
  code/        runnable Python simulations -> write to figures/
  figures/     matplotlib output (PNG)
  diagrams/    hand-written SVG
  latex/       compilable .tex summary
```

## Roadmap

1. Qubits, gates, measurement, Bloch sphere (done)
2. Multi-qubit systems, entanglement, Bell/GHZ
3. Frameworks tour: Qiskit, Cirq, PennyLane
4. Deutsch–Jozsa, Bernstein–Vazirani, Simon
5. QFT, phase estimation, Shor
6. Grover and amplitude amplification
7. Noise, error mitigation, error-correction basics
8. Variational algorithms: VQE, QAOA
9. Quantum machine learning with PennyLane
10. Real cloud hardware workflow (IBM Quantum, AWS Braket)
11. Capstone project

## Real hardware

Create a free [IBM Quantum](https://quantum.cloud.ibm.com) account (Open Plan) for QPU time.
Never commit API keys: save them once with `QiskitRuntimeService.save_account(...)` (stored in `~/.qiskit`)
or use environment variables.

## Requirements

- macOS, Linux or Windows with a recent browser
- Python 3.12 (uv installs it for you), [uv](https://docs.astral.sh/uv/)
