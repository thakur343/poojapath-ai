"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Sparkles, Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import * as THREE from "three";
import gsap from "gsap";

// Inner component for individual floating Om symbols
function OmSymbol({ position, seed }: { position: [number, number, number]; seed: number }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textRef = useRef<any>(null);
  const { mouse, camera } = useThree();
  const [hovered, setHovered] = useState(false);
  
  // Base starting position
  const baseX = position[0];
  const baseY = position[1];
  
  // Random rotation offset
  const rotOffset = useMemo(() => Math.random() * Math.PI * 2, []);
  
  useFrame((state) => {
    if (!textRef.current) return;
    
    // Magnetic Physics Logic
    // Convert normalized mouse coordinates to world coordinates
    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const targetPos = camera.position.clone().add(dir.multiplyScalar(distance));

    // Calculate distance from symbol to mouse pointer
    const dx = textRef.current.position.x - targetPos.x;
    const dy = textRef.current.position.y - targetPos.y;
    const distToMouse = Math.sqrt(dx * dx + dy * dy);

    // Magnetic attraction/repulsion
    const magneticRadius = 3;
    let targetX = baseX;
    let targetY = baseY;

    if (distToMouse < magneticRadius) {
      // Gently attract towards mouse, but add slight float
      const pullStrength = 0.05 * (1 - distToMouse / magneticRadius);
      targetX = baseX - dx * pullStrength;
      targetY = baseY - dy * pullStrength;
      
      if (!hovered) {
        setHovered(true);
        gsap.to(textRef.current.material, { opacity: 0.9, duration: 0.5 });
        gsap.to(textRef.current.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.5 });
      }
    } else {
      if (hovered) {
        setHovered(false);
        gsap.to(textRef.current.material, { opacity: 0.3 + seed * 0.2, duration: 1.5 });
        gsap.to(textRef.current.scale, { x: 1, y: 1, z: 1, duration: 1.5 });
      }
    }

    // Smoothly interpolate current position to target position
    textRef.current.position.x = THREE.MathUtils.lerp(textRef.current.position.x, targetX, 0.05);
    textRef.current.position.y = THREE.MathUtils.lerp(textRef.current.position.y, targetY, 0.05);

    // Gentle constant rotation
    textRef.current.rotation.y = rotOffset + state.clock.elapsedTime * (0.2 + seed * 0.1);
    textRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + seed) * 0.1;
  });

  return (
    <Float
      speed={1.5 + seed} // Animation speed
      rotationIntensity={0.2} // XYZ rotation intensity
      floatIntensity={0.8} // Up/down float intensity
      floatingRange={[-0.2, 0.2]} // Range of y-axis values the object will float within
    >
      <Text
        ref={textRef}
        position={position}
        fontSize={0.8 + seed * 0.6}
        color={hovered ? "#F2C96E" : "#E8600A"} // saffron to gold
        font="https://fonts.gstatic.com/s/notosansdevanagari/v21/6xKxdSpVJ9cxRVqca8zRe1_L1uM_J-A-.woff"
        anchorX="center"
        anchorY="middle"
        material-toneMapped={false}
        material-transparent={true}
        material-opacity={0.3 + seed * 0.2}
      >
        ॐ
      </Text>
    </Float>
  );
}

// Mandala Background Effect
function BackgroundMandala() {
  const sphereRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      sphereRef.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <Sphere ref={sphereRef} args={[15, 64, 64]} position={[0, 0, -10]}>
      <MeshDistortMaterial
        color="#1C0A00" // Deep spiritual black/brown
        emissive="#3D0C02"
        emissiveIntensity={0.5}
        distort={0.4}
        speed={1.5}
        roughness={0.8}
        wireframe={true}
        transparent={true}
        opacity={0.15}
      />
    </Sphere>
  );
}

// Main Scene Component
function Scene() {
  const { viewport } = useThree();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate random positions for Om symbols based on viewport
  const omData = useMemo(() => {
    const data = [];
    const count = isMobile ? 8 : 18; // Limit count on mobile for performance
    for (let i = 0; i < count; i++) {
      data.push({
        position: [
          (Math.random() - 0.5) * (viewport.width * 1.5),
          (Math.random() - 0.5) * (viewport.height * 1.2),
          (Math.random() - 0.5) * 5 - 2 // z depth
        ] as [number, number, number],
        seed: Math.random()
      });
    }
    return data;
  }, [viewport.width, viewport.height, isMobile]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#F2C96E" />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#E8600A" />

      <BackgroundMandala />

      {/* Floating Symbols */}
      {omData.map((data, i) => (
        <OmSymbol key={i} position={data.position} seed={data.seed} />
      ))}

      {/* Glowing Diya Particles (Sparkles) */}
      <Sparkles 
        count={isMobile ? 50 : 150} 
        scale={viewport.width * 1.5} 
        size={isMobile ? 2 : 4} 
        speed={0.4} 
        opacity={0.6} 
        color="#F2C96E" 
        noise={0.1}
      />
      <Sparkles 
        count={isMobile ? 30 : 80} 
        scale={viewport.width * 1.2} 
        size={isMobile ? 4 : 8} 
        speed={0.8} 
        opacity={0.3} 
        color="#E8600A" 
        noise={0.2}
      />

      {/* Post Processing Effects - Bloom adds the divine glow */}
      {!isMobile && (
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} />
          <Noise opacity={0.02} />
        </EffectComposer>
      )}
    </>
  );
}

export default function DivineHeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 bg-[#060302] overflow-hidden pointer-events-none">
      {/* Fallback radial gradient behind the canvas to ensure rich dark background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1C0A00] via-[#060302] to-[#000000] opacity-80" />
      
      <Canvas eventSource={containerRef} camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
        <Scene />
      </Canvas>
      
      {/* Subtle bottom fade to blend smoothly into the next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#060302] to-transparent z-10 pointer-events-none" />
    </div>
  );
}
