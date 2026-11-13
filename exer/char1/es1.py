from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, Operator
from qiskit_aer import AerSimulator

qc = QuantumCircuit(1)

qc.h(0)
qc.x(0)
qc.h(0)

print(Operator(qc).data)
print(Operator(qc) == Operator.from_label("Z"))
