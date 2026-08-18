import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

/*
  ZVIAD GAMSAKHURDIA DIGITAL MUSEUM
  Opening scene: Crucifixion / constellation sculpture

  The sculpture is procedural: no external 3D model is required.
  Thousands of points and dynamic line segments assemble into a
  crucifixion figure, hold as a luminous monument, then scatter into
  space as the visitor scrolls toward the museum card.
*/

const canvas = document.getElementById("scene");
const card = document.getElementById("reveal-card");
const footer =
  document.getElementById("archive-footer") ||
  document.getElementById("home-footer") ||
  document.querySelector(".archive-footer");
const root = document.documentElement;

if (!canvas) {
  throw new Error('Opening animation requires <canvas id="scene">.');
}

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const isSmallScreen = window.matchMedia("(max-width: 760px)").matches;

/* ---------------------------------
   RENDERER / CAMERA
--------------------------------- */

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, isSmallScreen ? 1.2 : 1.55),
);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.16;
renderer.setClearColor(0xffffff, 0);

const scene = new THREE.Scene();

scene.fog = new THREE.FogExp2(0xf7f7f4, isSmallScreen ? 0.024 : 0.019);

const camera = new THREE.PerspectiveCamera(
  isSmallScreen ? 52 : 43,
  window.innerWidth / window.innerHeight,
  0.1,
  120,
);

camera.position.set(0, 0.15, isSmallScreen ? 19.5 : 18.2);

const world = new THREE.Group();

scene.add(world);

const sculptureGroup = new THREE.Group();

world.add(sculptureGroup);

/* ---------------------------------
   HELPERS
--------------------------------- */

function clamp(value, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function mapRange(value, inputStart, inputEnd, outputStart = 0, outputEnd = 1) {
  const progress = clamp((value - inputStart) / (inputEnd - inputStart));

  return outputStart + (outputEnd - outputStart) * progress;
}

function smoothStep(value) {
  const clamped = clamp(value);

  return clamped * clamped * (3 - 2 * clamped);
}

function smootherStep(value) {
  const clamped = clamp(value);

  return clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10);
}

function randomDirection() {
  const vector = new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5,
  );

  if (vector.lengthSq() < 0.0001) {
    vector.set(1, 0, 0);
  }

  return vector.normalize();
}

function randomBetween(minimum, maximum) {
  return minimum + Math.random() * (maximum - minimum);
}

function rotateAroundCenter(point, center, euler) {
  return point.clone().sub(center).applyEuler(euler).add(center);
}

function createSoftGlowTexture() {
  const size = 256;

  const glowCanvas = document.createElement("canvas");

  glowCanvas.width = size;
  glowCanvas.height = size;

  const context = glowCanvas.getContext("2d");

  const center = size / 2;

  const gradient = context.createRadialGradient(
    center,
    center,
    0,

    center,
    center,
    center,
  );

  gradient.addColorStop(0, "rgba(255, 251, 232, 1)");

  gradient.addColorStop(0.09, "rgba(255, 226, 170, 0.94)");

  gradient.addColorStop(0.28, "rgba(223, 165, 94, 0.45)");

  gradient.addColorStop(0.62, "rgba(137, 88, 42, 0.12)");

  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

  context.fillStyle = gradient;

  context.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(glowCanvas);
}

/* ---------------------------------
   BACKGROUND STAR FIELD
--------------------------------- */

