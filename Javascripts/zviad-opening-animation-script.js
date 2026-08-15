import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("scene");
const card = document.getElementById("reveal-card");
const footer =
  document.getElementById("home-footer") ??
  document.getElementById("archive-footer");
const root = document.documentElement;

if (!canvas) {
  throw new Error('The Three.js canvas with id="scene" was not found.');
}

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const smallScreenQuery = window.matchMedia("(max-width: 760px)");
let isSmallScreen = smallScreenQuery.matches;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xffffff, isSmallScreen ? 0.026 : 0.018);

const camera = new THREE.PerspectiveCamera(
  isSmallScreen ? 49 : 43,
  window.innerWidth / window.innerHeight,
  0.1,
  180,
);

const monument = new THREE.Group();
scene.add(monument);

scene.add(new THREE.HemisphereLight(0xffffff, 0x59616c, 2.15));

const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
keyLight.position.set(-7, 10, 12);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0x87a8cc, 24, 48, 2);
rimLight.position.set(10, 3, 12);
scene.add(rimLight);

const warmLight = new THREE.PointLight(0xffd7a1, 22, 46, 2);
warmLight.position.set(-11, 5, 8);
scene.add(warmLight);

/* ---------------------------------
   COMPLETE SOLAR SYSTEM
--------------------------------- */

const cosmicSystem = new THREE.Group();
monument.add(cosmicSystem);

/*
  The sun, all eight planets, and all eight orbit paths live in one
  shared three-dimensional group. The camera looks down toward the
  horizontal X/Z orbital plane, so the circular paths appear as wide
  ellipses on screen, matching the reference composition.
*/
const solarSystem = new THREE.Group();
cosmicSystem.add(solarSystem);

function setSolarSystemScale() {
  solarSystem.scale.setScalar(isSmallScreen ? 0.61 : 0.92);
}

setSolarSystemScale();

/* ---------------------------------
   STAR FIELD
--------------------------------- */

const starCount = isSmallScreen ? 560 : 1060;
const starStarts = [];
const starDriftAxes = [];
const starDelays = [];
const starPositions = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3);
const starSizes = new Float32Array(starCount);
const starPhases = new Float32Array(starCount);

const starPalette = [
  new THREE.Color(0xf8fbff),
  new THREE.Color(0xdce8f5),
  new THREE.Color(0xffffff),
  new THREE.Color(0xe8edf3),
  new THREE.Color(0xffefcf),
  new THREE.Color(0xbfd4ea),
];

for (let index = 0; index < starCount; index += 1) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 15 + Math.random() * 38;
  const height = (Math.random() - 0.5) * 34;

  const start = new THREE.Vector3(
    Math.cos(angle) * radius + (Math.random() - 0.5) * 7,
    height,
    Math.sin(angle) * radius + (Math.random() - 0.5) * 12,
  );

  const driftAxis = new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5,
  ).normalize();

  const delay = Math.random();
  const color =
    starPalette[Math.floor(Math.random() * starPalette.length)].clone();

  color.offsetHSL(
    (Math.random() - 0.5) * 0.025,
    (Math.random() - 0.5) * 0.08,
    (Math.random() - 0.5) * 0.1,
  );

  starStarts.push(start);
  starDriftAxes.push(driftAxis);
  starDelays.push(delay);

  starPositions[index * 3] = start.x;
  starPositions[index * 3 + 1] = start.y;
  starPositions[index * 3 + 2] = start.z;

  starColors[index * 3] = color.r;
  starColors[index * 3 + 1] = color.g;
  starColors[index * 3 + 2] = color.b;

  starSizes[index] = 0.7 + Math.pow(Math.random(), 3) * 4.8;
  starPhases[index] = Math.random() * Math.PI * 2;
}

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(starPositions, 3).setUsage(THREE.DynamicDrawUsage),
);
starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
starGeometry.setAttribute("aSize", new THREE.BufferAttribute(starSizes, 1));
starGeometry.setAttribute("aPhase", new THREE.BufferAttribute(starPhases, 1));

const starMaterial = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.NormalBlending,
  uniforms: {
    uTime: { value: 0 },
    uFade: { value: 1 },
  },
  vertexShader: `
    attribute vec3 color;
    attribute float aSize;
    attribute float aPhase;

    uniform float uTime;

    varying vec3 vColor;
    varying float vTwinkle;

    void main() {
      vColor = color;
      vTwinkle = 0.72 + 0.28 * sin(uTime * 1.75 + aPhase);

      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vec4 viewPosition = viewMatrix * worldPosition;

      gl_Position = projectionMatrix * viewPosition;
      gl_PointSize =
        aSize *
        vTwinkle *
        (170.0 / max(1.0, -viewPosition.z));
    }
  `,
  fragmentShader: `
    uniform float uFade;

    varying vec3 vColor;
    varying float vTwinkle;

    void main() {
      vec2 point = gl_PointCoord - vec2(0.5);
      float distanceFromCenter = length(point);

      if (distanceFromCenter > 0.5) {
        discard;
      }

      float core = 1.0 - smoothstep(0.02, 0.12, distanceFromCenter);
      float halo = 1.0 - smoothstep(0.08, 0.5, distanceFromCenter);
      float horizontalRay = 1.0 - smoothstep(0.0, 0.03, abs(point.y));
      float verticalRay = 1.0 - smoothstep(0.0, 0.03, abs(point.x));
      float rayMask =
        (horizontalRay + verticalRay) *
        (1.0 - smoothstep(0.06, 0.48, distanceFromCenter));

      float alpha =
        (core + halo * 0.34 + rayMask * 0.15) *
        uFade *
        vTwinkle;

      gl_FragColor = vec4(vColor, alpha);
    }
  `,
});

