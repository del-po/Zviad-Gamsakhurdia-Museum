import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

/* =========================================================
   ZVIAD GAMSAKHURDIA DIGITAL MUSEUM
   CONTINUOUS HOME EXPERIENCE
   ========================================================= */

const canvas = document.getElementById("scene");
const root = document.documentElement;

const scrollTrack = document.getElementById("home-scroll");
const scrollNumber = document.getElementById("home-scroll-number");

const introPanel = document.querySelector('[data-home-panel="intro"]');

const cards = {
  family: document.querySelector('[data-home-panel="family"]'),
  politics: document.querySelector('[data-home-panel="politics"]'),
  works: document.querySelector('[data-home-panel="works"]'),
  blog: document.querySelector('[data-home-panel="blog"]'),
  archive: document.querySelector('[data-home-panel="archive"]'),
};

const jumpButtons = [...document.querySelectorAll("[data-home-jump]")];

const footer = document.getElementById("home-footer");

if (!canvas) {
  throw new Error('Homepage requires <canvas id="scene">.');
}

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const isSmallScreen = window.innerWidth <= 760;

/* =========================================================
   HELPERS
   ========================================================= */

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothStep(value) {
  const t = clamp(value);

  return t * t * (3 - 2 * t);
}

function smootherStep(value) {
  const t = clamp(value);

  return t * t * t * (t * (t * 6 - 15) + 10);
}

function mapRange(value, inputStart, inputEnd, outputStart = 0, outputEnd = 1) {
  const t = clamp(
    (value - inputStart) / Math.max(0.000001, inputEnd - inputStart),
  );

  return lerp(outputStart, outputEnd, t);
}

function createRng(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;

    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);

    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomRange(rng, min, max) {
  return min + rng() * (max - min);
}

function rotate2D(x, y, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  return {
    x: x * c - y * s,
    y: x * s + y * c,
  };
}

/* =========================================================
   MASTER TIMELINE
   ========================================================= */

/*
   These are the visual centres of the six worlds.

   The transitions between them are continuous.
*/

const TIMELINE = [
  {
    key: "intro",
    at: 0,
  },

  {
    key: "family",
    at: 0.17,
  },

  {
    key: "politics",
    at: 0.35,
  },

  {
    key: "works",
    at: 0.53,
  },

  {
    key: "blog",
    at: 0.71,
  },

  {
    key: "archive",
    at: 0.89,
  },

  {
    key: "archive",
    at: 1,
  },
];

const CARD_CENTERS = {
  family: 0.17,
  politics: 0.35,
  works: 0.53,
  blog: 0.71,
  archive: 0.89,
};

/* =========================================================
   THREE.JS RENDERER
   ========================================================= */

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.toneMapping = THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.05;

renderer.setClearColor(0xffffff, 0);

/* =========================================================
   SCENE / CAMERA
   ========================================================= */

const scene = new THREE.Scene();

scene.fog = new THREE.FogExp2(0xf8f8f5, isSmallScreen ? 0.033 : 0.024);

const camera = new THREE.PerspectiveCamera(
  isSmallScreen ? 50 : 43,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
);

camera.position.set(0, 0, isSmallScreen ? 12.5 : 11.5);

const world = new THREE.Group();

scene.add(world);

/* =========================================================
   GLOBAL PARTICLE SYSTEM
   ========================================================= */

/*
   SAME particles exist throughout the entire experience.

   Their target coordinates change for:

   INTRO
   FAMILY
   POLITICS
   WORKS
   BLOG
   ARCHIVE

   Therefore one world literally morphs into the next.
*/

const PARTICLE_COUNT = isSmallScreen ? 720 : 1250;

const targetSets = {};

const phases = new Float32Array(PARTICLE_COUNT);

const sizes = new Float32Array(PARTICLE_COUNT);

const goldValues = new Float32Array(PARTICLE_COUNT);

const transitionOffsets = new Float32Array(PARTICLE_COUNT * 3);

const positionBuffer = new Float32Array(PARTICLE_COUNT * 3);

const rngGeneral = createRng(19390331);

for (let i = 0; i < PARTICLE_COUNT; i += 1) {
  phases[i] = rngGeneral() * Math.PI * 2;

  sizes[i] = randomRange(rngGeneral, 0.75, 2.4);

  goldValues[i] = rngGeneral();

  transitionOffsets[i * 3] = randomRange(rngGeneral, -0.75, 0.75);

  transitionOffsets[i * 3 + 1] = randomRange(rngGeneral, -0.75, 0.75);

  transitionOffsets[i * 3 + 2] = randomRange(rngGeneral, -1.1, 1.1);
}