function createStarField() {
  const count = isSmallScreen ? 650 : 1250;

  const positions = new Float32Array(count * 3);

  const colors = new Float32Array(count * 3);

  const sizes = new Float32Array(count);

  const phases = new Float32Array(count);

  const starColors = [
    new THREE.Color(0x171717),
    new THREE.Color(0x6f6f6f),
    new THREE.Color(0xc6a437),
    new THREE.Color(0xd9d9d9),
  ];

  for (let i = 0; i < count; i += 1) {
    const radius = randomBetween(20, 54);

    const direction = randomDirection();

    positions[i * 3] = direction.x * radius * 1.38;

    positions[i * 3 + 1] = direction.y * radius * 0.88;

    positions[i * 3 + 2] = -8 + direction.z * radius;

    const color =
      starColors[Math.floor(Math.random() * starColors.length)].clone();

    color.multiplyScalar(randomBetween(0.55, 1));

    colors[i * 3] = color.r;

    colors[i * 3 + 1] = color.g;

    colors[i * 3 + 2] = color.b;

    sizes[i] = randomBetween(0.7, 2.8);

    phases[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,

    depthWrite: false,

    blending: THREE.NormalBlending,

    uniforms: {
      uTime: {
        value: 0,
      },

      uOpacity: {
        value: 0.48,
      },
    },

    vertexShader: `
        attribute vec3 color;
        attribute float aSize;
        attribute float aPhase;

        uniform float uTime;

        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = color;

          vAlpha =
            0.58 +
            0.42 *
            sin(
              uTime * 0.75 +
              aPhase
            );

          vec4 mvPosition =
            modelViewMatrix *
            vec4(
              position,
              1.0
            );

          gl_Position =
            projectionMatrix *
            mvPosition;

          gl_PointSize =
            aSize *
            (
              110.0 /
              max(
                1.0,
                -mvPosition.z
              )
            );
        }
      `,

    fragmentShader: `
        uniform float uOpacity;

        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec2 uv =
            gl_PointCoord -
            0.5;

          float d =
            length(uv);

          if (
            d > 0.5
          ) {
            discard;
          }

          float core =
            1.0 -
            smoothstep(
              0.0,
              0.10,
              d
            );

          float halo =
            1.0 -
            smoothstep(
              0.08,
              0.5,
              d
            );

          float alpha =
            (
              core +
              halo * 0.42
            ) *
            vAlpha *
            uOpacity;

          gl_FragColor =
            vec4(
              vColor,
              alpha
            );
        }
      `,
  });

  const points = new THREE.Points(geometry, material);

  points.rotation.x = -0.08;

  return {
    points,
    material,
  };
}

const starField = createStarField();

world.add(starField.points);

/* ---------------------------------
   CRUCIFIXION SCULPTURE DATA
--------------------------------- */

const nodeTargets = [];
const nodeStarts = [];
const nodeScatterTargets = [];
const nodeScatterAxes = [];
const nodeScatterDelays = [];
const nodePhases = [];
const nodeSizes = [];
const nodeColors = [];

const regionIndices = new Map();

const BODY_GOLD = new THREE.Color(0x171717);

const BODY_WHITE = new THREE.Color(0xf0c94b);

const CROSS_GOLD = new THREE.Color(0x2b2b2b);

const CROSS_DARK = new THREE.Color(0x171717);

const CLOTH_COLOR = new THREE.Color(0xd7b84f);

function registerNode(position, region, options = {}) {
  const target = position.clone();

  const startDirection = randomDirection();

  const startDistance = randomBetween(5.5, 15.5);

  const start = target
    .clone()
    .addScaledVector(startDirection, startDistance)
    .add(
      new THREE.Vector3(
        randomBetween(-2.2, 2.2),

        randomBetween(-1.8, 1.8),

        randomBetween(-4.5, 4.5),
      ),
    );

  const radialDirection = target.clone().sub(new THREE.Vector3(0, 0.2, 0));

  if (radialDirection.lengthSq() < 0.08) {
    radialDirection.copy(randomDirection());
  }

  radialDirection.normalize();

  const scatterDirection = radialDirection
    .multiplyScalar(0.68)
    .addScaledVector(randomDirection(), 0.9)
    .normalize();

  const scatterDistance = randomBetween(9, 22);

  const scatterTarget = target
    .clone()
    .addScaledVector(scatterDirection, scatterDistance)
    .add(
      new THREE.Vector3(
        randomBetween(-2.8, 2.8),

        randomBetween(-2.2, 2.2),

        randomBetween(-7, 4),
      ),
    );

  const colorBase = (options.color || BODY_GOLD).clone();

  colorBase.offsetHSL(
    randomBetween(-0.015, 0.015),

    randomBetween(-0.06, 0.05),

    randomBetween(-0.08, 0.11),
  );

  const index = nodeTargets.length;

  nodeTargets.push(target);

  nodeStarts.push(start);

  nodeScatterTargets.push(scatterTarget);

  nodeScatterAxes.push(randomDirection());

  nodeScatterDelays.push(
    clamp(
      (options.delayBias || 0) + Math.random() * (options.delaySpread || 0.34),

      0,
      0.72,
    ),
  );

  nodePhases.push(Math.random() * Math.PI * 2);

  nodeSizes.push(options.size || randomBetween(1.2, 3.4));

  nodeColors.push(colorBase);

  if (!regionIndices.has(region)) {
    regionIndices.set(region, []);
  }

  regionIndices.get(region).push(index);

  return index;
}

