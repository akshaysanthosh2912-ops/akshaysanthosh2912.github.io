/* ===================================================================
   PORTFOLIO LOGIC — Three.js WebGL, GSAP, Web Audio Synth, AI Voice
   Premium AI Engineer Portfolio v3.0
   =================================================================== */

// Global state
let scene, camera, renderer, controls;
let robotGroup;
let starfieldGalaxy;
let interactiveObjects = [];
let hoveredNode = null;
let activeNode = null;
let currentState = 'orbit';
let isLoaded = false;
let gfxMode = 'ultra';
let isMobile = false;
let isLoopRunning = true;
let voiceRecognition = null;

// Typing effect state
const heroRoles = [
  'AI Engineering Student',
  'Aspiring AI Research Engineer',
  'Machine Learning Enthusiast',
  'Open Source Developer',
  'Future Robotics Engineer'
];
let currentRoleIndex = 0;
let typingCharIndex = 0;
let isTypingDeleting = false;
let typingTimeout = null;

// Animated counter tracking
const activeCounters = new Set();

// Mobile detection
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

// 3D coordinate mappings
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

const tooltipContent = {
  head: { title: "Neural Profile", body: "Akshai Santhosh. AI Engineering Student. Click to load bio archives." },
  brain: { title: "Cognitive Core", body: "Programming, AI/ML, Web Dev & Tool competencies. Click to run analytics." },
  rightChest: { title: "Projects Node", body: "5 active projects, 2 innovation concepts. Click to map files." },
  leftChest: { title: "Credentials Vault", body: "NASA, SIH Hackathon certificates. Click to scan vault." },
  rightHand: { title: "Resume Module", body: "Academic timeline & career parameters. Click to access PDF." },
  coreReactor: { title: "Journey Reactor", body: "Chronological progression from code to AI research. Click to stabilize." },
  leftLeg: { title: "Comms Console", body: "Interactive mail gateway and social link array. Click to transmit." },
  rightLeg: { title: "Mission Objectives", body: "Short and long term operational goals mapped. Click to inspect." }
};

const voiceNarration = {
  welcome: "System initialized. Welcome to Akshai's Neural Portfolio. Select a body node to begin data exploration.",
  head: "Profile node accessed. Biographical archives online.",
  brain: "Cognitive core accessed. Neural skill matrix loaded with all categories.",
  rightChest: "Projects database active. Five repositories and two innovation concepts mapped.",
  leftChest: "Credentials vault unlocked. NASA and Smart India Hackathon records verified.",
  rightHand: "Resume module loaded. Academic timeline and career parameters ready.",
  coreReactor: "Journey chronologer online. Six phase progression from first code to AI research.",
  leftLeg: "Communication console engaged. Neural uplink terminal waiting for input.",
  rightLeg: "Future objectives mapped. Eight mission parameters loaded.",
  reset: "Returning camera core to default orbital coordinates."
};

/* ===================================================================
   WEB AUDIO SYNTHESIZER
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
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.035, ctx.currentTime);
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
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);

    setTimeout(() => {
      if (!this.ctx) return;
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
    osc.frequency.setValueAtTime(380, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.055, ctx.currentTime);
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
    const chord = [523.25, 659.25, 783.99, 1046.50];
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.045, ctx.currentTime);
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
   AI SPEECH SYNTHESIS
   =================================================================== */
class AIVoice {
  constructor() {
    this.enabled = false;
    this.synth = window.speechSynthesis;
  }
  speak(text) {
    if (!this.enabled || !this.synth) return;
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = this.synth.getVoices();
    const chosenVoice = voices.find(v =>
      v.name.includes('Google US English') || v.name.includes('Female') || v.lang.startsWith('en-')
    );
    if (chosenVoice) utterance.voice = chosenVoice;
    utterance.pitch = 0.95;
    utterance.rate = 1.02;
    this.synth.speak(utterance);
  }
}
const voice = new AIVoice();

/* ===================================================================
   INITIALIZATION
   =================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initThree();
  initCursorTrail();
  setupUIEvents();
  simulateBootProgress();
  initTypingEffect();
  initHeroCounters();
});

/* ===================================================================
   TYPING EFFECT
   =================================================================== */
function initTypingEffect() {
  const el = document.getElementById('typing-role');
  if (!el) return;

  function typeNextChar() {
    const currentRole = heroRoles[currentRoleIndex];

    if (!isTypingDeleting) {
      // Typing forward
      if (typingCharIndex < currentRole.length) {
        el.textContent = currentRole.slice(0, typingCharIndex + 1);
        typingCharIndex++;
        typingTimeout = setTimeout(typeNextChar, 65);
      } else {
        // Pause then start deleting
        typingTimeout = setTimeout(() => {
          isTypingDeleting = true;
          typeNextChar();
        }, 2200);
      }
    } else {
      // Deleting
      if (typingCharIndex > 0) {
        el.textContent = currentRole.slice(0, typingCharIndex - 1);
        typingCharIndex--;
        typingTimeout = setTimeout(typeNextChar, 40);
      } else {
        isTypingDeleting = false;
        currentRoleIndex = (currentRoleIndex + 1) % heroRoles.length;
        typingTimeout = setTimeout(typeNextChar, 350);
      }
    }
  }

  // Start after a short delay
  setTimeout(typeNextChar, 1500);
}