/* =========================================================
   TARGET 00 — INTRO
   ABSTRACT ORBITAL SYSTEM
   ========================================================= */

function createIntroTargets() {
  const rng = createRng(1001);

  const targets = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const index = i * 3;

    const mode = i % 5;

    let x = 0;
    let y = 0;
    let z = 0;

    if (mode <= 2) {
      /*
        Nested orbital rings.
      */

      const ring = mode;

      const radius = 1.65 + ring * 1.15 + randomRange(rng, -0.18, 0.18);

      const angle = randomRange(rng, 0, Math.PI * 2);

      let rx = Math.cos(angle) * radius;

      let ry = Math.sin(angle) * radius * 0.62;

      const rotation = ring === 0 ? -0.4 : ring === 1 ? 0.3 : -0.12;

      const rotated = rotate2D(rx, ry, rotation);

      x = rotated.x;
      y = rotated.y;

      z = Math.sin(angle * 2) * 0.55 + randomRange(rng, -0.12, 0.12);
    } else {
      /*
        Loose central constellation.
      */

      const radius = Math.pow(rng(), 0.55) * 3.7;

      const angle = rng() * Math.PI * 2;

      x = Math.cos(angle) * radius;

      y = Math.sin(angle) * radius * 0.68;

      z = randomRange(rng, -1.5, 1.5);
    }

    targets[index] = x;
    targets[index + 1] = y;
    targets[index + 2] = z;
  }

  return targets;
}

/* =========================================================
   TARGET 01 — FAMILY
   TREE / GENEALOGY / ROOT SYSTEM
   ========================================================= */

function createFamilyTargets() {
  const rng = createRng(2002);

  const targets = new Float32Array(PARTICLE_COUNT * 3);

  const offsetX = isSmallScreen ? 0 : 2.15;

  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const index = i * 3;

    const p = i / PARTICLE_COUNT;

    let x;
    let y;
    let z;

    /*
      TRUNK
    */

    if (p < 0.19) {
      const t = p / 0.19;

      x = Math.sin(t * 8) * 0.08 + offsetX;

      y = lerp(-3.5, 1.15, t);

      z = randomRange(rng, -0.12, 0.12);
    } else if (p < 0.38) {

    /*
      LEFT BRANCH
    */
      const t = (p - 0.19) / 0.19;

      x = offsetX - t * 3.45 + Math.sin(t * 6) * 0.12;

      y = 0.5 + t * 2.6;

      z = randomRange(rng, -0.22, 0.22);
    } else if (p < 0.57) {

    /*
      RIGHT BRANCH
    */
      const t = (p - 0.38) / 0.19;

      x = offsetX + t * 3.45 + Math.sin(t * 7) * 0.12;

      y = 0.5 + t * 2.7;

      z = randomRange(rng, -0.22, 0.22);
    } else if (p < 0.76) {

    /*
      ROOTS
    */
      const t = (p - 0.57) / 0.19;

      const direction = i % 2 === 0 ? -1 : 1;

      x = offsetX + direction * t * 2.75;

      y = -2.9 - t * 1.1 + Math.sin(t * Math.PI) * 0.65;

      z = randomRange(rng, -0.35, 0.35);
    } else {

    /*
      FAMILY NODES
    */
      const nodeIndex = i % 3;

      const centres = [
        [offsetX - 3.35, 3.05],

        [offsetX, 2.35],

        [offsetX + 3.35, 3.15],
      ];

      const center = centres[nodeIndex];

      const angle = randomRange(rng, 0, Math.PI * 2);

      const radius = randomRange(rng, 0.18, 0.65);

      x = center[0] + Math.cos(angle) * radius;

      y = center[1] + Math.sin(angle) * radius;

      z = randomRange(rng, -0.32, 0.32);
    }

    targets[index] = x;
    targets[index + 1] = y;
    targets[index + 2] = z;
  }

  return targets;
}

/* =========================================================
   TARGET 02 — POLITICS
   STATE / TIMELINE / PRESSURE
   ========================================================= */