const stars = new THREE.Points(starGeometry, starMaterial);
cosmicSystem.add(stars);

/* ---------------------------------
   PROCEDURAL PLANETS
--------------------------------- */

const planetVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;

  void main() {
    vUv = uv;

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);

    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const planetFragmentShader = `
  uniform vec3 uBaseColor;
  uniform vec3 uSecondaryColor;
  uniform vec3 uAccentColor;

  uniform float uSeed;
  uniform float uGasGiant;
  uniform float uCloudStrength;
  uniform float uEmissiveStrength;
  uniform float uTime;
  uniform float uOpacity;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;

  float hash(vec2 point) {
    point = fract(point * vec2(123.34, 456.21));
    point += dot(point, point + 45.32 + uSeed);
    return fract(point.x * point.y);
  }

  float noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);

    float a = hash(cell);
    float b = hash(cell + vec2(1.0, 0.0));
    float c = hash(cell + vec2(0.0, 1.0));
    float d = hash(cell + vec2(1.0, 1.0));

    return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
  }

  float fbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int octave = 0; octave < 5; octave++) {
      value += noise(point) * amplitude;
      point = point * 2.03 + vec2(17.1, 9.2);
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec2 sphereUv = vec2(vUv.x * 6.2831853, vUv.y * 3.1415926);
    vec2 movingUv = sphereUv + vec2(uTime * 0.006, 0.0);

    float continents = fbm(movingUv * 2.8 + uSeed);
    float fineDetail = fbm(movingUv * 9.0 - uSeed * 0.37);

    float bands =
      0.5 +
      sin(vUv.y * 88.0 + fineDetail * 7.0 + uSeed) * 0.23 +
      sin(vUv.y * 173.0 - continents * 5.0) * 0.07;

    float surface = mix(
      continents * 0.78 + fineDetail * 0.22,
      bands,
      uGasGiant
    );

    float firstBlend = smoothstep(0.31, 0.63, surface);
    float accentBlend = smoothstep(0.66, 0.9, surface);

    vec3 albedo = mix(uBaseColor, uSecondaryColor, firstBlend);
    albedo = mix(albedo, uAccentColor, accentBlend);

    float stormDistance = distance(
      vUv,
      vec2(0.67 + sin(uSeed) * 0.05, 0.43)
    );

    float storm = exp(-stormDistance * 43.0) * uGasGiant;
    albedo = mix(albedo, uAccentColor * 1.18, storm * 0.72);

    float cloudNoise = fbm(movingUv * 6.2 + vec2(31.0, 7.0));
    float clouds = smoothstep(0.62, 0.82, cloudNoise) * uCloudStrength;
    albedo = mix(albedo, vec3(0.94, 0.97, 1.0), clouds);

    vec3 normalDirection = normalize(vWorldNormal);
    vec3 lightDirection = normalize(-vWorldPosition);
    vec3 viewDirection = normalize(vViewDirection);

    float directLight = max(dot(normalDirection, lightDirection), 0.0);
    float softTerminator = smoothstep(
      -0.18,
      0.28,
      dot(normalDirection, lightDirection)
    );

    float rim = pow(
      1.0 - max(dot(normalDirection, viewDirection), 0.0),
      3.0
    );

    vec3 shadedColor = albedo * (0.2 + directLight * 0.94);
    shadedColor *= 0.58 + softTerminator * 0.42;
    shadedColor += uAccentColor * rim * 0.12;
    shadedColor += albedo * uEmissiveStrength;

    gl_FragColor = vec4(shadedColor, uOpacity);
  }
`;

const atmosphereVertexShader = `
  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const atmosphereFragmentShader = `
  uniform vec3 uAtmosphereColor1;
  uniform vec3 uAtmosphereColor2;
  uniform vec3 uAtmosphereColor3;
  uniform vec3 uAtmosphereColor4;
  uniform float uOpacity;

  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;

  void main() {
    vec3 normalDirection = normalize(vWorldNormal);
    vec3 viewDirection = normalize(vViewDirection);

    float rim = pow(
      1.0 - max(dot(normalDirection, viewDirection), 0.0),
      2.35
    );

    float verticalMix = smoothstep(-1.0, 1.0, normalDirection.y);
    float horizontalMix = smoothstep(-1.0, 1.0, normalDirection.x);

    vec3 colorA = mix(
      uAtmosphereColor1,
      uAtmosphereColor2,
      verticalMix
    );

    vec3 colorB = mix(
      uAtmosphereColor3,
      uAtmosphereColor4,
      horizontalMix
    );

    vec3 finalColor = mix(colorA, colorB, 0.5);
    gl_FragColor = vec4(finalColor, rim * uOpacity);
  }
