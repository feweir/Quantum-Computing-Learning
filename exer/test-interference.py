import numpy as np

H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)             # half-mirror
def glass(phi): return np.diag([1, np.exp(1j * phi)])    # delays the lower route
start = np.array([1, 0])                                 # photon enters

for phi in [0, np.pi / 2, np.pi]:
    out = H @ glass(phi) @ H @ start                     # right to left = in time order
    print(f"phi={phi:4.2f}  P(A), P(B) =", np.round(abs(out) ** 2, 3))

mid = H @ start                                          # after half-mirror 1
blocked = np.array([mid[0], 0])                          # lower route removed
print("lower route blocked:", np.round(abs(H @ blocked) ** 2, 3))