function createPoliticsTargets() {
  const rng = createRng(3003);

  const targets = new Float32Array(PARTICLE_COUNT * 3);

  const offsetX = isSmallScreen ? 0 : -2;

  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const index = i * 3;

    const p = i / PARTICLE_COUNT;

    let x;
    let y;
    let z;

    /*
      Historical timeline.
    */

    if (p < 0.35) {
      const t = p / 0.35;

      x = offsetX + lerp(-4, 4, t);

      y = -2.25 + randomRange(rng, -0.08, 0.08);

      z = randomRange(rng, -0.18, 0.18);
    } else if (p < 0.57) {

    /*
      Vertical event markers.
    */
      const marker = i % 6;

      const markerX = offsetX - 3.8 + marker * 1.52;

      const t = rng();

      x = markerX + randomRange(rng, -0.05, 0.05);

      y = lerp(-2.25, 1.45 + marker * 0.12, t);

      z = randomRange(rng, -0.12, 0.12);
    } else if (p < 0.82) {

    /*
      Central state diamond.
    */
      const side = i % 4;

      const t = rng();

      const radius = 2.25;

      const corners = [
        [0, radius],

        [radius, 0],

        [0, -radius],

        [-radius, 0],
      ];

      const a = corners[side];

      const b = corners[(side + 1) % 4];

      x = offsetX + lerp(a[0], b[0], t);

      y = 0.7 + lerp(a[1], b[1], t);

      z = randomRange(rng, -0.28, 0.28);
    } else {

    /*
      Radiating political pressure.
    */
      const angle = randomRange(rng, 0, Math.PI * 2);

      const radius = randomRange(rng, 0.5, 4.1);

      x = offsetX + Math.cos(angle) * radius;

      y = 0.65 + Math.sin(angle) * radius * 0.62;

      z = randomRange(rng, -1, 1);
    }

    targets[index] = x;
    targets[index + 1] = y;
    targets[index + 2] = z;
  }

  return targets;
}

/* =========================================================
   TARGET 03 — WORKS
   PAGES / BOOKS / TEXT
   ========================================================= */

function createWorksTargets() {
  const rng = createRng(4004);

  const targets = new Float32Array(PARTICLE_COUNT * 3);

  const offsetX = isSmallScreen ? 0 : 2;

  const pageCount = 4;

  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const index = i * 3;

    const page = i % pageCount;

    const localIndex = Math.floor(i / pageCount);

    const edge = localIndex % 4;

    const t = rng();

    const width = 3.8;

    const height = 5.1;

    let localX;
    let localY;

    if (edge === 0) {
      localX = lerp(-width / 2, width / 2, t);

      localY = height / 2;
    } else if (edge === 1) {
      localX = width / 2;

      localY = lerp(height / 2, -height / 2, t);
    } else if (edge === 2) {
      localX = lerp(width / 2, -width / 2, t);

      localY = -height / 2;
    } else {
      localX = -width / 2;

      localY = lerp(-height / 2, height / 2, t);
    }

    /*
      Each page is slightly displaced
      and rotated in 3D.
    */

    const pageShift = page - (pageCount - 1) / 2;

    const rotation = pageShift * 0.055;

    const rotated = rotate2D(localX, localY, rotation);

    targets[index] = offsetX + rotated.x + pageShift * 0.25;

    targets[index + 1] = rotated.y + pageShift * 0.07;

    targets[index + 2] = pageShift * -0.48 + randomRange(rng, -0.04, 0.04);
  }

  return targets;
}

/* =========================================================
   TARGET 04 — BLOG
   LIVING NETWORK / ORBITS
   ========================================================= */

function createBlogTargets() {
  const rng = createRng(5005);

  const targets = new Float32Array(PARTICLE_COUNT * 3);

  const offsetX = isSmallScreen ? 0 : -2;

  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const index = i * 3;

    const ring = i % 5;

    const radius = 1 + ring * 0.82 + randomRange(rng, -0.12, 0.12);

    const angle = randomRange(rng, 0, Math.PI * 2);

    const squash = 0.46 + ring * 0.06;

    let x = Math.cos(angle) * radius;

    let y = Math.sin(angle) * radius * squash;

    const rotation = ring % 2 === 0 ? -0.35 : 0.28;

    const rotated = rotate2D(x, y, rotation);

    x = offsetX + rotated.x;

    y = rotated.y;

    const z =
      Math.sin(angle * (1 + ring * 0.5)) * 0.8 + randomRange(rng, -0.18, 0.18);

    targets[index] = x;
    targets[index + 1] = y;
    targets[index + 2] = z;
  }

  return targets;
}

/* =========================================================
   TARGET 05 — ARCHIVE
   STRUCTURED RECORD MATRIX
   ========================================================= */