function sampleEllipsoid({
  center,
  radii,
  count,
  region,
  color,
  rotation = new THREE.Euler(),
  sizeRange = [1.2, 3.4],
  delayBias = 0,
}) {
  for (let i = 0; i < count; i += 1) {
    const normal = randomDirection();

    const shell = randomBetween(0.82, 1.02);

    let point = new THREE.Vector3(
      normal.x * radii.x * shell,

      normal.y * radii.y * shell,

      normal.z * radii.z * shell,
    ).add(center);

    point = rotateAroundCenter(point, center, rotation);

    registerNode(point, region, {
      color,

      size: randomBetween(sizeRange[0], sizeRange[1]),

      delayBias,
    });
  }
}

function sampleCylinderBetween({
  start,
  end,
  radius,
  count,
  region,
  color,
  taper = 0,
  sizeRange = [1.1, 3.1],
  delayBias = 0,
}) {
  const axis = end.clone().sub(start);

  const length = axis.length();

  const direction = axis.clone().normalize();

  const reference =
    Math.abs(direction.y) < 0.9
      ? new THREE.Vector3(0, 1, 0)
      : new THREE.Vector3(1, 0, 0);

  const basisA = new THREE.Vector3()
    .crossVectors(direction, reference)
    .normalize();

  const basisB = new THREE.Vector3()
    .crossVectors(direction, basisA)
    .normalize();

  for (let i = 0; i < count; i += 1) {
    const t = Math.random();

    const angle = Math.random() * Math.PI * 2;

    const localRadius = radius * (1 - taper * t) * randomBetween(0.78, 1.05);

    const point = start
      .clone()
      .addScaledVector(direction, t * length)
      .addScaledVector(basisA, Math.cos(angle) * localRadius)
      .addScaledVector(basisB, Math.sin(angle) * localRadius);

    registerNode(point, region, {
      color,

      size: randomBetween(sizeRange[0], sizeRange[1]),

      delayBias,
    });
  }
}

function sampleCuboidSurface({
  center,
  size,
  count,
  region,
  color,
  delayBias = 0,
}) {
  const half = size.clone().multiplyScalar(0.5);

  for (let i = 0; i < count; i += 1) {
    const face = Math.floor(Math.random() * 6);

    const x = randomBetween(-half.x, half.x);

    const y = randomBetween(-half.y, half.y);

    const z = randomBetween(-half.z, half.z);

    const point = new THREE.Vector3(x, y, z);

    if (face === 0) {
      point.x = half.x;
    }

    if (face === 1) {
      point.x = -half.x;
    }

    if (face === 2) {
      point.y = half.y;
    }

    if (face === 3) {
      point.y = -half.y;
    }

    if (face === 4) {
      point.z = half.z;
    }

    if (face === 5) {
      point.z = -half.z;
    }

    point.add(center);

    registerNode(point, region, {
      color,

      size: randomBetween(1.0, 2.7),

      delayBias,

      delaySpread: 0.42,
    });
  }
}

function sampleTorso(count) {
  const centerY = 1.0;

  for (let i = 0; i < count; i += 1) {
    const t = Math.random();

    const y = THREE.MathUtils.lerp(-0.35, 2.35, t);

    const shoulderFactor = smoothStep(mapRange(t, 0.42, 1));

    const waistFactor = 1 - 0.18 * Math.exp(-Math.pow((t - 0.28) * 4.2, 2));

    const width =
      THREE.MathUtils.lerp(0.72, 1.22, shoulderFactor) * waistFactor;

    const depth = THREE.MathUtils.lerp(0.38, 0.54, shoulderFactor);

    const angle = Math.random() * Math.PI * 2;

    const shell = randomBetween(0.82, 1.03);

    const point = new THREE.Vector3(
      Math.cos(angle) * width * shell - 0.06,

      y,

      Math.sin(angle) * depth * shell + 0.32,
    );

    point.x += Math.sin((y - centerY) * 1.4) * 0.06;

    registerNode(point, "torso", {
      color: Math.random() > 0.22 ? BODY_GOLD : BODY_WHITE,

      size: randomBetween(1.25, 3.7),

      delayBias: 0.08,
    });
  }
}

function sampleCloth(count) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;

    const y = randomBetween(-0.72, 0.05);

    const width = 0.86 + (0.1 - y) * 0.18;

    const depth = 0.48;

    const point = new THREE.Vector3(
      Math.cos(angle) * width * randomBetween(0.82, 1.02),

      y,

      Math.sin(angle) * depth * randomBetween(0.8, 1.02) + 0.31,
    );

    point.x += Math.sin((y + 0.7) * 7) * 0.08;

    registerNode(point, "cloth", {
      color: CLOTH_COLOR,

      size: randomBetween(1.0, 2.8),

      delayBias: 0.12,
    });
  }
}

