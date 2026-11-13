from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, Operator
from qiskit_aer import AerSimulator

qc = QuantumCircuit(1)
qc.h(0); qc.s(0); qc.rx(0.3, 0)       # gates, applied in order (left→right in the circuit)
Statevector(qc)                        # exact amplitudes (simulation only! real HW can't give this)
Operator(qc).data                      # the 2x2 matrix of the whole circuit
qc.measure_all()
AerSimulator().run(qc, shots=1000).result().get_counts()