function createArchiveTargets() {
  const rng = createRng(6006);

  const targets = new Float32Array(PARTICLE_COUNT * 3);

  const columns = isSmallScreen ? 7 : 11;

  const rows = isSmallScreen ? 8 : 7;

  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const index = i * 3;

    const cell = i % (columns * rows);

    const column = cell % columns;

    const row = Math.floor(cell / columns);

    const layer = Math.floor(i / (columns * rows)) % 4;

    const spacingX = isSmallScreen ? 0.82 : 0.74;

    const spacingY = 0.72;

    const baseX = (column - (columns - 1) / 2) * spacingX;

    const baseY = ((rows - 1) / 2 - row) * spacingY;

    /*
      Little record / catalogue cell.
    */

    const withinCell = i % 4;

    let offsetX = 0;
    let offsetY = 0;

    if (withinCell === 0) {
      offsetX = randomRange(rng, -0.25, 0.25);

      offsetY = -0.18;
    } else if (withinCell === 1) {
      offsetX = -0.28;

      offsetY = randomRange(rng, -0.2, 0.2);
    } else if (withinCell === 2) {
      offsetX = 0.28;

      offsetY = randomRange(rng, -0.2, 0.2);
    } else {
      offsetX = randomRange(rng, -0.25, 0.25);

      offsetY = 0.18;
    }

    targets[index] = baseX + offsetX;

    targets[index + 1] = baseY + offsetY;

    targets[index + 2] = -layer * 0.32 + randomRange(rng, -0.04, 0.04);
  }

  return targets;
}

/* =========================================================
   BUILD ALL TARGET WORLDS
   ========================================================= */

targetSets.intro = createIntroTargets();

targetSets.family = createFamilyTargets();

targetSets.politics = createPoliticsTargets();

targetSets.works = createWorksTargets();

targetSets.blog = createBlogTargets();

targetSets.archive = createArchiveTargets();

/* =========================================================
   PARTICLE GEOMETRY
   ========================================================= */

positionBuffer.set(targetSets.intro);

const particleGeometry = new THREE.BufferGeometry();

particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positionBuffer, 3).setUsage(THREE.DynamicDrawUsage),
);

particleGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

particleGeometry.setAttribute(
  "aGold",
  new THREE.BufferAttribute(goldValues, 1),
);

particleGeometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

/* =========================================================
   PARTICLE SHADER
   ========================================================= */

const particleMaterial = new THREE.ShaderMaterial({
  transparent: true,

  depthWrite: false,

  blending: THREE.NormalBlending,

  uniforms: {
    uTime: {
      value: 0,
    },

    uTransition: {
      value: 0,
    },

    uOpacity: {
      value: 0.92,
    },
  },

  vertexShader: `
      attribute float aSize;
      attribute float aGold;
      attribute float aPhase;

      uniform float uTime;
      uniform float uTransition;

      varying float vGold;
      varying float vAlpha;

      void main() {
        vec3 p = position;

        float ambient =
          0.012 +
          uTransition *
          0.028;

        p.x +=
          sin(
            uTime * 0.38 +
            aPhase
          ) *
          ambient;

        p.y +=
          cos(
            uTime * 0.31 +
            aPhase * 1.23
          ) *
          ambient;

        p.z +=
          sin(
            uTime * 0.25 +
            aPhase * 0.73
          ) *
          ambient *
          1.4;

        vec4 mvPosition =
          modelViewMatrix *
          vec4(
            p,
            1.0
          );

        gl_Position =
          projectionMatrix *
          mvPosition;

        gl_PointSize =
          aSize *
          (
            70.0 /
            max(
              1.0,
              -mvPosition.z
            )
          );

        vGold = aGold;

        vAlpha =
          0.82 +
          0.18 *
          sin(
            uTime * 0.7 +
            aPhase
          );
      }
    `,

  fragmentShader: `
      uniform float uOpacity;

      varying float vGold;
      varying float vAlpha;

      void main() {
        vec2 p =
          gl_PointCoord -
          0.5;

        float distanceFromCenter =
          length(p);

        if (
          distanceFromCenter >
          0.5
        ) {
          discard;
        }

        float alpha =
          1.0 -
          smoothstep(
            0.1,
            0.5,
            distanceFromCenter
          );

        vec3 dark =
          vec3(
            0.09,
            0.09,
            0.09
          );

        vec3 grey =
          vec3(
            0.38,
            0.38,
            0.36
          );

        vec3 gold =
          vec3(
            0.86,
            0.65,
            0.12
          );

        vec3 color =
          mix(
            dark,
            grey,
            smoothstep(
              0.15,
              0.65,
              vGold
            )
          );

        color =
          mix(
            color,
            gold,
            smoothstep(
              0.82,
              1.0,
              vGold
            )
          );

        gl_FragColor =
          vec4(
            color,
            alpha *
            vAlpha *
            uOpacity
          );
      }
    `,
});

const particles = new THREE.Points(particleGeometry, particleMaterial);

particles.frustumCulled = false;

world.add(particles);

/* =========================================================
   BACKGROUND DUST
   ========================================================= */