/* ===================================================================
   HERO COUNTER ANIMATION
   =================================================================== */
function initHeroCounters() {
  const counters = document.querySelectorAll('.mini-stat-num[data-count]');
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.count);
    animateCounterEl(counter, target, 1800);
  });
}

function animateCounterEl(el, target, duration) {
  const start = performance.now();
  const startVal = 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
    const current = Math.floor(startVal + (target - startVal) * eased);
    el.textContent = current;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }

  requestAnimationFrame(update);
}

// Animate about-stat counters when the panel opens
function animateAboutStatCounters() {
  const statEls = document.querySelectorAll('.about-stat-num[data-target]');
  statEls.forEach(el => {
    if (activeCounters.has(el)) return;
    activeCounters.add(el);
    const target = parseInt(el.dataset.target);
    animateCounterEl(el, target, 1200);
  });
}

/* ===================================================================
   BOOT SEQUENCE
   =================================================================== */
function simulateBootProgress() {
  const progressBar = document.querySelector('.preloader-progress');
  const percentLabel = document.querySelector('.status-pct');
  const preloader = document.getElementById('preloader');
  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 7) + 4;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);

      progressBar.style.width = '100%';
      percentLabel.textContent = '100%';

      setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        isLoaded = true;
        assembleRobot();

        document.body.addEventListener('click', () => {
          synth.init();
        }, { once: true });

        setTimeout(() => {
          if (voice.enabled) voice.speak(voiceNarration.welcome);
        }, 1000);
      }, 700);
    } else {
      progressBar.style.width = `${progress}%`;
      percentLabel.textContent = `${progress.toString().padStart(2, '0')}%`;
    }
  }, 75);
}

/* ===================================================================
   THREE.JS SCENE SETUP
   =================================================================== */
function initThree() {
  const container = document.getElementById('canvas-container');
  const canvas = document.getElementById('3d-canvas');

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05050a, 0.075);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.5, 4.5);

  const camLight = new THREE.PointLight(0xffffff, 1.2, 12);
  camera.add(camLight);
  scene.add(camera);

  detectMobileDevice();
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  const maxDPR = gfxMode === 'eco' ? 1.0 : 1.35;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.maxDistance = 6.5;
  controls.minDistance = 1.2;
  controls.maxPolarAngle = Math.PI / 2 + 0.1;
  controls.target.set(0, 0.2, 0);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x0a0a25, 1.3);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0x00f0ff, 1.6);
  mainLight.position.set(5, 8, 5);
  scene.add(mainLight);

  const magentaLight = new THREE.DirectionalLight(0xff007f, 1.1);
  magentaLight.position.set(-5, 5, 2);
  scene.add(magentaLight);

  const backLight = new THREE.DirectionalLight(0x9d00ff, 1.3);
  backLight.position.set(0, 2, -3);
  scene.add(backLight);

  buildGalaxyBackground();
  buildHumanoidRobot();
  animate();

  window.addEventListener('resize', onWindowResize);
}

/* ===================================================================
   GALAXY PARTICLE BACKGROUND
   =================================================================== */
