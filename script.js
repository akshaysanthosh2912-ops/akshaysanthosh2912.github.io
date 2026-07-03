/* ===================================================================
   PORTFOLIO LOGIC — Three.js WebGL, GSAP, Web Audio Synth, AI Voice
   =================================================================== */

// Global state variables
let scene, camera, renderer, controls;
let robotGroup;
let starfieldGalaxy;
let interactiveObjects = [];
let hoveredNode = null;
let activeNode = null;
let currentState = 'orbit'; // 'orbit' or 'zoomed'
let isLoaded = false;
let gfxMode = 'ultra';      // 'ultra' or 'eco'
let isMobile = false;
let isLoopRunning = true;
let voiceRecognition = null;

// Auto-detect mobile devices and initialize graphics state
function detectMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || (isTouch && window.innerWidth < 992);
  
  if (isMobile) {
    gfxMode = 'eco';
    document.body.classList.add('mobile-device');
  } else {
    gfxMode = 'ultra';
  }
}

// Dynamic positions mapping for 3D coordinate projection
const nodeCoordinates = {
  head: new THREE.Vector3(0, 1.45, 0),
  brain: new THREE.Vector3(0, 1.55, 0),
  rightChest: new THREE.Vector3(0.3, 0.85, 0.15),
  leftChest: new THREE.Vector3(-0.3, 0.85, 0.15),
  rightHand: new THREE.Vector3(1.05, -0.05, 0),
  coreReactor: new THREE.Vector3(0, 0.3, 0),
  leftLeg: new THREE.Vector3(-0.3, -1.3, 0),
  rightLeg: new THREE.Vector3(0.3, -1.3, 0)
};

// Node camera coordinates (position & target focus)
const cameraFocusZones = {
  head: { pos: new THREE.Vector3(0, 1.45, 2.0), target: new THREE.Vector3(0, 1.45, 0) },
  brain: { pos: new THREE.Vector3(0, 1.55, 1.6), target: new THREE.Vector3(0, 1.55, 0) },
  rightChest: { pos: new THREE.Vector3(0.35, 0.85, 1.8), target: new THREE.Vector3(0.25, 0.85, 0) },
  leftChest: { pos: new THREE.Vector3(-0.35, 0.85, 1.8), target: new THREE.Vector3(-0.25, 0.85, 0) },
  rightHand: { pos: new THREE.Vector3(1.15, -0.05, 1.6), target: new THREE.Vector3(1.05, -0.05, 0) },
  coreReactor: { pos: new THREE.Vector3(0, 0.3, 2.2), target: new THREE.Vector3(0, 0.3, 0) },
  leftLeg: { pos: new THREE.Vector3(-0.35, -1.3, 2.0), target: new THREE.Vector3(-0.25, -1.3, 0) },
  rightLeg: { pos: new THREE.Vector3(0.35, -1.3, 2.0), target: new THREE.Vector3(0.25, -1.3, 0) }
};

// Tooltip textual details mapping
const tooltipContent = {
  head: { title: "Neural Profile", body: "Akshai Santhosh. CSE (AI) Student. Click to load bio archives." },
  brain: { title: "Cognitive Core", body: "Programming languages, tools & soft competencies. Click to run analytics." },
  rightChest: { title: "Projects Node", body: "3 active repositories, 1 innovation concept. Click to map files." },
  leftChest: { title: "Credentials Vault", body: "Smart India Hackathon, NASA Space Apps credentials. Click to scan." },
  rightHand: { title: "Resume Module", body: "Academic timeline & career parameters. Click to access PDF." },
  coreReactor: { title: "Energy Reactor", body: "Chronological academic progression and roadmap. Click to stabilize." },
  leftLeg: { title: "Comms Console", body: "Interactive mail gateway and social link array. Click to transmit." },
  rightLeg: { title: "Mission Objectives", body: "Short and long term operational goals. Click to inspect." }
};

// AI Voice Narrator voice script script
const voiceNarration = {
  welcome: "System initialized. Welcome to Akshai's Neural Portfolio. Select a body node to begin data exploration.",
  head: "Profile node accessed. Biographical archives online.",
  brain: "Cognitive core accessed. Neural skill node matrix loaded.",
  rightChest: "Projects database active. Visualizing active repositories.",
  leftChest: "Credentials vault unlocked. Security clearance verified.",
  rightHand: "System specifications loaded. Resume document stream ready for download.",
  coreReactor: "Roadmap chronologer online. Learning core reactor stabilizing.",
  leftLeg: "Communication console engaged. Neural uplink terminal waiting for input.",
  rightLeg: "Future objectives mapped. Mission parameters loaded.",
  reset: "Returning camera core to default orbital coordinates."
};

/* ===================================================================
   WEB AUDIO API SYNTHESIZER
   =================================================================== */
class CyberSynth {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }
  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  playHover() {
    if (!this.enabled) return;
    this.init();
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }
  playClick() {
    if (!this.enabled) return;
    this.init();
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);

    // Play secondary high chime
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime);
      osc2.frequency.setValueAtTime(1760, ctx.currentTime + 0.05);
      gain2.gain.setValueAtTime(0.04, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.1);
    }, 45);
  }
  playClose() {
    if (!this.enabled) return;
    this.init();
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  }
  playSuccess() {
    if (!this.enabled) return;
    this.init();
    const ctx = this.ctx;
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }, idx * 60);
    });
  }
}
const synth = new CyberSynth();

/* ===================================================================
   AI SPEECH SYNTHESIS ASSISTANT
   =================================================================== */
class AIVoice {
  constructor() {
    this.enabled = false;
    this.synth = window.speechSynthesis;
  }
  speak(text) {
    if (!this.enabled || !this.synth) return;
    this.synth.cancel(); // Stop any ongoing narrator speech
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = this.synth.getVoices();
    // Prefer English/female/robotic sounding voice
    const chosenVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Female') || v.lang.startsWith('en-'));
    if (chosenVoice) utterance.voice = chosenVoice;
    utterance.pitch = 0.95;
    utterance.rate = 1.02;
    this.synth.speak(utterance);
  }
}
const voice = new AIVoice();