function createBackgroundDust() {
  const rng = createRng(7777);

  const count = isSmallScreen ? 320 : 700;

  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = randomRange(rng, -15, 15);

    positions[i * 3 + 1] = randomRange(rng, -9, 9);

    positions[i * 3 + 2] = randomRange(rng, -20, -4);
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x777777,

    size: isSmallScreen ? 0.017 : 0.023,

    transparent: true,

    opacity: 0.23,

    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);

  world.add(points);

  return {
    points,
    material,
  };
}

const backgroundDust = createBackgroundDust();

/* =========================================================
   STRUCTURAL LINE HELPERS
   ========================================================= */

function createLineSegments(segmentPoints, color = 0x171717) {
  const positions = [];

  segmentPoints.forEach((segment) => {
    positions.push(...segment[0], ...segment[1]);
  });

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );

  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  const lines = new THREE.LineSegments(geometry, material);

  return lines;
}

function createCircle(
  radius,
  { x = 0, y = 0, z = 0, squash = 1, rotation = 0, color = 0x171717 } = {},
) {
  const points = [];

  const count = 120;

  for (let i = 0; i <= count; i += 1) {
    const angle = (i / count) * Math.PI * 2;

    const px = Math.cos(angle) * radius;

    const py = Math.sin(angle) * radius * squash;

    const rotated = rotate2D(px, py, rotation);

    points.push(new THREE.Vector3(x + rotated.x, y + rotated.y, z));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  return new THREE.Line(geometry, material);
}

function setGroupOpacity(group, opacity) {
  group.traverse((object) => {
    if (object.material && "opacity" in object.material) {
      object.material.opacity = opacity;

      object.material.transparent = true;
    }
  });

  group.visible = opacity > 0.002;
}

/* =========================================================
   INTRO STRUCTURE
   ========================================================= */

const introStructure = new THREE.Group();

introStructure.add(
  createCircle(1.65, {
    squash: 0.62,
    rotation: -0.4,
  }),
);

introStructure.add(
  createCircle(2.8, {
    squash: 0.6,
    rotation: 0.3,
    color: 0x8f782e,
  }),
);

introStructure.add(
  createCircle(4, {
    squash: 0.58,
    rotation: -0.12,
  }),
);

world.add(introStructure);

/* =========================================================
   FAMILY STRUCTURE
   ========================================================= */

const familyStructure = new THREE.Group();

const familyOffset = isSmallScreen ? 0 : 2.15;

familyStructure.add(
  createLineSegments(
    [
      [
        [familyOffset, -3.6, 0],
        [familyOffset, 1.2, 0],
      ],

      [
        [familyOffset, 0.5, 0],
        [familyOffset - 3.35, 3.05, 0],
      ],

      [
        [familyOffset, 0.5, 0],
        [familyOffset + 3.35, 3.15, 0],
      ],

      [
        [familyOffset, -2.8, 0],
        [familyOffset - 2.8, -3.85, 0],
      ],

      [
        [familyOffset, -2.8, 0],
        [familyOffset + 2.8, -3.85, 0],
      ],
    ],
    0x171717,
  ),
);

familyStructure.add(
  createCircle(0.68, {
    x: familyOffset - 3.35,

    y: 3.05,

    color: 0xb18b20,
  }),
);

familyStructure.add(
  createCircle(0.68, {
    x: familyOffset,

    y: 2.35,
  }),
);

familyStructure.add(
  createCircle(0.68, {
    x: familyOffset + 3.35,

    y: 3.15,

    color: 0xb18b20,
  }),
);

world.add(familyStructure);

/* =========================================================
   POLITICS STRUCTURE
   ========================================================= */

const politicsStructure = new THREE.Group();

const politicsOffset = isSmallScreen ? 0 : -2;

const politicalSegments = [
  [
    [politicsOffset - 4, -2.25, 0],

    [politicsOffset + 4, -2.25, 0],
  ],
];

for (let i = 0; i < 6; i += 1) {
  const x = politicsOffset - 3.8 + i * 1.52;

  politicalSegments.push([
    [x, -2.25, 0],

    [x, 1.35 + i * 0.12, 0],
  ]);
}

politicalSegments.push(
  [
    [politicsOffset, 2.95, 0],

    [politicsOffset + 2.25, 0.7, 0],
  ],

  [
    [politicsOffset + 2.25, 0.7, 0],

    [politicsOffset, -1.55, 0],
  ],

  [
    [politicsOffset, -1.55, 0],

    [politicsOffset - 2.25, 0.7, 0],
  ],

  [
    [politicsOffset - 2.25, 0.7, 0],

    [politicsOffset, 2.95, 0],
  ],
);

politicsStructure.add(createLineSegments(politicalSegments));

world.add(politicsStructure);

/* =========================================================
   WORKS STRUCTURE
   ========================================================= */

const worksStructure = new THREE.Group();

const worksOffset = isSmallScreen ? 0 : 2;

for (let page = 0; page < 4; page += 1) {
  const shift = page - 1.5;

  const x = worksOffset + shift * 0.25;

  const y = shift * 0.07;

  const z = shift * -0.48;

  const width = 3.8;
  const height = 5.1;

  const pageLines = createLineSegments(
    [
      [
        [x - width / 2, y + height / 2, z],

        [x + width / 2, y + height / 2, z],
      ],

      [
        [x + width / 2, y + height / 2, z],

        [x + width / 2, y - height / 2, z],
      ],

      [
        [x + width / 2, y - height / 2, z],

        [x - width / 2, y - height / 2, z],
      ],

      [
        [x - width / 2, y - height / 2, z],

        [x - width / 2, y + height / 2, z],
      ],
    ],

    page % 2 === 0 ? 0x171717 : 0x9a7c27,
  );

  worksStructure.add(pageLines);
}

world.add(worksStructure);

/* =========================================================
   BLOG STRUCTURE
   ========================================================= */

const blogStructure = new THREE.Group();

const blogOffset = isSmallScreen ? 0 : -2;

for (let ring = 0; ring < 5; ring += 1) {
  blogStructure.add(
    createCircle(
      1 + ring * 0.82,

      {
        x: blogOffset,

        squash: 0.46 + ring * 0.06,

        rotation: ring % 2 === 0 ? -0.35 : 0.28,

        color: ring === 2 ? 0xaa8728 : 0x171717,
      },
    ),
  );
}

world.add(blogStructure);

/* =========================================================
   ARCHIVE STRUCTURE
   ========================================================= */

const archiveStructure = new THREE.Group();

const archiveColumns = isSmallScreen ? 7 : 11;

const archiveRows = isSmallScreen ? 8 : 7;

const archiveSegments = [];

for (let c = 0; c <= archiveColumns; c += 1) {
  const x = (c - archiveColumns / 2) * (isSmallScreen ? 0.82 : 0.74);

  archiveSegments.push([
    [x, -archiveRows * 0.36, 0],

    [x, archiveRows * 0.36, 0],
  ]);
}

for (let r = 0; r <= archiveRows; r += 1) {
  const y = (r - archiveRows / 2) * 0.72;

  archiveSegments.push([
    [-archiveColumns * (isSmallScreen ? 0.41 : 0.37), y, 0],

    [archiveColumns * (isSmallScreen ? 0.41 : 0.37), y, 0],
  ]);
}

archiveStructure.add(createLineSegments(archiveSegments));

world.add(archiveStructure);

/* =========================================================
   STRUCTURE REGISTRY
   ========================================================= */

const structures = {
  intro: introStructure,

  family: familyStructure,

  politics: politicsStructure,

  works: worksStructure,

  blog: blogStructure,

  archive: archiveStructure,
};

/* =========================================================
   SCROLL STATE
   ========================================================= */

let targetProgress = 0;

let renderedProgress = 0;

let previousFrame = performance.now();

/* =========================================================
   SCROLL CALCULATION
   ========================================================= */

function getMaximumScroll() {
  return Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight,
  );
}

