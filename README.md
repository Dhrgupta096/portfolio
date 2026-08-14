# 📐 DHRUV.AERO // Aerospace Engineering Portfolio

> **Dhruv Gupta** — Aerospace Engineering Student @ Dayananda Sagar University (DSU)  
> Interactive physics visualizers, procedural CAD drafting tools, and aerodynamic computational modules.

[![Live Portfolio](https://img.shields.io/badge/Live_Portfolio-dhrgupta096.github.io%2Fportfolio-005bc5?style=for-the-badge&logo=google-chrome&logoColor=white)](https://dhrgupta096.github.io/portfolio/)
[![GitHub](https://img.shields.io/badge/GitHub-dhrgupta096-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/dhrgupta096)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 🚀 Overview

**DHRUV.AERO** is an interactive, blueprint-themed portfolio designed from the ground up to showcase mathematical models, aerodynamic solvers, and CAD drafting tools.

Instead of a static portfolio, every section is an active engineering simulation rendered via high-performance HTML5 canvas engines and procedural vector math.

---

## ⚡ Key Interactive Modules

### 1. 🛩️ Real-Time NACA Airfoil Wind Tunnel Simulator
- **Aerodynamic Model**: Dynamically generates streamlines and flow velocity vectors around **NACA 4412**, **NACA 2412**, and **NACA 0012** airfoils.
- **Physics Equations**:
  - Thin Airfoil Theory: $C_L = 2\pi \cdot (\alpha - \alpha_0)$
  - Induced & Form Drag: $C_D = C_{D0} + \frac{C_L^2}{\pi \cdot AR \cdot e}$
  - Real-time **stall simulation** with turbulent flow separation above $18^\circ$ Angle of Attack ($\alpha$).
- **Live Polar Plot**: Renders the dynamic $C_L \text{ vs } \alpha$ lift curve graph side-by-side.

### 2. 🌌 3D Kinetic Conceptual Orbit (Vector Field Conflux)
- **3D Particle Cloud**: Core engineering disciplines (*Aerodynamics, Propulsion, CAD, Rocketry, Orbits*) orbiting in full pseudo-3D space ($X, Y, Z$) with depth perspective and scaling.
- **Interactive Cursor Gravity**: Hovering pulls orbital particles into the central core, while dispersing them back to their trajectories when the cursor leaves.

### 3. 📐 Interactive CAD Draft Sketchpad
- **Drafting Canvas**: Graph-paper drafting board with procedural grid alignment.
- **Dimensioning Vectors**: Automatically calculates Euclidean lengths ($L = \sqrt{\Delta x^2 + \Delta y^2}$), radius dimensions, and slope angles ($\theta = \arctan2(\Delta y, \Delta x)$) in real time.
- **Angle Snapping**: Hold <kbd>Shift</kbd> while drawing to snap lines to exact $15^\circ$ angular increments.

### 4. 🚀 Rocket Trajectory & Pressure Modules
- **Kinematics Solver**: Runge-Kutta 4th-order numerical integration of ODEs modeling variable-mass water rocket ascent profiles and atmospheric drag.
- **Airfoil Pressure Gradient Visualizer**: Finite-difference gradient mapping of Bernoulli pressure distributions across boundary layers.
- **Nose Cone Parabolic Assembly**: SolidWorks CAD model with Haack-series parabolic profiles designed for student rocketry projects.

---

## 🛠️ Technical Stack

- **Frontend Core**: Pure Semantic HTML5, Vanilla JavaScript (ES6+), Vanilla CSS3.
- **Graphics Engine**: Dual Canvas 2D Matrix Rendering (Custom Particle & Vector Fields).
- **Design Language**: Blueprint CAD drafting theme, custom cursor crosshair with live $(X, Y)$ coordinate tracking, precision dimension lines.
- **Typography & Icons**: Inter, Fira Code, Orbitron, FontAwesome 6.

---

## 💻 Local Quickstart

Clone the repository and run locally:

```bash
# 1. Clone the repository
git clone https://github.com/dhrgupta096/portfolio.git

# 2. Navigate to directory
cd portfolio

# 3. Start local HTTP preview server
python3 -m http.server 5174

# 4. Open in your browser
open http://localhost:5174
```

*Or simply open `index.html` directly in any modern web browser!*

---

## 📬 Connect & Telemetry

- **Author**: Dhruv Gupta
- **Email**: [dhr.gupta096@gmail.com](mailto:dhr.gupta096@gmail.com)
- **GitHub**: [@dhrgupta096](https://github.com/dhrgupta096)
- **Institution**: Dayananda Sagar University (DSU), Department of Aerospace Engineering

---

<div align="center">
  <sub>Designed & Engineered with physics-first precision by Dhruv Gupta • 2026</sub>
</div>