/* ===================================================================
   INITIALIZATION & BOOT SEQUENCE
   =================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initThree();
  initCursorTrail();
  initNeuralSkillsMap();
  setupUIEvents();
  simulateBootProgress();
});

// Simulate preloader loading values
function simulateBootProgress() {
  const progressBar = document.querySelector('.preloader-progress');
  const percentLabel = document.querySelector('.status-pct');
  const preloader = document.getElementById('preloader');
  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 8) + 4;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);

      progressBar.style.width = '100%';
      percentLabel.textContent = '100%';

      setTimeout(() => {
        // Trigger assembly animation, fade preloader, play welcome sound
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        isLoaded = true;
        assembleRobot();

        // Initial setup for Audio context trigger
        document.body.addEventListener('click', () => {
          synth.init();
        }, { once: true });

        // Narrate welcome if user starts voice links
        setTimeout(() => {
          if (voice.enabled) voice.speak(voiceNarration.welcome);
        }, 1000);
      }, 600);
    } else {
      progressBar.style.width = `${progress}%`;
      percentLabel.textContent = `${progress.toString().padStart(2, '0')}%`;
    }
  }, 70);
}

/* ===================================================================
   THREE.JS 3D SCENE CONFIGURATION
   =================================================================== */
function initThree() {
  const container = document.getElementById('canvas-container');
  const canvas = document.getElementById('3d-canvas');

  // Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05050a, 0.08);

  // Camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.5, 4.5);

  // Camera Light (illuminates front facing surfaces dynamically as camera moves)
  const camLight = new THREE.PointLight(0xffffff, 1.2, 12);
  camera.add(camLight);
  scene.add(camera);

  // Renderer
  detectMobileDevice();
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  const maxDPR = gfxMode === 'eco' ? 1.0 : 1.35;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 6.5;
  controls.minDistance = 1.2;
  controls.maxPolarAngle = Math.PI / 2 + 0.1; // Limit panning below ground
  controls.target.set(0, 0.2, 0);

  // Lights
  const ambientLight = new THREE.AmbientLight(0x0a0a25, 1.2);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0x00f0ff, 1.5);
  mainLight.position.set(5, 8, 5);
  scene.add(mainLight);

  const magentaLight = new THREE.DirectionalLight(0xff007f, 1.0);
  magentaLight.position.set(-5, 5, 2);
  scene.add(magentaLight);

  const backLight = new THREE.DirectionalLight(0x9d00ff, 1.2); // Directional light is significantly faster to compute than PointLight
  backLight.position.set(0, 2, -3);
  scene.add(backLight);

  // Build Assets
  buildGalaxyBackground();
  buildHumanoidRobot();

  // Animation Loop
  animate();

  // Resize Listener
  window.addEventListener('resize', onWindowResize);
}

/* ===================================================================
   3D BACKGROUND PARTICLE GALAXY
   =================================================================== */
function buildGalaxyBackground() {
  const particleCount = gfxMode === 'eco' ? 350 : 1300;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorCyan = new THREE.Color(0x00f0ff);
  const colorMagenta = new THREE.Color(0xff007f);
  const colorPurple = new THREE.Color(0x9d00ff);

  for (let i = 0; i < particleCount; i++) {
    // Generate spiral coordinates
    const r = Math.random() * 8 + 0.8;
    const theta = Math.random() * Math.PI * 2 + (r * 0.4); // spiral arm shape
    const spread = (Math.random() - 0.5) * 0.3 * (r * 0.5);

    const x = Math.cos(theta) * r + spread;
    const y = (Math.random() - 0.5) * 0.8;
    const z = Math.sin(theta) * r + spread;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Distribute colors across the spiral
    let mixedColor;
    const rand = Math.random();
    if (rand < 0.45) {
      mixedColor = colorCyan.clone().lerp(colorPurple, Math.random());
    } else {
      mixedColor = colorMagenta.clone().lerp(colorPurple, Math.random());
    }

    colors[i * 3] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Custom round particle shader emulation
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 16, 16);
  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    map: texture,
    depthWrite: false
  });

  starfieldGalaxy = new THREE.Points(geometry, material);
  scene.add(starfieldGalaxy);
}

/* ===================================================================
   3D HUMANOID ROBOT GEOMETRIES
   =================================================================== */