function updateTargetProgress() {
  targetProgress = clamp(window.scrollY / getMaximumScroll());
}

updateTargetProgress();

renderedProgress = targetProgress;

/* =========================================================
   FIND CURRENT MORPH SEGMENT
   ========================================================= */

function getTimelineSegment(progress) {
  for (let i = 0; i < TIMELINE.length - 1; i += 1) {
    const current = TIMELINE[i];

    const next = TIMELINE[i + 1];

    if (progress >= current.at && progress <= next.at) {
      const local = clamp(
        (progress - current.at) / Math.max(0.000001, next.at - current.at),
      );

      return {
        from: current.key,

        to: next.key,

        raw: local,

        eased: smootherStep(local),
      };
    }
  }

  return {
    from: "archive",
    to: "archive",
    raw: 1,
    eased: 1,
  };
}

/* =========================================================
   PARTICLE MORPH
   ========================================================= */

function updateParticles(progress, elapsed) {
  const segment = getTimelineSegment(progress);

  const from = targetSets[segment.from];

  const to = targetSets[segment.to];

  const t = segment.eased;

  /*
    Arc reaches maximum halfway
    between two worlds.

    This prevents the morph from looking
    like simple straight-line interpolation.
  */

  const arc = Math.sin(segment.raw * Math.PI);

  const positionAttribute = particleGeometry.getAttribute("position");

  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const index = i * 3;

    let x = lerp(from[index], to[index], t);

    let y = lerp(from[index + 1], to[index + 1], t);

    let z = lerp(from[index + 2], to[index + 2], t);

    /*
      Curved transition movement.
    */

    const wave = Math.sin(phases[i] + segment.raw * Math.PI * 2);

    x += transitionOffsets[index] * arc * 0.65;

    y += transitionOffsets[index + 1] * arc * 0.65;

    z += transitionOffsets[index + 2] * arc * 0.8 + wave * arc * 0.18;

    positionAttribute.setXYZ(i, x, y, z);
  }

  positionAttribute.needsUpdate = true;

  particleMaterial.uniforms.uTime.value = elapsed;

  particleMaterial.uniforms.uTransition.value = arc;
}

