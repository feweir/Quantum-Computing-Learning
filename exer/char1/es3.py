import itertools
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, Operator
from qiskit_aer import AerSimulator
import numpy as np

# qc = QuantumCircuit(1)

# qc.h(0); qc.s(0); qc.h(0); 
# print(qc)
# target = Statevector([1/np.sqrt(2), -1j/np.sqrt(2)])

# print(Statevector(qc))
# print(target.equiv(Statevector(qc)))

target = Statevector([1/np.sqrt(2), -1j/np.sqrt(2)])

def search():
    for l in range(1, 10):
        for c in itertools.product("HS", repeat=l):
            qc = QuantumCircuit(1)

            for i in c:
                if(i == 'H'):
                    qc.h(0)
                else:
                    qc.s(0)

            if(Statevector(qc).equiv(target)):
                print(qc.draw())
                return


search()