function buildHumanoidRobot() {
  robotGroup = new THREE.Group();

  // Custom Materials
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x889ab0,          // Cybernetic bright metallic silver-blue
    metalness: 0.95,         // Highly reflective chrome-like metal
    roughness: 0.18,         // Low roughness for clean specular reflections
    emissive: 0x161c28,       // Subtle emissive blue so structure is visible in shadow
    envMapIntensity: 1.2
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.22,
    roughness: 0.1,
    metalness: 0.2,
    depthWrite: true
  });

  const cyanGlowMat = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x00f0ff,
    emissiveIntensity: 1.6,
    roughness: 0.1
  });

  const magentaGlowMat = new THREE.MeshStandardMaterial({
    color: 0xff007f,
    emissive: 0xff007f,
    emissiveIntensity: 1.6,
    roughness: 0.1
  });

  const purpleGlowMat = new THREE.MeshStandardMaterial({
    color: 0x9d00ff,
    emissive: 0x9d00ff,
    emissiveIntensity: 1.4,
    roughness: 0.1
  });

  const wireframeCyanMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    wireframe: true,
    transparent: true,
    opacity: 0.35
  });

  const wireframeMagentaMat = new THREE.MeshBasicMaterial({
    color: 0xff007f,
    wireframe: true,
    transparent: true,
    opacity: 0.35
  });

  // 1. Spine / Central Post
  const spineGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.9, 8);
  const spine = new THREE.Mesh(spineGeo, metalMat);
  spine.position.y = 0.5;
  robotGroup.add(spine);

  // 2. Neck
  const neckGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.18, 12);
  const neck = new THREE.Mesh(neckGeo, metalMat);
  neck.position.y = 1.15;
  robotGroup.add(neck);

  // 3. Shoulder Bar
  const shoulderBarGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.1, 8);
  shoulderBarGeo.rotateZ(Math.PI / 2);
  const shoulderBar = new THREE.Mesh(shoulderBarGeo, metalMat);
  shoulderBar.position.set(0, 0.95, 0);
  robotGroup.add(shoulderBar);

  // 4. Hip Base
  const hipGeo = new THREE.BoxGeometry(0.6, 0.12, 0.3);
  const hip = new THREE.Mesh(hipGeo, metalMat);
  hip.position.set(0, -0.15, 0);
  robotGroup.add(hip);

  // ==========================================
  // ===== INTERACTIVE NODES (GROUPS) =========
  // ==========================================

  // --- NODE: HEAD & FACE & BRAIN ---
  const headNode = new THREE.Group();
  headNode.position.copy(nodeCoordinates.head);
  headNode.userData = { nodeName: 'head' };

  // Glass skull
  const skullGeo = new THREE.SphereGeometry(0.24, 32, 32);
  const skull = new THREE.Mesh(skullGeo, glassMat);
  headNode.add(skull);

  // Glowing eyes
  const eyeLeftGeo = new THREE.SphereGeometry(0.035, 16, 16);
  const eyeLeft = new THREE.Mesh(eyeLeftGeo, cyanGlowMat);
  eyeLeft.position.set(-0.08, 0.04, 0.18);
  headNode.add(eyeLeft);

  const eyeRight = eyeLeft.clone();
  eyeRight.position.x = 0.08;
  headNode.add(eyeRight);

  // Visual Circuit Plate
  const plateGeo = new THREE.BoxGeometry(0.12, 0.02, 0.12);
  const plate = new THREE.Mesh(plateGeo, metalMat);
  plate.position.y = -0.15;
  headNode.add(plate);

  // BRAIN Node (inside head)
  const brainNode = new THREE.Group();
  brainNode.position.copy(nodeCoordinates.brain);
  brainNode.userData = { nodeName: 'brain' };

  // Neural particle core
  const brainCoreGeo = new THREE.SphereGeometry(0.13, 16, 16);
  const brainCore = new THREE.Mesh(brainCoreGeo, wireframeCyanMat);
  brainNode.add(brainCore);

  const brainCenterGeo = new THREE.SphereGeometry(0.07, 16, 16);
  const brainCenter = new THREE.Mesh(brainCenterGeo, purpleGlowMat);
  brainNode.add(brainCenter);

  robotGroup.add(headNode);
  robotGroup.add(brainNode);

  // --- NODE: RIGHT CHEST (PROJECTS) ---
  const rChestNode = new THREE.Group();
  rChestNode.position.copy(nodeCoordinates.rightChest);
  rChestNode.userData = { nodeName: 'rightChest' };

  const rChestPlateGeo = new THREE.BoxGeometry(0.24, 0.32, 0.12);
  const rChestPlate = new THREE.Mesh(rChestPlateGeo, metalMat);
  rChestNode.add(rChestPlate);

  const rChestFrame = new THREE.Mesh(rChestPlateGeo.clone().scale(1.02, 1.02, 1.02), wireframeCyanMat);
  rChestNode.add(rChestFrame);

  const rChestCoreGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.05, 12);
  rChestCoreGeo.rotateX(Math.PI / 2);
  const rChestCore = new THREE.Mesh(rChestCoreGeo, cyanGlowMat);
  rChestCore.position.z = 0.06;
  rChestNode.add(rChestCore);

  robotGroup.add(rChestNode);

  // --- NODE: LEFT CHEST (CREDENTIALS) ---
  const lChestNode = new THREE.Group();
  lChestNode.position.copy(nodeCoordinates.leftChest);
  lChestNode.userData = { nodeName: 'leftChest' };

  const lChestPlate = new THREE.Mesh(rChestPlateGeo, metalMat);
  lChestNode.add(lChestPlate);

  const lChestFrame = new THREE.Mesh(rChestPlateGeo.clone().scale(1.02, 1.02, 1.02), wireframeMagentaMat);
  lChestNode.add(lChestFrame);

  const lChestCore = new THREE.Mesh(rChestCoreGeo, magentaGlowMat);
  lChestCore.position.z = 0.06;
  lChestNode.add(lChestCore);

  robotGroup.add(lChestNode);

  // --- NODE: RIGHT HAND (RESUME) ---
  const rHandNode = new THREE.Group();
  rHandNode.position.copy(nodeCoordinates.rightHand);
  rHandNode.userData = { nodeName: 'rightHand' };

  // Hand base connector
  const handBaseGeo = new THREE.SphereGeometry(0.07, 16, 16);
  const handBase = new THREE.Mesh(handBaseGeo, metalMat);
  rHandNode.add(handBase);

  // Floating glowing console orb
  const orbGeo = new THREE.TorusGeometry(0.11, 0.015, 8, 24);
  const handOrb = new THREE.Mesh(orbGeo, cyanGlowMat);
  handOrb.rotation.x = Math.PI / 2;
  rHandNode.add(handOrb);

  const innerOrbGeo = new THREE.SphereGeometry(0.045, 16, 16);
  const innerOrb = new THREE.Mesh(innerOrbGeo, purpleGlowMat);
  rHandNode.add(innerOrb);

  robotGroup.add(rHandNode);

  // Left hand connector (passive)
  const lHand = new THREE.Mesh(handBaseGeo, metalMat);
  lHand.position.set(-1.05, -0.05, 0);
  robotGroup.add(lHand);

  // Passive Upper/Forearms
  const upperArmGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.45, 8);
  const forearmGeo = new THREE.CylinderGeometry(0.04, 0.03, 0.45, 8);

  const rUpper = new THREE.Mesh(upperArmGeo, metalMat);
  rUpper.position.set(0.8, 0.65, 0);
  rUpper.rotation.z = -Math.PI / 4;
  robotGroup.add(rUpper);

  const rFore = new THREE.Mesh(forearmGeo, metalMat);
  rFore.position.set(0.95, 0.25, 0);
  rFore.rotation.z = -Math.PI / 8;
  robotGroup.add(rFore);

  const lUpper = new THREE.Mesh(upperArmGeo, metalMat);
  lUpper.position.set(-0.8, 0.65, 0);
  lUpper.rotation.z = Math.PI / 4;
  robotGroup.add(lUpper);

  const lFore = new THREE.Mesh(forearmGeo, metalMat);
  lFore.position.set(-0.95, 0.25, 0);
  lFore.rotation.z = Math.PI / 8;
  robotGroup.add(lFore);

  // --- NODE: CORE REACTOR (STOMACH / JOURNEY) ---
  const coreReactorNode = new THREE.Group();
  coreReactorNode.position.copy(nodeCoordinates.coreReactor);
  coreReactorNode.userData = { nodeName: 'coreReactor' };

  // Spin rings gyroscope
  const ring1Geo = new THREE.TorusGeometry(0.18, 0.015, 8, 24);
  const ring1 = new THREE.Mesh(ring1Geo, cyanGlowMat);
  ring1.name = "gyroRing1";
  coreReactorNode.add(ring1);

  const ring2Geo = new THREE.TorusGeometry(0.14, 0.015, 8, 24);
  const ring2 = new THREE.Mesh(ring2Geo, magentaGlowMat);
  ring2.name = "gyroRing2";
  ring2.rotation.x = Math.PI / 2;
  coreReactorNode.add(ring2);

  const energyCoreGeo = new THREE.SphereGeometry(0.08, 32, 32);
  const energyCore = new THREE.Mesh(energyCoreGeo, purpleGlowMat);
  coreReactorNode.add(energyCore);

  robotGroup.add(coreReactorNode);

  // --- NODE: LEFT LEG (CONTACT) ---
  const lLegNode = new THREE.Group();
  lLegNode.position.copy(nodeCoordinates.leftLeg);
  lLegNode.userData = { nodeName: 'leftLeg' };

  const legGeo = new THREE.CylinderGeometry(0.06, 0.04, 0.8, 12);
  const lLeg = new THREE.Mesh(legGeo, metalMat);
  lLegNode.add(lLeg);

  // glowing bands
  const bandGeo = new THREE.TorusGeometry(0.062, 0.01, 8, 16);
  bandGeo.rotateX(Math.PI / 2);
  const bandL1 = new THREE.Mesh(bandGeo, magentaGlowMat);
  bandL1.position.y = 0.2;
  lLegNode.add(bandL1);

  const bandL2 = bandL1.clone();
  bandL2.position.y = -0.2;
  lLegNode.add(bandL2);

  robotGroup.add(lLegNode);

  // --- NODE: RIGHT LEG (GOALS) ---
  const rLegNode = new THREE.Group();
  rLegNode.position.copy(nodeCoordinates.rightLeg);
  rLegNode.userData = { nodeName: 'rightLeg' };

  const rLeg = new THREE.Mesh(legGeo, metalMat);
  rLegNode.add(rLeg);

  const bandR1 = new THREE.Mesh(bandGeo, cyanGlowMat);
  bandR1.position.y = 0.2;
  rLegNode.add(bandR1);

  const bandR2 = bandR1.clone();
  bandR2.position.y = -0.2;
  rLegNode.add(bandR2);

  robotGroup.add(rLegNode);

  // Populate interactive elements array for Raycaster
  interactiveObjects = [
    headNode, brainNode, rChestNode, lChestNode, rHandNode, coreReactorNode, lLegNode, rLegNode
  ];

  scene.add(robotGroup);

  // Set up offset initial positions for boot scatter effect
  headNode.position.y += 4.5;
  brainNode.position.y += 4.5;
  rChestNode.position.x += 4.0;
  lChestNode.position.x -= 4.0;
  rHandNode.position.x += 3.5;
  rHandNode.position.y -= 2.0;
  coreReactorNode.position.z -= 7.0;
  lLegNode.position.y -= 4.0;
  rLegNode.position.y -= 4.0;
}

