import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';

const MODEL3D_EXPRESSION_ALIAS_MAP = {
  neutral: ['neutral', 'normal', 'base', 'Neutral', 'Normal'],
  smile: ['smile', 'Smile', 'joy', 'Joy', 'happy', 'Happy', 'grin', 'Grin'],
  surprised: [
    'surprised',
    'Surprised',
    'surprise',
    'Surprise',
    'shock',
    'Shock',
    'oh',
    'Oh',
  ],
};

function normalizeExpressionKey(key) {
  return (key || '').toString().trim().toLowerCase();
}

class Model3DLoader {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.vrm = null;
    this.animationId = null;
    this.clock = new THREE.Clock();
    this.isInitialized = false;
    this.isVisible = true;
    this.canvas = null;
    this.expressionManager = null;
    this.expressionNames = [];
    this.expressionNameMap = new Map();
  }

  async init(canvasId) {
    if (this.isInitialized) return;

    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error('Model3D canvas not found');
      return;
    }

    const container = this.canvas.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 1.5, 3);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.enableRotate = true;
    this.controls.target.set(0, 1.3, 0);
    this.controls.panSpeed = 0.8;
    this.controls.screenSpacePanning = true;
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(1, 2, 1);
    this.scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight.position.set(-1, 1, -1);
    this.scene.add(fillLight);

    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x222233,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.scene.add(ground);

    this.isInitialized = true;
  }

  async loadModel(blob) {
    if (!this.isInitialized) {
      await this.init('model3d-canvas');
    }

    if (this.vrm) {
      this.disposeVRM();
    }

    const loadingEl = document.getElementById('model3d-loading');
    if (loadingEl) loadingEl.classList.remove('hidden');

    try {
      const url = URL.createObjectURL(blob);
      const loader = new GLTFLoader();
      loader.register((parser) => new VRMLoaderPlugin(parser));

      const gltf = await new Promise((resolve, reject) => {
        loader.load(
          url,
          (result) => resolve(result),
          undefined,
          (error) => reject(error)
        );
      });

      URL.revokeObjectURL(url);

      this.vrm = gltf.userData.vrm;
      if (this.vrm) {
        this.scene.add(this.vrm.scene);

        if (this.vrm.scene) {
          this.vrm.scene.traverse((obj) => {
            if (obj.isMesh) {
              obj.castShadow = true;
              obj.receiveShadow = true;
            }
          });
        }

        const box = new THREE.Box3().setFromObject(this.vrm.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;

        this.vrm.scene.scale.setScalar(scale);
        this.vrm.scene.position.set(-center.x * scale, 0, -center.z * scale);

        this.controls.target.set(0, (size.y * scale) / 2, 0);
        this.camera.position.set(0, (size.y * scale) / 2 + 0.5, 3);
      }

      this.updateExpressionInfo();
      this.resetExpressions();

      if (loadingEl) loadingEl.classList.add('hidden');

      if (!this.animationId) {
        this.startAnimationLoop();
      }

      return true;
    } catch (error) {
      console.error('Failed to load VRM model:', error);
      if (loadingEl) loadingEl.classList.add('hidden');
      return false;
    }
  }

  updateExpressionInfo() {
    this.expressionManager = this.vrm?.expressionManager ?? null;
    this.expressionNames = [];
    this.expressionNameMap.clear();
    if (this.expressionManager?.expressionMap) {
      this.expressionNames = Object.keys(this.expressionManager.expressionMap).filter(
        Boolean,
      );
      for (const name of this.expressionNames) {
        const normalized = normalizeExpressionKey(name);
        if (normalized) {
          this.expressionNameMap.set(normalized, name);
        }
      }
    }
  }

  findExpressionNameForPreset(preset) {
    const normalizedPreset = normalizeExpressionKey(preset);
    if (!normalizedPreset || !this.expressionManager) return null;
    if (this.expressionNameMap.has(normalizedPreset)) {
      return this.expressionNameMap.get(normalizedPreset);
    }
    const aliasList = MODEL3D_EXPRESSION_ALIAS_MAP[normalizedPreset];
    if (Array.isArray(aliasList)) {
      for (const alias of aliasList) {
        const normalizedAlias = normalizeExpressionKey(alias);
        if (normalizedAlias && this.expressionNameMap.has(normalizedAlias)) {
          return this.expressionNameMap.get(normalizedAlias);
        }
      }
    }
    return null;
  }

  resetExpressions() {
    if (!this.expressionManager) return false;
    if (typeof this.expressionManager.resetValues === 'function') {
      this.expressionManager.resetValues();
      return true;
    }
    let cleared = false;
    for (const name of this.expressionNames) {
      this.expressionManager.setValue(name, 0);
      cleared = true;
    }
    return cleared;
  }

  setExpressionByPreset(preset) {
    if (!this.expressionManager) return false;
    const normalizedPreset = normalizeExpressionKey(preset);
    if (!normalizedPreset) {
      return this.resetExpressions();
    }

    const targetName = this.findExpressionNameForPreset(normalizedPreset);
    if (targetName) {
      this.resetExpressions();
      this.expressionManager.setValue(targetName, 1);
      return true;
    }

    if (normalizedPreset === 'neutral') {
      return this.resetExpressions();
    }

    return false;
  }

  getExpressionNames() {
    return [...this.expressionNames];
  }

  startAnimationLoop() {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      const delta = this.clock.getDelta();

      if (this.vrm) {
        this.vrm.update(delta);
      }

      if (this.controls) {
        this.controls.update();
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };
    animate();
  }

  setVisible(visible) {
    this.isVisible = visible;
    if (this.vrm && this.vrm.scene) {
      this.vrm.scene.visible = visible;
    }
  }

  resetExpressionInfo() {
    this.expressionManager = null;
    this.expressionNames = [];
    this.expressionNameMap.clear();
  }

  disposeVRM() {
    if (this.vrm) {
      if (this.vrm.scene) {
        this.vrm.scene.traverse((obj) => {
          if (obj.isMesh) {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
              if (Array.isArray(obj.material)) {
                obj.material.forEach((mat) => {
                  if (mat.map) mat.map.dispose();
                  mat.dispose();
                });
              } else {
                if (obj.material.map) obj.material.map.dispose();
                obj.material.dispose();
              }
            }
          }
        });
      }
      this.scene.remove(this.vrm.scene);
      this.resetExpressionInfo();
      this.vrm = null;
    }
  }

  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.disposeVRM();

    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    this.scene = null;
    this.camera = null;
    this.isInitialized = false;
  }

  resize(width, height) {
    if (!this.camera || !this.renderer) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}