/* =========================================================
   STAGE WEIGHT
   ========================================================= */

function stageWeight(progress, center, width = 0.105) {
  const distance = Math.abs(progress - center);

  return 1 - smoothStep(clamp(distance / width));
}

/* =========================================================
   STRUCTURES
   ========================================================= */

function updateStructures(progress, elapsed) {
  const weights = {
    intro: stageWeight(progress, 0, 0.14),

    family: stageWeight(progress, 0.17, 0.115),

    politics: stageWeight(progress, 0.35, 0.115),

    works: stageWeight(progress, 0.53, 0.115),

    blog: stageWeight(progress, 0.71, 0.115),

    archive: stageWeight(progress, 0.89, 0.14),
  };

  Object.entries(structures).forEach(([key, group]) => {
    const weight = weights[key];

    setGroupOpacity(group, weight * (key === "archive" ? 0.12 : 0.18));

    const scale = 0.94 + weight * 0.06;

    group.scale.setScalar(scale);
  });

  /*
    Individual worlds remain subtly alive.
  */

  introStructure.rotation.z = elapsed * 0.025;

  introStructure.rotation.y = Math.sin(elapsed * 0.13) * 0.05;

  familyStructure.rotation.z = Math.sin(elapsed * 0.22) * 0.006;

  politicsStructure.rotation.y = Math.sin(elapsed * 0.16) * 0.025;

  worksStructure.rotation.y = Math.sin(elapsed * 0.18) * 0.04;

  blogStructure.rotation.z = elapsed * 0.018;

  blogStructure.rotation.y = Math.sin(elapsed * 0.1) * 0.07;

  archiveStructure.rotation.x = Math.sin(elapsed * 0.11) * 0.018;
}

/* =========================================================
   HTML CARD VISIBILITY
   ========================================================= */

function cardWeight(progress, center) {
  const distance = Math.abs(progress - center);

  /*
    Stable reading zone.
  */

  if (distance <= 0.043) {
    return 1;
  }

  /*
    Fade through transition.
  */

  if (distance <= 0.083) {
    return 1 - smoothStep(mapRange(distance, 0.043, 0.083));
  }

  return 0;
}

function updateCards(progress) {
  Object.entries(cards).forEach(([key, card]) => {
    if (!card) {
      return;
    }

    const weight = cardWeight(progress, CARD_CENTERS[key]);

    const enteringY = 26 * (1 - weight);

    const scale = 0.975 + weight * 0.025;

    card.style.opacity = weight.toFixed(4);

    card.style.transform = `translate3d(0, ${enteringY}px, 0) scale(${scale})`;

    card.style.pointerEvents = weight > 0.8 ? "auto" : "none";

    card.style.visibility = weight > 0.01 ? "visible" : "hidden";

    const active = weight > 0.72;

    card.classList.toggle("is-active", active);

    card.setAttribute("aria-hidden", active ? "false" : "true");
  });
}

/* =========================================================
   INTRO PANEL
   ========================================================= */

function updateIntro(progress) {
  if (!introPanel) {
    return;
  }

  const weight = 1 - smoothStep(mapRange(progress, 0.025, 0.105));

  introPanel.style.opacity = weight.toFixed(4);

  introPanel.style.transform = `translate3d(0, ${-24 * (1 - weight)}px, 0)`;

  introPanel.style.pointerEvents = weight > 0.5 ? "auto" : "none";

  introPanel.style.visibility = weight > 0.01 ? "visible" : "hidden";
}

/* =========================================================
   ACTIVE CHAPTER INDEX
   ========================================================= */

function getNearestChapter(progress) {
  if (progress < 0.08) {
    return {
      key: "intro",
      number: "00",
    };
  }

  const chapters = [
    {
      key: "family",
      at: 0.17,
      number: "01",
    },

    {
      key: "politics",
      at: 0.35,
      number: "02",
    },

    {
      key: "works",
      at: 0.53,
      number: "03",
    },

    {
      key: "blog",
      at: 0.71,
      number: "04",
    },

    {
      key: "archive",
      at: 0.89,
      number: "05",
    },
  ];

  let nearest = chapters[0];

  let bestDistance = Infinity;

  chapters.forEach((chapter) => {
    const distance = Math.abs(progress - chapter.at);

    if (distance < bestDistance) {
      nearest = chapter;

      bestDistance = distance;
    }
  });

  return nearest;
}

