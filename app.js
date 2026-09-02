/* ==========================================================================
   Clean Technical Blueprint Aerospace Portfolio - Application Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------------------------
    // 1. Background Canvas: Rotating 3D Model Rocket CAD Wireframe
    // ----------------------------------------------------------------------
    const bgCanvas = document.getElementById('bg-canvas');
    const bgCtx = bgCanvas.getContext('2d');
    
    let rocketVertices = [];
    let rocketEdges = [];
    let rotX = 0.4;
    let rotY = 0.6;
    let targetRotX = 0.4;
    let targetRotY = 0.6;
    let bgAnimFrameId = null;

    function resizeBgCanvas() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }

    // Build 3D coordinates for a model rocket wireframe
    function generateRocketModel() {
        rocketVertices = [];
        rocketEdges = [];

        // Body cylinder slices (4 rings along the body cylinder)
        const slices = 5;
        const ringPoints = 6;
        const radius = 1.0;
        const length = 5.0;

        for (let s = 0; s < slices; s++) {
            const z = (s / (slices - 1)) * length - length/2; // Z is along length
            for (let p = 0; p < ringPoints; p++) {
                const angle = (p / ringPoints) * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                rocketVertices.push({ x, y, z });
            }
        }

        // Nose cone point at front
        const noseConeIdx = rocketVertices.length;
        rocketVertices.push({ x: 0, y: 0, z: length/2 + 2.0 });

        // Rocket base center point
        const baseCenterIdx = rocketVertices.length;
        rocketVertices.push({ x: 0, y: 0, z: -length/2 });

        // Fins (4 flat sheets sticking out at the base)
        const finOffsets = [0, 90, 180, 270];
        const baseRingStart = 0; // slice 0
        const finVerticesStart = rocketVertices.length;

        finOffsets.forEach((deg, idx) => {
            const rad = deg * Math.PI / 180;
            // Fin outer tip point
            rocketVertices.push({
                x: Math.cos(rad) * 2.8,
                y: Math.sin(rad) * 2.8,
                z: -length/2 - 0.8
            });
            // Fin upper attachment point on body (slice 1)
            rocketVertices.push({
                x: Math.cos(rad) * radius,
                y: Math.sin(rad) * radius,
                z: -length/2 + 1.2
            });
        });

        // --- Build Edge Connections ---
        // 1. Connect points along cylinder rings
        for (let s = 0; s < slices; s++) {
            const startIdx = s * ringPoints;
            for (let p = 0; p < ringPoints; p++) {
                // Circle connection
                rocketEdges.push([startIdx + p, startIdx + (p + 1) % ringPoints]);
                // Longitudinal cylinder connection
                if (s < slices - 1) {
                    rocketEdges.push([startIdx + p, startIdx + ringPoints + p]);
                }
            }
        }

        // 2. Connect top ring to nose cone tip
        const topRingStart = (slices - 1) * ringPoints;
        for (let p = 0; p < ringPoints; p++) {
            rocketEdges.push([topRingStart + p, noseConeIdx]);
        }

        // 3. Connect bottom ring to base center
        for (let p = 0; p < ringPoints; p++) {
            rocketEdges.push([p, baseCenterIdx]);
        }

        // 4. Connect fins
        finOffsets.forEach((deg, idx) => {
            const finTip = finVerticesStart + idx * 2;
            const finRootTop = finVerticesStart + idx * 2 + 1;
            
            // Map corresponding ring index at base
            const ringIdx = Math.round((deg / 360) * ringPoints) % ringPoints;
            
            // Draw fin outline
            rocketEdges.push([ringIdx, finTip]);
            rocketEdges.push([finTip, finRootTop]);
        });
    }

    // 3D rotation and orthographic projection mapping
    function renderBgRocket() {
        // Clear background
        bgCtx.fillStyle = '#f4f6fa';
        bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

        // Center offsets
        const cx = bgCanvas.width / 2;
        const cy = bgCanvas.height / 2;
        const scale = Math.min(bgCanvas.width, bgCanvas.height) * 0.09;

        // Smooth drag rotation ease
        rotX += (targetRotX - rotX) * 0.08;
        rotY += (targetRotY - rotY) * 0.08;

        // Default slow rotation if no mouse drag input
        targetRotY += 0.0035;

        // Rotate & project vertices
        const projected = rocketVertices.map(v => {
            let { x, y, z } = v;

            // Rotate around Y axis
            let cosA = Math.cos(rotY), sinA = Math.sin(rotY);
            let x1 = x * cosA - z * sinA;
            let z1 = x * sinA + z * cosA;
            x = x1; z = z1;

            // Rotate around X axis
            cosA = Math.cos(rotX); sinA = Math.sin(rotX);
            let y1 = y * cosA - z * sinA;
            let z2 = y * sinA + z * cosA;
            y = y1; z = z2;

            // Orthographic projection coords
            return {
                x: cx + x * scale,
                y: cy - y * scale // Flip y for standard cartesian direction
            };
        });

        // Draw CAD wireframe lines
        bgCtx.strokeStyle = 'rgba(0, 91, 197, 0.045)';
        bgCtx.lineWidth = 1.0;

        rocketEdges.forEach(edge => {
            const p1 = projected[edge[0]];
            const p2 = projected[edge[1]];
            bgCtx.beginPath();
            bgCtx.moveTo(p1.x, p1.y);
            bgCtx.lineTo(p2.x, p2.y);
            bgCtx.stroke();
        });

        // Draw structural corner design lines (decorations for blueprint)
        bgCtx.strokeStyle = 'rgba(0, 91, 197, 0.025)';
        bgCtx.strokeRect(40, 75, bgCanvas.width - 80, bgCanvas.height - 150);

        // --- Draw CAD Viewport Triad (3D Coordinate Axes Indicator) ---
        const tx = bgCanvas.width - 90;
        const ty = 120;
        const axisLen = 28;

        function rotateAxis(x, y, z) {
            // Y rotation
            let cosY = Math.cos(rotY), sinY = Math.sin(rotY);
            let x1 = x * cosY - z * sinY;
            let z1 = x * sinY + z * cosY;

            // X rotation
            let cosX = Math.cos(rotX), sinX = Math.sin(rotX);
            let y1 = y * cosX - z1 * sinX;
            
            return {
                x: tx + x1,
                y: ty - y1
            };
        }

        const origin = { x: tx, y: ty };
        const ptX = rotateAxis(axisLen, 0, 0);
        const ptY = rotateAxis(0, axisLen, 0);
        const ptZ = rotateAxis(0, 0, axisLen);

        // Draw Triad Compass circle boundary
        bgCtx.strokeStyle = 'rgba(0, 91, 197, 0.03)';
        bgCtx.lineWidth = 1;
        bgCtx.beginPath();
        bgCtx.arc(tx, ty, 32, 0, Math.PI * 2);
        bgCtx.stroke();

        // X-Axis (Red)
        bgCtx.strokeStyle = 'rgba(217, 4, 41, 0.25)';
        bgCtx.beginPath(); bgCtx.moveTo(origin.x, origin.y); bgCtx.lineTo(ptX.x, ptX.y); bgCtx.stroke();
        bgCtx.fillStyle = 'rgba(217, 4, 41, 0.35)';
        bgCtx.font = '8px Fira Code';
        bgCtx.fillText('X', ptX.x + 3, ptX.y + 3);

        // Y-Axis (Green / Graphite)
        bgCtx.strokeStyle = 'rgba(43, 54, 72, 0.2)';
        bgCtx.beginPath(); bgCtx.moveTo(origin.x, origin.y); bgCtx.lineTo(ptY.x, ptY.y); bgCtx.stroke();
        bgCtx.fillStyle = 'rgba(43, 54, 72, 0.3)';
        bgCtx.fillText('Y', ptY.x + 3, ptY.y + 3);

        // Z-Axis (Blue)
        bgCtx.strokeStyle = 'rgba(0, 91, 197, 0.25)';
        bgCtx.beginPath(); bgCtx.moveTo(origin.x, origin.y); bgCtx.lineTo(ptZ.x, ptZ.y); bgCtx.stroke();
        bgCtx.fillStyle = 'rgba(0, 91, 197, 0.35)';
        bgCtx.fillText('Z', ptZ.x + 3, ptZ.y + 3);

        // Viewport label
        bgCtx.fillStyle = 'rgba(0, 91, 197, 0.15)';
        bgCtx.font = '7px Fira Code';
        bgCtx.fillText('ISO_TRIAD', tx - 22, ty + 42);

        bgAnimFrameId = requestAnimationFrame(renderBgRocket);
    }

    // Capture screen drag rotation variables
    window.addEventListener('mousemove', (e) => {
        // Map cursor relative coordinates to rotation limits
        targetRotX = (e.clientY / window.innerHeight - 0.5) * 1.5;
        targetRotY = (e.clientX / window.innerWidth - 0.5) * 3.0;
    });

    window.addEventListener('resize', () => {
        cancelAnimationFrame(bgAnimFrameId);
        resizeBgCanvas();
        renderBgRocket();
    });

    resizeBgCanvas();
    generateRocketModel();
    renderBgRocket();

    // ----------------------------------------------------------------------
    // 2. Hero Typist Text
    // ----------------------------------------------------------------------
    const typedTextEl = document.getElementById('typed-text');
    const words = ["Aerodynamics.", "Trajectory Solvers.", "SolidWorks Assemblies.", "Launch Calculations."];
    let wordIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function handleTyping() {
        const currentWord = words[wordIdx];
        
        if (isDeleting) {
            typedTextEl.textContent = currentWord.substring(0, charIdx - 1);
            charIdx--;
            typeSpeed = 40;
        } else {
            typedTextEl.textContent = currentWord.substring(0, charIdx + 1);
            charIdx++;
            typeSpeed = 90;
        }

        if (!isDeleting && charIdx === currentWord.length) {
            isDeleting = true;
            typeSpeed = 1800; // Apogee pause
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            wordIdx = (wordIdx + 1) % words.length;
            typeSpeed = 500; // Pause before launching new word
        }

        setTimeout(handleTyping, typeSpeed);
    }

    if (typedTextEl) {
        setTimeout(handleTyping, 1000);
    }

    // ----------------------------------------------------------------------
    // 3. Navigation Spy & Mobile Menu toggle
    // ----------------------------------------------------------------------
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.querySelector('i').classList.toggle('fa-bars-staggered');
            mobileToggle.querySelector('i').classList.toggle('fa-xmark');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            if (mobileToggle) {
                mobileToggle.querySelector('i').className = 'fa-solid fa-bars-staggered';
            }
        });
    });

    const scrollObserverOpts = {
        root: null,
        rootMargin: '-30% 0px -50% 0px',
        threshold: 0
    };

    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${activeId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, scrollObserverOpts);

    sections.forEach(sec => spyObserver.observe(sec));

    // ----------------------------------------------------------------------
    // 4. Skills Progress Intersection Animator
    // ----------------------------------------------------------------------
    const skillsSection = document.getElementById('skills');
    const progressBars = document.querySelectorAll('.skill-progress');

    const skillsObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                progressBars.forEach(bar => {
                    const width = bar.getAttribute('data-progress');
                    bar.style.width = width;
                });
                skillsObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    if (skillsSection) {
        skillsObs.observe(skillsSection);
    }

    // ----------------------------------------------------------------------
    // 5. Portfolio Projects Filtering
    // ----------------------------------------------------------------------
    const filterBtns = document.querySelectorAll('.filter-button');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterVal = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filterVal === 'all' || (category && category.includes(filterVal))) {
                    card.style.display = 'block';
                    setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 20);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.96)';
                    setTimeout(() => { card.style.display = 'none'; }, 300);
                }
            });
        });
    });

    // ----------------------------------------------------------------------
    // 6. Project Specifications Modal Setup
    // ----------------------------------------------------------------------
    const specMetadata = {
        'vyom-details': {
            title: 'VYOM — Real-Time 3D Space Debris Tracking & Threat Radar',
            category: 'ISRO Hackathon 2nd Prize Winner • Dayananda Sagar University',
            image: 'assets/project_vyom.jpg',
            content: `
                <div style="background: rgba(255, 153, 51, 0.1); border: 1px solid rgba(255, 153, 51, 0.3); padding: 12px; border-radius: 6px; margin-bottom: 1rem;">
                    <strong style="color: #e65100;">🏆 2nd Prize Winner — Bharatiya Antariksh Hackathon (BAH)</strong>
                    <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: var(--pencil-grey);">Awarded by the Indian Space Research Organisation (ISRO). Built representing Dayananda Sagar University (DSU).</p>
                </div>
                <p><strong>VYOM</strong> is a web-based Space Situational Awareness (SSA) 3D radar platform tracking cataloged debris objects (&gt;10 cm) and micro-debris swarms across LEO, MEO, GEO, and Graveyard corridors to safeguard space assets.</p>
                <h4>Core Mission Capabilities</h4>
                <ul>
                    <li><strong>Photorealistic NASA 4K Blue Marble Earth Globe:</strong> WebGL Rayleigh scattering atmospheric shader, 23.44° real axial tilt, and diurnal rotation.</li>
                    <li><strong>Keep-Out Volume Shielding:</strong> Real-time 3D spherical protective zones for human habitats (ISS & Tiangong) with automatic DEFCON 2 conjunction threat warnings.</li>
                    <li><strong>20-Year Orbital Decay Trajectory Engine:</strong> Thermospheric atmospheric drag decay modeling to forecast satellite re-entry epochs.</li>
                    <li><strong>ISRO Space Asset Telemetry:</strong> Priority asset tagging for Indian satellites (Cartosat-3, Oceansat-3, RISAT-1A, NavIC IRNSS, PSLV-C37).</li>
                </ul>
                <h4>Engineering Parameters</h4>
                <p><strong>Graphics & Scene:</strong> Three.js (WebGL), OrbitControls, Shader Material</p>
                <p><strong>Orbital Physics:</strong> Keplerian Inclination & RAAN plane propagation, SGP4 / TLE ingestion</p>
                <p><strong>Data Provenance:</strong> CelesTrak, Space-Track, ESA DISCOS, NASA ORDEM 3.2</p>
            `
        },
        'ares-v-details': {
            title: 'Ares-V 3D Staged Rocket Simulator',
            category: 'Math & Trajectory',
            image: 'assets/project_mlops.png',
            content: `
                <p>An interactive 3D physics-based rocket launch configurator and staged flight simulator built with WebGL/Three.js. Features real-time multi-stage propulsion physics, atmospheric drag gradients, and orbital insertion trajectory calculus.</p>
                <h4>Algorithmic Spec</h4>
                <ul>
                    <li>Integrated real-time variable-mass rocket equation equations (\(\\Delta v = I_{sp} g_0 \\ln(m_0/m_f)\)).</li>
                    <li>Modeled dynamic atmospheric density decay (\(\\rho(h) = \\rho_0 e^{-h/H}\)) and peak aerodynamic dynamic pressure (\(Q_{max}\)).</li>
                    <li>Calculated instantaneous Thrust-to-Weight ratios (TWR), staging separation timings, and Keplerian orbital transfer paths.</li>
                </ul>
                <h4>Project Parameters</h4>
                <p><strong>Stack:</strong> WebGL, Three.js, JavaScript (ES6+), GLSL Shader Effects</p>
                <p><strong>Physics Core:</strong> Tsiolkovsky rocket equation, Runge-Kutta numerical orbit propagation</p>
            `
        },
        'trajectory-details': {
            title: 'Rocket Trajectory Solver',
            category: 'Math & Trajectory',
            image: 'assets/project_llm.png',
            content: `
                <p>A flight kinematics simulation application written inside Python using standard numerical ODE integration methods (SciPy solve_ivp). Plots pressure forces and apogee heights.</p>
                <h4>Algorithmic Spec</h4>
                <ul>
                    <li>Integrated custom Runge-Kutta 4th-Order differential calculations mapping liquid depletion mass matrices.</li>
                    <li>Derived drag coefficients (\(C_D\)) dynamically mapped across shifting velocities and altitudes.</li>
                    <li>Plotted apogee vectors comparing launching pressure variables and water volumes.</li>
                </ul>
                <h4>Project Parameters</h4>
                <p><strong>Language:</strong> Python 3.9 (NumPy, SciPy, Matplotlib)</p>
                <p><strong>Aero Formula:</strong> Apogee Solvers, Euler integration loops</p>
            `
        },
        'pressure-details': {
            title: 'Airfoil Pressure Visualizer',
            category: 'Math & Trajectory',
            image: 'assets/project_forecast.png',
            content: `
                <p>An introductory CFD numerical solver plotting pressure coefficient distributions around NACA airfoils under ideal fluid conditions.</p>
                <h4>Algorithmic Spec</h4>
                <ul>
                    <li>Calculated pressure fields around symmetric 4-digit airfoil profiles.</li>
                    <li>Derived velocity fields using standard finite-difference gradient vectors.</li>
                    <li>Mapped grid matrices visualizing boundary layer flow patterns.</li>
                </ul>
                <h4>Project Parameters</h4>
                <p><strong>Language:</strong> Python 3.9, NumPy, SciPy GridData</p>
                <p><strong>Aero Formula:</strong> Bernoulli pressure vectors, coordinate transforms</p>
            `
        },
        'nose-cone-details': {
            title: 'Nose Cone CAD Assembly',
            category: 'CAD Drafts',
            image: 'assets/project_vision.png',
            content: `
                <p>A parabolic aerodynamic nose cone structural component draft modeled for collegiate rocketry design teams.</p>
                <h4>Algorithmic Spec</h4>
                <ul>
                    <li>Drafted a Haack-series parabolic outline to minimize drag variables.</li>
                    <li>Modeled interlocking internal structural bulkheads inside SolidWorks.</li>
                    <li>Stress-tested structural boundary limit matrices against landing collision vectors.</li>
                </ul>
                <h4>Project Parameters</h4>
                <p><strong>Design Tools:</strong> SolidWorks 2024, AutoCAD Drafting</p>
                <p><strong>Materials:</strong> ABS Polymer Filament, Glass fiber coatings</p>
            `
        }
    };

    const projectModal = document.getElementById('project-modal');
    const modalData = document.getElementById('modal-project-data');

    window.openProjectModal = function(id) {
        const data = specMetadata[id];
        if (!data) return;

        modalData.innerHTML = `
            <span class="project-tag tag-accent" style="margin-bottom: 0.75rem; display: inline-block;">${data.category}</span>
            <h3 class="modal-title" style="font-family: var(--font-heading); font-size: 1.8rem; text-transform: uppercase;">${data.title}</h3>
            <img src="${data.image}" alt="${data.title}" class="modal-image">
            <div class="modal-body">
                ${data.content}
            </div>
            <div style="margin-top: 2rem; display: flex; justify-content: flex-end;">
                <button class="btn btn-secondary" onclick="closeProjectModal()">Close Spec</button>
            </div>
        `;

        projectModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    window.closeProjectModal = function() {
        projectModal.classList.remove('open');
        document.body.style.overflow = 'auto';
    };

    window.closeProjectModalOnBackdrop = function(e) {
        if (e.target === projectModal) {
            closeProjectModal();
        }
    };

    // ----------------------------------------------------------------------
    // 7. Blueprint Corner Coordinate Tracker & Submission
    // ----------------------------------------------------------------------
    const blueprintPanel = document.querySelector('.blueprint-panel');
    const coordDisplay = document.getElementById('blueprint-coords');
    const blueprintForm = document.getElementById('blueprint-form');
    const blueprintLog = document.getElementById('blueprint-log');
    const logLoading = document.getElementById('log-loading');
    const logSuccess = document.getElementById('log-success');

    if (blueprintPanel) {
        blueprintPanel.addEventListener('mousemove', (e) => {
            const rect = blueprintPanel.getBoundingClientRect();
            const relX = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1);
            const relY = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1);
            coordDisplay.textContent = `X: ${relX}% / Y: ${relY}%`;
        });

        blueprintPanel.addEventListener('mouseleave', () => {
            coordDisplay.textContent = `X: 0.0% / Y: 0.0%`;
        });
    }

    window.handleBlueprintSubmit = async function(e) {
        e.preventDefault();

        const nameVal = document.getElementById('form-name').value.trim();
        const emailVal = document.getElementById('form-email').value.trim();
        const messageVal = document.getElementById('form-message').value.trim();
        const submitBtn = document.querySelector('.blueprint-btn-submit');

        if (!nameVal || !emailVal || !messageVal) return;

        blueprintLog.classList.add('active');
        logLoading.style.display = 'block';
        logSuccess.style.display = 'none';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            submitBtn.textContent = 'TRANSMITTING PAYLOAD...';
        }

        logLoading.innerHTML = '';
        const addLog = (msg, isSpecial = false) => {
            const p = document.createElement('div');
            p.className = 'blueprint-log-line ' + (isSpecial ? 'loading' : '');
            p.textContent = msg;
            logLoading.appendChild(p);
        };

        addLog(`[COMPILE]: Packaging message payload from ${nameVal}...`);
        addLog(`[ENCRYPT]: Routing secure uplink to destination node: dhr.gupta096@gmail.com`);

        try {
            const response = await fetch('https://formsubmit.co/ajax/dhr.gupta096@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: nameVal,
                    email: emailVal,
                    message: messageVal,
                    _subject: `🚀 [DHRUV.AERO Transmission] From ${nameVal}`,
                    _template: 'table',
                    _captcha: 'false'
                })
            });

            if (response.ok) {
                addLog(`[CONNECT]: Uplink socket connected successfully.`);
                addLog(`[DELIVERY]: 200 OK — Packet transmitted directly to Dhruv Gupta's mailbox.`);
                
                setTimeout(() => {
                    logLoading.style.display = 'none';
                    logSuccess.style.display = 'block';
                    logSuccess.innerHTML = `
<div style="padding: 0.75rem 0; border-left: 2px solid var(--blueprint-blue); padding-left: 1rem; margin-top: 0.5rem;">
    <div style="color: var(--blueprint-blue); font-weight: 700; font-size: 0.95rem; margin-bottom: 0.25rem;">
        ✓ [TRANSMISSION CONFIRMED — EMAIL DISPATCHED]
    </div>
    <div style="font-size: 0.85rem; color: var(--pencil-graphite); line-height: 1.5;">
        Thank you, <strong>${nameVal}</strong>! Your message has been sent directly to <code>dhr.gupta096@gmail.com</code>. Dhruv will review your message and reply via <code>${emailVal}</code>.
    </div>
</div>
                    `;
                    blueprintForm.reset();
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.style.opacity = '1';
                        submitBtn.textContent = 'COMPILE & TRANSMIT';
                    }
                }, 500);
            } else {
                throw new Error('Server returned status ' + response.status);
            }
        } catch (err) {
            console.warn('Direct HTTP submit fallback triggered:', err);
            addLog(`[FALLBACK]: Initializing native mail client uplink...`, true);
            
            setTimeout(() => {
                logLoading.style.display = 'none';
                logSuccess.style.display = 'block';
                logSuccess.innerHTML = `
<div style="padding: 0.75rem 0; border-left: 2px solid var(--blueprint-blue); padding-left: 1rem; margin-top: 0.5rem;">
    <div style="color: var(--blueprint-blue); font-weight: 700; font-size: 0.95rem; margin-bottom: 0.25rem;">
        ✓ [NATIVE MAIL UPLINK PREPARED]
    </div>
    <div style="font-size: 0.85rem; color: var(--pencil-graphite); line-height: 1.5; margin-bottom: 0.75rem;">
        Opening your default mail client to dispatch directly to <strong>dhr.gupta096@gmail.com</strong>...
    </div>
    <a href="mailto:dhr.gupta096@gmail.com?subject=${encodeURIComponent('🚀 Transmission from ' + nameVal)}&body=${encodeURIComponent('From: ' + nameVal + ' (' + emailVal + ')\n\n' + messageVal)}" class="btn btn-primary" style="display: inline-block; padding: 0.4rem 1rem; font-size: 0.8rem;">
        <i class="fa-solid fa-paper-plane"></i> Launch Email App
    </a>
</div>
                `;
                window.location.href = `mailto:dhr.gupta096@gmail.com?subject=${encodeURIComponent('🚀 Transmission from ' + nameVal)}&body=${encodeURIComponent('From: ' + nameVal + ' (' + emailVal + ')\n\n' + messageVal)}`;
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.textContent = 'COMPILE & TRANSMIT';
                }
            }, 500);
        }
    };

    // ----------------------------------------------------------------------
    // 8. Aerodynamic Wind Tunnel Airfoil Simulator
    // ----------------------------------------------------------------------
    const tunnelCanvas = document.getElementById('wind-tunnel-canvas');
    const tunnelCtx = tunnelCanvas.getContext('2d');

    const polarCanvas = document.getElementById('airfoil-polar-canvas');
    const polarCtx = polarCanvas.getContext('2d');

    const selectProfile = document.getElementById('control-profile');
    const sliderAoA = document.getElementById('control-aoa');
    const sliderVelocity = document.getElementById('control-velocity');

    const txtAoA = document.getElementById('aoa-val');
    const txtVelocity = document.getElementById('velocity-val');

    const valCL = document.getElementById('val-cl');
    const valCD = document.getElementById('val-cd');

    const btnTunnelReset = document.getElementById('btn-tunnel-reset');
    const btnTunnelSnapshot = document.getElementById('btn-tunnel-snapshot');
    const tunnelStatus = document.getElementById('tunnel-status');

    // Visual State Variables
    let angleOfAttack = parseInt(sliderAoA.value);
    let windVelocity = parseInt(sliderVelocity.value);
    let wingProfile = selectProfile ? selectProfile.value : 'naca4412';
    let tunnelTime = 0;
    let streamParticles = [];
    const particleCount = 130;

    if (selectProfile) {
        selectProfile.addEventListener('change', (e) => {
            wingProfile = e.target.value;
            initTunnelParticles();
        });
    }

    sliderAoA.addEventListener('input', (e) => {
        angleOfAttack = parseInt(e.target.value);
        txtAoA.textContent = `${angleOfAttack > 0 ? '+' : ''}${angleOfAttack.toFixed(1)}°`;
    });

    sliderVelocity.addEventListener('input', (e) => {
        windVelocity = parseInt(e.target.value);
        txtVelocity.textContent = `${windVelocity} m/s`;
    });

    // Get parameters based on selected profile
    function getProfileParams() {
        switch(wingProfile) {
            case 'naca0012': // Symmetric
                return { camber: 0.0, zeroLiftCL: 0.0, stallAoA: 15, cdZero: 0.008 };
            case 'naca2412': // Moderate Camber
                return { camber: 0.09, zeroLiftCL: 0.22, stallAoA: 16, cdZero: 0.010 };
            case 'naca4412': // High Camber
            default:
                return { camber: 0.18, zeroLiftCL: 0.44, stallAoA: 18, cdZero: 0.014 };
        }
    }

    // Particle representation in fluid streamlines
    class FlowStreamline {
        constructor() {
            this.reset(true);
        }

        reset(randomX = false) {
            this.x = randomX ? Math.random() * tunnelCanvas.width : 0;
            this.y = Math.random() * tunnelCanvas.height;
            this.px = this.x;
            this.py = this.y;
            this.speed = (windVelocity * 0.08) + Math.random() * 0.2;
            this.life = Math.random() * 120 + 80;
        }

        update(airfoilX, airfoilY, chordLength, thicknessScale) {
            this.px = this.x;
            this.py = this.y;
            this.x += this.speed;

            const params = getProfileParams();
            const isStalled = angleOfAttack > params.stallAoA || angleOfAttack < -params.stallAoA;

            const dx = this.x - airfoilX;
            
            if (dx >= 0 && dx <= chordLength) {
                const ratio = dx / chordLength;
                const camberY = Math.sin(ratio * Math.PI) * thicknessScale * (angleOfAttack * 0.07 + params.camber);
                const thickness = Math.sqrt(ratio) * (1 - ratio) * thicknessScale * 1.8;

                if (this.y < airfoilY) {
                    // UPPER SURFACE FLOW
                    if (isStalled && ratio > 0.3) {
                        this.y += (airfoilY - thicknessScale - this.y) * 0.02 + (Math.random() - 0.45) * 4;
                    } else {
                        const targetDeflectionY = airfoilY - thickness - camberY - 8;
                        this.y += (targetDeflectionY - this.y) * (0.05 + ratio * 0.05);
                    }
                } else {
                    // LOWER SURFACE FLOW
                    const targetDeflectionY = airfoilY + thickness - camberY + 8;
                    this.y += (targetDeflectionY - this.y) * (0.05 + ratio * 0.05);
                }
            } else if (dx > chordLength && dx < chordLength + 100) {
                const ratio = (dx - chordLength) / 100;
                
                if (isStalled) {
                    this.y += Math.sin(this.x * 0.1) * 3 + (Math.random() - 0.5) * 4 * (1 - ratio);
                } else {
                    const targetWakeY = airfoilY - (angleOfAttack * 0.8);
                    this.y += (targetWakeY - this.y) * 0.05;
                }
            }

            if (this.x > tunnelCanvas.width) {
                this.reset(false);
            }
        }

        draw() {
            const params = getProfileParams();
            const isStalled = angleOfAttack > params.stallAoA || angleOfAttack < -params.stallAoA;
            
            if (isStalled && this.y < tunnelCanvas.height / 2 - 20) {
                tunnelCtx.strokeStyle = 'rgba(217, 4, 41, 0.25)'; // Red stall streams
            } else {
                tunnelCtx.strokeStyle = 'rgba(0, 91, 197, 0.16)'; // Blue streams
            }
            
            tunnelCtx.lineWidth = 1.2;
            tunnelCtx.beginPath();
            tunnelCtx.moveTo(this.px, this.py);
            tunnelCtx.lineTo(this.x, this.y);
            tunnelCtx.stroke();
        }
    }

    function initTunnelParticles() {
        streamParticles = [];
        for (let i = 0; i < particleCount; i++) {
            streamParticles.push(new FlowStreamline());
        }
    }

    // Mathematical Lift coefficient logic
    function calculateLiftCoefficient(aoa, params) {
        if (aoa > params.stallAoA) {
            return 0.35 - (aoa - params.stallAoA) * 0.015;
        } else if (aoa < -params.stallAoA) {
            return -0.35 - (aoa + params.stallAoA) * 0.015;
        } else {
            return params.zeroLiftCL + 0.11 * aoa;
        }
    }

    // Render the Lift Polar curve graph on the secondary canvas
    function renderPolarPlot(currentCL, params) {
        polarCtx.clearRect(0, 0, polarCanvas.width, polarCanvas.height);

        const margin = 40;
        const width = polarCanvas.width - 2 * margin;
        const height = polarCanvas.height - 2 * margin;

        const minAoA = -10, maxAoA = 25;
        const minCL = -1.0, maxCL = 2.0;

        function getXPixel(aoa) {
            return margin + ((aoa - minAoA) / (maxAoA - minAoA)) * width;
        }
        function getYPixel(cl) {
            return margin + (1 - (cl - minCL) / (maxCL - minCL)) * height;
        }

        // Draw plot background coordinates grid
        polarCtx.strokeStyle = 'rgba(0, 91, 197, 0.02)';
        polarCtx.lineWidth = 1;
        
        // Vertical grid lines
        for (let aoa = minAoA; aoa <= maxAoA; aoa += 5) {
            const x = getXPixel(aoa);
            polarCtx.beginPath();
            polarCtx.moveTo(x, margin);
            polarCtx.lineTo(x, polarCanvas.height - margin);
            polarCtx.stroke();
            
            // Labels
            polarCtx.fillStyle = 'rgba(43, 54, 72, 0.4)';
            polarCtx.font = '9px monospace';
            polarCtx.textAlign = 'center';
            polarCtx.fillText(`${aoa}°`, x, polarCanvas.height - margin + 15);
        }

        // Horizontal grid lines
        for (let cl = minCL; cl <= maxCL; cl += 0.5) {
            const y = getYPixel(cl);
            polarCtx.beginPath();
            polarCtx.moveTo(margin, y);
            polarCtx.lineTo(polarCanvas.width - margin, y);
            polarCtx.stroke();

            // Labels
            polarCtx.fillStyle = 'rgba(43, 54, 72, 0.4)';
            polarCtx.font = '9px monospace';
            polarCtx.textAlign = 'right';
            polarCtx.fillText(cl.toFixed(1), margin - 8, y + 3);
        }

        // Draw axes (heavy graphite pencil lines)
        polarCtx.strokeStyle = 'rgba(43, 54, 72, 0.2)';
        polarCtx.lineWidth = 1.5;
        
        // Zero AoA vertical axis
        const zeroX = getXPixel(0);
        polarCtx.beginPath();
        polarCtx.moveTo(zeroX, margin);
        polarCtx.lineTo(zeroX, polarCanvas.height - margin);
        polarCtx.stroke();

        // Zero CL horizontal axis
        const zeroY = getYPixel(0);
        polarCtx.beginPath();
        polarCtx.moveTo(margin, zeroY);
        polarCtx.lineTo(polarCanvas.width - margin, zeroY);
        polarCtx.stroke();

        // Draw the full performance curve line
        polarCtx.strokeStyle = 'var(--blueprint-blue)';
        polarCtx.lineWidth = 2;
        polarCtx.beginPath();
        for (let aoa = minAoA; aoa <= maxAoA; aoa += 0.5) {
            const cl = calculateLiftCoefficient(aoa, params);
            const x = getXPixel(aoa);
            const y = getYPixel(cl);
            if (aoa === minAoA) polarCtx.moveTo(x, y);
            else polarCtx.lineTo(x, y);
        }
        polarCtx.stroke();

        // Plot current operating point (Red dot + coordinates projection)
        const curX = getXPixel(angleOfAttack);
        const curY = getYPixel(currentCL);

        // Dashed grid project guides
        polarCtx.setLineDash([3, 3]);
        polarCtx.strokeStyle = 'var(--blueprint-red)';
        polarCtx.lineWidth = 1;

        // Line to vertical axis (CL)
        polarCtx.beginPath();
        polarCtx.moveTo(curX, curY);
        polarCtx.lineTo(margin, curY);
        polarCtx.stroke();

        // Line to horizontal axis (AoA)
        polarCtx.beginPath();
        polarCtx.moveTo(curX, curY);
        polarCtx.lineTo(curX, polarCanvas.height - margin);
        polarCtx.stroke();
        polarCtx.setLineDash([]); // Reset dash

        // Draw current operating point dot
        polarCtx.fillStyle = 'var(--blueprint-red)';
        polarCtx.beginPath();
        polarCtx.arc(curX, curY, 5, 0, Math.PI * 2);
        polarCtx.fill();

        // Label details near point
        polarCtx.fillStyle = 'var(--pencil-graphite)';
        polarCtx.font = '10px monospace';
        polarCtx.textAlign = 'left';
        polarCtx.fillText(`[AoA: ${angleOfAttack}°, CL: ${currentCL.toFixed(2)}]`, curX + 8, curY - 5);
    }

    // Canvas Draw: Airfoil Profile and Streamlines
    function renderTunnelFrame() {
        tunnelCtx.clearRect(0, 0, tunnelCanvas.width, tunnelCanvas.height);
        
        const airfoilX = tunnelCanvas.width / 2 - 60;
        const airfoilY = tunnelCanvas.height / 2 + 10;
        const chordLength = 130;
        const thicknessScale = 15;

        // Perform calculation: Lift & Drag Coefficients
        const params = getProfileParams();
        const cL = calculateLiftCoefficient(angleOfAttack, params);
        
        // Induced drag calculation + base drag profile
        let cD = params.cdZero + (cL * cL) / (Math.PI * 1.3);

        const isStalled = angleOfAttack > params.stallAoA || angleOfAttack < -params.stallAoA;
        const stallBadge = document.getElementById('stall-warning-badge');
        const hudLd = document.getElementById('hud-ld-ratio');
        const hudFlow = document.getElementById('hud-boundary-flow');
        const hudQ = document.getElementById('hud-dyn-q');
        const hudRe = document.getElementById('hud-reynolds');

        if (isStalled) {
            cD += 0.085;
            
            tunnelStatus.textContent = 'WARNING: AIRFLOW STALL';
            tunnelStatus.className = 'canvas-live-badge stall';
            if (stallBadge) stallBadge.style.display = 'inline-flex';
            
            valCL.className = 'readout-val warning';
            valCD.className = 'readout-val warning';
            if (hudFlow) {
                hudFlow.textContent = 'TURBULENT SEPARATION';
                hudFlow.style.color = 'var(--stall-red)';
            }
        } else {
            tunnelStatus.textContent = cL >= 0 ? 'LIFT GENERATED' : 'DOWNFORCE GENERATED';
            tunnelStatus.className = 'canvas-live-badge';
            if (stallBadge) stallBadge.style.display = 'none';
            
            valCL.className = 'readout-val';
            valCD.className = 'readout-val';
            if (hudFlow) {
                hudFlow.textContent = 'LAMINAR FLOW';
                hudFlow.style.color = 'var(--aero-cyan)';
            }
        }

        // Update readouts values
        valCL.textContent = cL.toFixed(2);
        valCD.textContent = cD.toFixed(3);

        // Update HUD metrics
        if (hudLd) {
            const ldRatio = cD > 0 ? (cL / cD).toFixed(1) : '0.0';
            hudLd.textContent = `${ldRatio} L/D`;
        }
        if (hudQ) {
            const dynQ = Math.round(0.5 * 1.225 * windVelocity * windVelocity);
            hudQ.textContent = `${dynQ} Pa`;
        }
        if (hudRe) {
            const reynoldsVal = ((1.225 * windVelocity * 0.13) / 1.81e-5 / 100000).toFixed(2);
            hudRe.innerHTML = `${reynoldsVal} &times; 10<sup>5</sup>`;
        }

        // Draw background mesh grid lines inside tunnel visualizer
        tunnelCtx.strokeStyle = 'rgba(0, 91, 197, 0.015)';
        tunnelCtx.lineWidth = 1;
        const spacing = 20;
        for (let x = 0; x < tunnelCanvas.width; x += spacing) {
            tunnelCtx.beginPath(); tunnelCtx.moveTo(x, 0); tunnelCtx.lineTo(x, tunnelCanvas.height); tunnelCtx.stroke();
        }
        for (let y = 0; y < tunnelCanvas.height; y += spacing) {
            tunnelCtx.beginPath(); tunnelCtx.moveTo(0, y); tunnelCtx.lineTo(tunnelCanvas.width, y); tunnelCtx.stroke();
        }

        // Update & Render flow streamlines
        streamParticles.forEach(p => {
            p.update(airfoilX, airfoilY, chordLength, thicknessScale);
            p.draw();
        });

        // Draw Airfoil Profile
        tunnelCtx.save();
        
        const pivotX = airfoilX + chordLength * 0.25;
        const pivotY = airfoilY;
        
        tunnelCtx.translate(pivotX, pivotY);
        const radAoA = angleOfAttack * Math.PI / 180;
        tunnelCtx.rotate(-radAoA);
        tunnelCtx.translate(-pivotX, -pivotY);

        // Render Airfoil Shape
        tunnelCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        tunnelCtx.strokeStyle = 'var(--pencil-graphite)';
        tunnelCtx.lineWidth = 2.0;
        tunnelCtx.beginPath();
        
        const steps = 40;
        // Upper surface
        for (let i = 0; i <= steps; i++) {
            const ratio = i / steps;
            const x = airfoilX + ratio * chordLength;
            const thickness = Math.sqrt(ratio) * (1 - ratio) * thicknessScale * 1.8;
            const camberY = Math.sin(ratio * Math.PI) * thicknessScale * params.camber;
            
            const y = airfoilY - thickness - camberY;
            if (i === 0) tunnelCtx.moveTo(x, y);
            else tunnelCtx.lineTo(x, y);
        }
        // Lower surface
        for (let i = steps; i >= 0; i--) {
            const ratio = i / steps;
            const x = airfoilX + ratio * chordLength;
            const thickness = Math.sqrt(ratio) * (1 - ratio) * thicknessScale * 1.8;
            const camberY = Math.sin(ratio * Math.PI) * thicknessScale * params.camber;
            
            const y = airfoilY + thickness - camberY;
            tunnelCtx.lineTo(x, y);
        }
        
        tunnelCtx.closePath();
        tunnelCtx.fill();
        tunnelCtx.stroke();

        // Draw lift vector arrow
        if (Math.abs(cL) > 0.05) {
            tunnelCtx.strokeStyle = isStalled ? 'var(--blueprint-red)' : 'var(--blueprint-blue)';
            tunnelCtx.fillStyle = isStalled ? 'var(--blueprint-red)' : 'var(--blueprint-blue)';
            tunnelCtx.lineWidth = 2.0;

            const arrowLength = cL * 55;
            const arrowEndX = pivotX;
            const arrowEndY = pivotY - arrowLength;

            tunnelCtx.beginPath();
            tunnelCtx.moveTo(pivotX, pivotY);
            tunnelCtx.lineTo(arrowEndX, arrowEndY);
            tunnelCtx.stroke();

            const headSize = 6;
            const arrowDir = cL > 0 ? 1 : -1;
            tunnelCtx.beginPath();
            tunnelCtx.moveTo(arrowEndX, arrowEndY);
            tunnelCtx.lineTo(arrowEndX - headSize, arrowEndY + headSize * arrowDir);
            tunnelCtx.lineTo(arrowEndX + headSize, arrowEndY + headSize * arrowDir);
            tunnelCtx.closePath();
            tunnelCtx.fill();
        }

        tunnelCtx.restore();

        // Render secondary polar plot
        renderPolarPlot(cL, params);

        tunnelTime++;
        requestAnimationFrame(renderTunnelFrame);
    }

    // Reset controls
    if (btnTunnelReset) {
        btnTunnelReset.addEventListener('click', () => {
            sliderAoA.value = 4;
            sliderVelocity.value = 30;
            if (selectProfile) selectProfile.value = 'naca4412';
            wingProfile = 'naca4412';
            angleOfAttack = 4;
            windVelocity = 30;
            txtAoA.textContent = '+4.0°';
            txtVelocity.textContent = '30 m/s';
            initTunnelParticles();
        });
    }

    // Snapshot download exporter
    if (btnTunnelSnapshot) {
        btnTunnelSnapshot.addEventListener('click', () => {
            tunnelCtx.font = '10px monospace';
            tunnelCtx.fillStyle = 'rgba(43, 54, 72, 0.3)';
            tunnelCtx.fillText(`CFD STAMP // Profile: ${wingProfile.toUpperCase()} // AoA: ${angleOfAttack}° // V: ${windVelocity}m/s`, 15, tunnelCanvas.height - 15);

            const imageURL = tunnelCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `dhruv_cfd_mesh_${wingProfile}_${Date.now()}.png`;
            link.href = imageURL;
            link.click();
        });
    }

    // Sizing adjustments
    function adjustTunnelCanvasSize() {
        if (!tunnelCanvas || !polarCanvas) return;
        
        const parentW = tunnelCanvas.parentElement.clientWidth;
        
        tunnelCanvas.width = parentW - 24;
        tunnelCanvas.height = 350;
        
        polarCanvas.width = polarCanvas.parentElement.clientWidth - 24;
        polarCanvas.height = 350;
        
        initTunnelParticles();
    }

    // ----------------------------------------------------------------------
    // 9. Interactive 3D Word-Merging Simulator (Conceptual Orbit)
    // ----------------------------------------------------------------------
    const mergerCanvas = document.getElementById('word-merger-canvas');
    if (mergerCanvas) {
        const mergerCtx = mergerCanvas.getContext('2d');
        const sliderOrbitSpeed = document.getElementById('control-orbit-speed');
        const btnMergeAction = document.getElementById('btn-merge-action');
        const mergerStatus = document.getElementById('merger-status');
        const txtOrbitSpeed = document.getElementById('orbit-speed-val');

        let orbitSpeed = sliderOrbitSpeed ? parseFloat(sliderOrbitSpeed.value) : 1.0;
        let isMerging = false;
        let mergeAlpha = 0;
        let orbitWords = [];
        
        const concepts = [
            "AERODYNAMICS", "ROCKETRY", "PROPULSION", "CAD", 
            "3D PRINTING", "CFD", "CALCULUS", "PHYSICS", 
            "SOLIDWORKS", "WIND TUNNEL", "ORBITS", "GLIDERS"
        ];

        if (sliderOrbitSpeed) {
            sliderOrbitSpeed.addEventListener('input', (e) => {
                orbitSpeed = parseFloat(e.target.value);
                if (txtOrbitSpeed) txtOrbitSpeed.textContent = `${orbitSpeed.toFixed(1)}x`;
            });
        }

        function initMergerOrbits() {
            orbitWords = [];
            concepts.forEach((txt, idx) => {
                const phi = Math.acos(-1 + (2 * idx) / concepts.length);
                const theta = Math.sqrt(concepts.length * Math.PI) * phi;
                
                orbitWords.push({
                    text: txt,
                    theta: theta,
                    phi: phi,
                    radius: 120 + Math.random() * 20,
                    cx: 0, cy: 0, cz: 0
                });
            });
        }

        function updateMergerFrame() {
            mergerCtx.clearRect(0, 0, mergerCanvas.width, mergerCanvas.height);
            const cx = mergerCanvas.width / 2;
            const cy = mergerCanvas.height / 2;

            mergerCtx.strokeStyle = 'rgba(0, 91, 197, 0.015)';
            mergerCtx.lineWidth = 1;
            for (let x = 0; x < mergerCanvas.width; x += 30) {
                mergerCtx.beginPath(); mergerCtx.moveTo(x, 0); mergerCtx.lineTo(x, mergerCanvas.height); mergerCtx.stroke();
            }
            for (let y = 0; y < mergerCanvas.height; y += 30) {
                mergerCtx.beginPath(); mergerCtx.moveTo(0, y); mergerCtx.lineTo(mergerCanvas.width, y); mergerCtx.stroke();
            }

            if (isMerging) {
                mergeAlpha += (1 - mergeAlpha) * 0.08;
                if (mergerStatus) {
                    mergerStatus.textContent = 'CONFLUX MERGING ACTIVE';
                    mergerStatus.className = 'canvas-live-badge stall';
                }
            } else {
                mergeAlpha += (0 - mergeAlpha) * 0.08;
                if (mergerStatus) {
                    mergerStatus.textContent = 'ORBITING ACTIVE';
                    mergerStatus.className = 'canvas-live-badge';
                }
            }

            orbitWords.forEach(w => {
                if (!isMerging) {
                    w.theta += 0.006 * orbitSpeed;
                    w.phi += 0.003 * orbitSpeed;
                }

                const tx = Math.sin(w.phi) * Math.cos(w.theta) * w.radius;
                const ty = Math.sin(w.phi) * Math.sin(w.theta) * w.radius;
                const tz = Math.cos(w.phi) * w.radius;

                const targetX = isMerging ? 0 : tx;
                const targetY = isMerging ? 0 : ty;
                const targetZ = isMerging ? 0 : tz;

                w.cx += (targetX - w.cx) * 0.08;
                w.cy += (targetY - w.cy) * 0.08;
                w.cz += (targetZ - w.cz) * 0.08;

                const scale = 260 / (260 + w.cz);
                const screenX = cx + w.cx * scale;
                const screenY = cy - w.cy * scale;

                const distToCenter = Math.sqrt(w.cx * w.cx + w.cy * w.cy + w.cz * w.cz);
                if (distToCenter > 10) {
                    mergerCtx.strokeStyle = `rgba(0, 91, 197, ${0.05 * (1 - mergeAlpha) * scale})`;
                    mergerCtx.setLineDash([2, 2]);
                    mergerCtx.beginPath();
                    mergerCtx.moveTo(cx, cy);
                    mergerCtx.lineTo(screenX, screenY);
                    mergerCtx.stroke();
                    mergerCtx.setLineDash([]);
                }

                const alpha = (1 - mergeAlpha) * scale * (w.cz < 0 ? 1 : 0.45);
                if (alpha > 0.05) {
                    mergerCtx.fillStyle = w.cz < 0 ? `rgba(0, 91, 197, ${alpha})` : `rgba(43, 54, 72, ${alpha})`;
                    mergerCtx.font = `${Math.round(10 + scale * 4)}px Space Grotesk`;
                    mergerCtx.textAlign = 'center';
                    mergerCtx.fillText(w.text, screenX, screenY);
                }
            });

            if (mergeAlpha > 0.05) {
                mergerCtx.strokeStyle = `rgba(217, 4, 41, ${mergeAlpha * 0.25})`;
                mergerCtx.lineWidth = 1.5;
                mergerCtx.beginPath();
                mergerCtx.arc(cx, cy, 75 + Math.sin(Date.now() * 0.003) * 5, 0, Math.PI * 2);
                mergerCtx.stroke();

                mergerCtx.strokeStyle = `rgba(43, 54, 72, ${mergeAlpha * 0.15})`;
                mergerCtx.lineWidth = 1.0;
                mergerCtx.beginPath();
                mergerCtx.arc(cx, cy, 70, 0, Math.PI * 2);
                mergerCtx.stroke();

                mergerCtx.fillStyle = `rgba(0, 91, 197, ${mergeAlpha})`;
                mergerCtx.font = 'bold 20px Space Grotesk';
                mergerCtx.textAlign = 'center';
                mergerCtx.fillText("DHRUV GUPTA", cx, cy - 8);

                mergerCtx.fillStyle = `rgba(217, 4, 41, ${mergeAlpha})`;
                mergerCtx.font = '10px Fira Code';
                mergerCtx.fillText("AEROSPACE STUDENT", cx, cy + 14);

                mergerCtx.fillStyle = `rgba(113, 128, 150, ${mergeAlpha * 0.8})`;
                mergerCtx.font = '9px Space Grotesk';
                mergerCtx.fillText("STARTING DSU NEXT WEEK // DW-001", cx, cy + 28);
            }

            requestAnimationFrame(updateMergerFrame);
        }

        if (btnMergeAction) {
            btnMergeAction.addEventListener('click', () => {
                isMerging = !isMerging;
                btnMergeAction.innerHTML = isMerging 
                    ? `<i class="fa-solid fa-expand"></i> Disperse Orbit` 
                    : `<i class="fa-solid fa-compress"></i> Trigger Merge`;
            });
        }

        mergerCanvas.addEventListener('mouseenter', () => {
            isMerging = true;
            if (btnMergeAction) {
                btnMergeAction.innerHTML = `<i class="fa-solid fa-expand"></i> Disperse Orbit`;
            }
        });

        mergerCanvas.addEventListener('mouseleave', () => {
            isMerging = false;
            if (btnMergeAction) {
                btnMergeAction.innerHTML = `<i class="fa-solid fa-compress"></i> Trigger Merge`;
            }
        });

        function adjustMergerCanvasSize() {
            mergerCanvas.width = mergerCanvas.parentElement.clientWidth - 24;
            mergerCanvas.height = 350;
            initMergerOrbits();
        }

        adjustMergerCanvasSize();
        initMergerOrbits();
        updateMergerFrame();

        window.addEventListener('resize', adjustMergerCanvasSize);
    }

    // Sizing adjustments
    function adjustTunnelCanvasSize() {
        if (!tunnelCanvas || !polarCanvas) return;
        
        const parentW = tunnelCanvas.parentElement.clientWidth;
        
        tunnelCanvas.width = parentW - 24;
        tunnelCanvas.height = 350;
        
        polarCanvas.width = polarCanvas.parentElement.clientWidth - 24;
        polarCanvas.height = 350;
        
        initTunnelParticles();
    }

    // ----------------------------------------------------------------------
    // 10. Custom CAD Drafting Crosshair Cursor Logic
    // ----------------------------------------------------------------------
    const cadCursor = document.getElementById('cad-cursor');
    if (cadCursor) {
        const cursorCoords = cadCursor.querySelector('.cursor-coords');
        let mouseX = 0, mouseY = 0;
        let curX = 0, curY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function updateCursorFrame() {
            curX += (mouseX - curX) * 0.16;
            curY += (mouseY - curY) * 0.16;

            cadCursor.style.left = `${curX}px`;
            cadCursor.style.top = `${curY}px`;
            
            if (cursorCoords) {
                cursorCoords.textContent = `X: ${Math.round(curX)} // Y: ${Math.round(curY)}`;
            }

            requestAnimationFrame(updateCursorFrame);
        }
        updateCursorFrame();

        // Listen on interactives to trigger crosshair hovering expansion
        function registerHoverListeners() {
            const interactives = document.querySelectorAll('a, button, select, input, textarea, .project-link-spec, .filter-button, .slider-blueprint');
            interactives.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    cadCursor.classList.add('hovering');
                });
                el.addEventListener('mouseleave', () => {
                    cadCursor.classList.remove('hovering');
                });
            });
        }
        registerHoverListeners();

        // Re-run listener binders on filter triggers or modal popups
        const filterButtons = document.querySelectorAll('.filter-button');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                setTimeout(registerHoverListeners, 350);
            });
        });
    }

    // ----------------------------------------------------------------------
    // 11. Interactive CAD Sketchpad (Geometric Draft Board)
    // ----------------------------------------------------------------------
    const sketchpadCanvas = document.getElementById('cad-sketchpad-canvas');
    if (sketchpadCanvas) {
        const sketchCtx = sketchpadCanvas.getContext('2d');
        const selectTool = document.getElementById('control-sketchpad-tool');
        const btnClear = document.getElementById('btn-sketchpad-clear');
        const sketchpadStatus = document.getElementById('sketchpad-status');

        let shapes = [];
        let isDrawing = false;
        let startX = 0, startY = 0;
        let curMouseX = 0, curMouseY = 0;
        let hoverX = 0, hoverY = 0;
        let isMouseOverCanvas = false;
        let activeTool = selectTool ? selectTool.value : 'line';
        let isShiftPressed = false;

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Shift') isShiftPressed = true;
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'Shift') isShiftPressed = false;
        });

        if (selectTool) {
            selectTool.addEventListener('change', (e) => {
                activeTool = e.target.value;
            });
        }

        sketchpadCanvas.addEventListener('mouseenter', () => {
            isMouseOverCanvas = true;
        });

        sketchpadCanvas.addEventListener('mouseleave', () => {
            isMouseOverCanvas = false;
            isDrawing = false; // Safeguard if user releases mouse outside canvas
            if (sketchpadStatus) {
                sketchpadStatus.textContent = 'READY FOR CAD';
                sketchpadStatus.className = 'canvas-live-badge';
            }
        });

        function getMousePos(e) {
            const rect = sketchpadCanvas.getBoundingClientRect();
            const scaleX = sketchpadCanvas.width / rect.width;
            const scaleY = sketchpadCanvas.height / rect.height;
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        }

        sketchpadCanvas.addEventListener('mousedown', (e) => {
            const pos = getMousePos(e);
            startX = pos.x;
            startY = pos.y;
            curMouseX = pos.x;
            curMouseY = pos.y;
            isDrawing = true;
            if (sketchpadStatus) {
                sketchpadStatus.textContent = 'DRAFTING GEOMETRY';
                sketchpadStatus.className = 'canvas-live-badge stall';
            }
        });

        sketchpadCanvas.addEventListener('mousemove', (e) => {
            const pos = getMousePos(e);
            hoverX = pos.x;
            hoverY = pos.y;
            if (!isDrawing) return;
            curMouseX = pos.x;
            curMouseY = pos.y;
        });

        sketchpadCanvas.addEventListener('mouseup', (e) => {
            if (!isDrawing) return;
            const pos = getMousePos(e);
            curMouseX = pos.x;
            curMouseY = pos.y;

            let finalX2 = curMouseX;
            let finalY2 = curMouseY;

            if (activeTool === 'line' && isShiftPressed) {
                const dx = curMouseX - startX;
                const dy = curMouseY - startY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const theta = Math.atan2(dy, dx);
                const snapAngle = Math.round(theta / (Math.PI / 12)) * (Math.PI / 12);
                finalX2 = startX + Math.cos(snapAngle) * dist;
                finalY2 = startY + Math.sin(snapAngle) * dist;
            }

            shapes.push({
                type: activeTool,
                x1: startX, y1: startY,
                x2: finalX2, y2: finalY2
            });

            isDrawing = false;
            if (sketchpadStatus) {
                sketchpadStatus.textContent = 'DRAFT COMPLETED';
                sketchpadStatus.className = 'canvas-live-badge';
            }
        });

        if (btnClear) {
            btnClear.addEventListener('click', () => {
                shapes = [];
                if (sketchpadStatus) {
                    sketchpadStatus.textContent = 'SHEET CLEARED';
                }
            });
        }

        function drawAirframeTemplate(cx, cy) {
            sketchCtx.strokeStyle = 'rgba(0, 91, 197, 0.08)';
            sketchCtx.lineWidth = 1.2;

            sketchCtx.setLineDash([4, 4]);
            sketchCtx.beginPath();
            sketchCtx.moveTo(cx - 200, cy);
            sketchCtx.lineTo(cx + 200, cy);
            sketchCtx.stroke();
            sketchCtx.setLineDash([]);

            sketchCtx.beginPath();
            sketchCtx.moveTo(cx + 170, cy);
            sketchCtx.quadraticCurveTo(cx + 100, cy - 15, cx + 50, cy - 15);
            sketchCtx.lineTo(cx - 150, cy - 15);
            sketchCtx.lineTo(cx - 160, cy - 40);
            sketchCtx.lineTo(cx - 175, cy - 40);
            sketchCtx.lineTo(cx - 165, cy);
            
            sketchCtx.lineTo(cx - 175, cy + 40);
            sketchCtx.lineTo(cx - 160, cy + 40);
            sketchCtx.lineTo(cx - 150, cy + 15);
            sketchCtx.lineTo(cx + 50, cy + 15);
            sketchCtx.quadraticCurveTo(cx + 100, cy + 15, cx + 170, cy);
            sketchCtx.stroke();

            sketchCtx.beginPath();
            sketchCtx.moveTo(cx + 20, cy - 15);
            sketchCtx.lineTo(cx - 100, cy - 160);
            sketchCtx.lineTo(cx - 120, cy - 160);
            sketchCtx.lineTo(cx - 80, cy - 15);
            sketchCtx.stroke();

            sketchCtx.beginPath();
            sketchCtx.moveTo(cx + 20, cy + 15);
            sketchCtx.lineTo(cx - 100, cy + 160);
            sketchCtx.lineTo(cx - 120, cy + 160);
            sketchCtx.lineTo(cx - 80, cy + 15);
            sketchCtx.stroke();
        }

        function drawSketchpadFrame() {
            sketchCtx.clearRect(0, 0, sketchpadCanvas.width, sketchpadCanvas.height);
            const cx = sketchpadCanvas.width / 2;
            const cy = sketchpadCanvas.height / 2;

            sketchCtx.strokeStyle = 'rgba(0, 91, 197, 0.02)';
            sketchCtx.lineWidth = 1;
            const step = 20;
            for (let x = 0; x < sketchpadCanvas.width; x += step) {
                sketchCtx.beginPath(); sketchCtx.moveTo(x, 0); sketchCtx.lineTo(x, sketchpadCanvas.height); sketchCtx.stroke();
            }
            for (let y = 0; y < sketchpadCanvas.height; y += step) {
                sketchCtx.beginPath(); sketchCtx.moveTo(0, y); sketchCtx.lineTo(sketchpadCanvas.width, y); sketchCtx.stroke();
            }

            // Draw CAD cursor crosshairs overlay if hovering and not dragging
            if (isMouseOverCanvas && !isDrawing) {
                sketchCtx.strokeStyle = 'rgba(0, 91, 197, 0.12)';
                sketchCtx.lineWidth = 0.8;
                sketchCtx.setLineDash([3, 4]);
                sketchCtx.beginPath();
                sketchCtx.moveTo(0, hoverY); sketchCtx.lineTo(sketchpadCanvas.width, hoverY);
                sketchCtx.moveTo(hoverX, 0); sketchCtx.lineTo(hoverX, sketchpadCanvas.height);
                sketchCtx.stroke();
                sketchCtx.setLineDash([]);

                sketchCtx.fillStyle = 'rgba(0, 91, 197, 0.65)';
                sketchCtx.font = '8px Fira Code';
                sketchCtx.fillText(`X:${Math.round(hoverX)} Y:${Math.round(hoverY)}`, hoverX + 8, hoverY - 6);
            }

            drawAirframeTemplate(cx, cy);

            sketchCtx.strokeStyle = 'var(--pencil-graphite)';
            sketchCtx.lineWidth = 1.8;
            sketchCtx.fillStyle = 'rgba(43, 54, 72, 0.7)';
            sketchCtx.font = '9px Fira Code';

            shapes.forEach(s => {
                if (s.type === 'line') {
                    sketchCtx.beginPath();
                    sketchCtx.moveTo(s.x1, s.y1);
                    sketchCtx.lineTo(s.x2, s.y2);
                    sketchCtx.stroke();

                    sketchCtx.fillStyle = 'var(--pencil-graphite)';
                    sketchCtx.beginPath(); sketchCtx.arc(s.x1, s.y1, 2.5, 0, Math.PI*2); sketchCtx.fill();
                    sketchCtx.beginPath(); sketchCtx.arc(s.x2, s.y2, 2.5, 0, Math.PI*2); sketchCtx.fill();

                    const dx = s.x2 - s.x1;
                    const dy = s.y2 - s.y1;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    sketchCtx.fillText(`${dist.toFixed(0)}mm`, (s.x1 + s.x2)/2 + 5, (s.y1 + s.y2)/2 - 5);
                } else if (s.type === 'circle') {
                    const dx = s.x2 - s.x1;
                    const dy = s.y2 - s.y1;
                    const r = Math.sqrt(dx * dx + dy * dy);

                    sketchCtx.beginPath();
                    sketchCtx.arc(s.x1, s.y1, r, 0, Math.PI*2);
                    sketchCtx.stroke();

                    sketchCtx.fillStyle = 'var(--pencil-graphite)';
                    sketchCtx.beginPath(); sketchCtx.arc(s.x1, s.y1, 2, 0, Math.PI*2); sketchCtx.fill();

                    sketchCtx.strokeStyle = 'rgba(43, 54, 72, 0.3)';
                    sketchCtx.lineWidth = 0.8;
                    sketchCtx.beginPath();
                    sketchCtx.moveTo(s.x1 - 10, s.y1); sketchCtx.lineTo(s.x1 + 10, s.y1);
                    sketchCtx.moveTo(s.x1, s.y1 - 10); sketchCtx.lineTo(s.x1, s.y1 + 10);
                    sketchCtx.stroke();

                    sketchCtx.fillStyle = 'rgba(43, 54, 72, 0.8)';
                    sketchCtx.fillText(`R: ${r.toFixed(0)}mm`, s.x1 + 5, s.y1 - 5);
                }
            });

            if (isDrawing) {
                let finalX2 = curMouseX;
                let finalY2 = curMouseY;

                sketchCtx.strokeStyle = 'var(--blueprint-blue)';
                sketchCtx.fillStyle = 'var(--blueprint-blue)';
                sketchCtx.lineWidth = 1.5;

                if (activeTool === 'line') {
                    const dx = curMouseX - startX;
                    const dy = curMouseY - startY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    let theta = Math.atan2(dy, dx);

                    if (isShiftPressed) {
                        const snapAngle = Math.round(theta / (Math.PI / 12)) * (Math.PI / 12);
                        finalX2 = startX + Math.cos(snapAngle) * dist;
                        finalY2 = startY + Math.sin(snapAngle) * dist;
                        theta = snapAngle;
                    }

                    sketchCtx.setLineDash([3, 3]);
                    sketchCtx.strokeStyle = 'rgba(0, 91, 197, 0.3)';
                    sketchCtx.beginPath();
                    sketchCtx.moveTo(startX, startY); sketchCtx.lineTo(finalX2, startY);
                    sketchCtx.moveTo(finalX2, startY); sketchCtx.lineTo(finalX2, finalY2);
                    sketchCtx.stroke();
                    sketchCtx.setLineDash([]);

                    sketchCtx.strokeStyle = 'var(--blueprint-blue)';
                    sketchCtx.beginPath();
                    sketchCtx.moveTo(startX, startY);
                    sketchCtx.lineTo(finalX2, finalY2);
                    sketchCtx.stroke();

                    const deg = (theta * 180 / Math.PI).toFixed(0);
                    sketchCtx.font = '10px Fira Code';
                    sketchCtx.fillText(`L: ${dist.toFixed(0)}mm / θ: ${deg}°`, finalX2 + 10, finalY2 + 5);
                } else if (activeTool === 'circle') {
                    const dx = curMouseX - startX;
                    const dy = curMouseY - startY;
                    const r = Math.sqrt(dx * dx + dy * dy);

                    sketchCtx.beginPath();
                    sketchCtx.arc(startX, startY, r, 0, Math.PI*2);
                    sketchCtx.stroke();

                    sketchCtx.beginPath();
                    sketchCtx.moveTo(startX, startY);
                    sketchCtx.lineTo(curMouseX, curMouseY);
                    sketchCtx.stroke();

                    sketchCtx.font = '10px Fira Code';
                    sketchCtx.fillText(`R: ${r.toFixed(0)}mm`, curMouseX + 10, curMouseY - 5);
                }
            }

            requestAnimationFrame(drawSketchpadFrame);
        }

        function adjustSketchpadCanvasSize() {
            sketchpadCanvas.width = sketchpadCanvas.parentElement.clientWidth - 24;
            sketchpadCanvas.height = 380;
        }

        adjustSketchpadCanvasSize();
        drawSketchpadFrame();

        window.addEventListener('resize', adjustSketchpadCanvasSize);
    }

    window.addEventListener('resize', () => {
        adjustTunnelCanvasSize();
    });

    adjustTunnelCanvasSize();
    renderTunnelFrame();
});