function buildGalaxyBackground() {
  const particleCount = gfxMode === 'eco' ? 400 : 1400;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorCyan = new THREE.Color(0x00f0ff);
  const colorMagenta = new THREE.Color(0xff007f);
  const colorPurple = new THREE.Color(0x9d00ff);

  for (let i = 0; i < particleCount; i++) {
    const r = Math.random() * 8 + 0.8;
    const theta = Math.random() * Math.PI * 2 + (r * 0.4);
    const spread = (Math.random() - 0.5) * 0.3 * (r * 0.5);
    positions[i * 3] = Math.cos(theta) * r + spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
    positions[i * 3 + 2] = Math.sin(theta) * r + spread;

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

  // Round particle texture
  const cvs = document.createElement('canvas');
  cvs.width = 16; cvs.height = 16;
  const ctx = cvs.getContext('2d');
  const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 16, 16);
  const texture = new THREE.CanvasTexture(cvs);

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
   HUMANOID ROBOT CONSTRUCTION
   =================================================================== */
function buildHumanoidRobot() {
  robotGroup = new THREE.Group();

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x8090a8,
    metalness: 0.95,
    roughness: 0.16,
    emissive: 0x161c28,
    envMapIntensity: 1.3
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.22,
    roughness: 0.08,
    metalness: 0.2,
    depthWrite: true
  });

  const cyanGlowMat = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x00f0ff,
    emissiveIntensity: 1.8,
    roughness: 0.08
  });

  const magentaGlowMat = new THREE.MeshStandardMaterial({
    color: 0xff007f,
    emissive: 0xff007f,
    emissiveIntensity: 1.8,
    roughness: 0.08
  });

  const purpleGlowMat = new THREE.MeshStandardMaterial({
    color: 0x9d00ff,
    emissive: 0x9d00ff,
    emissiveIntensity: 1.6,
    roughness: 0.08
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

  // Spine
  const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.055, 0.9, 8), metalMat);
  spine.position.y = 0.5;
  robotGroup.add(spine);

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.18, 12), metalMat);
  neck.position.y = 1.15;
  robotGroup.add(neck);

  // Shoulder bar
  const shoulderBarGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.12, 8);
  shoulderBarGeo.rotateZ(Math.PI / 2);
  const shoulderBar = new THREE.Mesh(shoulderBarGeo, metalMat);
  shoulderBar.position.set(0, 0.95, 0);
  robotGroup.add(shoulderBar);

  // Hip base
  const hip = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.12, 0.3), metalMat);
  hip.position.set(0, -0.15, 0);
  robotGroup.add(hip);

  // ── HEAD NODE ──
  const headNode = new THREE.Group();
  headNode.position.copy(nodeCoordinates.head);
  headNode.userData = { nodeName: 'head' };

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 32), glassMat);
  headNode.add(skull);

  // Glowing eyes (eye blinking via emissive intensity animation)
  const eyeGeo = new THREE.SphereGeometry(0.036, 16, 16);
  const eyeLeft = new THREE.Mesh(eyeGeo, cyanGlowMat.clone());
  eyeLeft.name = 'eyeLeft';
  eyeLeft.position.set(-0.08, 0.04, 0.18);
  headNode.add(eyeLeft);

  const eyeRight = new THREE.Mesh(eyeGeo, cyanGlowMat.clone());
  eyeRight.name = 'eyeRight';
  eyeRight.position.set(0.08, 0.04, 0.18);
  headNode.add(eyeRight);

  // Face plate
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.12), metalMat);
  plate.position.y = -0.15;
  headNode.add(plate);

  // ── BRAIN NODE ──
  const brainNode = new THREE.Group();
  brainNode.position.copy(nodeCoordinates.brain);
  brainNode.userData = { nodeName: 'brain' };

  const brainCore = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), wireframeCyanMat);
  brainNode.add(brainCore);

  const brainCenter = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), purpleGlowMat);
  brainNode.add(brainCenter);

  robotGroup.add(headNode);
  robotGroup.add(brainNode);

  // ── RIGHT CHEST (PROJECTS) ──
  const rChestNode = new THREE.Group();
  rChestNode.position.copy(nodeCoordinates.rightChest);
  rChestNode.userData = { nodeName: 'rightChest' };

  const chestPlateGeo = new THREE.BoxGeometry(0.24, 0.32, 0.12);
  rChestNode.add(new THREE.Mesh(chestPlateGeo, metalMat));
  rChestNode.add(new THREE.Mesh(chestPlateGeo.clone().scale(1.02, 1.02, 1.02), wireframeCyanMat));

  const coreGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.05, 12);
  coreGeo.rotateX(Math.PI / 2);
  const rChestCore = new THREE.Mesh(coreGeo, cyanGlowMat);
  rChestCore.position.z = 0.06;
  rChestNode.add(rChestCore);
  robotGroup.add(rChestNode);

  // ── LEFT CHEST (CREDENTIALS) ──
  const lChestNode = new THREE.Group();
  lChestNode.position.copy(nodeCoordinates.leftChest);
  lChestNode.userData = { nodeName: 'leftChest' };

  lChestNode.add(new THREE.Mesh(chestPlateGeo, metalMat));
  lChestNode.add(new THREE.Mesh(chestPlateGeo.clone().scale(1.02, 1.02, 1.02), wireframeMagentaMat));

  const lChestCore = new THREE.Mesh(coreGeo, magentaGlowMat);
  lChestCore.position.z = 0.06;
  lChestNode.add(lChestCore);
  robotGroup.add(lChestNode);

  // ── RIGHT HAND (RESUME) ──
  const rHandNode = new THREE.Group();
  rHandNode.position.copy(nodeCoordinates.rightHand);
  rHandNode.userData = { nodeName: 'rightHand' };

  rHandNode.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), metalMat));

  const handOrb = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.015, 8, 24), cyanGlowMat);
  handOrb.rotation.x = Math.PI / 2;
  rHandNode.add(handOrb);

  rHandNode.add(new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), purpleGlowMat));
  robotGroup.add(rHandNode);

  // Left hand (passive)
  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), metalMat);
  lHand.position.set(-1.05, -0.05, 0);
  robotGroup.add(lHand);

  // Arms
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

  // ── CORE REACTOR (JOURNEY) ──
  const coreReactorNode = new THREE.Group();
  coreReactorNode.position.copy(nodeCoordinates.coreReactor);
  coreReactorNode.userData = { nodeName: 'coreReactor' };

  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.015, 8, 24), cyanGlowMat);
  ring1.name = 'gyroRing1';
  coreReactorNode.add(ring1);

  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.015, 8, 24), magentaGlowMat);
  ring2.name = 'gyroRing2';
  ring2.rotation.x = Math.PI / 2;
  coreReactorNode.add(ring2);

  coreReactorNode.add(new THREE.Mesh(new THREE.SphereGeometry(0.08, 32, 32), purpleGlowMat));
  robotGroup.add(coreReactorNode);

  // ── LEFT LEG (CONTACT) ──
  const lLegNode = new THREE.Group();
  lLegNode.position.copy(nodeCoordinates.leftLeg);
  lLegNode.userData = { nodeName: 'leftLeg' };

  lLegNode.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.8, 12), metalMat));

  const bandGeo = new THREE.TorusGeometry(0.062, 0.01, 8, 16);
  bandGeo.rotateX(Math.PI / 2);
  const bandL1 = new THREE.Mesh(bandGeo, magentaGlowMat);
  bandL1.position.y = 0.2;
  lLegNode.add(bandL1);
  const bandL2 = bandL1.clone();
  bandL2.position.y = -0.2;
  lLegNode.add(bandL2);
  robotGroup.add(lLegNode);

  // ── RIGHT LEG (GOALS) ──
  const rLegNode = new THREE.Group();
  rLegNode.position.copy(nodeCoordinates.rightLeg);
  rLegNode.userData = { nodeName: 'rightLeg' };

  rLegNode.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.8, 12), metalMat));

  const bandR1 = new THREE.Mesh(bandGeo, cyanGlowMat);
  bandR1.position.y = 0.2;
  rLegNode.add(bandR1);
  const bandR2 = bandR1.clone();
  bandR2.position.y = -0.2;
  rLegNode.add(bandR2);
  robotGroup.add(rLegNode);

  interactiveObjects = [headNode, brainNode, rChestNode, lChestNode, rHandNode, coreReactorNode, lLegNode, rLegNode];

  scene.add(robotGroup);

  // Scatter positions for boot assembly
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