function sampleCrown(count) {
  const center = new THREE.Vector3(-0.16, 3.36, 0.35);

  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + randomBetween(-0.05, 0.05);

    const radius = randomBetween(0.53, 0.72);

    const point = new THREE.Vector3(
      center.x + Math.cos(angle) * radius,

      center.y + Math.sin(angle) * radius * 0.48,

      center.z + Math.sin(angle * 2.0) * 0.14,
    );

    registerNode(point, "crown", {
      color: BODY_WHITE,

      size: randomBetween(1.0, 2.3),

      delayBias: 0,

      delaySpread: 0.18,
    });
  }
}

function buildCrucifixion() {
  const scaleFactor = isSmallScreen ? 0.72 : 1;

  const scaled = (value) => Math.max(12, Math.round(value * scaleFactor));

  /*
    CROSS
  */

  sampleCuboidSurface({
    center: new THREE.Vector3(0, 0.18, -0.34),

    size: new THREE.Vector3(0.68, 10.8, 0.42),

    count: scaled(680),

    region: "cross-vertical",

    color: CROSS_GOLD,

    delayBias: 0.22,
  });

  sampleCuboidSurface({
    center: new THREE.Vector3(0, 2.62, -0.34),

    size: new THREE.Vector3(8.65, 0.68, 0.42),

    count: scaled(560),

    region: "cross-horizontal",

    color: CROSS_DARK,

    delayBias: 0.24,
  });

  /*
    HEAD
  */

  sampleEllipsoid({
    center: new THREE.Vector3(-0.16, 3.34, 0.36),

    radii: new THREE.Vector3(0.57, 0.72, 0.5),

    count: scaled(270),

    region: "head",

    color: BODY_WHITE,

    rotation: new THREE.Euler(0.02, 0.08, -0.28),

    sizeRange: [1.25, 3.4],

    delayBias: 0,
  });

  sampleCrown(scaled(120));

  /*
    NECK
  */

  sampleCylinderBetween({
    start: new THREE.Vector3(-0.12, 2.78, 0.35),

    end: new THREE.Vector3(-0.06, 2.35, 0.34),

    radius: 0.28,

    count: scaled(80),

    region: "neck",

    color: BODY_GOLD,

    taper: 0.05,
  });

  /*
    TORSO
  */

  sampleTorso(scaled(620));

  /*
    LEFT ARM
  */

  sampleCylinderBetween({
    start: new THREE.Vector3(-0.92, 2.24, 0.34),

    end: new THREE.Vector3(-2.18, 2.46, 0.24),

    radius: 0.29,

    count: scaled(190),

    region: "left-arm",

    color: BODY_GOLD,

    taper: 0.14,

    delayBias: 0.02,
  });

  sampleCylinderBetween({
    start: new THREE.Vector3(-2.18, 2.46, 0.24),

    end: new THREE.Vector3(-3.82, 2.62, 0.12),

    radius: 0.23,

    count: scaled(210),

    region: "left-arm",

    color: BODY_GOLD,

    taper: 0.3,

    delayBias: 0,
  });

  /*
    RIGHT ARM
  */

  sampleCylinderBetween({
    start: new THREE.Vector3(0.88, 2.23, 0.34),

    end: new THREE.Vector3(2.15, 2.43, 0.25),

    radius: 0.29,

    count: scaled(190),

    region: "right-arm",

    color: BODY_GOLD,

    taper: 0.14,

    delayBias: 0,
  });

  sampleCylinderBetween({
    start: new THREE.Vector3(2.15, 2.43, 0.25),

    end: new THREE.Vector3(3.82, 2.61, 0.11),

    radius: 0.23,

    count: scaled(210),

    region: "right-arm",

    color: BODY_GOLD,

    taper: 0.3,

    delayBias: 0,
  });

  /*
    HANDS
  */

  sampleEllipsoid({
    center: new THREE.Vector3(-3.86, 2.61, 0.12),

    radii: new THREE.Vector3(0.28, 0.19, 0.12),

    count: scaled(56),

    region: "left-hand",

    color: BODY_WHITE,

    sizeRange: [1.0, 2.5],
  });

  sampleEllipsoid({
    center: new THREE.Vector3(3.86, 2.61, 0.12),

    radii: new THREE.Vector3(0.28, 0.19, 0.12),

    count: scaled(56),

    region: "right-hand",

    color: BODY_WHITE,

    sizeRange: [1.0, 2.5],
  });

  /*
    CLOTH
  */

  sampleCloth(scaled(230));

  /*
    LEFT LEG
  */

  sampleCylinderBetween({
    start: new THREE.Vector3(-0.34, -0.42, 0.31),

    end: new THREE.Vector3(-0.25, -1.85, 0.25),

    radius: 0.34,

    count: scaled(210),

    region: "left-leg",

    color: BODY_GOLD,

    taper: 0.12,

    delayBias: 0.08,
  });

  sampleCylinderBetween({
    start: new THREE.Vector3(-0.25, -1.85, 0.25),

    end: new THREE.Vector3(-0.05, -3.55, 0.13),

    radius: 0.27,

    count: scaled(215),

    region: "left-leg",

    color: BODY_GOLD,

    taper: 0.28,

    delayBias: 0.06,
  });

  /*
    RIGHT LEG
  */

  sampleCylinderBetween({
    start: new THREE.Vector3(0.34, -0.42, 0.28),

    end: new THREE.Vector3(0.22, -1.86, 0.18),

    radius: 0.34,

    count: scaled(210),

    region: "right-leg",

    color: BODY_GOLD,

    taper: 0.12,

    delayBias: 0.08,
  });

  sampleCylinderBetween({
    start: new THREE.Vector3(0.22, -1.86, 0.18),

    end: new THREE.Vector3(0.03, -3.58, 0.08),

    radius: 0.27,

    count: scaled(215),

    region: "right-leg",

    color: BODY_GOLD,

    taper: 0.28,

    delayBias: 0.06,
  });

  /*
    FEET
  */

  sampleEllipsoid({
    center: new THREE.Vector3(0, -3.68, 0.08),

    radii: new THREE.Vector3(0.3, 0.46, 0.18),

    count: scaled(90),

    region: "feet",

    color: BODY_WHITE,

    rotation: new THREE.Euler(0.22, 0, 0),

    sizeRange: [1.0, 2.5],

    delayBias: 0.03,
  });
}