// Assemble parts with GSAP
function assembleRobot() {
  const duration = 1.8;
  const ease = "elastic.out(1, 0.75)";

  gsap.to(robotGroup.children.find(c => c.userData.nodeName === 'head').position, {
    y: nodeCoordinates.head.y, duration, ease
  });
  gsap.to(robotGroup.children.find(c => c.userData.nodeName === 'brain').position, {
    y: nodeCoordinates.brain.y, duration, ease
  });
  gsap.to(robotGroup.children.find(c => c.userData.nodeName === 'rightChest').position, {
    x: nodeCoordinates.rightChest.x, duration, ease
  });
  gsap.to(robotGroup.children.find(c => c.userData.nodeName === 'leftChest').position, {
    x: nodeCoordinates.leftChest.x, duration, ease
  });
  gsap.to(robotGroup.children.find(c => c.userData.nodeName === 'rightHand').position, {
    x: nodeCoordinates.rightHand.x, y: nodeCoordinates.rightHand.y, duration, ease
  });
  gsap.to(robotGroup.children.find(c => c.userData.nodeName === 'coreReactor').position, {
    z: nodeCoordinates.coreReactor.z, duration, ease
  });
  gsap.to(robotGroup.children.find(c => c.userData.nodeName === 'leftLeg').position, {
    y: nodeCoordinates.leftLeg.y, duration, ease
  });
  gsap.to(robotGroup.children.find(c => c.userData.nodeName === 'rightLeg').position, {
    y: nodeCoordinates.rightLeg.y, duration, ease
  });

  // Reveal HUD labels after assembly completes
  setTimeout(() => {
    document.querySelectorAll('.holo-label-tag').forEach(tag => {
      tag.classList.add('visible');
    });
  }, 1500);
}

/* ===================================================================
   ANIMATION TICK LOOP
   =================================================================== */
function animate(time) {
  if (!isLoopRunning) return;
  requestAnimationFrame(animate);

  const t = time * 0.001;

  // Orbit controls update
  controls.update();

  // Subtle background galaxy rotation
  if (starfieldGalaxy) {
    starfieldGalaxy.rotation.y = t * 0.015;
  }

  // Idle robot breathing / rotation movements (only in default state)
  if (robotGroup && currentState === 'orbit' && isLoaded) {
    robotGroup.position.y = Math.sin(t * 1.5) * 0.04;
    robotGroup.rotation.y = Math.cos(t * 0.6) * 0.03;
  }

  // Animate Gyroscope stomach core rings
  if (robotGroup) {
    const core = robotGroup.children.find(c => c.userData.nodeName === 'coreReactor');
    if (core) {
      const ring1 = core.getObjectByName("gyroRing1");
      const ring2 = core.getObjectByName("gyroRing2");
      if (ring1) ring1.rotation.y = t * 1.5;
      if (ring2) ring2.rotation.x = t * 2.0;
    }
  }

  // Update holographic screen overlays
  updateFloatingLabels();

  renderer.render(scene, camera);
}

// Loop rendering manager to pause WebGL CPU consumption when details are loaded
function startLoop() {
  if (!isLoopRunning) {
    isLoopRunning = true;
    requestAnimationFrame(animate);
  }
}

function stopLoop() {
  isLoopRunning = false;
}

// GFX Mode controls
function toggleGfxMode() {
  gfxMode = gfxMode === 'ultra' ? 'eco' : 'ultra';
  
  // Re-configure renderer pixel ratio
  const maxDPR = gfxMode === 'eco' ? 1.0 : 1.35;
  if (renderer) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));
  }
  
  // Re-build galaxy with optimized particle counts
  rebuildGalaxyBackground();
  
  // Update button classes
  const gfxBtn = document.getElementById('gfx-toggle');
  if (gfxBtn) {
    gfxBtn.classList.toggle('eco-active', gfxMode === 'eco');
    gfxBtn.innerHTML = gfxMode === 'eco' ? '<i class="fas fa-leaf"></i>' : '<i class="fas fa-bolt"></i>';
  }
  
  // Play click audio feedback
  synth.playClick();
  
  if (voice.enabled) {
    voice.speak(`Graphics quality set to ${gfxMode === 'eco' ? 'efficiency' : 'high definition'}.`);
  }
}

function rebuildGalaxyBackground() {
  if (starfieldGalaxy && scene) {
    scene.remove(starfieldGalaxy);
    starfieldGalaxy.geometry.dispose();
    starfieldGalaxy.material.dispose();
  }
  buildGalaxyBackground();
}

// Window resizing
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  const maxDPR = gfxMode === 'eco' ? 1.0 : 1.35;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));
}

/* ===================================================================
   DYNAMIC COORDINATES FLOATING LABELS
   =================================================================== */