/* ===================================================================
   ROBOT ASSEMBLY ANIMATION
   =================================================================== */
function assembleRobot() {
  const duration = 1.8;
  const ease = "elastic.out(1, 0.75)";

  const getNode = (name) => robotGroup.children.find(c => c.userData.nodeName === name);

  gsap.to(getNode('head').position, { y: nodeCoordinates.head.y, duration, ease });
  gsap.to(getNode('brain').position, { y: nodeCoordinates.brain.y, duration, ease });
  gsap.to(getNode('rightChest').position, { x: nodeCoordinates.rightChest.x, duration, ease });
  gsap.to(getNode('leftChest').position, { x: nodeCoordinates.leftChest.x, duration, ease });
  gsap.to(getNode('rightHand').position, { x: nodeCoordinates.rightHand.x, y: nodeCoordinates.rightHand.y, duration, ease });
  gsap.to(getNode('coreReactor').position, { z: nodeCoordinates.coreReactor.z, duration, ease });
  gsap.to(getNode('leftLeg').position, { y: nodeCoordinates.leftLeg.y, duration, ease });
  gsap.to(getNode('rightLeg').position, { y: nodeCoordinates.rightLeg.y, duration, ease });

  // Reveal HUD labels
  setTimeout(() => {
    document.querySelectorAll('.holo-label-tag').forEach(tag => tag.classList.add('visible'));
  }, 1600);

  // Show hero intro
  setTimeout(() => {
    const heroIntro = document.getElementById('hero-intro');
    if (heroIntro) heroIntro.style.opacity = '1';
  }, 1200);
}

/* ===================================================================
   ANIMATION LOOP
   =================================================================== */
let eyeBlinkTimer = 0;
let eyeBlinkState = 'open'; // 'open' | 'closing' | 'opening'
let eyeBlinkProgress = 0;

function animate(time) {
  if (!isLoopRunning) return;
  requestAnimationFrame(animate);

  const t = time * 0.001;
  controls.update();

  // Galaxy rotation
  if (starfieldGalaxy) {
    starfieldGalaxy.rotation.y = t * 0.014;
  }

  // Robot idle float + subtle rotation
  if (robotGroup && currentState === 'orbit' && isLoaded) {
    robotGroup.position.y = Math.sin(t * 1.4) * 0.045;
    robotGroup.rotation.y = Math.cos(t * 0.55) * 0.032;
  }

  // Core reactor gyroscope rings
  if (robotGroup) {
    const core = robotGroup.children.find(c => c.userData.nodeName === 'coreReactor');
    if (core) {
      const ring1 = core.getObjectByName('gyroRing1');
      const ring2 = core.getObjectByName('gyroRing2');
      if (ring1) ring1.rotation.y = t * 1.6;
      if (ring2) ring2.rotation.x = t * 2.1;
    }
  }

  // Eye blinking animation
  animateRobotEyes(t);

  updateFloatingLabels();
  renderer.render(scene, camera);
}

