import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const NORMAL_SPIN_SPEED = 0.01;
const FAST_SPIN_SPEED = 0.03;

export class Dice implements App.IDice {
  dice: THREE.Group | null = null;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  animationId: number | null = null;
  faces: THREE.Euler[] = [
    new THREE.Euler(-(3 * Math.PI) / 2, 0, 0), // Face 1
    new THREE.Euler(0, -1.6, 0), // Face 2
    new THREE.Euler(Math.PI, 0, 0), // Face 3
    new THREE.Euler(0, 0, 0), // Face 4
    new THREE.Euler(0, 1.6, 0), // Face 5
    new THREE.Euler((3 * Math.PI) / 2, Math.PI / 2, 0), // Face 6
  ];

  constructor(container: HTMLElement, useHelpers: boolean = false) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      120,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 1;
    this.initScene(useHelpers);
    this.renderer = new THREE.WebGLRenderer();
    this.initRenderer(container);
    this.loadDice();

    this.spin = this.spin.bind(this);
    this.rollTo = this.rollTo.bind(this);
  }

  initScene(helpers: boolean = false): void {
    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100); // white light
    pointLight.position.set(10, 20, 10);
    this.scene.add(pointLight);

    if (helpers) {
      const axesHelper = new THREE.AxesHelper(5);
      this.scene.add(axesHelper);

      const size = 10;
      const divisions = 10;
      const gridHelper = new THREE.GridHelper(size, divisions);
      this.scene.add(gridHelper);
    }
  }

  initRenderer(el: HTMLElement): void {
    this.renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(this.renderer.domElement);

    window.addEventListener("resize", () => {
      this.renderer.setSize(el.clientWidth, el.clientHeight);
      this.camera.aspect = el.clientWidth / el.clientHeight;
      this.camera.updateProjectionMatrix();
    });
  }

  loadDice(): void {
    const loader = new GLTFLoader();

    loader.load(
      "./new_centered_dice.glb",
      (gltf) => {
        this.dice = gltf.scene;

        this.dice.rotation.x = this.faces[0].x;
        this.dice.rotation.y = this.faces[0].y;

        this.scene.add(gltf.scene);
      },
      function (xhr) {},
      function (error) {
        console.error("An error loading 3d dice occurred", error);
      }
    );
  }

  roll(): void {
    if (this.dice === null) {
      return;
    }

    const roll = Math.floor(Math.random() * 6) + 1;

    this.stop();
    this.animationId = requestAnimationFrame(() => this.rollTo(roll));
  }

  rollTo(roll: number): void {
    if (this.dice === null) {
      return;
    }

    this.stop();
    this.animationId = requestAnimationFrame(() => this.rollTo(roll));

    const targetRotation = this.faces[roll - 1];

    // Calculate the difference between the current rotation and the target rotation
    const diffX =
      ((targetRotation.x - this.dice.rotation.x + Math.PI) % (2 * Math.PI)) -
      Math.PI;
    const diffY =
      ((targetRotation.y - this.dice.rotation.y + Math.PI) % (2 * Math.PI)) -
      Math.PI;

    // Update the rotation a little bit each frame, until the target rotation is reached
    if (Math.abs(diffX) > FAST_SPIN_SPEED) {
      this.dice.rotation.x += Math.sign(diffX) * FAST_SPIN_SPEED;
    }
    if (Math.abs(diffY) > FAST_SPIN_SPEED) {
      this.dice.rotation.y += Math.sign(diffY) * FAST_SPIN_SPEED;
    }

    this.renderer.render(this.scene, this.camera);
  }
  spin(): void {
    this.stop();
    this.animationId = requestAnimationFrame(this.spin);

    if (this.dice) {
      this.dice.rotation.x += NORMAL_SPIN_SPEED;
      this.dice.rotation.y += NORMAL_SPIN_SPEED;
    }

    this.renderer.render(this.scene, this.camera);
  }
  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  dispose(): void {
    this.stop();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