const tempV = new THREE.Vector3();
function updateFloatingLabels() {
  if (!robotGroup) return;

  // OPTIMIZATION: If not in orbit mode, immediately hide all tags and return,
  // bypassing expensive matrix multiplications and projections.
  if (currentState !== 'orbit' || !isLoaded) {
    document.querySelectorAll('.holo-label-tag').forEach(el => el.classList.remove('visible'));
    return;
  }

  const widthHalf = window.innerWidth / 2;
  const heightHalf = window.innerHeight / 2;

  for (const [nodeName, pos] of Object.entries(nodeCoordinates)) {
    const el = document.getElementById(`tag-${nodeName}`);
    if (!el) continue;

    // Fetch absolute global coordinates
    tempV.copy(pos);

    // Find matching child group in robotGroup
    const groupChild = robotGroup.children.find(c => c.userData.nodeName === nodeName);
    if (groupChild) {
      tempV.copy(groupChild.position);
    }

    tempV.applyMatrix4(robotGroup.matrixWorld);
    tempV.project(camera);

    // If node is behind camera, hide it
    if (tempV.z > 1) {
      el.classList.remove('visible');
      continue;
    }

    const x = (tempV.x * widthHalf) + widthHalf;
    const y = -(tempV.y * heightHalf) + heightHalf;

    // Apply coordinate style updates
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    // Only display overlays when zoomed out and boot initialized
    el.classList.add('visible');
  }
}

/* ===================================================================
   SVG NEURAL NETWORK DRAWING (SKILLS PANEL)
   =================================================================== */
const skillDescriptions = {
  core: "BRAIN CORE: The primary link of Akshai's cognitive resources and logic loops. Tap on any peripheral skill node in the diagram to fetch telemetry specs.",
  python: "PYTHON DECODER: 75% stability. Utilized in B.Tech CSE (AI) projects to build the Trip Budget Guessing system, automate terminal utilities, and create RegEx conversational chatbot clients.",
  c: "C LANGUAGE DECODER: 70% stability. Engineered procedural file-stream quiz modules, memory pointers, and structured class templates for undergraduate challenges.",
  cpp: "C++ DECODER: 65% stability. Utilized for object-oriented abstractions, data structural logs, and optimized competitive programming parameters.",
  mysql: "MYSQL SYSTEM DECODER: 60% stability. Configured relational table indexing, query optimizations, and structured storage schemas for university platforms.",
  vscode: "VS CODE ENVIRONMENT: 80% stability. Configuration of primary workspace, extension sets, remote terminal debugging, and multi-language compilation parameters.",
  git: "GIT VCS DECODER: 60% stability. Version control configuration, remote repository commits, branch rebasing, and GitHub collaboration workflows."
};

function initNeuralSkillsMap() {
  const svg = document.getElementById('neural-svg-map');
  if (!svg) return;

  const width = 400;
  const height = 240;

  const nodes = [
    { id: 'core', label: 'BRAIN CORE', x: width / 2, y: height / 2, r: 12, color: '#9d00ff' },
    { id: 'python', label: 'PYTHON', x: 80, y: 60, r: 8, color: '#00f0ff' },
    { id: 'c', label: 'C LANG', x: 100, y: 175, r: 8, color: '#00f0ff' },
    { id: 'cpp', label: 'C++', x: 300, y: 65, r: 8, color: '#00f0ff' },
    { id: 'mysql', label: 'MYSQL', x: 320, y: 170, r: 8, color: '#00f0ff' },
    { id: 'vscode', label: 'VS CODE', x: width / 2, y: 35, r: 8, color: '#ff007f' },
    { id: 'git', label: 'GIT/GITHUB', x: width / 2, y: 205, r: 8, color: '#ff007f' }
  ];

  // Draw connector lines first
  nodes.forEach(node => {
    if (node.id === 'core') return;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', nodes[0].x);
    line.setAttribute('y1', nodes[0].y);
    line.setAttribute('x2', node.x);
    line.setAttribute('y2', node.y);
    line.setAttribute('stroke', 'rgba(0, 240, 255, 0.15)');
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-dasharray', '5 5');

    // Add glowing animated data flows
    line.style.animation = 'dashFlow 3s infinite linear';
    svg.appendChild(line);
  });

  // Draw nodes circles and text
  nodes.forEach(node => {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.cursor = 'pointer';

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('r', node.r);
    circle.setAttribute('fill', 'rgba(10,10,25,0.8)');
    circle.setAttribute('stroke', node.color);
    circle.setAttribute('stroke-width', '2');
    circle.style.transition = 'all 0.3s';

    const glowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    glowFilter.setAttribute('cx', node.x);
    glowFilter.setAttribute('cy', node.y);
    glowFilter.setAttribute('r', node.r + 4);
    glowFilter.setAttribute('fill', 'transparent');
    glowFilter.setAttribute('stroke', node.color);
    glowFilter.setAttribute('stroke-width', '1');
    glowFilter.setAttribute('opacity', '0.25');

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', node.x);
    text.setAttribute('y', node.y + (node.id === 'core' || node.y > height / 2 ? node.r + 14 : -node.r - 8));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#8d8da5');
    text.setAttribute('font-size', node.id === 'core' ? '8px' : '7px');
    text.setAttribute('font-family', 'JetBrains Mono');
    text.setAttribute('font-weight', '700');
    text.textContent = node.label;

    group.appendChild(glowFilter);
    group.appendChild(circle);
    group.appendChild(text);

    // Skill hover effects
    group.addEventListener('mouseenter', () => {
      synth.playHover();
      circle.setAttribute('r', node.r + 3);
      circle.setAttribute('fill', node.color);
      text.setAttribute('fill', '#fff');
    });

    group.addEventListener('mouseleave', () => {
      circle.setAttribute('r', node.r);
      circle.setAttribute('fill', 'rgba(10,10,25,0.8)');
      text.setAttribute('fill', '#8d8da5');
    });

    // Skill click interaction
    group.addEventListener('click', () => {
      synth.playClick();
      
      // Update Telemetry Console
      const consoleBody = document.getElementById('skills-telemetry-body');
      if (consoleBody) {
        consoleBody.textContent = skillDescriptions[node.id];
        consoleBody.classList.remove('active-text');
        void consoleBody.offsetWidth; // Trigger reflow to restart animation
        consoleBody.classList.add('active-text');
      }

      // Highlight Corresponding Skill Bar
      document.querySelectorAll('.cyber-skill-bar-wrap').forEach(el => {
        el.classList.remove('glowing-active');
      });

      const skillBar = document.getElementById(`skill-bar-${node.id}`);
      if (skillBar) {
        skillBar.classList.add('glowing-active');
        skillBar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    svg.appendChild(group);
  });
}

/* ===================================================================
   CUSTOM CURSOR ENERGY ORB TRAIL
   =================================================================== */
function initCursorTrail() {
  const canvas = document.getElementById('cursor-canvas');
  if (!canvas) return;

  // OPTIMIZATION: Disable custom canvas particles on mobile/touch screens
  // to avoid overhead on touch events where hover does not exist.
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth < 768);
  if (isTouch) {
    canvas.style.display = 'none';
    document.body.style.cursor = 'default';
    return;
  }

  const ctx = canvas.getContext('2d');

  let mousePos = { x: 0, y: 0 };
  let cursor = { x: 0, y: 0 };
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;

    // HUD coordinates projection
    const hudCoords = document.getElementById('hud-coordinates');
    if (hudCoords) {
      const xPct = ((e.clientX / window.innerWidth) * 2 - 1).toFixed(2);
      const yPct = (-(e.clientY / window.innerHeight) * 2 + 1).toFixed(2);
      hudCoords.textContent = `X: ${xPct} Y: ${yPct} Z: 0.00`;
    }
  });

  class TrailParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 5 + 1;
      this.speedX = (Math.random() - 0.5) * 1.5;
      this.speedY = (Math.random() - 0.5) * 1.5;
      this.color = Math.random() > 0.5 ? '0, 240, 255' : '255, 0, 127';
      this.opacity = 0.8;
      this.decay = Math.random() * 0.025 + 0.015;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.opacity -= this.decay;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
      ctx.fill();
    }
  }

  function drawCursor() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Easing cursor to mouse coordinates
    cursor.x += (mousePos.x - cursor.x) * 0.25;
    cursor.y += (mousePos.y - cursor.y) * 0.25;

    // Create particles on move
    if (Math.abs(mousePos.x - cursor.x) > 0.5 || Math.abs(mousePos.y - cursor.y) > 0.5) {
      particles.push(new TrailParticle(cursor.x, cursor.y));
    }

    // Update particles
    particles = particles.filter(p => p.opacity > 0);
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Draw main glowing cursor core
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#00f0ff';
    ctx.fill();

    // Outer cursor loop ring
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, 16, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0; // reset glow
    ctx.stroke();

    requestAnimationFrame(drawCursor);
  }
  drawCursor();
}