`;

function getAtmosphereColors(atmosphereConfiguration) {
  if (atmosphereConfiguration.colors?.length) {
    const colors = atmosphereConfiguration.colors;

    return [
      colors[0],
      colors[1] ?? colors[0],
      colors[2] ?? colors[1] ?? colors[0],
      colors[3] ?? colors[2] ?? colors[1] ?? colors[0],
    ];
  }

  const color = atmosphereConfiguration.color ?? 0xffffff;
  const base = new THREE.Color(color);
  const lighter = base.clone().offsetHSL(0, -0.04, 0.08);
  const darker = base.clone().offsetHSL(0, 0.03, -0.06);

  return [base, lighter, base.clone(), darker];
}

/* ---------------------------------
   PLANETARY RINGS
--------------------------------- */

function createPlanetRing(radius, ringConfiguration) {
  const ringGroup = new THREE.Group();
  const ringDisc = new THREE.Group();

  ringGroup.add(ringDisc);

  const bandCount = ringConfiguration.bandCount ?? 7;
  const innerRadius = radius * ringConfiguration.innerScale;
  const outerRadius = radius * ringConfiguration.outerScale;
  const colors = ringConfiguration.colors ?? [
    ringConfiguration.color ?? 0xd8c294,
  ];

  for (let bandIndex = 0; bandIndex < bandCount; bandIndex += 1) {
    const bandProgress = bandCount === 1 ? 0.5 : bandIndex / (bandCount - 1);
    const bandCenter = THREE.MathUtils.lerp(
      innerRadius,
      outerRadius,
      bandProgress,
    );

    const availableWidth = (outerRadius - innerRadius) / Math.max(1, bandCount);
    const bandWidth = availableWidth * (0.28 + (bandIndex % 3) * 0.08);

    const geometry = new THREE.RingGeometry(
      Math.max(0.01, bandCenter - bandWidth * 0.5),
      bandCenter + bandWidth * 0.5,
      160,
      1,
    );

    const color = colors[bandIndex % colors.length];

    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: ringConfiguration.opacity ?? 0.58,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const band = new THREE.Mesh(geometry, material);
    band.renderOrder = 4;
    ringDisc.add(band);
  }

  /* RingGeometry begins in the local X/Y plane. */
  ringGroup.rotation.set(
    ringConfiguration.tiltX ?? Math.PI * 0.5,
    ringConfiguration.tiltY ?? 0,
    ringConfiguration.tiltZ ?? 0,
  );

  ringGroup.userData.spinner = ringDisc;
  ringGroup.userData.rotationSpeed = ringConfiguration.rotationSpeed ?? 0.08;
  ringGroup.userData.baseRotationX = ringGroup.rotation.x;
  ringGroup.userData.baseRotationY = ringGroup.rotation.y;
  ringGroup.userData.baseRotationZ = ringGroup.rotation.z;
  ringGroup.userData.baseOpacity = ringConfiguration.opacity ?? 0.58;

  return ringGroup;
}

function createPlanet(configuration, index) {
  const planetMaterial = new THREE.ShaderMaterial({
    transparent: false,
    depthTest: true,
    depthWrite: true,
    uniforms: {
      uBaseColor: { value: new THREE.Color(configuration.palette[0]) },
      uSecondaryColor: { value: new THREE.Color(configuration.palette[1]) },
      uAccentColor: { value: new THREE.Color(configuration.palette[2]) },
      uSeed: { value: 1.7 + index * 4.39 },
      uGasGiant: { value: configuration.gasGiant ? 1 : 0 },
      uCloudStrength: { value: configuration.cloudStrength ?? 0 },
      uEmissiveStrength: { value: configuration.emissiveStrength ?? 0 },
      uTime: { value: 0 },
      uOpacity: { value: 1 },
    },
    vertexShader: planetVertexShader,
    fragmentShader: planetFragmentShader,
  });

  const planetMesh = new THREE.Mesh(
    new THREE.SphereGeometry(configuration.radius, 64, 44),
    planetMaterial,
  );

  planetMesh.rotation.set(
    configuration.axialTilt ?? (Math.random() - 0.5) * 0.35,
    configuration.initialRotationY ?? Math.random() * Math.PI * 2,
    configuration.roll ?? 0,
  );

  const planetGroup = new THREE.Group();
  planetGroup.add(planetMesh);

  let atmosphere = null;
  let ring = null;

  if (configuration.atmosphere) {
    const atmosphereColors = getAtmosphereColors(configuration.atmosphere);

    const atmosphereMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uAtmosphereColor1: {
          value:
            atmosphereColors[0] instanceof THREE.Color
              ? atmosphereColors[0]
              : new THREE.Color(atmosphereColors[0]),
        },
        uAtmosphereColor2: {
          value:
            atmosphereColors[1] instanceof THREE.Color
              ? atmosphereColors[1]
              : new THREE.Color(atmosphereColors[1]),
        },
        uAtmosphereColor3: {
          value:
            atmosphereColors[2] instanceof THREE.Color
              ? atmosphereColors[2]
              : new THREE.Color(atmosphereColors[2]),
        },
        uAtmosphereColor4: {
          value:
            atmosphereColors[3] instanceof THREE.Color
              ? atmosphereColors[3]
              : new THREE.Color(atmosphereColors[3]),
        },
        uOpacity: { value: configuration.atmosphere.opacity },
      },
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
    });

    atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(configuration.radius * 1.075, 56, 38),
      atmosphereMaterial,
    );

    planetGroup.add(atmosphere);
  }

  if (configuration.ring) {
    ring = createPlanetRing(configuration.radius, configuration.ring);
    planetGroup.add(ring);
  }

  planetGroup.userData = {
    name: configuration.name,
    planetMesh,
    atmosphere,
    ring,
    atmosphereOpacity: configuration.atmosphere?.opacity ?? 0,
    orbitRadius: configuration.orbitRadius,
    orbitAngle: configuration.orbitAngle,
    orbitSpeed: configuration.orbitSpeed,
    depthLane: configuration.depthLane ?? 0,
    rotationSpeed: configuration.rotationSpeed ?? 0.09,
    initialRotationX: planetMesh.rotation.x,
    initialRotationY: planetMesh.rotation.y,
    initialRotationZ: planetMesh.rotation.z,
    pulseOffset: index * 1.83,
  };

  return planetGroup;
}

/*
  Initial angles deliberately recreate the requested composition:
  Mercury right, Venus left, Earth upper-left, Mars far right,
  Jupiter upper-left, Saturn upper-right, Uranus far left,
  and Neptune bottom-right.
*/
const planetConfigurations = [
  {
    name: "Mercury",
    radius: 0.2,
    orbitRadius: 3.2,
    depthLane: 0.0,
    orbitAngle: THREE.MathUtils.degToRad(3),
    orbitSpeed: 0.32,
    rotationSpeed: 0.006,
    palette: [0x5e5a55, 0x8a847d, 0xb8b1a9],
    atmosphere: { color: 0xa8a39d, opacity: 0.02 },
  },
  {
    name: "Venus",
    radius: 0.49,
    orbitRadius: 4.15,
    depthLane: 0.18,
    orbitAngle: THREE.MathUtils.degToRad(178),
    orbitSpeed: 0.24,
    rotationSpeed: -0.0015,
    cloudStrength: 0.34,
    palette: [0x8b6c45, 0xc79b62, 0xe6c892],
    atmosphere: { color: 0xe8d19f, opacity: 0.32 },
  },
  {
    name: "Earth",
    radius: 0.52,
    orbitRadius: 5.25,
    depthLane: -0.18,
    orbitAngle: THREE.MathUtils.degToRad(224),
    orbitSpeed: 0.19,
    rotationSpeed: 0.13,
    cloudStrength: 0.52,
    palette: [0x12518b, 0x2c8c63, 0xd8c88d],
    atmosphere: { color: 0x69bfff, opacity: 0.56 },
  },
  {
    name: "Mars",
    radius: 0.28,
    orbitRadius: 6.7,
    depthLane: 0.36,
    orbitAngle: THREE.MathUtils.degToRad(356),
    orbitSpeed: 0.145,
    rotationSpeed: 0.126,
    palette: [0x4e2219, 0x8a402c, 0xc46847],
    atmosphere: { color: 0xb96548, opacity: 0.08 },
  },
  {
    name: "Jupiter",
    radius: 1.95,
    orbitRadius: 9.55,
    depthLane: -0.36,
    orbitAngle: THREE.MathUtils.degToRad(218),
    orbitSpeed: 0.105,
    rotationSpeed: 0.31,
    gasGiant: true,
    palette: [0x8e6f55, 0xd7b28e, 0xf1dfc8],
    atmosphere: {
      color: 0xe5ccb4,
      opacity: 0.14,
    },
    ring: {
      innerScale: 1.18,
      outerScale: 1.48,
      bandCount: 3,
      colors: [0x544c43, 0x756b5e, 0x968878],
      opacity: 0.1,
      tiltX: Math.PI * 0.5,
      tiltY: THREE.MathUtils.degToRad(2),
      tiltZ: THREE.MathUtils.degToRad(3),
      rotationSpeed: 0.12,
    },
  },
  {
    name: "Saturn",
    radius: 1.62,
    orbitRadius: 12.2,
    depthLane: 0.54,
    orbitAngle: THREE.MathUtils.degToRad(316),
    orbitSpeed: 0.082,
    rotationSpeed: 0.29,
    gasGiant: true,
    palette: [0xb29a68, 0xddc28e, 0xf0e1b2],
    atmosphere: { color: 0xe8d7ad, opacity: 0.16 },
    ring: {
      innerScale: 1.38,
      outerScale: 2.45,
      bandCount: 10,
      colors: [0x8e806a, 0xbca98b, 0xd8c7a4, 0x6f6657],
      opacity: 0.46,
      tiltX: Math.PI * 0.5,
      tiltY: 0.08,
      tiltZ: THREE.MathUtils.degToRad(-12),
      rotationSpeed: 0.19,
    },
  },
  {
    name: "Uranus",
    radius: 0.92,
    orbitRadius: 15.35,
    depthLane: -0.54,
    orbitAngle: THREE.MathUtils.degToRad(183),
    orbitSpeed: 0.061,
    rotationSpeed: -0.18,
    gasGiant: true,
    palette: [0x6cb9bf, 0x93dfe2, 0xc8f5f2],
    atmosphere: { color: 0xa8f0ef, opacity: 0.24 },
    ring: {
      innerScale: 1.22,
      outerScale: 1.66,
      bandCount: 4,
      colors: [0x2a4749, 0x4c6e72],
      opacity: 0.28,
      tiltX: THREE.MathUtils.degToRad(13),
      tiltY: THREE.MathUtils.degToRad(18),
      tiltZ: THREE.MathUtils.degToRad(79),
      rotationSpeed: 0.09,
    },
  },
  {
    name: "Neptune",
    radius: 0.89,
    orbitRadius: 18.3,
    depthLane: 0.72,
    orbitAngle: THREE.MathUtils.degToRad(43),
    orbitSpeed: 0.047,
    rotationSpeed: 0.19,
    gasGiant: true,
    cloudStrength: 0.12,
    palette: [0x123a92, 0x1d63d1, 0x60acef],
    atmosphere: { color: 0x4d97ff, opacity: 0.3 },
    ring: {
      innerScale: 1.24,
      outerScale: 1.55,
      bandCount: 3,
      colors: [0x395f98, 0x6e8dbd],
      opacity: 0.15,
      tiltX: Math.PI * 0.5,
      tiltY: 0,
      tiltZ: THREE.MathUtils.degToRad(5),
      rotationSpeed: 0.07,
    },
  },
];

/* ---------------------------------
   EIGHT VISIBLE ORBIT PATHS
--------------------------------- */

function createOrbitPath(radius) {
  const segmentCount = 320;
  const points = [];

  for (let segment = 0; segment < segmentCount; segment += 1) {
    const angle = (segment / segmentCount) * Math.PI * 2;

    points.push(
      new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius),
    );
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const material = new THREE.LineBasicMaterial({
    color: 0xd5a83f,
    transparent: true,
    opacity: 0.27,
    depthTest: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const orbitPath = new THREE.LineLoop(geometry, material);

  orbitPath.frustumCulled = false;
  orbitPath.renderOrder = 1;

  return orbitPath;
}
const orbitPathGroup = new THREE.Group();
solarSystem.add(orbitPathGroup);

const orbitPaths = planetConfigurations.map((configuration, index) => {
  const path = createOrbitPath(configuration.orbitRadius, index);
  orbitPathGroup.add(path);
  return path;
});

const planets = planetConfigurations.map((configuration, index) => {
  const planet = createPlanet(configuration, index);
  solarSystem.add(planet);
  return planet;
});

/* ---------------------------------
   CENTRAL SUN
--------------------------------- */

const sunVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;

  void main() {
    vUv = uv;

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const sunFragmentShader = `
  uniform float uTime;
  uniform float uOpacity;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;

  float hash(vec2 point) {
    return fract(
      sin(dot(point, vec2(127.1, 311.7))) * 43758.5453
    );
  }

  float noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);

    float a = hash(cell);
    float b = hash(cell + vec2(1.0, 0.0));
    float c = hash(cell + vec2(0.0, 1.0));
    float d = hash(cell + vec2(1.0, 1.0));

    return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
  }

  float fbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int octave = 0; octave < 5; octave++) {
      value += noise(point) * amplitude;
      point = point * 2.04 + vec2(15.7, 8.3);
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    /*
  Use the sphere's 3D normal instead of its 2D UV coordinates.
  This prevents the visible vertical UV seam.
*/
vec3 sphereDirection = normalize(vWorldNormal);

vec3 blendWeights = abs(sphereDirection);
blendWeights = pow(blendWeights, vec3(4.0));
blendWeights /= max(
  blendWeights.x + blendWeights.y + blendWeights.z,
  0.0001
);

vec2 timeOffset = vec2(
  uTime * 0.038,
  -uTime * 0.014
);

float plasmaXY = fbm(
  sphereDirection.xy * 4.5 + timeOffset
);

float plasmaYZ = fbm(
  sphereDirection.yz * 4.5 + timeOffset * 0.83 + vec2(8.1, 3.7)
);

float plasmaZX = fbm(
  sphereDirection.zx * 4.5 + timeOffset * 1.17 + vec2(14.3, 6.2)
);

float plasma =
  plasmaXY * blendWeights.z +
  plasmaYZ * blendWeights.x +
  plasmaZX * blendWeights.y;

float filamentXY = fbm(
  sphereDirection.xy * 11.0 +
  timeOffset * 1.4 +
  plasma * 3.6
);

float filamentYZ = fbm(
  sphereDirection.yz * 11.0 +
  timeOffset * 1.15 +
  plasma * 3.6 +
  vec2(5.4, 12.7)
);

float filamentZX = fbm(
  sphereDirection.zx * 11.0 +
  timeOffset * 1.7 +
  plasma * 3.6 +
  vec2(17.2, 4.1)
);

float filaments =
  filamentXY * blendWeights.z +
  filamentYZ * blendWeights.x +
  filamentZX * blendWeights.y;

    float energy = clamp(plasma * 0.72 + filaments * 0.62, 0.0, 1.0);

    vec3 deepOrange = vec3(1.0, 0.19, 0.015);
    vec3 gold = vec3(1.0, 0.66, 0.055);
    vec3 whiteHot = vec3(1.0, 0.98, 0.72);

    vec3 color = mix(
      deepOrange,
      gold,
      smoothstep(0.22, 0.66, energy)
    );

    color = mix(
      color,
      whiteHot,
      smoothstep(0.64, 0.96, energy)
    );

    float rim = pow(
      1.0 - max(
        dot(normalize(vWorldNormal), normalize(vViewDirection)),
        0.0
      ),
      1.8
    );

    color += vec3(1.0, 0.28, 0.025) * rim * 0.6;
    gl_FragColor = vec4(color, uOpacity);
  }