// Realistic eye blinking
function animateRobotEyes(t) {
  if (!robotGroup) return;

  const headNode = robotGroup.children.find(c => c.userData.nodeName === 'head');
  if (!headNode) return;

  const eyeLeft = headNode.getObjectByName('eyeLeft');
  const eyeRight = headNode.getObjectByName('eyeRight');
  if (!eyeLeft || !eyeRight) return;

  // Trigger blink every ~3.5-6 seconds
  eyeBlinkTimer += 0.016;

  if (eyeBlinkState === 'open' && eyeBlinkTimer > 3.5 + Math.sin(t * 0.3) * 1.5) {
    eyeBlinkState = 'closing';
    eyeBlinkProgress = 0;
    eyeBlinkTimer = 0;
  }

  if (eyeBlinkState === 'closing') {
    eyeBlinkProgress += 0.18;
    if (eyeBlinkProgress >= 1) {
      eyeBlinkProgress = 1;
      eyeBlinkState = 'opening';
    }
  } else if (eyeBlinkState === 'opening') {
    eyeBlinkProgress -= 0.12;
    if (eyeBlinkProgress <= 0) {
      eyeBlinkProgress = 0;
      eyeBlinkState = 'open';
    }
  }

  // Scale Y to simulate closing eyelid
  const scaleY = 1 - eyeBlinkProgress * 0.9;
  [eyeLeft, eyeRight].forEach(eye => {
    eye.scale.y = scaleY;
    eye.material.emissiveIntensity = 1.8 * (1 - eyeBlinkProgress * 0.8);
  });
}

function startLoop() {
  if (!isLoopRunning) {
    isLoopRunning = true;
    requestAnimationFrame(animate);
  }
}

function stopLoop() {
  isLoopRunning = false;
}

function toggleGfxMode() {
  gfxMode = gfxMode === 'ultra' ? 'eco' : 'ultra';
  const maxDPR = gfxMode === 'eco' ? 1.0 : 1.35;
  if (renderer) renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));
  rebuildGalaxyBackground();

  const gfxBtn = document.getElementById('gfx-toggle');
  if (gfxBtn) {
    gfxBtn.classList.toggle('eco-active', gfxMode === 'eco');
    gfxBtn.innerHTML = gfxMode === 'eco' ? '<i class="fas fa-leaf"></i>' : '<i class="fas fa-bolt"></i>';
  }
  synth.playClick();
}

function rebuildGalaxyBackground() {
  if (starfieldGalaxy && scene) {
    scene.remove(starfieldGalaxy);
    starfieldGalaxy.geometry.dispose();
    starfieldGalaxy.material.dispose();
  }
  buildGalaxyBackground();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  const maxDPR = gfxMode === 'eco' ? 1.0 : 1.35;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));
}

/* ===================================================================
   FLOATING HOLOGRAPHIC LABELS — 3D → 2D PROJECTION
   =================================================================== */
const tempV = new THREE.Vector3();

function updateFloatingLabels() {
  if (!robotGroup) return;

  if (currentState !== 'orbit' || !isLoaded) {
    document.querySelectorAll('.holo-label-tag').forEach(el => el.classList.remove('visible'));
    return;
  }

  const widthHalf = window.innerWidth / 2;
  const heightHalf = window.innerHeight / 2;

  for (const [nodeName, pos] of Object.entries(nodeCoordinates)) {
    const el = document.getElementById(`tag-${nodeName}`);
    if (!el) continue;

    const groupChild = robotGroup.children.find(c => c.userData.nodeName === nodeName);
    if (groupChild) {
      tempV.copy(groupChild.position);
    } else {
      tempV.copy(pos);
    }

    tempV.applyMatrix4(robotGroup.matrixWorld);
    tempV.project(camera);

    if (tempV.z > 1) {
      el.classList.remove('visible');
      continue;
    }

    el.style.left = `${(tempV.x * widthHalf) + widthHalf}px`;
    el.style.top = `${-(tempV.y * heightHalf) + heightHalf}px`;
    el.classList.add('visible');
  }
}

/* ===================================================================
   RAYCASTER INTERACTION ENGINE
   =================================================================== */
const raycaster = new THREE.Raycaster();
const mouseVec = new THREE.Vector2();

window.addEventListener('mousemove', (e) => {
  if (!isLoaded || currentState === 'zoomed') return;

  mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1;

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
    if (nodeName) zoomToNode(nodeName);
  }
});

// Also make floating label tags clickable
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.holo-label-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const nodeName = tag.dataset.node;
      if (nodeName) zoomToNode(nodeName);
    });
  });
});

function triggerHover(nodeName, screenX, screenY) {
  synth.playHover();

  const childGroup = robotGroup.children.find(c => c.userData.nodeName === nodeName);
  if (childGroup) {
    gsap.to(childGroup.scale, { x: 1.18, y: 1.18, z: 1.18, duration: 0.35, ease: 'back.out(2)' });
  }

  const tooltip = document.getElementById('holo-tooltip');
  const content = tooltipContent[nodeName];
  if (tooltip && content) {
    tooltip.querySelector('.tooltip-title').textContent = content.title;
    tooltip.querySelector('.tooltip-body').textContent = content.body;
    tooltip.classList.add('visible');
    tooltip.style.left = `${screenX}px`;
    tooltip.style.top = `${screenY}px`;
  }

  // Highlight the label tag
  const tag = document.getElementById(`tag-${nodeName}`);
  if (tag) tag.style.zIndex = '20';
}