/* ===================================================================
   RAYCASTER INTERACTION ENGINE
   =================================================================== */
const raycaster = new THREE.Raycaster();
const mouseVec = new THREE.Vector2();

window.addEventListener('mousemove', (e) => {
  if (!isLoaded || currentState === 'zoomed') return;

  // Convert mouse coordinates to normalized device coordinates (-1 to +1)
  mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouseVec, camera);
  const intersects = raycaster.intersectObjects(interactiveObjects, true);

  if (intersects.length > 0) {
    // Traverse parent groups to find interactive target name
    let obj = intersects[0].object;
    let nodeName = null;
    while (obj) {
      if (obj.userData && obj.userData.nodeName) {
        nodeName = obj.userData.nodeName;
        break;
      }
      obj = obj.parent;
    }

    if (nodeName && hoveredNode !== nodeName) {
      if (hoveredNode) resetHover(hoveredNode);
      hoveredNode = nodeName;
      triggerHover(nodeName, e.clientX, e.clientY);
    }
  } else {
    if (hoveredNode) {
      resetHover(hoveredNode);
      hoveredNode = null;
    }
  }
});

// Click detection listener
window.addEventListener('click', (e) => {
  if (!isLoaded || currentState === 'zoomed') return;

  raycaster.setFromCamera(mouseVec, camera);
  const intersects = raycaster.intersectObjects(interactiveObjects, true);

  if (intersects.length > 0) {
    let obj = intersects[0].object;
    let nodeName = null;
    while (obj) {
      if (obj.userData && obj.userData.nodeName) {
        nodeName = obj.userData.nodeName;
        break;
      }
      obj = obj.parent;
    }

    if (nodeName) {
      zoomToNode(nodeName);
    }
  }
});

function triggerHover(nodeName, screenX, screenY) {
  synth.playHover();

  // Highlight robot 3D mesh
  const childGroup = robotGroup.children.find(c => c.userData.nodeName === nodeName);
  if (childGroup) {
    gsap.to(childGroup.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.35 });
  }

  // Update tooltip content and show it
  const tooltip = document.getElementById('holo-tooltip');
  const content = tooltipContent[nodeName];
  if (tooltip && content) {
    tooltip.querySelector('.tooltip-title').textContent = content.title;
    tooltip.querySelector('.tooltip-body').textContent = content.body;
    tooltip.classList.add('visible');

    // Position tooltip offset
    tooltip.style.left = `${screenX}px`;
    tooltip.style.top = `${screenY}px`;
  }
}

function resetHover(nodeName) {
  const childGroup = robotGroup.children.find(c => c.userData.nodeName === nodeName);
  if (childGroup) {
    gsap.to(childGroup.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.35 });
  }

  const tooltip = document.getElementById('holo-tooltip');
  if (tooltip) {
    tooltip.classList.remove('visible');
  }
}

// Camera transition zoom logic
function zoomToNode(nodeName) {
  startLoop(); // Ensure rendering loop is active during camera flight transition
  currentState = 'zoomed';
  activeNode = nodeName;
  controls.enabled = false; // Disable orbit drags while viewing details

  synth.playClick();
  if (voice.enabled) voice.speak(voiceNarration[nodeName]);

  const targetFocus = cameraFocusZones[nodeName];
  if (targetFocus) {
    // Zoom camera using GSAP
    gsap.to(camera.position, {
      x: targetFocus.pos.x,
      y: targetFocus.pos.y,
      z: targetFocus.pos.z,
      duration: 1.6,
      ease: "power2.inOut"
    });

    gsap.to(controls.target, {
      x: targetFocus.target.x,
      y: targetFocus.target.y,
      z: targetFocus.target.z,
      duration: 1.6,
      ease: "power2.inOut",
      onComplete: () => {
        // Once camera zoom completes, pause rendering loop to save mobile performance
        stopLoop();
      }
    });
  }

  // Hide floating HUD instruction markers
  document.getElementById('hud-instructions').style.opacity = '0';

  // Toggle active styling on navigation navbar links
  document.querySelectorAll('.nav-link-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.node === nodeName);
  });
  
  // Toggle active styling on mobile overlay menu links too
  document.querySelectorAll('.mobile-link-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.node === nodeName);
  });

  // Display glass panel overlay & lock background scroll on mobile
  setTimeout(() => {
    const panel = document.getElementById(`panel-${nodeName}`);
    if (panel) panel.classList.add('active');
    document.body.classList.add('panel-open');
  }, 1200);
}