`;

function createSunGlowTexture({ withRays = false } = {}) {
  const size = 512;
  const glowCanvas = document.createElement("canvas");
  const context = glowCanvas.getContext("2d");
  const center = size * 0.5;

  glowCanvas.width = size;
  glowCanvas.height = size;

  const radialGradient = context.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    center,
  );

  radialGradient.addColorStop(0, "rgba(255, 255, 235, 1)");
  radialGradient.addColorStop(0.08, "rgba(255, 235, 126, 0.98)");
  radialGradient.addColorStop(0.24, "rgba(255, 184, 45, 0.74)");
  radialGradient.addColorStop(0.52, "rgba(255, 132, 24, 0.25)");
  radialGradient.addColorStop(1, "rgba(255, 107, 0, 0)");

  context.fillStyle = radialGradient;
  context.fillRect(0, 0, size, size);

  if (withRays) {
    context.save();
    context.translate(center, center);
    context.globalCompositeOperation = "screen";

    for (let rayIndex = 0; rayIndex < 28; rayIndex += 1) {
      context.rotate((Math.PI * 2) / 28);

      const rayLength = center * (0.66 + Math.random() * 0.3);
      const rayGradient = context.createLinearGradient(0, 0, rayLength, 0);

      rayGradient.addColorStop(0, "rgba(255, 233, 150, 0.48)");
      rayGradient.addColorStop(0.25, "rgba(255, 180, 50, 0.16)");
      rayGradient.addColorStop(1, "rgba(255, 142, 22, 0)");

      context.fillStyle = rayGradient;
      context.beginPath();
      context.moveTo(0, -2.1);
      context.lineTo(rayLength, -0.5);
      context.lineTo(rayLength, 0.5);
      context.lineTo(0, 2.1);
      context.closePath();
      context.fill();
    }

    context.restore();
  }

  const texture = new THREE.CanvasTexture(glowCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

const sunGroup = new THREE.Group();
solarSystem.add(sunGroup);

const sunMaterial = new THREE.ShaderMaterial({
  transparent: true,
  depthTest: true,
  depthWrite: true,
  uniforms: {
    uTime: { value: 0 },
    uOpacity: { value: 1 },
  },
  vertexShader: sunVertexShader,
  fragmentShader: sunFragmentShader,
});

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(isSmallScreen ? 2.4 : 2.9, 72, 48),
  sunMaterial,
);

sunGroup.add(sun);

const sunGlow = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: createSunGlowTexture(),
    color: 0xffffff,
    transparent: true,
    opacity: 0.84,
    depthWrite: false,
    depthTest: true,
    blending: THREE.NormalBlending,
  }),
);

sunGlow.scale.setScalar(isSmallScreen ? 4.7 : 5.5);
sunGroup.add(sunGlow);

const sunRays = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: createSunGlowTexture({ withRays: true }),
    color: 0xffffff,
    transparent: true,
    opacity: 0.44,
    depthWrite: false,
    depthTest: true,
    blending: THREE.NormalBlending,
  }),
);

sunRays.scale.setScalar(isSmallScreen ? 7.4 : 8.5);
sunRays.position.y = 0.02;
sunGroup.add(sunRays);

const solarLight = new THREE.PointLight(0xffbd63, 105, 44, 1.75);
solarLight.position.set(0, 0, 0);
sunGroup.add(solarLight);

/* ---------------------------------
   SCROLL STATE AND HELPERS
--------------------------------- */

let targetScrollProgress = prefersReducedMotion ? 1 : 0;
let smoothScrollProgress = targetScrollProgress;
let lastTime = performance.now();
let planetScrollAngle = 0;
let previousScrollY = window.scrollY;

const PLANET_SCROLL_SENSITIVITY = 0.004;

const FASTEST_PLANET_ORBIT_SPEED = Math.max(
  ...planetConfigurations.map((configuration) =>
    Math.abs(configuration.orbitSpeed),
  ),
);

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

function updateScrollProgress() {
  const currentScrollY = window.scrollY;

  /*
    Positive when scrolling downward.
    Negative when scrolling upward.
  */
  const scrollDelta = currentScrollY - previousScrollY;

  previousScrollY = currentScrollY;

  /*
    Add scroll movement to the planets' accumulated
    orbital displacement.
  */
  planetScrollAngle += scrollDelta * PLANET_SCROLL_SENSITIVITY;

  const maximumScroll = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight,
  );

  targetScrollProgress = prefersReducedMotion
    ? 1
    : clamp(currentScrollY / maximumScroll);
}

/* ---------------------------------
   HTML INTERFACE
--------------------------------- */

function updateInterface(progress) {
  const intro = 1 - smoothStep(mapRange(progress, 0.025, 0.22));
  const cardProgress = smootherStep(mapRange(progress, 0.58, 0.74));
  const footerProgress = smootherStep(mapRange(progress, 0.78, 0.94));

  root.style.setProperty("--intro-progress", intro.toFixed(4));
  root.style.setProperty("--card-progress", cardProgress.toFixed(4));
  root.style.setProperty("--footer-progress", footerProgress.toFixed(4));

  if (card) {
    card.classList.toggle("is-interactive", cardProgress > 0.92);
  }

  if (footer) {
    footer.classList.toggle("is-interactive", footerProgress > 0.92);
  }
}

/* ---------------------------------
   MAIN SCENE UPDATE
--------------------------------- */

function updateScene(progress, elapsedSeconds) {
  const dismantle = smootherStep(mapRange(progress, 0.12, 0.92));
  const cosmicFade = 1 - smootherStep(mapRange(progress, 0.7, 0.98)) * 0.5;
  const sunFade = 1;
  const cardProgress = smootherStep(mapRange(progress, 0.58, 0.74));

  const positionAttribute = starGeometry.getAttribute("position");

  for (let index = 0; index < starCount; index += 1) {
    const start = starStarts[index];
    const axis = starDriftAxes[index];
    const delay = starDelays[index];

    const orbitSpeed = 0.035 + delay * 0.075;
    const starAngle = elapsedSeconds * orbitSpeed + delay * Math.PI * 4;

    const orbitX = Math.cos(starAngle) * (0.18 + delay * 0.48);
    const orbitY = Math.sin(starAngle * 1.37) * (0.12 + delay * 0.34);
    const orbitZ = Math.sin(starAngle * 0.8) * (0.2 + delay * 0.52);
    const outwardDistance = dismantle * (2 + delay * 5);

    positionAttribute.setXYZ(
      index,
      start.x + orbitX + axis.x * outwardDistance,
      start.y + orbitY + axis.y * outwardDistance,
      start.z + orbitZ + axis.z * outwardDistance,
    );
  }

  positionAttribute.needsUpdate = true;
  starMaterial.uniforms.uTime.value = elapsedSeconds;
  starMaterial.uniforms.uFade.value = Math.max(cosmicFade, 0.001);
  stars.visible = cosmicFade > 0.001;

  /*
    All planets stay on their own fixed concentric orbit. Scroll does not
    push them away or alter their paths. Inner planets move faster and
    outer planets move more slowly.
  */
  planets.forEach((planetGroup) => {
    const data = planetGroup.userData;

    /*
    Keeps each planet's scroll response proportional
    to its normal orbital speed.
  */
    const relativeOrbitSpeed = data.orbitSpeed / FASTEST_PLANET_ORBIT_SPEED;

    /*
    Normal automatic movement:
      elapsedSeconds * data.orbitSpeed

    Additional scroll-controlled movement:
      planetScrollAngle * relativeOrbitSpeed
  */
    const orbitAngle =
      data.orbitAngle +
      elapsedSeconds * data.orbitSpeed +
      planetScrollAngle * relativeOrbitSpeed;

    const orbitX = Math.cos(orbitAngle) * data.orbitRadius;
    const orbitZ = Math.sin(orbitAngle) * data.orbitRadius;

    planetGroup.position.set(orbitX, data.depthLane, orbitZ);

    /*
    Planet rotation around its own axis continues
    independently of scrolling.
  */
    data.planetMesh.rotation.y =
      data.initialRotationY + elapsedSeconds * data.rotationSpeed;

    data.planetMesh.rotation.x = data.initialRotationX;
    data.planetMesh.rotation.z = data.initialRotationZ;

    data.planetMesh.material.uniforms.uTime.value = elapsedSeconds;
    data.planetMesh.material.uniforms.uOpacity.value = 1;

    const planetPulse =
      1 + Math.sin(elapsedSeconds * 0.72 + data.pulseOffset) * 0.008;

    planetGroup.scale.setScalar(planetPulse);

    if (data.atmosphere) {
      data.atmosphere.material.uniforms.uOpacity.value =
        cosmicFade * data.atmosphereOpacity;
    }

    if (data.ring) {
      data.ring.rotation.x = data.ring.userData.baseRotationX;

      data.ring.rotation.y = data.ring.userData.baseRotationY;

      data.ring.rotation.z = data.ring.userData.baseRotationZ;

      /*
      The planet's rings continue spinning automatically.
    */
      data.ring.userData.spinner.rotation.z =
        elapsedSeconds * data.ring.userData.rotationSpeed;

      data.ring.userData.spinner.children.forEach((band) => {
        band.material.opacity = cosmicFade * data.ring.userData.baseOpacity;
      });
    }
  });

  orbitPaths.forEach((orbitPath, index) => {
    const breathing = 0.025 * Math.sin(elapsedSeconds * 0.45 + index * 0.7);
    orbitPath.material.opacity = cosmicFade * (0.25 + breathing);
  });

  sunMaterial.uniforms.uTime.value = elapsedSeconds;
  sunMaterial.uniforms.uOpacity.value = sunFade;

  sun.rotation.y = elapsedSeconds * 0.085;
  sun.rotation.z = elapsedSeconds * 0.025;
  sunGroup.scale.setScalar(1);

  /* The sun always remains at the exact center of all eight orbit paths. */
  sunGroup.position.set(0, 0, 0);

  sunGlow.material.opacity =
    sunFade * (0.8 + Math.sin(elapsedSeconds * 1.8) * 0.07);
  sunRays.material.opacity =
    sunFade * (0.38 + Math.sin(elapsedSeconds * 0.86) * 0.06);
  sunRays.material.rotation = elapsedSeconds * 0.018;

  solarLight.intensity =
    105 * sunFade * (0.94 + Math.sin(elapsedSeconds * 1.3) * 0.06);

  /* Keep the requested composition stable instead of rotating it away. */
  monument.scale.setScalar(0.98 - dismantle * 0.025);
  monument.position.set(0, 0, 0);
  monument.rotation.y = Math.sin(elapsedSeconds * 0.08) * 0.008;
  monument.rotation.x = Math.sin(elapsedSeconds * 0.06) * 0.004;

  /*
    Elevated, oblique camera: planets remain genuine 3D spheres while the
    shared circular orbital plane appears as horizontal elliptical rings.
  */
  camera.position.y = THREE.MathUtils.lerp(
    isSmallScreen ? 23 : 16.5,
    isSmallScreen ? 22 : 15.5,
    dismantle,
  );

  camera.position.z = THREE.MathUtils.lerp(
    isSmallScreen ? 42 : 31,
    isSmallScreen ? 40.5 : 29.5,
    dismantle,
  );

  camera.position.x =
    Math.sin(elapsedSeconds * 0.07) * 0.06 * (1 - cardProgress);

  camera.lookAt(0, 0, 0);
}

/* ---------------------------------
   ANIMATION LOOP
--------------------------------- */

function animate(now) {
  const deltaSeconds = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  const easing = 1 - Math.pow(0.0008, deltaSeconds);
  smoothScrollProgress +=
    (targetScrollProgress - smoothScrollProgress) * easing;

  updateScene(smoothScrollProgress, now / 1000);
  updateInterface(smoothScrollProgress);
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

/* ---------------------------------
   RESIZE
--------------------------------- */

function handleResize() {
  isSmallScreen = smallScreenQuery.matches;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.fov = isSmallScreen ? 49 : 43;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene.fog.density = isSmallScreen ? 0.026 : 0.018;
  setSolarSystemScale();
  updateScrollProgress();
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", handleResize);

updateScrollProgress();
requestAnimationFrame(animate);

/* ---------------------------------
   SLOW SCROLL LINK
--------------------------------- */

const archiveLink = document.querySelector(".scroll-to-archive");
const archiveTarget = document.getElementById("archive-entry");

if (archiveLink && archiveTarget) {
  archiveLink.addEventListener("click", (event) => {
    event.preventDefault();

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

      window.scrollTo(0, startPosition + distance * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(scrollAnimation);
      }
    }

    requestAnimationFrame(scrollAnimation);
  });
}
