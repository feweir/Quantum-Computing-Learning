"""Chapter 1 - Measurement statistics, interference, and the first Qiskit circuits.

Run: uv run python 01-qubits-and-gates/code/02_measurement_qiskit.py
Output: ../figures/interference.png, ../figures/measurement_counts.png, ../figures/circuit_hzh.png
"""
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit_aer import AerSimulator

OUT = Path(__file__).resolve().parent.parent / "figures"
OUT.mkdir(exist_ok=True)
sim = AerSimulator(seed_simulator=7)

# 1) Statevector of H|0>, exact probabilities vs sampled shots -----------------
qc = QuantumCircuit(1)
qc.h(0)
print("H|0> =", Statevector(qc).data.round(4), "-> P =", Statevector(qc).probabilities())

meas = qc.copy()
meas.measure_all()
shots = [10, 100, 1000, 10000]
fig, axes = plt.subplots(1, 4, figsize=(13, 3), sharey=True)
for ax, n in zip(axes, shots):
    counts = sim.run(meas, shots=n).result().get_counts()
    p = [counts.get(k, 0) / n for k in ("0", "1")]
    ax.bar(["0", "1"], p, color=["tab:blue", "tab:orange"])
    ax.axhline(0.5, color="k", ls="--", lw=0.8)
    ax.set_title(f"{n} shots")
axes[0].set_ylabel("frequency")
fig.suptitle("Born rule: |<x|psi>|^2 emerges only statistically (law of large numbers)")
fig.savefig(OUT / "measurement_counts.png", dpi=160, bbox_inches="tight")
plt.close(fig)

# 2) Interference: H, then phase phi, then H. P(0) = cos^2(phi/2) -------------
phis = np.linspace(0, 2 * np.pi, 25)
p0_sim, p0_theory = [], np.cos(phis / 2) ** 2
for phi in phis:
    c = QuantumCircuit(1)
    c.h(0)
    c.p(phi, 0)
    c.h(0)
    p0_sim.append(Statevector(c).probabilities()[0])
assert np.allclose(p0_sim, p0_theory)

fig, ax = plt.subplots(figsize=(6, 3.5))
ax.plot(phis, p0_theory, label=r"theory $\cos^2(\phi/2)$")
ax.plot(phis, p0_sim, "o", ms=4, label="Qiskit statevector")
ax.set_xlabel(r"relative phase $\phi$")
ax.set_ylabel("P(measure 0)")
ax.set_title("Mach–Zehnder-style interference with one qubit")
ax.legend()
fig.savefig(OUT / "interference.png", dpi=160, bbox_inches="tight")
plt.close(fig)

# 3) Identity H Z H = X, drawn as a circuit -------------------------------------
hzh = QuantumCircuit(1)
hzh.h(0)
hzh.z(0)
hzh.h(0)
from qiskit.quantum_info import Operator  # noqa: E402

assert Operator(hzh).equiv(Operator.from_label("X"))
hzh.draw("mpl", filename=str(OUT / "circuit_hzh.png"))
print("H Z H == X  ✔  ; figures saved in", OUT)