function resetHover(nodeName) {
  const childGroup = robotGroup.children.find(c => c.userData.nodeName === nodeName);
  if (childGroup) {
    gsap.to(childGroup.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.35 });
  }

  const tooltip = document.getElementById('holo-tooltip');
  if (tooltip) tooltip.classList.remove('visible');

  const tag = document.getElementById(`tag-${nodeName}`);
  if (tag) tag.style.zIndex = '';
}

/* ===================================================================
   CAMERA ZOOM TO NODE
   =================================================================== */
function zoomToNode(nodeName) {
  startLoop();
  currentState = 'zoomed';
  activeNode = nodeName;
  controls.enabled = false;

  synth.playClick();
  if (voice.enabled) voice.speak(voiceNarration[nodeName]);

  const targetFocus = cameraFocusZones[nodeName];
  if (targetFocus) {
    gsap.to(camera.position, {
      x: targetFocus.pos.x,
      y: targetFocus.pos.y,
      z: targetFocus.pos.z,
      duration: 1.6,
      ease: 'power2.inOut'
    });

    gsap.to(controls.target, {
      x: targetFocus.target.x,
      y: targetFocus.target.y,
      z: targetFocus.target.z,
      duration: 1.6,
      ease: 'power2.inOut',
      onComplete: () => stopLoop()
    });
  }

  // Hide hero intro
  const heroIntro = document.getElementById('hero-intro');
  if (heroIntro) heroIntro.classList.add('hidden');

  // Hide HUD instructions
  const hudInstructions = document.getElementById('hud-instructions');
  if (hudInstructions) hudInstructions.style.opacity = '0';

  // Update nav links
  document.querySelectorAll('.nav-link-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.node === nodeName);
  });
  document.querySelectorAll('.mobile-link-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.node === nodeName);
  });

  // Open panel
  setTimeout(() => {
    const panel = document.getElementById(`panel-${nodeName}`);
    if (panel) {
      panel.classList.add('active');

      // Trigger panel-specific animations
      if (nodeName === 'head') {
        setTimeout(animateAboutStatCounters, 400);
      }
    }
    document.body.classList.add('panel-open');
  }, 1200);
}

/* ===================================================================
   ZOOM OUT BACK TO ORBIT
   =================================================================== */
function zoomOut() {
  if (currentState !== 'zoomed') return;

  startLoop();
  synth.playClose();
  if (voice.enabled) voice.speak(voiceNarration.reset);

  if (activeNode) {
    const panel = document.getElementById(`panel-${activeNode}`);
    if (panel) panel.classList.remove('active');
  }
  document.body.classList.remove('panel-open');

  currentState = 'orbit';
  activeNode = null;

  gsap.to(camera.position, {
    x: 0, y: 0.5, z: 4.5,
    duration: 1.5,
    ease: 'power2.inOut'
  });

  gsap.to(controls.target, {
    x: 0, y: 0.2, z: 0,
    duration: 1.5,
    ease: 'power2.inOut',
    onComplete: () => {
      controls.enabled = true;
    }
  });

  // Restore hero intro
  const heroIntro = document.getElementById('hero-intro');
  if (heroIntro) heroIntro.classList.remove('hidden');

  // Restore HUD
  const hudInstructions = document.getElementById('hud-instructions');
  if (hudInstructions) hudInstructions.style.opacity = '1';

  // Restore nav state
  document.querySelectorAll('.nav-link-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.node === 'home');
  });
  document.querySelectorAll('.mobile-link-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.node === 'home');
  });
}

/* ===================================================================
   UI EVENT BINDINGS
   =================================================================== */