// Zoom out back to normal orbit coordinates
function zoomOut() {
  if (currentState !== 'zoomed') return;

  startLoop(); // Resume animation loop for zoom out camera transition

  synth.playClose();
  if (voice.enabled) voice.speak(voiceNarration.reset);

  // Close active panel overlay & restore scroll
  if (activeNode) {
    const panel = document.getElementById(`panel-${activeNode}`);
    if (panel) panel.classList.remove('active');
  }
  document.body.classList.remove('panel-open');

  currentState = 'orbit';
  activeNode = null;

  // Restore camera defaults
  gsap.to(camera.position, {
    x: 0,
    y: 0.5,
    z: 4.5,
    duration: 1.5,
    ease: "power2.inOut"
  });

  gsap.to(controls.target, {
    x: 0,
    y: 0.2,
    z: 0,
    duration: 1.5,
    ease: "power2.inOut",
    onComplete: () => {
      controls.enabled = true; // restore orbital dragging
    }
  });

  // Restore instruction banners
  document.getElementById('hud-instructions').style.opacity = '1';

  // Re-highlight navbar Home button
  document.querySelectorAll('.nav-link-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.node === 'home');
  });

  // Re-highlight mobile overlay Home button
  document.querySelectorAll('.mobile-link-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.node === 'home');
  });
}

/* ===================================================================
   INTERFACE USER INTERACTION BINDINGS
   =================================================================== */
function setupUIEvents() {
  // Panel Close buttons
  document.querySelectorAll('.panel-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      zoomOut();
    });
  });

  // ── Swipe-down to dismiss bottom-sheet panels (mobile) ──
  document.querySelectorAll('.holo-panel').forEach(panel => {
    let touchStartY = 0;
    let touchStartTime = 0;
    let isDragging = false;

    panel.addEventListener('touchstart', (e) => {
      // Only start drag when touching near top 60px (pill/header area)
      const touchY = e.touches[0].clientY;
      const panelTop = panel.getBoundingClientRect().top;
      if (touchY - panelTop < 64) {
        touchStartY = touchY;
        touchStartTime = Date.now();
        isDragging = true;
        panel.style.transition = 'none';
      }
    }, { passive: true });

    panel.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const delta = e.touches[0].clientY - touchStartY;
      if (delta > 0) {
        panel.style.transform = `translateY(${delta}px)`;
      }
    }, { passive: true });

    panel.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      panel.style.transition = '';
      const delta = e.changedTouches[0].clientY - touchStartY;
      const elapsed = Date.now() - touchStartTime;
      const velocity = delta / elapsed; // px/ms
      if (delta > 80 || velocity > 0.35) {
        panel.style.transform = '';
        zoomOut();
      } else {
        panel.style.transform = '';
      }
    }, { passive: true });
  });

  // Top Nav quick access menu buttons
  document.querySelectorAll('.nav-link-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetNode = btn.dataset.node;
      if (targetNode === 'home') {
        zoomOut();
      } else {
        if (currentState === 'zoomed' && activeNode !== targetNode) {
          // Close previous panel, zoom to new node directly
          const prevPanel = document.getElementById(`panel-${activeNode}`);
          if (prevPanel) prevPanel.classList.remove('active');
          zoomToNode(targetNode);
        } else if (currentState === 'orbit') {
          zoomToNode(targetNode);
        }
      }
    });
  });

  // Sound Toggle Button
  const soundBtn = document.getElementById('sound-toggle');
  soundBtn.addEventListener('click', () => {
    synth.enabled = !synth.enabled;
    soundBtn.classList.toggle('active', !synth.enabled);
    soundBtn.innerHTML = synth.enabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
    synth.playClick();
  });

  // Voice Assistant button
  const voiceBtn = document.getElementById('voice-assistant');
  voiceBtn.addEventListener('click', () => {
    voice.enabled = !voice.enabled;
    voiceBtn.classList.toggle('active', voice.enabled);
    synth.playClick();
    
    // Toggle HUD display card
    const voiceCard = document.getElementById('hud-voice-card');
    if (voiceCard) {
      voiceCard.style.display = voice.enabled ? 'block' : 'none';
    }

    if (voice.enabled) {
      voice.speak("Voice recognition link engaged.");
      
      // Lazily initialize voice controller
      if (!voiceRecognition) {
        initVoiceAssistant();
      }
      
      // Start listening
      if (voiceRecognition) {
        try {
          voiceRecognition.start();
        } catch (e) {
          // Already listening
        }
      }
    } else {
      voice.speak("Voice recognition link terminated.");
      if (voiceRecognition) {
        try {
          voiceRecognition.stop();
        } catch (e) {
          // Already stopped
        }
      }
      updateVoiceHUDStatus("STANDBY", "pulse-dot-purple");
    }
  });

  // GFX Performance Toggle
  const gfxBtn = document.getElementById('gfx-toggle');
  if (gfxBtn) {
    if (gfxMode === 'eco') {
      gfxBtn.classList.add('eco-active');
      gfxBtn.innerHTML = '<i class="fas fa-leaf"></i>';
    }
    gfxBtn.addEventListener('click', () => {
      toggleGfxMode();
    });
  }

  // Mobile Hamburger Menu Toggle
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mobileClose = document.getElementById('mobile-menu-close');
  const mobileOverlay = document.getElementById('mobile-menu-overlay');

  if (mobileToggle && mobileOverlay) {
    mobileToggle.addEventListener('click', () => {
      synth.playClick();
      const isOpen = mobileOverlay.classList.contains('open');
      if (isOpen) {
        mobileOverlay.classList.remove('open');
        mobileToggle.classList.remove('open');
      } else {
        mobileOverlay.classList.add('open');
        mobileToggle.classList.add('open');
      }
    });
  }

  if (mobileClose && mobileOverlay && mobileToggle) {
    mobileClose.addEventListener('click', () => {
      synth.playClose();
      mobileOverlay.classList.remove('open');
      mobileToggle.classList.remove('open');
    });
  }

  // Mobile Overlay Link click handlers
  document.querySelectorAll('.mobile-link-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetNode = btn.dataset.node;
      
      // Close overlay menu
      if (mobileOverlay && mobileToggle) {
        mobileOverlay.classList.remove('open');
        mobileToggle.classList.remove('open');
      }

      if (targetNode === 'home') {
        zoomOut();
      } else {
        if (currentState === 'zoomed' && activeNode !== targetNode) {
          const prevPanel = document.getElementById(`panel-${activeNode}`);
          if (prevPanel) prevPanel.classList.remove('active');
          zoomToNode(targetNode);
        } else if (currentState === 'orbit') {
          zoomToNode(targetNode);
        }
      }
    });
  });

  // Projects Inner Tabs
  document.querySelectorAll('.cyber-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      synth.playClick();

      const parent = btn.closest('.holo-panel');
      parent.querySelectorAll('.cyber-tab-btn').forEach(b => b.classList.remove('active'));
      parent.querySelectorAll('.tab-panel-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // Contact Form Dispatch Submission
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('contact-submit-btn');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> TRANSMITTING...';
      submitBtn.disabled = true;

      try {
        await emailjs.sendForm('service_rcz156m', 'template_6j7way7', contactForm);
        synth.playSuccess();
        if (voice.enabled) voice.speak("Transmission successfully dispatched.");
        submitBtn.innerHTML = '<i class="fas fa-check"></i> TRANSMISSION DELIVERED';
        submitBtn.style.borderColor = 'var(--neon-green)';
        submitBtn.style.color = 'var(--neon-green)';
      } catch (error) {
        console.error('EmailJS Error:', error);
        submitBtn.innerHTML = '<i class="fas fa-times"></i> DELAY ENCOUNTERED';
        submitBtn.style.borderColor = 'var(--neon-magenta)';
        submitBtn.style.color = 'var(--neon-magenta)';
      }

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        submitBtn.style.borderColor = '';
        submitBtn.style.color = '';
        contactForm.reset();
      }, 3500);
    });
  }

  // Resume Download Button Placeholder click
  const resumeBtn = document.getElementById('resume-download-btn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      synth.playClick();
      alert('Resume file transfer node active. Download will begin shortly once PDF asset link is updated.');
    });
  }
}

