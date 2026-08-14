# 📐 DHRUV.AERO // Aerospace Engineering Portfolio

> **Dhruv Gupta** — Aerospace Engineering Student @ Dayananda Sagar University (DSU)  
> Interactive physics visualizers, procedural CAD drafting tools, and aerodynamic computational modules.

[![Live Portfolio](https://img.shields.io/badge/Live_Portfolio-dhrgupta096.github.io%2Fportfolio-005bc5?style=for-the-badge&logo=google-chrome&logoColor=white)](https://dhrgupta096.github.io/portfolio/)
[![GitHub](https://img.shields.io/badge/GitHub-dhrgupta096-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/dhrgupta096)

---

## 🚀 Overview

**DHRUV.AERO** is my personal interactive aerospace engineering portfolio, built from scratch to showcase computational aerodynamics, fluid dynamics simulations, and CAD drafting tools.

Every module is an active simulation powered by real physics equations and custom HTML5 canvas rendering engines.

---

## ⚡ Interactive Modules

### 1. 🛩️ Real-Time NACA Airfoil Wind Tunnel
- **Simulation**: Generates real-time streamlines and flow vectors across **NACA 4412**, **NACA 2412**, and **NACA 0012** airfoils.
- **Physics Equations**:
  - Thin Airfoil Theory: $C_L = 2\pi \cdot (\alpha - \alpha_0)$
  - Induced & Form Drag: $C_D = C_{D0} + \frac{C_L^2}{\pi \cdot AR \cdot e}$
  - Real-time aerodynamic **stall simulation** with turbulent separation above $18^\circ$ Angle of Attack ($\alpha$).
- **Live Polar Curve**: Displays dynamic $C_L \text{ vs } \alpha$ lift graphs.

### 2. 🌌 3D Conceptual Orbit (Kinetic Conflux)
- **3D Particle Cloud**: Visualizes core disciplines (*Aerodynamics, Propulsion, CAD, Rocketry, Orbits*) in pseudo-3D coordinate space with real-time perspective scaling.
- **Interactive Gravitational Field**: Attracts particles toward the cursor and releases them back into stable orbits.

### 3. 📐 CAD Draft Sketchpad
- **Drafting Board**: Graph-paper drafting surface with custom vector rendering.
- **Real-Time Dimensioning**: Computes Euclidean lengths ($L = \sqrt{\Delta x^2 + \Delta y^2}$), radius dimensions, and slope angles in real time.
- **Precision Snap**: Hold <kbd>Shift</kbd> to lock lines to $15^\circ$ angular increments.

### 4. 🚀 Rocket Trajectory & Pressure Modules
- **Kinematics Solver**: Runge-Kutta 4th-order numerical integration of ODEs modeling variable-mass water rocket ascent profiles and atmospheric drag.
- **Pressure Gradient Visualizer**: Finite-difference gradient mapping of Bernoulli pressure distributions across boundary layers.
- **Nose Cone Parabolic Assembly**: SolidWorks CAD model with Haack-series parabolic profiles designed for rocketry club projects.

---

## 🛠️ Tech Stack

- **Frontend**: Semantic HTML5, Vanilla JavaScript (ES6+), Vanilla CSS3.
- **Graphics Engine**: Dual Canvas 2D Matrix Rendering (Custom Particle & Vector Fields).
- **Design System**: Technical blueprint theme, custom CAD crosshair cursor with real-time coordinate tracking.

---

## 💻 Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/Dhrgupta096/portfolio.git

# 2. Open folder
cd portfolio

# 3. Start preview
python3 -m http.server 5174

# 4. Open in browser
open http://localhost:5174
```

---

## 📬 Contact & Telemetry

- **Author**: Dhruv Gupta
- **Email**: [dhr.gupta096@gmail.com](mailto:dhr.gupta096@gmail.com)
- **GitHub**: [@dhrgupta096](https://github.com/dhrgupta096)
- **Institution**: Dayananda Sagar University (DSU), Aerospace Engineering

---

<div align="center">
  <sub>© 2026 Dhruv Gupta • All Rights Reserved</sub>
</div>