function setupUIEvents() {
  // Panel close buttons
  document.querySelectorAll('.panel-close-btn').forEach(btn => {
    btn.addEventListener('click', () => zoomOut());
  });

  // Swipe-down to dismiss (mobile)
  document.querySelectorAll('.holo-panel').forEach(panel => {
    let touchStartY = 0;
    let touchStartTime = 0;
    let isDragging = false;

    panel.addEventListener('touchstart', (e) => {
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
      if (delta > 0) panel.style.transform = `translateY(${delta}px)`;
    }, { passive: true });

    panel.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      panel.style.transition = '';
      const delta = e.changedTouches[0].clientY - touchStartY;
      const elapsed = Date.now() - touchStartTime;
      const velocity = delta / elapsed;
      if (delta > 80 || velocity > 0.35) {
        panel.style.transform = '';
        zoomOut();
      } else {
        panel.style.transform = '';
      }
    }, { passive: true });
  });

  // Top nav
  document.querySelectorAll('.nav-link-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetNode = btn.dataset.node;
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

  // Sound toggle
  const soundBtn = document.getElementById('sound-toggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      synth.enabled = !synth.enabled;
      soundBtn.classList.toggle('active', !synth.enabled);
      soundBtn.innerHTML = synth.enabled
        ? '<i class="fas fa-volume-up"></i>'
        : '<i class="fas fa-volume-mute"></i>';
      synth.playClick();
    });
  }

  // Voice assistant
  const voiceBtn = document.getElementById('voice-assistant');
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      voice.enabled = !voice.enabled;
      voiceBtn.classList.toggle('active', voice.enabled);
      synth.playClick();

      const voiceCard = document.getElementById('hud-voice-card');
      if (voiceCard) voiceCard.style.display = voice.enabled ? 'block' : 'none';

      if (voice.enabled) {
        voice.speak("Voice recognition link engaged.");
        if (!voiceRecognition) initVoiceAssistant();
        if (voiceRecognition) {
          try { voiceRecognition.start(); } catch (e) { /* already listening */ }
        }
      } else {
        voice.speak("Voice recognition link terminated.");
        if (voiceRecognition) {
          try { voiceRecognition.stop(); } catch (e) { /* already stopped */ }
        }
        updateVoiceHUDStatus("STANDBY", "pulse-dot-purple");
      }
    });
  }

  // GFX toggle
  const gfxBtn = document.getElementById('gfx-toggle');
  if (gfxBtn) {
    if (gfxMode === 'eco') {
      gfxBtn.classList.add('eco-active');
      gfxBtn.innerHTML = '<i class="fas fa-leaf"></i>';
    }
    gfxBtn.addEventListener('click', toggleGfxMode);
  }

  // Mobile hamburger
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mobileClose = document.getElementById('mobile-menu-close');
  const mobileOverlay = document.getElementById('mobile-menu-overlay');

  if (mobileToggle && mobileOverlay) {
    mobileToggle.addEventListener('click', () => {
      synth.playClick();
      const isOpen = mobileOverlay.classList.contains('open');
      mobileOverlay.classList.toggle('open', !isOpen);
      mobileToggle.classList.toggle('open', !isOpen);
    });
  }

  if (mobileClose && mobileOverlay) {
    mobileClose.addEventListener('click', () => {
      synth.playClose();
      mobileOverlay.classList.remove('open');
      mobileToggle && mobileToggle.classList.remove('open');
    });
  }

  // Mobile overlay nav links
  document.querySelectorAll('.mobile-link-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetNode = btn.dataset.node;
      if (mobileOverlay) mobileOverlay.classList.remove('open');
      if (mobileToggle) mobileToggle.classList.remove('open');

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

  // Project / inner panel tabs
  document.querySelectorAll('.cyber-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      synth.playClick();
      const parent = btn.closest('.holo-panel');
      parent.querySelectorAll('.cyber-tab-btn').forEach(b => b.classList.remove('active'));
      parent.querySelectorAll('.tab-panel-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const tabEl = document.getElementById(btn.dataset.tab);
      if (tabEl) tabEl.classList.add('active');
    });
  });

  // Skill category tab filter
  document.querySelectorAll('.skill-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      synth.playClick();
      document.querySelectorAll('.skill-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selected = btn.dataset.stab;
      document.querySelectorAll('#panel-brain .skill-section').forEach(section => {
        const cat = section.dataset.category;
        if (selected === 'all' || cat === selected || cat === 'all') {
          section.removeAttribute('hidden');
        } else {
          section.setAttribute('hidden', '');
        }
      });
    });
  });

  // Contact form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('contact-submit-btn');
      const originalHTML = submitBtn.innerHTML;

      submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> TRANSMITTING...';
      submitBtn.disabled = true;

      try {
        await emailjs.sendForm('service_rcz156m', 'template_6j7way7', contactForm);
        synth.playSuccess();
        if (voice.enabled) voice.speak("Transmission successfully dispatched.");
        submitBtn.innerHTML = '<i class="fas fa-check"></i> TRANSMISSION DELIVERED';
        submitBtn.style.borderColor = 'var(--neon-green)';
        submitBtn.style.color = 'var(--neon-green)';
      } catch (err) {
        console.error('EmailJS error:', err);
        submitBtn.innerHTML = '<i class="fas fa-times"></i> DELAY ENCOUNTERED';
        submitBtn.style.borderColor = 'var(--neon-magenta)';
        submitBtn.style.color = 'var(--neon-magenta)';
      }

      setTimeout(() => {
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
        submitBtn.style.borderColor = '';
        submitBtn.style.color = '';
        contactForm.reset();
      }, 3500);
    });
  }

  // Resume buttons
  const resumeDownloadBtn = document.getElementById('resume-download-btn');
  if (resumeDownloadBtn) {
    resumeDownloadBtn.addEventListener('click', () => {
      synth.playClick();
      // Replace '#' with actual resume PDF path when ready
      alert('Resume PDF coming soon! The file will be available for download shortly.');
    });
  }

  const heroResumeBtn = document.getElementById('hero-resume-btn');
  if (heroResumeBtn) {
    heroResumeBtn.addEventListener('click', () => {
      synth.playClick();
      alert('Resume PDF coming soon! The file will be available for download shortly.');
    });
  }

  const resumeViewBtn = document.getElementById('resume-view-btn');
  if (resumeViewBtn) {
    resumeViewBtn.addEventListener('click', () => {
      synth.playClick();
      alert('Resume PDF viewer coming soon!');
    });
  }
}

/* ===================================================================
   CERTIFICATE MODAL
   =================================================================== */
window.openCertImageModal = function(imageSrc, captionText) {
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

window.closeCertImageModal = function() {
  synth.playClose();
  const modal = document.getElementById('cert-image-modal');
  if (modal) modal.style.display = 'none';
};

/* ===================================================================
   KEYBOARD NAVIGATION
   =================================================================== */
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCertImageModal();
    if (currentState === 'zoomed') zoomOut();
  }
});