/* ===================================================================
   CERTIFICATES SECURE IMAGE VAULT VIEWER
   =================================================================== */
window.openCertImageModal = function (imageSrc, captionText) {
  synth.playClick();
  const modal = document.getElementById('cert-image-modal');
  const modalImg = document.getElementById('modal-cert-img');
  const caption = document.getElementById('modal-cert-caption');

  if (modal && modalImg && caption) {
    modal.style.display = 'block';
    modalImg.src = imageSrc;
    caption.innerText = captionText;
  }
};

window.closeCertImageModal = function () {
  synth.playClose();
  const modal = document.getElementById('cert-image-modal');
  if (modal) modal.style.display = 'none';
};

// Listen to keyboard Escape exits
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCertImageModal();
    if (currentState === 'zoomed') {
      zoomOut();
    }
  }
});

/* ===================================================================
   NATIVE SPEECH RECOGNITION COMMAND LISTENERS
   =================================================================== */
function initVoiceAssistant() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("Speech Recognition not supported on this browser context.");
    const voiceCard = document.getElementById('hud-voice-card');
    if (voiceCard) voiceCard.style.display = 'none';
    return;
  }

  voiceRecognition = new SpeechRecognition();
  voiceRecognition.continuous = true;
  voiceRecognition.interimResults = false;
  voiceRecognition.lang = 'en-US';

  voiceRecognition.onstart = () => {
    updateVoiceHUDStatus("LISTENING", "pulse-dot-green");
  };

  voiceRecognition.onresult = (event) => {
    const lastResultIndex = event.results.length - 1;
    const commandText = event.results[lastResultIndex][0].transcript.trim().toLowerCase();
    console.log("Voice Command Recognized:", commandText);
    
    updateVoiceHUDStatus("PROCESSING...", "pulse-dot-purple");
    processVoiceCommand(commandText);
    
    setTimeout(() => {
      if (voiceRecognition && voice.enabled) {
        updateVoiceHUDStatus("LISTENING", "pulse-dot-green");
      }
    }, 1500);
  };

  voiceRecognition.onerror = (event) => {
    console.error("Speech Recognition Error:", event.error);
    if (event.error === 'not-allowed') {
      voice.enabled = false;
      updateVoiceHUDStatus("MIC BLOCKED", "pulse-dot-red");
      const voiceBtn = document.getElementById('voice-assistant');
      if (voiceBtn) voiceBtn.classList.remove('active');
      voice.speak("Microphone access was denied. Please check your browser settings.");
    }
  };

  voiceRecognition.onend = () => {
    if (voice.enabled && voiceRecognition) {
      try {
        voiceRecognition.start();
      } catch (e) {
        // Already starting
      }
    } else {
      updateVoiceHUDStatus("STANDBY", "pulse-dot-purple");
    }
  };
}

function updateVoiceHUDStatus(text, dotClass) {
  const voiceStatus = document.getElementById('hud-voice-status');
  if (voiceStatus) {
    let dotColor = 'var(--neon-purple)';
    if (dotClass === 'pulse-dot-green') dotColor = 'var(--neon-green)';
    if (dotClass === 'pulse-dot-red') dotColor = 'var(--neon-magenta)';
    
    voiceStatus.innerHTML = `<span style="width:6px; height:6px; background:${dotColor}; border-radius:50%; box-shadow: 0 0 8px ${dotColor}; display:inline-block; margin-right:6px; animation: glowPulse 1.5s infinite alternate;"></span> ${text}`;
  }
}

function processVoiceCommand(phrase) {
  const clean = phrase.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
  
  if (clean.includes("about") || clean.includes("profile") || clean.includes("bio") || clean.includes("biography") || clean.includes("who are you")) {
    navigateFromVoice("head");
  } else if (clean.includes("skill") || clean.includes("languages") || clean.includes("tools") || clean.includes("abilities")) {
    navigateFromVoice("brain");
  } else if (clean.includes("project") || clean.includes("repositories") || clean.includes("apps") || clean.includes("work")) {
    navigateFromVoice("rightChest");
  } else if (clean.includes("certificate") || clean.includes("credentials") || clean.includes("hackathon") || clean.includes("achievements")) {
    navigateFromVoice("leftChest");
  } else if (clean.includes("resume") || clean.includes("cv") || clean.includes("academic") || clean.includes("education")) {
    navigateFromVoice("rightHand");
  } else if (clean.includes("journey") || clean.includes("roadmap") || clean.includes("timeline") || clean.includes("path")) {
    navigateFromVoice("coreReactor");
  } else if (clean.includes("contact") || clean.includes("email") || clean.includes("message") || clean.includes("social")) {
    navigateFromVoice("leftLeg");
  } else if (clean.includes("goal") || clean.includes("objectives") || clean.includes("future") || clean.includes("mission")) {
    navigateFromVoice("rightLeg");
  } else if (clean.includes("home") || clean.includes("back") || clean.includes("close") || clean.includes("reset") || clean.includes("exit")) {
    navigateFromVoice("home");
  }
}

function navigateFromVoice(nodeName) {
  if (nodeName === 'home') {
    if (currentState === 'zoomed') {
      zoomOut();
    }
  } else {
    if (currentState === 'zoomed' && activeNode !== nodeName) {
      const prevPanel = document.getElementById(`panel-${activeNode}`);
      if (prevPanel) prevPanel.classList.remove('active');
      zoomToNode(nodeName);
    } else if (currentState === 'orbit') {
      zoomToNode(nodeName);
    }
  }
}
