from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, Operator
from qiskit_aer import AerSimulator
import numpy as np

qc = QuantumCircuit(1)

qc.sx(0)

print(Statevector(qc))