/* ===================================================================
   VOICE RECOGNITION ASSISTANT
   =================================================================== */
function initVoiceAssistant() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("Speech Recognition not supported on this browser.");
    const voiceCard = document.getElementById('hud-voice-card');
    if (voiceCard) voiceCard.style.display = 'none';
    return;
  }

  voiceRecognition = new SpeechRecognition();
  voiceRecognition.continuous = true;
  voiceRecognition.interimResults = false;
  voiceRecognition.lang = 'en-US';

  voiceRecognition.onstart = () => updateVoiceHUDStatus("LISTENING", "pulse-dot-green");

  voiceRecognition.onresult = (event) => {
    const lastIdx = event.results.length - 1;
    const commandText = event.results[lastIdx][0].transcript.trim().toLowerCase();
    updateVoiceHUDStatus("PROCESSING...", "pulse-dot-purple");
    processVoiceCommand(commandText);
    setTimeout(() => {
      if (voiceRecognition && voice.enabled) updateVoiceHUDStatus("LISTENING", "pulse-dot-green");
    }, 1500);
  };

  voiceRecognition.onerror = (event) => {
    if (event.error === 'not-allowed') {
      voice.enabled = false;
      updateVoiceHUDStatus("MIC BLOCKED", "pulse-dot-red");
      const voiceBtn = document.getElementById('voice-assistant');
      if (voiceBtn) voiceBtn.classList.remove('active');
    }
  };

  voiceRecognition.onend = () => {
    if (voice.enabled) {
      try { voiceRecognition.start(); } catch (e) { /* already starting */ }
    } else {
      updateVoiceHUDStatus("STANDBY", "pulse-dot-purple");
    }
  };
}

function updateVoiceHUDStatus(text, dotClass) {
  const el = document.getElementById('hud-voice-status');
  if (!el) return;
  let color = 'var(--neon-purple)';
  if (dotClass === 'pulse-dot-green') color = 'var(--neon-green)';
  if (dotClass === 'pulse-dot-red') color = 'var(--neon-magenta)';
  el.innerHTML = `<span style="width:6px;height:6px;background:${color};border-radius:50%;box-shadow:0 0 8px ${color};display:inline-block;margin-right:6px;animation:glowPulse 1.5s infinite alternate;"></span>${text}`;
}

function processVoiceCommand(phrase) {
  const clean = phrase.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();

  if (clean.includes("about") || clean.includes("profile") || clean.includes("bio") || clean.includes("who are you")) {
    navigateFromVoice("head");
  } else if (clean.includes("skill") || clean.includes("languages") || clean.includes("tools")) {
    navigateFromVoice("brain");
  } else if (clean.includes("project") || clean.includes("repositories") || clean.includes("work")) {
    navigateFromVoice("rightChest");
  } else if (clean.includes("certificate") || clean.includes("credentials") || clean.includes("hackathon")) {
    navigateFromVoice("leftChest");
  } else if (clean.includes("resume") || clean.includes("cv") || clean.includes("academic")) {
    navigateFromVoice("rightHand");
  } else if (clean.includes("journey") || clean.includes("roadmap") || clean.includes("timeline")) {
    navigateFromVoice("coreReactor");
  } else if (clean.includes("contact") || clean.includes("email") || clean.includes("message")) {
    navigateFromVoice("leftLeg");
  } else if (clean.includes("goal") || clean.includes("objectives") || clean.includes("future")) {
    navigateFromVoice("rightLeg");
  } else if (clean.includes("home") || clean.includes("back") || clean.includes("close") || clean.includes("reset")) {
    navigateFromVoice("home");
  }
}

function navigateFromVoice(nodeName) {
  if (nodeName === 'home') {
    if (currentState === 'zoomed') zoomOut();
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

/* ===================================================================
   CUSTOM CURSOR ENERGY TRAIL
   =================================================================== */
function initCursorTrail() {
  const canvas = document.getElementById('cursor-canvas');
  if (!canvas) return;

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
      this.size = Math.random() * 4 + 1;
      this.speedX = (Math.random() - 0.5) * 1.5;
      this.speedY = (Math.random() - 0.5) * 1.5;
      this.color = Math.random() > 0.5 ? '0, 240, 255' : '255, 0, 127';
      this.opacity = 0.75;
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
    cursor.x += (mousePos.x - cursor.x) * 0.25;
    cursor.y += (mousePos.y - cursor.y) * 0.25;

    if (Math.abs(mousePos.x - cursor.x) > 0.5 || Math.abs(mousePos.y - cursor.y) > 0.5) {
      particles.push(new TrailParticle(cursor.x, cursor.y));
    }

    particles = particles.filter(p => p.opacity > 0);
    particles.forEach(p => { p.update(); p.draw(); });

    // Cursor core glow
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00f0ff';
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#00f0ff';
    ctx.fill();

    // Outer ring
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, 16, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.stroke();

    requestAnimationFrame(drawCursor);
  }
  drawCursor();
}
