import * as THREE from "three";
import { useEffect, useRef } from "react";

interface ThreeJSBookProps {
  width?: number;
  height?: number;
}

const ThreeJSBook: React.FC<ThreeJSBookProps> = ({ width = 300, height = 400 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const bookRef = useRef<THREE.Mesh>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 4;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Book model
    const geometry = new THREE.BoxGeometry(2, 3, 0.3);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x2a4858,
      metalness: 0.1,
      roughness: 0.5,
      reflectivity: 0.5,
    });
    const book = new THREE.Mesh(geometry, material);
    scene.add(book);
    bookRef.current = book;

    // Animation
    let animationFrameId: number;
    const animate = () => {
      if (bookRef.current && rendererRef.current && sceneRef.current && cameraRef.current) {
        bookRef.current.rotation.y += 0.005;
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, [width, height]);

  return <div ref={mountRef} style={{ width, height }} />;
};

export default ThreeJSBook;