buildCrucifixion();

/* ---------------------------------
   POINT CLOUD MATERIAL
--------------------------------- */

const nodeCount = nodeTargets.length;

const nodePositionArray = new Float32Array(nodeCount * 3);

const nodeColorArray = new Float32Array(nodeCount * 3);

const nodeSizeArray = new Float32Array(nodeCount);

const nodePhaseArray = new Float32Array(nodeCount);

for (let i = 0; i < nodeCount; i += 1) {
  const start = nodeStarts[i];

  const color = nodeColors[i];

  nodePositionArray[i * 3] = start.x;

  nodePositionArray[i * 3 + 1] = start.y;

  nodePositionArray[i * 3 + 2] = start.z;

  nodeColorArray[i * 3] = color.r;

  nodeColorArray[i * 3 + 1] = color.g;

  nodeColorArray[i * 3 + 2] = color.b;

  nodeSizeArray[i] = nodeSizes[i];

  nodePhaseArray[i] = nodePhases[i];
}

const nodeGeometry = new THREE.BufferGeometry();

nodeGeometry.setAttribute(
  "position",

  new THREE.BufferAttribute(nodePositionArray, 3).setUsage(
    THREE.DynamicDrawUsage,
  ),
);

nodeGeometry.setAttribute(
  "color",

  new THREE.BufferAttribute(nodeColorArray, 3),
);

nodeGeometry.setAttribute(
  "aSize",

  new THREE.BufferAttribute(nodeSizeArray, 1),
);

nodeGeometry.setAttribute(
  "aPhase",

  new THREE.BufferAttribute(nodePhaseArray, 1),
);

const nodeMaterial = new THREE.ShaderMaterial({
  transparent: true,

  depthWrite: false,

  blending: THREE.AdditiveBlending,

  uniforms: {
    uTime: {
      value: 0,
    },

    uOpacity: {
      value: 1,
    },
  },

  vertexShader: `
      attribute vec3 color;
      attribute float aSize;
      attribute float aPhase;

      uniform float uTime;

      varying vec3 vColor;
      varying float vGlow;

      void main() {
        vColor = color;

        vGlow =
          0.82 +
          0.18 *
          sin(
            uTime * 1.45 +
            aPhase
          );

        vec4 mvPosition =
          modelViewMatrix *
          vec4(
            position,
            1.0
          );

        gl_Position =
          projectionMatrix *
          mvPosition;

        gl_PointSize =
          aSize *
          vGlow *
          (
            150.0 /
            max(
              1.0,
              -mvPosition.z
            )
          );
      }
    `,

  fragmentShader: `
      uniform float uOpacity;

      varying vec3 vColor;
      varying float vGlow;

      void main() {
        vec2 point =
          gl_PointCoord -
          vec2(0.5);

        float d =
          length(point);

        if (
          d > 0.5
        ) {
          discard;
        }

        float core =
          1.0 -
          smoothstep(
            0.015,
            0.105,
            d
          );

        float halo =
          1.0 -
          smoothstep(
            0.08,
            0.5,
            d
          );

        float rayX =
          1.0 -
          smoothstep(
            0.0,
            0.025,
            abs(point.y)
          );

        float rayY =
          1.0 -
          smoothstep(
            0.0,
            0.025,
            abs(point.x)
          );

        float rays =
          (
            rayX +
            rayY
          ) *
          (
            1.0 -
            smoothstep(
              0.06,
              0.44,
              d
            )
          );

        float alpha =
          (
            core +
            halo * 0.44 +
            rays * 0.10
          ) *
          uOpacity *
          vGlow;

        gl_FragColor =
          vec4(
            vColor,
            alpha
          );
      }
    `,
});