function updateExperienceIndex(progress) {
  const active = getNearestChapter(progress);

  if (scrollNumber) {
    scrollNumber.textContent = active.number;
  }

  jumpButtons.forEach((button) => {
    const key = button.dataset.homeJump;

    button.classList.toggle("is-active", key === active.key);
  });
}

/* =========================================================
   FOOTER
   ========================================================= */

function updateFooter(progress) {
  if (!footer) {
    return;
  }

  const weight = smoothStep(mapRange(progress, 0.925, 0.985));

  footer.style.opacity = weight.toFixed(4);

  footer.style.transform = `translate3d(0, ${30 * (1 - weight)}px, 0)`;

  footer.style.pointerEvents = weight > 0.9 ? "auto" : "none";

  footer.classList.toggle("is-interactive", weight > 0.9);
}

/* =========================================================
   CAMERA
   ========================================================= */

function updateCamera(progress, elapsed) {
  /*
    Tiny forward/back movement creates
    depth through the entire experience.
  */

  const breathing = Math.sin(elapsed * 0.13) * 0.035;

  camera.position.z =
    (isSmallScreen ? 12.5 : 11.5) + breathing - progress * 0.4;

  camera.position.x = Math.sin(elapsed * 0.085) * 0.035;

  camera.position.y = Math.cos(elapsed * 0.07) * 0.025;

  camera.lookAt(0, 0, 0);
}

/* =========================================================
   WORLD MOVEMENT
   ========================================================= */

function updateWorld(progress, elapsed) {
  /*
    The entire universe remains subtly alive.
  */

  world.rotation.y = Math.sin(elapsed * 0.045) * 0.008;

  world.rotation.x = Math.cos(elapsed * 0.038) * 0.004;

  backgroundDust.points.rotation.y = elapsed * 0.0025;

  /*
    Archive becomes slightly denser / calmer.
  */

  backgroundDust.material.opacity = lerp(
    0.18,
    0.3,
    smoothStep(mapRange(progress, 0.72, 0.95)),
  );
}

/* =========================================================
   CSS VARIABLES
   ========================================================= */

function updateCssVariables(progress) {
  root.style.setProperty("--home-progress", progress.toFixed(5));

  root.style.setProperty(
    "--home-progress-percent",
    `${(progress * 100).toFixed(2)}%`,
  );
}

/* =========================================================
   COMPLETE FRAME UPDATE
   ========================================================= */

function updateExperience(progress, elapsed) {
  updateParticles(progress, elapsed);

  updateStructures(progress, elapsed);

  updateCamera(progress, elapsed);

  updateWorld(progress, elapsed);

  updateIntro(progress);

  updateCards(progress);

  updateExperienceIndex(progress);

  updateFooter(progress);

  updateCssVariables(progress);
}

/* =========================================================
   ANIMATION LOOP
   ========================================================= */

function animate(now) {
  const delta = Math.min(0.05, (now - previousFrame) / 1000);

  previousFrame = now;

  /*
    Very responsive scroll scrubbing.

    Almost direct connection to the wheel,
    with only enough damping to remove jitter.
  */

  const response = prefersReducedMotion ? 1 : 1 - Math.exp(-42 * delta);

  renderedProgress = lerp(renderedProgress, targetProgress, response);

  if (Math.abs(renderedProgress - targetProgress) < 0.00004) {
    renderedProgress = targetProgress;
  }

  const elapsed = now / 1000;

  updateExperience(renderedProgress, elapsed);

  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

/* =========================================================
   RESIZE
   ========================================================= */

function resize() {
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, window.innerWidth <= 760 ? 1.15 : 1.5),
  );

  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  updateTargetProgress();
}

resize();

/* =========================================================
   SCROLL
   ========================================================= */

window.addEventListener("scroll", updateTargetProgress, {
  passive: true,
});

window.addEventListener("resize", resize);

/* =========================================================
   CHAPTER JUMP BUTTONS
   ========================================================= */

const jumpTargets = {
  family: document.getElementById("scroll-family"),

  politics: document.getElementById("scroll-politics"),

  works: document.getElementById("scroll-works"),

  blog: document.getElementById("scroll-blog"),

  archive: document.getElementById("scroll-archive"),
};

jumpButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.homeJump;

    const target = jumpTargets[key];

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",

      block: "center",
    });
  });
});

/* =========================================================
   START
   ========================================================= */

requestAnimationFrame(animate);