const model3dLoader = new Model3DLoader();

export function getModel3DLoader() {
  return model3dLoader;
}

export async function loadModel3D(blob) {
  return model3dLoader.loadModel(blob);
}

export function setModel3DVisible(visible) {
  model3dLoader.setVisible(visible);
}

export function disposeModel3D() {
  model3dLoader.dispose();
}

export function resizeModel3D(width, height) {
  model3dLoader.resize(width, height);
}

export function setModel3DExpression(expressionKey) {
  return model3dLoader.setExpressionByPreset(expressionKey);
}

export function resetModel3DExpressions() {
  return model3dLoader.resetExpressions();
}

export function getModel3DExpressionNames() {
  return model3dLoader.getExpressionNames();
}

export function getModel3DCameraState() {
  if (!model3dLoader.camera || !model3dLoader.controls) return null;
  return {
    position: {
      x: model3dLoader.camera.position.x,
      y: model3dLoader.camera.position.y,
      z: model3dLoader.camera.position.z,
    },
    target: {
      x: model3dLoader.controls.target.x,
      y: model3dLoader.controls.target.y,
      z: model3dLoader.controls.target.z,
    },
  };
}

export function restoreModel3DCameraState(cameraState) {
  if (!model3dLoader.camera || !model3dLoader.controls || !cameraState) return;
  if (cameraState.position) {
    model3dLoader.camera.position.set(
      cameraState.position.x,
      cameraState.position.y,
      cameraState.position.z,
    );
  }
  if (cameraState.target) {
    model3dLoader.controls.target.set(
      cameraState.target.x,
      cameraState.target.y,
      cameraState.target.z,
    );
  }
}

window.loadModel3D = loadModel3D;
window.setModel3DVisible = setModel3DVisible;
window.disposeModel3D = disposeModel3D;
window.resizeModel3D = resizeModel3D;
window.setModel3DExpression = setModel3DExpression;
window.resetModel3DExpressions = resetModel3DExpressions;
window.getModel3DExpressionNames = getModel3DExpressionNames;
window.getModel3DCameraState = getModel3DCameraState;
window.restoreModel3DCameraState = restoreModel3DCameraState;

window.addEventListener('resize', () => {
  const panel = document.getElementById('model3d-panel');
  if (panel && !panel.classList.contains('hidden')) {
    const container = document.getElementById('model3d-canvas-container');
    if (container) {
      resizeModel3D(container.clientWidth, container.clientHeight);
    }
  }
});
