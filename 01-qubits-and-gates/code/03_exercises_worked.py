"""Chapter 1 - worked exercises. Pattern for every problem:  PREDICT -> CODE -> READ -> CHECK.

Run: uv run python 01-qubits-and-gates/code/03_exercises_worked.py
"""
import itertools

import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator, Pauli, Statevector
from qiskit_aer import AerSimulator


def bloch(sv: Statevector) -> np.ndarray:
    """Bloch vector (<X>, <Y>, <Z>) of a 1-qubit Statevector."""
    return np.array([sv.expectation_value(Pauli(p)).real for p in "XYZ"]).round(3)


print("=== Exercise 1: H X H = Z and H Y H = -Y ===")
# PREDICT (by hand): H*X swaps the columns of H; multiply by H again -> diag(1,-1) = Z.
hxh = QuantumCircuit(1); hxh.h(0); hxh.x(0); hxh.h(0)      # CODE: gates in time order
hyh = QuantumCircuit(1); hyh.h(0); hyh.y(0); hyh.h(0)
print("Operator(HXH).data =\n", Operator(hxh).data.round(3))  # READ: the 2x2 matrix
print("HXH == Z   :", Operator(hxh) == Operator.from_label("Z"))   # CHECK: exact match
print("HYH == -Y  :", Operator(hyh) == -Operator.from_label("Y"))
print("HYH equiv Y (ignoring global phase):", Operator(hyh).equiv(Operator.from_label("Y")))

print("\n=== Exercise 2: Bloch vector of sqrt(X)|0> ===")
# PREDICT: sqrt(X) = Rx(pi/2) (up to global phase): rotates +z by 90 deg about x -> -y.
qc = QuantumCircuit(1); qc.sx(0)
sv = Statevector(qc)                                         # start state is |0> by default
print("state     :", sv.data.round(3))                       # READ amplitudes
print("Bloch xyz :", bloch(sv), " (prediction: [0, -1, 0] = |-i>)")

print("\n=== Exercise 3: shortest H/S sequence from |0> to |-i> ===")
# PREDICT: H: z->x, S: x->y, H: y->-y  => H, S, H (3 gates). Prove it by brute-force search.
target = Statevector([1 / np.sqrt(2), -1j / np.sqrt(2)])     # |-i> = (|0> - i|1>)/sqrt2
found = None
for length in range(1, 6):
    for seq in itertools.product("HS", repeat=length):
        c = QuantumCircuit(1)
        for g in seq:
            getattr(c, g.lower())(0)
        if Statevector(c).equiv(target):                    # equiv ignores global phase
            found = seq
            break
    if found:
        break
print("shortest sequence:", " -> ".join(found), f"({len(found)} gates)")

print("\n=== Exercise 4: measure X on Ry(pi/3)|0> ===")
# PREDICT: Bloch = (sin(pi/3), 0, cos(pi/3)); <X> = 0.866; p(0 after H) = (1+<X>)/2 = 0.933.
qc = QuantumCircuit(1)
qc.ry(np.pi / 3, 0)             # prepare the state
qc.h(0)                         # "measure in X" = rotate X onto Z...
qc.measure_all()                # ...then do an ordinary Z measurement
shots = 4000
counts = AerSimulator(seed_simulator=1).run(qc, shots=shots).result().get_counts()
print("counts   :", counts)                                  # READ: dict bitstring -> times seen
n0, n1 = counts.get("0", 0), counts.get("1", 0)
print("p(0)     :", n0 / shots, "(prediction 0.933)")
print("<X> est. :", round((n0 - n1) / shots, 3), "(prediction", round(np.sin(np.pi / 3), 3), ")")

print("\n=== Exercise 5: your own 1-qubit simulator in plain NumPy ===")
rng = np.random.default_rng(0)
GATES = {"H": np.array([[1, 1], [1, -1]]) / np.sqrt(2), "X": np.array([[0, 1], [1, 0]]),
         "Z": np.diag([1, -1]), "S": np.diag([1, 1j])}


def run(circuit, shots=1000):
    psi = np.array([1, 0], dtype=complex)         # start in |0>
    for g in circuit:
        psi = GATES[g] @ psi                      # apply gates in time order
    probs = np.abs(psi) ** 2                      # Born rule
    outcomes = rng.choice([0, 1], size=shots, p=probs)
    return psi, {"0": int((outcomes == 0).sum()), "1": int((outcomes == 1).sum())}


psi, counts = run(["H", "Z", "H"])
print("H Z H on |0> ->", psi.round(3), counts, "(it is X, so all 1s)")
psi, counts = run(["H"])
print("H on |0>     ->", psi.round(3), counts)