const sculpturePoints = new THREE.Points(nodeGeometry, nodeMaterial);

sculpturePoints.renderOrder = 4;

sculptureGroup.add(sculpturePoints);

/* ---------------------------------
   DYNAMIC CONSTELLATION LINES
--------------------------------- */

const linePairs = [];

function buildRegionConnections(
  indices,
  maxConnectionsPerNode = 1,
  distanceLimit = 0.82,
) {
  if (indices.length < 2) {
    return;
  }

  for (let localIndex = 0; localIndex < indices.length; localIndex += 1) {
    const sourceIndex = indices[localIndex];

    const source = nodeTargets[sourceIndex];

    for (
      let connection = 0;
      connection < maxConnectionsPerNode;
      connection += 1
    ) {
      let bestIndex = -1;

      let bestDistance = distanceLimit;

      const attempts = Math.min(
        22,

        Math.max(
          8,

          Math.floor(indices.length * 0.08),
        ),
      );

      for (let attempt = 0; attempt < attempts; attempt += 1) {
        const candidateIndex =
          indices[Math.floor(Math.random() * indices.length)];

        if (candidateIndex === sourceIndex) {
          continue;
        }

        const distance = source.distanceTo(nodeTargets[candidateIndex]);

        if (distance < bestDistance) {
          bestDistance = distance;

          bestIndex = candidateIndex;
        }
      }

      if (bestIndex >= 0) {
        linePairs.push([sourceIndex, bestIndex]);
      }
    }
  }
}

regionIndices.forEach((indices, regionName) => {
  const isCross = regionName.startsWith("cross");

  const isLargeRegion = indices.length > 320;

  buildRegionConnections(
    indices,

    isCross || isLargeRegion ? 1 : 2,

    isCross ? 1.05 : 0.76,
  );
});

const linePositionArray = new Float32Array(linePairs.length * 6);

const lineGeometry = new THREE.BufferGeometry();

lineGeometry.setAttribute(
  "position",

  new THREE.BufferAttribute(linePositionArray, 3).setUsage(
    THREE.DynamicDrawUsage,
  ),
);

const lineMaterial = new THREE.LineBasicMaterial({
  color: 0x171717,

  transparent: true,

  opacity: 0,

  depthWrite: false,

  blending: THREE.NormalBlending,
});

const constellationLines = new THREE.LineSegments(lineGeometry, lineMaterial);

constellationLines.renderOrder = 3;

sculptureGroup.add(constellationLines);

/* ---------------------------------
   AURA / HALO
--------------------------------- */

const glowTexture = createSoftGlowTexture();

const bodyAura = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: glowTexture,

    color: 0xf1c93f,

    transparent: true,

    opacity: 0,

    depthWrite: false,

    blending: THREE.AdditiveBlending,
  }),
);

bodyAura.position.set(0, 0.55, -0.9);

bodyAura.scale.set(12.5, 15.5, 1);

bodyAura.renderOrder = 1;

sculptureGroup.add(bodyAura);

const headHalo = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: glowTexture,

    color: 0xfedd00,

    transparent: true,

    opacity: 0,

    depthWrite: false,

    blending: THREE.AdditiveBlending,
  }),
);

headHalo.position.set(-0.18, 3.35, 0.05);

headHalo.scale.set(3.15, 3.15, 1);

headHalo.renderOrder = 2;

sculptureGroup.add(headHalo);

/* ---------------------------------
   SCROLL STATE
--------------------------------- */

let targetScrollProgress = 0;

let smoothScrollProgress = 0;

let lastTime = performance.now();

const loadTime = performance.now();

function updateScrollProgress() {
  const maximumScroll = Math.max(
    1,

    document.documentElement.scrollHeight - window.innerHeight,
  );

  targetScrollProgress = clamp(window.scrollY / maximumScroll);
}

/* ---------------------------------
   INTERFACE
--------------------------------- */

