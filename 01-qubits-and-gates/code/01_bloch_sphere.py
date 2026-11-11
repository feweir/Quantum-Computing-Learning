"""Chapter 1 - Bloch sphere: states and gate trajectories.

Run: uv run python 01-qubits-and-gates/code/01_bloch_sphere.py
Output: ../figures/bloch_states.png, ../figures/bloch_rotation.png
"""
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

OUT = Path(__file__).resolve().parent.parent / "figures"
OUT.mkdir(exist_ok=True)

# ---- linear algebra core --------------------------------------------------
ket0 = np.array([1, 0], dtype=complex)
ket1 = np.array([0, 1], dtype=complex)
X = np.array([[0, 1], [1, 0]], dtype=complex)
Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
Z = np.array([[1, 0], [0, -1]], dtype=complex)
H = np.array([[1, 1], [1, -1]], dtype=complex) / np.sqrt(2)


def bloch_vector(psi):
    """(x, y, z) = (<X>, <Y>, <Z>) for a normalised state."""
    return np.array([np.real(psi.conj() @ P @ psi) for P in (X, Y, Z)])


def rot(axis_matrix, theta):
    """exp(-i theta/2 * P) = cos(theta/2) I - i sin(theta/2) P."""
    return np.cos(theta / 2) * np.eye(2) - 1j * np.sin(theta / 2) * axis_matrix


def draw_sphere(ax):
    u, v = np.mgrid[0:2 * np.pi:40j, 0:np.pi:20j]
    ax.plot_wireframe(np.cos(u) * np.sin(v), np.sin(u) * np.sin(v), np.cos(v),
                      color="lightgray", lw=0.3, alpha=0.6)
    t = np.linspace(0, 2 * np.pi, 200)
    ax.plot(np.cos(t), np.sin(t), 0 * t, color="gray", lw=0.8)  # equator
    for d, lab in [((1.35, 0, 0), "x"), ((0, 1.35, 0), "y"), ((0, 0, 1.35), "z")]:
        ax.plot([0, d[0]], [0, d[1]], [0, d[2]], color="k", lw=0.8)
        ax.text(*d, lab, fontsize=11)
    ax.set_box_aspect((1, 1, 1))
    ax.set_axis_off()


def arrow(ax, vec, label, color):
    ax.quiver(0, 0, 0, *vec, color=color, lw=2, arrow_length_ratio=0.12)
    ax.text(*(1.12 * vec), label, color=color, fontsize=10)


# ---- Figure 1: named states ------------------------------------------------
s = 1 / np.sqrt(2)
named = {
    "|0>": ket0, "|1>": ket1,
    "|+>": s * (ket0 + ket1), "|->": s * (ket0 - ket1),
    "|+i>": s * (ket0 + 1j * ket1), "|-i>": s * (ket0 - 1j * ket1),
}
fig = plt.figure(figsize=(6, 6))
ax = fig.add_subplot(projection="3d")
draw_sphere(ax)
for (name, psi), c in zip(named.items(), plt.cm.tab10.colors):
    arrow(ax, bloch_vector(psi), name, c)
ax.set_title("Six cardinal states on the Bloch sphere")
fig.savefig(OUT / "bloch_states.png", dpi=160, bbox_inches="tight")
plt.close(fig)

# ---- Figure 2: gates as rotations -----------------------------------------
fig = plt.figure(figsize=(13, 4.5))
cases = [
    ("Rx(theta) on |0>", X, ket0, "tab:red"),
    ("Ry(theta) on |0>", Y, ket0, "tab:green"),
    ("Rz(theta) on |+>", Z, named["|+>"], "tab:blue"),
]
thetas = np.linspace(0, 2 * np.pi, 120)
for i, (title, P, psi0, color) in enumerate(cases, 1):
    ax = fig.add_subplot(1, 3, i, projection="3d")
    draw_sphere(ax)
    traj = np.array([bloch_vector(rot(P, th) @ psi0) for th in thetas])
    ax.plot(*traj.T, color=color, lw=2)
    arrow(ax, traj[0], "start", "k")
    arrow(ax, traj[len(thetas) // 4], "pi/2", color)
    ax.set_title(title)
fig.suptitle("Single-qubit gates are rotations of the Bloch vector")
fig.savefig(OUT / "bloch_rotation.png", dpi=160, bbox_inches="tight")
plt.close(fig)

# ---- sanity checks ----------------------------------------------------------
assert np.allclose(bloch_vector(H @ ket0), [1, 0, 0])      # H|0> = |+> on +x
assert np.allclose(bloch_vector(X @ ket0), [0, 0, -1])     # X flips
assert np.allclose(rot(X, np.pi), -1j * X)                 # Rx(pi) = -iX (global phase)
print("saved:", *(p.name for p in OUT.glob("bloch_*.png")))