function updateInterface(progress) {
  const intro = 1 - smoothStep(mapRange(progress, 0.025, 0.22));

  const cardProgress = smootherStep(mapRange(progress, 0.58, 0.74));

  const footerProgress = smootherStep(mapRange(progress, 0.78, 0.94));

  root.style.setProperty("--intro-progress", intro.toFixed(4));

  root.style.setProperty("--card-progress", cardProgress.toFixed(4));

  root.style.setProperty("--footer-progress", footerProgress.toFixed(4));

  root.style.setProperty("--cosmic-progress", progress.toFixed(4));

  card?.classList.toggle("is-interactive", cardProgress > 0.92);

  footer?.classList.toggle("is-interactive", footerProgress > 0.92);
}

/* ---------------------------------
   SCULPTURE UPDATE
--------------------------------- */

const currentNodePositions = Array.from(
  {
    length: nodeCount,
  },

  () => new THREE.Vector3(),
);

const tempPosition = new THREE.Vector3();

const tempAssembly = new THREE.Vector3();

const tempScatter = new THREE.Vector3();

const tempTangent = new THREE.Vector3();

const upVector = new THREE.Vector3(0, 1, 0);

function updateSculpture(progress, elapsedSeconds) {
  const sinceLoad =
    Math.max(
      0,

      performance.now() - loadTime,
    ) / 1000;

  const assembly = prefersReducedMotion
    ? 1
    : smootherStep(clamp((sinceLoad - 0.12) / 2.65));

  /*
    The sculpture begins dissolving
    after the visitor starts scrolling.
  */

  const scatterGlobal = mapRange(progress, 0.02, 0.665);

  const sculptureFade = 1 - smootherStep(mapRange(progress, 0.62, 0.82));

  const lineFade = 1 - smootherStep(mapRange(progress, 0.52, 0.76));

  const cardProgress = smootherStep(mapRange(progress, 0.58, 0.74));

  const positionAttribute = nodeGeometry.getAttribute("position");

  for (let i = 0; i < nodeCount; i += 1) {
    const target = nodeTargets[i];

    const start = nodeStarts[i];

    const scatterTarget = nodeScatterTargets[i];

    const delay = nodeScatterDelays[i];

    const phase = nodePhases[i];

    const localScatter = clamp(
      (scatterGlobal - delay * 0.08) / Math.max(0.92, 1 - delay * 0.08),
    );

    tempAssembly.lerpVectors(start, target, assembly);

    tempScatter.copy(scatterTarget);

    /*
      Curling movement keeps the
      particles feeling suspended
      in space instead of simply
      exploding outward.
    */

    tempTangent
      .crossVectors(nodeScatterAxes[i], upVector)
      .normalize()
      .multiplyScalar(
        Math.sin(localScatter * Math.PI) *
          (0.45 + delay * 1.35) *
          Math.sin(elapsedSeconds * 0.72 + phase),
      );

    tempPosition
      .lerpVectors(tempAssembly, tempScatter, localScatter)
      .add(tempTangent);

    /*
      Tiny breathing movement while
      the sculpture is fully assembled.
    */

    if (localScatter < 0.06 && assembly > 0.92) {
      tempPosition.x += Math.sin(elapsedSeconds * 0.52 + phase) * 0.008;

      tempPosition.y += Math.cos(elapsedSeconds * 0.43 + phase) * 0.009;
    }

    currentNodePositions[i].copy(tempPosition);

    positionAttribute.setXYZ(i, tempPosition.x, tempPosition.y, tempPosition.z);
  }

  positionAttribute.needsUpdate = true;

  const lineAttribute = lineGeometry.getAttribute("position");

  for (let i = 0; i < linePairs.length; i += 1) {
    const [firstIndex, secondIndex] = linePairs[i];

    const first = currentNodePositions[firstIndex];

    const second = currentNodePositions[secondIndex];

    const offset = i * 2;

    lineAttribute.setXYZ(offset, first.x, first.y, first.z);

    lineAttribute.setXYZ(offset + 1, second.x, second.y, second.z);
  }

  lineAttribute.needsUpdate = true;

  nodeMaterial.uniforms.uTime.value = elapsedSeconds;

  nodeMaterial.uniforms.uOpacity.value = Math.max(0.001, sculptureFade);

  lineMaterial.opacity =
    assembly *
    lineFade *
    (0.28 + 0.34 * (1 - scatterGlobal)) *
    (0.94 + Math.sin(elapsedSeconds * 0.8) * 0.06);

  bodyAura.material.opacity =
    assembly *
    sculptureFade *
    (0.075 + Math.sin(elapsedSeconds * 0.52) * 0.012);

  headHalo.material.opacity =
    assembly * sculptureFade * (0.16 + Math.sin(elapsedSeconds * 0.9) * 0.022);

  /*
    Initially the sculpture sits
    somewhat to the right so the
    quotation can occupy the left.
  */

  const introShift = smootherStep(mapRange(progress, 0.04, 0.3));

  sculptureGroup.position.x = THREE.MathUtils.lerp(
    isSmallScreen ? 0.45 : 3.15,

    isSmallScreen ? 0 : 0.3,

    introShift,
  );

  sculptureGroup.position.y = isSmallScreen ? 0.45 : 0.1;

  const baseScale = isSmallScreen ? 0.86 : 1.0;

  const scatterScale = 1 - scatterGlobal * 0.055;

  sculptureGroup.scale.setScalar(baseScale * scatterScale);

  sculptureGroup.rotation.y =
    -0.12 + Math.sin(elapsedSeconds * 0.15) * 0.025 + scatterGlobal * 0.2;

  sculptureGroup.rotation.x =
    Math.sin(elapsedSeconds * 0.11) * 0.012 - scatterGlobal * 0.045;

  sculptureGroup.rotation.z = -0.018 + Math.sin(elapsedSeconds * 0.09) * 0.008;

  /*
    Restrained camera motion.
    The sculpture should feel
    monumental rather than like
    a game object.
  */

  camera.position.z = THREE.MathUtils.lerp(
    isSmallScreen ? 19.5 : 18.2,

    isSmallScreen ? 18.4 : 16.9,

    scatterGlobal,
  );

  camera.position.x =
    Math.sin(elapsedSeconds * 0.11) * 0.055 * (1 - cardProgress);

  camera.position.y =
    0.15 + Math.sin(elapsedSeconds * 0.085) * 0.04 * (1 - cardProgress);

  camera.lookAt(
    0,

    isSmallScreen ? 0.4 : 0.15,

    0,
  );

  starField.material.uniforms.uOpacity.value =
    0.34 + scatterGlobal * 0.34 - cardProgress * 0.08;
}

/* ---------------------------------
   MAIN SCENE
--------------------------------- */

function updateScene(progress, elapsedSeconds) {
  updateSculpture(progress, elapsedSeconds);

  starField.material.uniforms.uTime.value = elapsedSeconds;

  starField.points.rotation.y = elapsedSeconds * 0.006 + progress * 0.075;

  starField.points.rotation.z = Math.sin(elapsedSeconds * 0.035) * 0.012;

  world.rotation.y = Math.sin(elapsedSeconds * 0.035) * 0.004;
}

/* ---------------------------------
   ANIMATION LOOP
--------------------------------- */

function animate(now) {
  const deltaSeconds = Math.min(
    0.05,

    (now - lastTime) / 1000,
  );

  lastTime = now;

  smoothScrollProgress = targetScrollProgress;

  const elapsedSeconds = now / 1000;

  updateScene(smoothScrollProgress, elapsedSeconds);

  updateInterface(smoothScrollProgress);

  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

/* ---------------------------------
   RESIZE
--------------------------------- */

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio,

      window.innerWidth <= 760 ? 1.2 : 1.55,
    ),
  );

  renderer.setSize(window.innerWidth, window.innerHeight);

  updateScrollProgress();
}

window.addEventListener("scroll", updateScrollProgress, {
  passive: true,
});

window.addEventListener("resize", handleResize);

updateScrollProgress();

requestAnimationFrame(animate);

/* ---------------------------------
   "SCROLL TO ENTER" BUTTON
--------------------------------- */

const archiveLink = document.querySelector(".scroll-to-archive");

const archiveTarget = document.getElementById("archive-entry");

if (archiveLink && archiveTarget) {
  archiveLink.addEventListener("click", (event) => {
    event.preventDefault();

    if (prefersReducedMotion) {
      archiveTarget.scrollIntoView({
        behavior: "auto",
      });

      return;
    }

    const startPosition = window.scrollY;

    const targetPosition =
      archiveTarget.getBoundingClientRect().top + window.scrollY;

    const distance = targetPosition - startPosition;

    const duration = 3000;

    const startTime = performance.now();

    function scrollAnimation(currentTime) {
      const elapsedTime = currentTime - startTime;

      const progress = Math.min(elapsedTime / duration, 1);

      const easedProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(
        0,

        startPosition + distance * easedProgress,
      );

      if (progress < 1) {
        requestAnimationFrame(scrollAnimation);
      }
    }

    requestAnimationFrame(scrollAnimation);
  });
}
