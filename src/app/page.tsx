"use client";

import React, { useState, useRef, Suspense, useEffect } from "react";
import { ShieldCheck, CheckCircle2, Lock, Activity, Users, Zap, Share2, Info, ArrowUp, X, User, Edit3, Save, Camera, LogOut, Search, Compass, Target, CloudLightning } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useDrag } from "@use-gesture/react";
import * as THREE from "three";

// --- TYPES ---
interface Squad {
  name: string;
  amount: string;
}

interface Campaign {
  id: number;
  brand: string;
  title: string;
  description: string;
  goal: number;
  pledged: number;
  emoji?: string;
  modelType: string;
  color: string;
  deadline: string;
  squadsCount: string;
  specs: string[];
  squads: Squad[];
  category: "TECH" | "APPAREL" | "HOME" | "RESTAURANTS" | "LOCAL";
  image?: string;
}

interface Brand {
  name: string;
  totalRaised: string;
  campaigns: number;
  hue: string;
}

// --- DUMMY DATA ---
const CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    brand: "Nike Verified",
    title: "RETRO 95 NEON",
    description: "Pledge to resurrect the highly demanded Neon '95 colorway. If we hit the goal, it goes straight to production. Zero risk to you.",
    goal: 25000,
    pledged: 18450,
    emoji: "🥾", // Fallback
    modelType: "shoe",
    color: "#00FF41", // Electric Green
    deadline: "12 DAYS",
    squadsCount: "4.2k",
    category: "APPAREL",
    specs: ["Air Max Cushioning", "Mesh Upper", "Neon ACCents", "Retro 1995 Box"],
    squads: [{ name: "Sneakerheads", amount: "+$4.2k" }, { name: "The 90s Club", amount: "+$2.8k" }],
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 2,
    brand: "Sony Verified",
    title: "WALKMAN CYBER",
    description: "A modern, high-res audio DAP packaged inside the exact tooling of the original 1980s Walkman TPS-L2. Bluetooth 5.3 included.",
    goal: 150000,
    pledged: 112000,
    modelType: "walkman",
    color: "#00E5FF", // Cyber Blue
    deadline: "5 DAYS",
    squadsCount: "12.1k",
    category: "TECH",
    specs: ["Dual DAC", "Cassette Window Screen", "Bluetooth 5.3", "FLAC Support", "40hr Battery"],
    squads: [{ name: "Audiophiles", amount: "+$45k" }, { name: "Retro Tech", amount: "+$22k" }],
    image: "https://images.unsplash.com/photo-1629367489253-1ffbb2d978be?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 3,
    brand: "Leica Verified",
    title: "GHOST EDITION",
    description: "Stripped down. No screen. Magnesium alloy. True mechanical shutter. The ultimate demanding photographer's dream.",
    goal: 500000,
    pledged: 450500,
    modelType: "camera",
    color: "#FFD600", // Warning Yellow
    deadline: "48 HOURS",
    squadsCount: "2.8k",
    category: "TECH",
    specs: ["Full Frame Sensor", "No LCD", "Optical Viewfinder", "Weather Sealed"],
    squads: [{ name: "Street Shooters", amount: "+$120k" }, { name: "Analogue Purists", amount: "+$65k" }],
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 4,
    brand: "Arcteryx Verified",
    title: "DUNE SHELL",
    description: "An ultra-tough, unreleased concept shell built for extreme sandstorms and desert heat. Gore-Tex PRO breathable mesh.",
    goal: 80000,
    pledged: 22000,
    modelType: "shell",
    color: "#FF3D00", // Core Orange
    deadline: "21 DAYS",
    squadsCount: "1.4k",
    category: "APPAREL",
    specs: ["Gore-Tex PRO", "Sand-Proof Zippers", "Heat Vents", "Packable Design"],
    squads: [{ name: "Techwear Ninjas", amount: "+$8.2k" }, { name: "Dune Fans", amount: "+$4.5k" }],
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 5,
    brand: "Teenage Engineering",
    title: "OP-3 BRUTE",
    description: "A massive, brutalist portable synthesizer cast in pure aluminum. 16 tracks. Built-in FM radio transceiver.",
    goal: 200000,
    pledged: 40000,
    modelType: "synth",
    color: "#F1F5F9", // Bright White/Silver
    deadline: "30 DAYS",
    squadsCount: "9.2k",
    category: "TECH",
    specs: ["Aluminum Body", "16-Track Sequencer", "FM Transceiver", "Mechanical Keys"],
    squads: [{ name: "Synth Wave", amount: "+$18k" }, { name: "Sound Designers", amount: "+$7.2k" }]
  },
  {
    id: 6,
    brand: "Braun Verified",
    title: "AW10 1989",
    description: "The classic minimalist wristwatch from 1989. Exact original schematics, re-issued for a single production run.",
    goal: 40000,
    pledged: 39500,
    modelType: "watch",
    color: "#E11D48", // Braun Red accent
    deadline: "1 DAY",
    squadsCount: "1.2k",
    category: "LOCAL",
    specs: ["Raw Denim", "Repaired by Hand", "Tailored Fit", "Vintage Loom"],
    squads: [{ name: "Denim Heads", amount: "+$2.2k" }, { name: "Local Crafts", amount: "+$1.1k" }],
    image: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 7,
    brand: "Dyson Verified",
    title: "SONIC BOARD",
    description: "A proof-of-concept levitation board utilizing Dyson's unreleased cyclonic air-cushion technology. Moves seamlessly over concrete.",
    goal: 1000000,
    pledged: 200000,
    modelType: "board",
    color: "#D946EF", // Fuchsia
    deadline: "14 DAYS",
    squadsCount: "15k",
    category: "TECH",
    specs: ["Cyclonic Levitation", "1hr Battery", "Carbon Fiber Deck", "App Controlled"],
    squads: [{ name: "Future Tech", amount: "+$80k" }, { name: "Skaters", amount: "+$25k" }]
  },
  {
    id: 8,
    brand: "Nintendo Verified",
    title: "SUPER FAMICOM.V2",
    description: "An exact 1:1 machined aluminum replica of the original Super Famicom console, modernized with wireless controllers and 4K upscaling.",
    goal: 350000,
    pledged: 310500,
    modelType: "console",
    color: "#6366F1", // Indigo Blur
    deadline: "7 DAYS",
    squadsCount: "8.1k",
    category: "TECH",
    specs: ["Machined Aluminum", "Bluetooth 5.4", "4k HDMI OUT", "Original Cartridge Slot"],
    squads: [{ name: "Speedrunners", amount: "+$55k" }, { name: "Retro Gamers", amount: "+$110k" }]
  },
  {
    id: 9,
    brand: "Herman Miller",
    title: "AERON EXTREME",
    description: "A completely blacked-out, carbon-weave variant of the iconic Aeron chair. Designed for marathon ergonomic performance.",
    goal: 120000,
    pledged: 80000,
    modelType: "chair",
    color: "#A3E635", // High-Vis Lime
    deadline: "19 DAYS",
    squadsCount: "3.4k",
    category: "HOME",
    specs: ["Carbon Fiber Weave", "Vantablack Finish", "PostureFit SL", "8-Way Adjustable"],
    squads: [{ name: "Developers", amount: "+$24k" }, { name: "Writers", amount: "+$12k" }]
  },
  {
    id: 10,
    brand: "Nothing",
    title: "EAR (ZERO)",
    description: "True wireless earbuds enclosed entirely in transparent sapphire crystal. See every micro-component powering your audio.",
    goal: 50000,
    pledged: 49500,
    modelType: "earbuds",
    color: "#F43F5E", // Rose Red
    deadline: "18 HOURS",
    squadsCount: "22k",
    category: "TECH",
    specs: ["Sapphire Crystal", "Active Noise Cancelling", "Hi-Res Audio", "Bone Conduction"],
    squads: [{ name: "Tech Enthusiasts", amount: "+$19k" }, { name: "Audiophiles", amount: "+$9k" }]
  },
  {
    id: 11,
    brand: "Keychron Verified",
    title: "Q1 HE CARBON",
    description: "A Hall Effect magnetic switch keyboard with a solid forged carbon fiber chassis. 8000Hz polling rate.",
    goal: 65000,
    pledged: 58200,
    modelType: "keyboard",
    color: "#8B5CF6", // Purple
    deadline: "4 DAYS",
    squadsCount: "3.1k",
    category: "TECH",
    specs: ["Forged Carbon Body", "Hall Effect Switches", "8000Hz Polling", "Gasket Mount"],
    squads: [{ name: "Mechanical Mods", amount: "+$12.5k" }, { name: "Competitive Gamers", amount: "+$8.2k" }]
  },
  {
    id: 12,
    brand: "DJI Verified",
    title: "AVATA PRO X",
    description: "Cinestick-ready FPV drone with a titanium exoskeleton and 8K 60fps global shutter camera.",
    goal: 250000,
    pledged: 180000,
    modelType: "drone",
    color: "#F97316", // Orange
    deadline: "10 DAYS",
    squadsCount: "5.4k",
    category: "TECH",
    specs: ["Titanium Exoskeleton", "8K Global Shutter", "O4 Video Link", "Crash-Proof Ducting"],
    squads: [{ name: "FPV Pilots", amount: "+$45k" }, { name: "Cinematographers", amount: "+$32k" }]
  },
  {
    id: 13,
    brand: "La Marzocco",
    title: "LINEA MINI-S",
    description: "The classic cafe icon shrunk down even further. Now with dual boiler sapphire tubing and IoT flow profiling.",
    goal: 400000,
    pledged: 310000,
    modelType: "espresso",
    color: "#EF4444", // Red
    deadline: "15 DAYS",
    squadsCount: "1.8k",
    category: "HOME",
    specs: ["Doughnut Driver Design", "98dB Sensitivity", "Walnut Housing", "Solid Brass Accents"],
    squads: [{ name: "High Fidelity", amount: "+$12.5k" }, { name: "Craftsmanship", amount: "+$4k" }],
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 14,
    brand: "Bang & Olufsen",
    title: "BEOSOUND GLASS",
    description: "An omnidirectional speaker crafted from a single block of high-density acoustic glass. Sound you can see through.",
    goal: 150000,
    pledged: 45000,
    modelType: "speaker",
    color: "#64748B", // Slate
    deadline: "25 DAYS",
    squadsCount: "2.5k",
    category: "TECH",
    specs: ["Acoustic Glass Body", "360 Sound", "AirPlay 3", "Sustainable Design"],
    squads: [{ name: "Audiophiles", amount: "+$22k" }, { name: "Interior Designers", amount: "+$12k" }]
  },
  {
    id: 15,
    brand: "Rimowa Verified",
    title: "CABIN TITANIUM",
    description: "The legendary aluminum pilot case, re-imagined in pure Grade 5 Titanium for the ultimate frequent flyer.",
    goal: 120000,
    pledged: 115000,
    modelType: "suitcase",
    color: "#94A3B8", // Light Slate
    deadline: "2 DAYS",
    squadsCount: "1.1k",
    category: "APPAREL",
    specs: ["Grade 5 Titanium", "Multiwheel System", "TSA Locks", "Lifetime Guarantee"],
    squads: [{ name: "World Travelers", amount: "+$65k" }, { name: "Business Elite", amount: "+$35k" }]
  },
  {
    id: 16,
    brand: "Central Perk",
    title: "UPPER EAST ROAST",
    description: "Bringing the iconic Greenwich Village coffee experience to your doorstep. Verified organic micro-lots.",
    goal: 15000,
    pledged: 12400,
    modelType: "board", // Placeholder model
    color: "#3F6212", // Coffee Green
    deadline: "8 DAYS",
    squadsCount: "0.8k",
    category: "RESTAURANTS",
    specs: ["Single Origin", "Compostable Cups", "Mobile Roastery", "Nitro Cold Brew"],
    squads: [{ name: "Coffee Geeks", amount: "+$1.2k" }, { name: "Eco-Conscious", amount: "+$900" }],
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 17,
    brand: "The Corner Bistro",
    title: "HYPER-LOCAL CIDER",
    description: "Small-batch, zero-additive cider brewed exclusively with apples from 10km of the city center.",
    goal: 5000,
    pledged: 4800,
    modelType: "shell", // Placeholder
    color: "#FACC15", // Cider Yellow
    deadline: "2 DAYS",
    squadsCount: "0.4k",
    category: "RESTAURANTS",
    specs: ["Zero Additives", "Local Orchards", "Glass Bottles", "Volunteer Picking"],
    squads: [{ name: "Locavores", amount: "+$2k" }, { name: "Eco-Drinkers", amount: "+$1k" }]
  },
  {
    id: 18,
    brand: "Main St. Barber",
    title: "SOLID SHAVE BAR",
    description: "Ditching plastic. A high-performance shave soap bar formulated by the city's oldest barbershop.",
    goal: 2500,
    pledged: 2100,
    modelType: "watch", // Placeholder
    color: "#1E293B", // Navy Blue
    deadline: "10 DAYS",
    squadsCount: "0.2k",
    category: "LOCAL",
    specs: ["Shea Butter Base", "Steel Tin", "Zero Plastic", "Antique Scent"],
    squads: [{ name: "Traditionalists", amount: "+$800" }, { name: "Zero Waste", amount: "+$500" }]
  }
];

const BRANDS: Brand[] = [
  { name: "Nike", totalRaised: "$4.2M", campaigns: 12, hue: "#00FF41" },
  { name: "Sony", totalRaised: "$2.1M", campaigns: 5, hue: "#00E5FF" },
  { name: "Leica", totalRaised: "$8.5M", campaigns: 3, hue: "#FFD600" },
  { name: "Arcteryx", totalRaised: "$1.1M", campaigns: 4, hue: "#FF3D00" },
  { name: "Teenage Eng", totalRaised: "$950k", campaigns: 2, hue: "#F1F5F9" },
  { name: "Braun", totalRaised: "$400k", campaigns: 6, hue: "#E11D48" },
  { name: "Dyson", totalRaised: "$0", campaigns: 1, hue: "#D946EF" },
];

// --- 3D COMPONENTS ---
function ShapeModel({ type, color, index, currentIndex, onPointerDown, onToggleZen }: { type: string; color: string; index: number; currentIndex: number, onPointerDown: () => void, onToggleZen: () => void }) {
  const groupRef = useRef<any>(null);
  const time = useRef(Math.random() * 100); // offset randomness
  // Bug 4: track whether pointer moved to prevent accidental Zen toggle on rotate
  const pointerMoved = useRef(false);

  useFrame((state, delta) => {
    time.current += delta;
    if (groupRef.current) {
      if (index === currentIndex) {
        groupRef.current.position.x = Math.sin(time.current * 0.5) * 0.05;
      } else {
        groupRef.current.rotation.y = time.current * 0.2;
      }

      const targetY = (index - currentIndex) * 6;
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY + Math.sin(time.current * 2) * 0.1, 0.1);

      const targetScale = index === currentIndex ? 0.5 : 0.001;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.18);

      groupRef.current.visible = groupRef.current.scale.x > 0.01;
    }
  });

  const isChrome = type === "shell" || type === "camera" || type === "watch" || type === "suitcase";
  const isBrushedMetal = type === "walkman" || type === "synth" || type === "espresso" || type === "keyboard" || type === "drone";
  const isTransparent = type === "earbuds" || type === "speaker";

  const mat = <meshPhysicalMaterial
    color={isChrome ? "#FFFFFF" : color}
    roughness={isChrome ? 0.05 : isBrushedMetal ? 0.35 : 0.8}
    metalness={isChrome ? 1 : isBrushedMetal ? 0.9 : 0.1}
    clearcoat={isChrome ? 1 : 0.2}
    transmission={isTransparent ? 0.7 : 0}
    thickness={isTransparent ? 1 : 0}
    ior={1.5}
  />;

  const accentMat = <meshStandardMaterial color="#1C1C1C" roughness={0.2} metalness={0.8} />;
  const glassMat = <meshPhysicalMaterial transmission={1} thickness={0.5} roughness={0.05} ior={1.5} color="#FFFFFF" />;

  const handlePointerDown = (e: any) => {
    e.stopPropagation(); // Bug 2: prevent useDrag on window from competing with OrbitControls
    pointerMoved.current = false; // Bug 4: reset move tracker
    onPointerDown();
  };

  const handlePointerMove = (e: any) => {
    pointerMoved.current = true; // Bug 4: mark that pointer has moved (rotation happening)
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (!pointerMoved.current) onToggleZen(); // Bug 4: only toggle Zen if no rotation occurred
  };

  const renderModel = () => {
    switch (type) {
      case "shoe":
        return (
          <group position={[0, -0.5, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onClick={handleClick}>
            <mesh castShadow position={[0, 0, 0]}><capsuleGeometry args={[0.5, 1.2, 16, 32]} />{mat}</mesh>
            <mesh castShadow position={[0.4, -0.2, 0]} rotation={[0, 0, Math.PI / 4]}><cylinderGeometry args={[0.3, 0.4, 1.3, 32]} />{mat}</mesh>
            <mesh position={[0, -0.6, 0]} scale={[1.1, 0.2, 1.1]}><boxGeometry />{accentMat}</mesh>
          </group>
        );
      case "walkman":
        return (
          <group onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onClick={handleClick}>
            <mesh castShadow><boxGeometry args={[1.2, 1.8, 0.4]} />{mat}</mesh>
            <mesh position={[0, 0.2, 0.21]} scale={[0.8, 0.6, 0.02]}><boxGeometry />{glassMat}</mesh>
            <mesh position={[0.65, 0.4, 0]} scale={[0.1, 0.4, 0.2]}><boxGeometry />{accentMat}</mesh>
            <mesh position={[-0.65, -0.4, 0]} scale={[0.1, 0.2, 0.1]}><boxGeometry />{accentMat}</mesh>
          </group>
        );
      case "camera":
        return (
          <group onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onClick={handleClick}>
            <mesh castShadow><boxGeometry args={[1.8, 1.1, 0.6]} />{mat}</mesh>
            <mesh castShadow position={[0, 0, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.45, 0.45, 0.6, 32]} />{mat}
            </mesh>
            <mesh position={[0, 0, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.38, 0.38, 0.05, 32]} />{glassMat}
            </mesh>
            <mesh position={[0.6, 0.55, 0.1]} scale={[0.3, 0.1, 0.3]}><boxGeometry />{accentMat}</mesh>
          </group>
        );
      case "synth":
        return (
          <group onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onClick={handleClick}>
            <mesh castShadow><boxGeometry args={[2.8, 0.15, 1]} />{mat}</mesh>
            {[-1, -0.5, 0, 0.5, 1].map((x, i) => (
              <mesh key={i} position={[x, 0.15, 0]} scale={[0.3, 0.1, 0.8]}><boxGeometry />{accentMat}</mesh>
            ))}
            <mesh position={[-1.2, 0.15, 0.3]}><sphereGeometry args={[0.1, 16, 16]} />{accentMat}</mesh>
            <mesh position={[-1.2, 0.15, -0.3]}><sphereGeometry args={[0.1, 16, 16]} />{accentMat}</mesh>
          </group>
        );
      case "watch":
        return (
          <group onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onClick={handleClick}>
            <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.8, 0.8, 0.15, 64]} />{mat}</mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.08]}><cylinderGeometry args={[0.75, 0.75, 0.02, 64]} />{glassMat}</mesh>
            <mesh position={[0, 1.1, 0]} scale={[0.5, 0.8, 0.08]}><boxGeometry />{accentMat}</mesh>
            <mesh position={[0, -1.1, 0]} scale={[0.5, 0.8, 0.08]}><boxGeometry />{accentMat}</mesh>
            <mesh position={[0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.1, 0.1, 0.2]} />{accentMat}</mesh>
          </group>
        );
      case "keyboard":
        return (
          <group onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onClick={handleClick} rotation={[-0.2, 0, 0]}>
            <mesh castShadow><boxGeometry args={[3, 0.3, 1.2]} />{mat}</mesh>
            <group position={[0, 0.2, 0]}>
              {Array.from({ length: 12 }).map((_, i) => (
                <mesh key={i} position={[(i - 5.5) * 0.24, 0, 0]} scale={[0.2, 0.1, 0.2]}><boxGeometry />{accentMat}</mesh>
              ))}
            </group>
          </group>
        );
      case "drone":
        return (
          <group onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onClick={handleClick}>
            <mesh castShadow><boxGeometry args={[1, 0.4, 1]} />{mat}</mesh>
            {[[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].map((pos, i) => (
              <group key={i} position={[pos[0], 0.1, pos[1]]}>
                <mesh><cylinderGeometry args={[0.4, 0.4, 0.05, 32]} />{glassMat}</mesh>
                <mesh rotation={[0, Math.PI / 4, 0]} scale={[0.8, 0.02, 0.05]}><boxGeometry />{accentMat}</mesh>
              </group>
            ))}
            <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.2, 0.2, 0.3]} />{accentMat}</mesh>
          </group>
        );
      case "espresso":
        return (
          <group onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onClick={handleClick}>
            <mesh castShadow><boxGeometry args={[1.5, 1.8, 1.5]} />{mat}</mesh>
            <mesh position={[0, 0.95, 0]} scale={[1.6, 0.1, 1.6]}><boxGeometry />{mat}</mesh>
            <mesh position={[0, -0.2, 0.8]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.8]} />{mat}</mesh>
            <mesh position={[0, -0.6, 0.8]}><boxGeometry args={[0.4, 0.1, 0.4]} />{accentMat}</mesh>
            <mesh position={[0.7, 0.5, 0.76]}><sphereGeometry args={[0.2, 16, 16]} />{accentMat}</mesh>
          </group>
        );
      case "speaker":
        return (
          <group onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onClick={handleClick}>
            <mesh castShadow><cylinderGeometry args={[0.8, 1, 2.2, 32]} />{mat}</mesh>
            <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.7, 0.7, 2, 32]} />{accentMat}</mesh>
            <mesh position={[0, 1.15, 0]}><cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />{mat}</mesh>
          </group>
        );
      case "suitcase":
        return (
          <group onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onClick={handleClick}>
            <mesh castShadow><boxGeometry args={[1.2, 1.8, 0.6]} />{mat}</mesh>
            {[-0.6, -0.2, 0.2, 0.6].map((y, i) => (
              <mesh key={i} position={[0, y, 0.31]} scale={[1.1, 0.05, 0.02]}><boxGeometry />{accentMat}</mesh>
            ))}
            <mesh position={[0, 1, 0]} scale={[0.6, 0.2, 0.2]}><boxGeometry />{accentMat}</mesh>
            <mesh position={[0.5, -0.95, 0.25]}><sphereGeometry args={[0.1, 16, 16]} />{accentMat}</mesh>
            <mesh position={[-0.5, -0.95, 0.25]}><sphereGeometry args={[0.1, 16, 16]} />{accentMat}</mesh>
          </group>
        );
      case "shell":
        return (
          <group onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onClick={handleClick}>
            <mesh castShadow><sphereGeometry args={[1, 32, 32]} />{mat}</mesh>
            <mesh position={[0, 0, 0]} scale={[1.1, 0.8, 1.1]}><sphereGeometry args={[1, 32, 32]} />{mat}</mesh>
            <mesh position={[0, 1.2, 0]} scale={[0.2, 0.4, 0.2]}><boxGeometry />{accentMat}</mesh>
          </group>
        );
      case "board":
        return (
          <group onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onClick={handleClick}>
            <mesh castShadow rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.4, 2.8, 16, 32]} />{mat}</mesh>
            <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 0.2, 1.2]}><boxGeometry />{accentMat}</mesh>
            {[-1, 1].map((x, i) => (
              <mesh key={i} position={[x, -0.5, 0]} scale={[0.3, 0.1, 0.3]}><boxGeometry />{accentMat}</mesh>
            ))}
          </group>
        );
      case "console":
        return (
          <group onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onClick={handleClick}>
            <mesh castShadow><boxGeometry args={[2, 0.6, 1.6]} />{mat}</mesh>
            <mesh position={[0, 0.35, -0.2]}><boxGeometry args={[1.4, 0.1, 0.8]} />{accentMat}</mesh>
            <mesh position={[-0.6, 0.35, 0.5]}><sphereGeometry args={[0.15, 16, 16]} />{accentMat}</mesh>
            <mesh position={[0.6, 0.35, 0.5]}><sphereGeometry args={[0.15, 16, 16]} />{accentMat}</mesh>
          </group>
        );
      case "chair":
        return (
          <group position={[0, -0.5, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onClick={handleClick}>
            <mesh castShadow position={[0, 0.6, 0]}><boxGeometry args={[1.2, 0.15, 1.2]} />{mat}</mesh>
            <mesh castShadow position={[0, 1.4, -0.5]} rotation={[-0.1, 0, 0]}><boxGeometry args={[1.1, 1.3, 0.1]} />{mat}</mesh>
            <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 1.2]} />{accentMat}</mesh>
            <mesh position={[0, -0.6, 0]} scale={[1, 0.1, 1]}><cylinderGeometry args={[0.8, 0.8, 1]} />{accentMat}</mesh>
          </group>
        );
      case "earbuds":
        return (
          <group onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onClick={handleClick}>
            <mesh castShadow><sphereGeometry args={[0.6, 32, 32]} />{mat}</mesh>
            <mesh position={[0, -0.4, 0]} rotation={[0, 0, 0]}><cylinderGeometry args={[0.15, 0.1, 0.8]} />{mat}</mesh>
            <mesh position={[0, 0.1, 0.5]} scale={[0.2, 0.2, 0.1]}><sphereGeometry />{accentMat}</mesh>
          </group>
        );
      default:
        return <mesh castShadow onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onClick={handleClick}><boxGeometry args={[1, 1, 1]} />{mat}</mesh>;
    }
  };

  return <group ref={groupRef}>{renderModel()}</group>;
}

function ThreeScene({ currentCampaign, currentIndex, onInteractionStart, onToggleZen }: { currentCampaign: Campaign, currentIndex: number, onInteractionStart: () => void, onToggleZen: () => void }) {
  const controlsRef = useRef<any>(null);
  const { gl } = useThree();

  useEffect(() => {
    const handlePointerUp = () => {
      if (controlsRef.current) controlsRef.current.enableRotate = false;
    };
    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, []);

  // Bug 1: Reset camera to default position when campaign changes
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [currentIndex]);

  // Custom Zoom Control: Disable scroll-to-zoom, only allow pinch-to-zoom (trackpad/touch)
  useEffect(() => {
    const el = gl.domElement;
    if (!el) return;

    const handleWheelCapture = (e: WheelEvent) => {
      if (controlsRef.current) {
        // In macOS/Browsers, pinch-to-zoom on trackpad sends a wheel event with ctrlKey: true
        // We only enable zoom if it's a pinch, otherwise we disable it to let it bubble to the feed scroll
        controlsRef.current.enableZoom = e.ctrlKey;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (controlsRef.current && e.touches.length > 1) {
        // Ensure zoom is enabled for touch-based pinches
        controlsRef.current.enableZoom = true;
      }
    };

    // Bug 6: disable zoom when pinch ends so single-finger scroll is never interpreted as zoom
    const handleTouchEnd = (e: TouchEvent) => {
      if (controlsRef.current && e.touches.length < 2) {
        controlsRef.current.enableZoom = false;
      }
    };

    el.addEventListener("wheel", handleWheelCapture, { capture: true });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("wheel", handleWheelCapture, { capture: true });
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [gl]);

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 10, 5]} intensity={2.5} color={currentCampaign.color} />
      <directionalLight position={[-5, 5, -5]} intensity={1.5} color="#ffffff" />

      {CAMPAIGNS.map((campaign: Campaign, i: number) => (
        <ShapeModel
          key={campaign.id}
          type={campaign.modelType}
          color={campaign.color}
          index={i}
          currentIndex={currentIndex}
          onPointerDown={() => {
            if (controlsRef.current) controlsRef.current.enableRotate = true;
            onInteractionStart();
          }}
          onToggleZen={onToggleZen}
        />
      ))}

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true} // Base state must be true for the interceptor logic
        enableRotate={false}
        minDistance={2}
        maxDistance={12}
        enableDamping={true}
        dampingFactor={0.15}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }} // Bug 5: explicit touch config for consistent cross-device behaviour
        makeDefault
      />
    </>
  );
}

// --- MAIN APP COMPONENT ---
export default function Home() {
  const [currentTab, setCurrentTab] = useState<"FEED" | "TRENDS" | "BRANDS" | "PROFILE">("FEED");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZenMode, setIsZenMode] = useState(false);
  const [hasInteracted3D, setHasInteracted3D] = useState(false); // UX: track first 3D interaction for rotate hint
  const isInteractingWithObject = useRef(false);

  const currentCampaign = CAMPAIGNS[currentIndex % CAMPAIGNS.length];

  useEffect(() => {
    const handleUp = () => {
      isInteractingWithObject.current = false;
    };
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp); // Bug 3: handle browser-cancelled pointers (e.g. system gestures)
    return () => {
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, []);

  return (
    <main className="h-[100dvh] w-[100dvw] bg-[#E5E3DF] text-[#1C1C1C] relative flex justify-center items-center overflow-hidden font-sans selection:bg-[#1C1C1C] selection:text-white">

      {/* GLOBAL 3D CANVAS - STAYS MOUNTED FOREVER TO PREVENT WEBGL CONTEXT LOSS */}
      <div className={`absolute inset-0 bg-gradient-to-br from-[#F5F4F0] to-[#E5E3DF] transition-opacity duration-700 pointer-events-auto ${currentTab === "FEED" ? "opacity-100 z-10" : "opacity-0 -z-50 delay-500"}`}>
        <div className="absolute inset-0 top-[-10vh]">
          <Suspense fallback={null}>
            <Canvas
              dpr={typeof navigator !== 'undefined' && ((navigator as any).deviceMemory ?? 8) <= 4 ? [1, 1.5] : [1, 2]}
              camera={{ position: [0, 0, 5], fov: 45 }}
              gl={{ preserveDrawingBuffer: true }}
              style={{ touchAction: 'none' }}
            >
              <ThreeScene
                currentCampaign={currentCampaign}
                currentIndex={currentIndex}
                onInteractionStart={() => { isInteractingWithObject.current = true; setHasInteracted3D(true); }}
                onToggleZen={() => setIsZenMode(prev => !prev)}
              />
            </Canvas>
          </Suspense>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentTab === "FEED" && (
          <FeedView
            key="feed"
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            currentCampaign={currentCampaign}
            isInteractingWithObject={isInteractingWithObject}
            currentTab={currentTab}
            isZenMode={isZenMode}
            setIsZenMode={setIsZenMode}
            hasInteracted3D={hasInteracted3D}
          />
        )}
        {currentTab === "TRENDS" && <TrendsView key="trends" />}
        {currentTab === "BRANDS" && <BrandsView key="brands" />}
        {currentTab === "PROFILE" && <ProfileView key="profile" />}
      </AnimatePresence>

      {/* FLOATING BOTTOM NAVIGATION BAR */}
      <nav className={`absolute bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[600px] h-[70px] bg-[#F5F5F3] border-4 border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] z-50 flex items-center justify-between p-1 overflow-hidden transition-transform duration-500 ${(isZenMode && currentTab === "FEED") ? "translate-y-[150%]" : "translate-y-0"}`}>
        {[
          { id: "FEED", icon: Activity },
          { id: "TRENDS", icon: CloudLightning },
          { id: "BRANDS", icon: Compass },
          { id: "PROFILE", icon: User }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id as any)}
            className={`flex-1 h-full mx-0.5 flex flex-col items-center justify-center gap-1 uppercase font-black tracking-widest text-[10px] sm:text-xs transition-all border-2 border-transparent ${currentTab === tab.id ? "bg-[#1C1C1C] text-[#F5F5F3] border-[#1C1C1C]" : "text-[#1C1C1C]/60 hover:text-[#1C1C1C] hover:bg-[#E5E3DF]"}`}
          >
            <tab.icon size={20} strokeWidth={currentTab === tab.id ? 3 : 2} className={currentTab === tab.id ? "drop-shadow-[0_0_5px_#F5F5F3]" : ""} />
            <span className={currentTab === tab.id ? "text-[#F5F5F3]" : ""}>{tab.id}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}

// ==========================================
// FEED VIEW
// ==========================================
function FeedView({ currentIndex, setCurrentIndex, currentCampaign, isInteractingWithObject, currentTab, isZenMode, setIsZenMode, hasInteracted3D }: { currentIndex: number, setCurrentIndex: React.Dispatch<React.SetStateAction<number>>, currentCampaign: Campaign, isInteractingWithObject: React.RefObject<boolean>, currentTab: string, isZenMode: boolean, setIsZenMode: (val: boolean) => void, hasInteracted3D: boolean }) {
  const [pledgeState, setPledgeState] = useState<"initiated" | "escrowed" | "locked">("initiated");
  const [activeView, setActiveView] = useState<"none" | "specs" | "squads">("none");
  const lastScrollTime = useRef<number>(0);

  const progressPercent = (currentCampaign.pledged / currentCampaign.goal) * 100;

  const handleNext = () => {
    setCurrentIndex((prev: number) => (prev + 1) % CAMPAIGNS.length);
    setPledgeState("initiated");
  };

  const handlePrev = () => {
    setCurrentIndex((prev: number) => (prev - 1 + CAMPAIGNS.length) % CAMPAIGNS.length);
    setPledgeState("initiated");
  };

  const handleWheel = (e: React.WheelEvent | WheelEvent) => {
    if (e.ctrlKey) return;
    if (activeView !== "none") return;

    const now = Date.now();
    // Balanced cooldown for snappy but controlled scrolling
    if (now - lastScrollTime.current < 700) return;

    // Normalize deltaY slightly for different browsers
    const dy = e.deltaY;
    if (Math.abs(dy) > 30) {
      if (dy > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      lastScrollTime.current = now;
    }
  };

  useEffect(() => {
    const onGlobalWheel = (e: WheelEvent) => {
      handleWheel(e);
    };
    window.addEventListener("wheel", onGlobalWheel, { passive: true });
    return () => window.removeEventListener("wheel", onGlobalWheel);
  }, [currentIndex, activeView]);

  // Swipe Gesture Handling - Optimized for responsiveness
  useDrag(({ last, velocity: [, vy], movement: [, my], direction: [, dy], event, cancel }) => {
    if (activeView !== "none" || currentTab !== "FEED") return;

    // Ignore if clicking UI elements
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || isInteractingWithObject.current) return;

    const now = Date.now();
    if (now - lastScrollTime.current < 500) return;

    // Trigger transition if we slide enough or flick fast enough
    if (Math.abs(my) > 120 || (Math.abs(vy) > 0.5 && Math.abs(my) > 20)) {
      if (dy < 0) {
        handleNext();
      } else {
        handlePrev();
      }
      lastScrollTime.current = now;
      cancel(); // Stop the gesture here to prevent double triggers
    }
  }, {
    target: typeof window !== 'undefined' ? window : undefined,
    axis: 'y',
    filterTaps: true,
    rubberband: true
  });

  const handlePledge = () => {
    if (pledgeState === "initiated") {
      setPledgeState("escrowed");
      setTimeout(() => setPledgeState("locked"), 1500);
    }
  };

  // Stagger Variants
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };
  const sidebarVariants = { hidden: { opacity: 0, x: 50 }, show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 h-[calc(100%-80px)] w-full flex flex-col justify-end">

      {/* Main Overlay Visuals */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <motion.div
          key={currentIndex + "glow"}
          initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ duration: 1 }}
          className="absolute w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] blur-[100px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: currentCampaign.color }}
        />
        {/* BIG TYPE BACKDROP - ANIMATES ON SWIPE */}
        <div className="absolute top-[25vh] left-1/2 -translate-x-1/2 w-full text-center mix-blend-overlay opacity-20 pointer-events-none overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.h1
              key={currentCampaign.title}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.8 }}
              className="text-[12vw] font-black uppercase whitespace-nowrap leading-[0.8] tracking-tighter"
            >
              {currentCampaign.title}
            </motion.h1>
          </AnimatePresence>
        </div>
      </div>

      {/* UX: Rotate affordance hint — shown until first 3D interaction */}
      <AnimatePresence>
        {!hasInteracted3D && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center gap-1.5"
          >
            <div className="flex items-center gap-2 bg-[#1C1C1C]/70 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/20 shadow-lg">
              <span style={{ fontSize: 14 }}>↻</span>
              <span>Tap &amp; drag to rotate</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe Surface Container (Replaced drag with pointer-events-none to allow OrbitControls) */}
      <motion.div
        className="absolute inset-0 z-10 flex flex-col justify-end pointer-events-none"
      >
        {/*
          Swipe interactions are handled by useDrag on the window,
          while model rotation is scoped only to touches on the 3D meshes.
        */}

        {/* Title Area - SWAPPING ON SCROLL */}
        <div className={`absolute top-4 left-0 right-0 p-4 md:p-6 z-20 pointer-events-none flex flex-col gap-1 transition-opacity duration-300 ${activeView !== "none" ? "opacity-0" : "opacity-100"}`}>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentCampaign.id + "header"}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className={`flex items-center gap-1.5 transition-opacity duration-500 delay-100 ${isZenMode ? "opacity-0 invisible" : "opacity-100 visible"}`}>
                <div className="font-black text-sm md:text-base text-[#1C1C1C] drop-shadow-[1px_1px_0_#FFFFFF] uppercase bg-[#E5E3DF]/60 px-2 py-1 backdrop-blur-lg border-[2px] border-[#1C1C1C] shadow-[2px_2px_0_0_#1C1C1C] flex items-center gap-1.5">
                  {currentCampaign.brand}
                  <CheckCircle2 size={14} className="text-blue-500 fill-[#1C1C1C] shrink-0" />
                </div>
              </div>
              <h2 className={`text-2xl md:text-3xl font-black tracking-tighter leading-[1] text-[#1C1C1C] drop-shadow-[1px_1px_0_#FFFFFF] w-[90%] md:w-[70%] mt-2 uppercase transition-all duration-500 ${isZenMode ? "md:text-5xl mt-6 translate-y-4" : "mt-2"}`}>
                {currentCampaign.title}
              </h2>
              <p className={`text-xs md:text-sm font-bold text-[#1C1C1C] w-[85%] md:w-[60%] leading-snug mt-1 bg-[#E5E3DF]/60 backdrop-blur-lg p-2 border-l-[3px] border-2 border-[#1C1C1C] shadow-[2px_2px_0_0_#1C1C1C] pointer-events-auto transition-all duration-500 delay-75 ${isZenMode ? "opacity-0 invisible -translate-x-4" : "opacity-100 visible translate-x-0"}`} style={{ borderLeftColor: currentCampaign.color }}>
                {currentCampaign.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Sidebar Nav - STATIC */}
        <div className={`absolute right-2 md:right-4 bottom-[140px] md:bottom-36 flex flex-col gap-6 z-20 pointer-events-auto items-center transition-all duration-500 ${activeView !== "none" || isZenMode ? "opacity-0 pointer-events-none translate-x-12" : "opacity-100 translate-x-0"}`}>
          <motion.button onClick={() => setActiveView("squads")} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1.5 group">
            <div className="w-12 h-12 bg-[#F5F5F3]/90 backdrop-blur-lg border-[3px] border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] flex items-center justify-center group-hover:bg-[#1C1C1C] transition-all">
              <Users size={24} className="text-[#1C1C1C] group-hover:text-[#F5F5F3]" />
            </div>
            <span className="text-[10px] font-black text-[#1C1C1C] uppercase drop-shadow-[1px_1px_0_#FFFFFF] bg-[#E5E3DF]/60 px-2 rounded">{currentCampaign.squadsCount}</span>
          </motion.button>

          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1.5 group">
            <div className="w-12 h-12 bg-[#F5F5F3]/90 backdrop-blur-lg border-[3px] border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] flex items-center justify-center group-hover:bg-[#1C1C1C] transition-all">
              <ShieldCheck size={24} className="text-[#1C1C1C] group-hover:text-[#F5F5F3]" />
            </div>
            <span className="text-[10px] font-black text-[#1C1C1C] uppercase drop-shadow-[1px_1px_0_#FFFFFF] bg-[#E5E3DF]/60 px-2 rounded">Secure</span>
          </motion.button>

          <motion.button onClick={() => setActiveView("specs")} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1.5 group">
            <div className="w-12 h-12 bg-[#F5F5F3]/90 backdrop-blur-lg border-[3px] border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] flex items-center justify-center group-hover:bg-[#1C1C1C] transition-all">
              <Info size={24} className="text-[#1C1C1C] group-hover:text-[#F5F5F3]" />
            </div>
            <span className="text-[10px] font-black text-[#1C1C1C] uppercase drop-shadow-[1px_1px_0_#FFFFFF] bg-[#E5E3DF]/60 px-2 rounded">Specs</span>
          </motion.button>
        </div>

        {/* Bottom Action Area - STATIC BUT VALUE UPDATES ANIMATE */}
        <div className={`absolute bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[600px] z-20 pointer-events-none flex flex-col gap-4 transition-transform duration-500 ${activeView !== "none" || isZenMode ? "translate-y-[150%]" : "translate-y-0"}`}>

          <div className="w-full flex flex-col gap-0 pointer-events-auto border-4 border-[#1C1C1C] bg-[#F5F5F3]/60 backdrop-blur-lg shadow-[8px_8px_0_0_#1C1C1C]">
            <div className="flex justify-between items-center p-3 sm:p-4 pb-2 font-black uppercase text-sm md:text-base border-b-4 border-[#1C1C1C]">
              <div className="flex items-center gap-2 transition-colors duration-500" style={{ color: currentCampaign.color, textShadow: "1px 1px 0 #1C1C1C" }}>
                <Activity size={20} className="text-[#1C1C1C]" />
                <span className="text-[#1C1C1C] drop-shadow-[1px_1px_0_#FFFFFF]">${currentCampaign.pledged.toLocaleString()} Pledged</span>
              </div>
              <div className="text-[#1C1C1C]">
                Goal: ${currentCampaign.goal.toLocaleString()}
              </div>
            </div>

            {/* Progress Bar Inside Box */}
            <div className="w-full h-4 bg-[#D4D2CD] relative overflow-hidden flex items-center">
              <motion.div initial={false} animate={{ width: `${progressPercent}%`, backgroundColor: currentCampaign.color }} transition={{ duration: 0.8, ease: "circOut" }} className="h-full border-r-4 border-[#1C1C1C] relative">
                <motion.div animate={{ x: [0, -20] }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#1C1C1C_10px,#1C1C1C_20px)] w-[200%]"></motion.div>
              </motion.div>
            </div>

            {/* Massive Button Embedded */}
            <motion.button
              initial={false}
              animate={{
                backgroundColor: pledgeState === "initiated" ? "#FFFFFF" : pledgeState === "escrowed" ? "#1C1C1C" : "#E5E3DF",
                color: pledgeState === "escrowed" ? currentCampaign.color : "#1C1C1C",
              }}
              whileHover={pledgeState === "initiated" ? { backgroundColor: "#E5E3DF" } : {}}
              whileTap={pledgeState === "initiated" ? { scale: 0.98 } : {}}
              onClick={handlePledge}
              disabled={pledgeState !== "initiated"}
              transition={{ duration: 0.2 }}
              className={`w-full py-4 sm:py-5 border-t-4 border-[#1C1C1C] rounded-none flex items-center justify-center gap-3 text-xl sm:text-2xl font-black uppercase tracking-widest transition-colors relative overflow-hidden`}
            >
              {/* Progress / Deadline Label */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-[#1C1C1C]/50 text-left leading-tight hidden sm:block">
                {Math.round(progressPercent)}%<br />FUNDED
              </div>

              <AnimatePresence mode="popLayout">
                <motion.div key={pledgeState} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-3 z-10">
                  {pledgeState === "initiated" ? <><Lock size={24} /> Lock $100 In</> : pledgeState === "escrowed" ? <><Activity size={24} className="animate-spin" /> Securing...</> : <><Zap size={24} /> Secured</>}
                </motion.div>
              </AnimatePresence>

              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-[#1C1C1C]/50 text-right leading-tight hidden sm:block">
                CLOSES IN<br /><span style={{ color: currentCampaign.color, textShadow: "1px 1px 0 #FFF" }} className="text-[#1C1C1C] drop-shadow-sm font-bold">{currentCampaign.deadline}</span>
              </div>
            </motion.button>
          </div>
        </div>

      </motion.div>

      {currentIndex === 0 && activeView === "none" && !isZenMode && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} className="absolute top-[35vh] left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><ArrowUp size={32} className="text-[#1C1C1C] drop-shadow-[2px_2px_0_#FFFFFF]" /></motion.div>
        </motion.div>
      )}

      {/* --- OVERLAY VIEWS (BOTTOM SHEETS) --- */}
      <AnimatePresence>
        {activeView !== "none" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#1C1C1C]/40 backdrop-blur-lg z-40 flex flex-col justify-end pb-[80px]" onClick={() => setActiveView("none")}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} onClick={(e) => e.stopPropagation()} className="w-full h-[70vh] bg-[#F5F5F3]/60 backdrop-blur-xl border-t-8 border-t-[#1C1C1C] p-6 flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
              <div className="flex justify-between items-center w-full pb-4 border-b-4 border-[#1C1C1C]/10 text-[#1C1C1C]">
                <h3 className="text-3xl font-black uppercase tracking-tighter shadow-sm"> {activeView === "specs" ? "Specs" : "Squads"} </h3>
                <button onClick={() => setActiveView("none")} className="w-12 h-12 bg-[#1C1C1C] text-white flex items-center justify-center border-4 border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] hover:bg-white hover:text-black hover:shadow-none transition-all"> <X size={28} strokeWidth={3} /> </button>
              </div>
              <div className="flex-1 overflow-y-auto pt-6 no-scrollbar text-[#1C1C1C]">
                {activeView === "specs" ? (
                  <ul className="flex flex-col gap-4">
                    {currentCampaign.specs.map((s: string, i: number) => (
                      <li key={i} className="flex items-center gap-4 bg-[#E5E3DF] p-4 border-2 border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] uppercase font-bold text-lg"><div className="w-4 h-4 border border-[#1C1C1C]" style={{ backgroundColor: currentCampaign.color }}></div>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="bg-[#E5E3DF] p-6 border-4 border-[#1C1C1C] uppercase shadow-[4px_4px_0_0_#1C1C1C]">
                      <div className="text-sm font-black text-[#1C1C1C]/50 mb-1 tracking-widest">Total Pooled</div>
                      <div className="text-4xl font-black tracking-tighter" style={{ color: currentCampaign.color, textShadow: "1px 1px 0 #1C1C1C" }}> ${currentCampaign.squads.reduce((acc: number, sq: Squad) => acc + parseInt(sq.amount.replace(/\D/g, '')) * 100, 0).toLocaleString()} </div>
                    </div>
                    <ul className="flex flex-col gap-3">
                      {currentCampaign.squads.map((sq: Squad, i: number) => (
                        <li key={i} className="flex justify-between bg-white p-4 border-l-8 border-[#1C1C1C] border-2 shadow-[4px_4px_0_0_#1C1C1C] uppercase font-black text-xl" style={{ borderLeftColor: currentCampaign.color }}> <span>{sq.name}</span> <span className="text-[#1C1C1C]/60">{sq.amount}</span> </li>
                      ))}
                    </ul>
                    <button className="w-full py-4 text-xl font-black uppercase border-4 border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] hover:bg-[#1C1C1C] hover:text-white mt-2 transition-all">Create New Squad</button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ==========================================
// BRANDS VIEW
// ==========================================
function BrandsView() {
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"pledge" | "vote" | "idea">("pledge");

  const filteredBrands = BRANDS.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  if (selectedBrand) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="absolute inset-0 h-[calc(100%-80px)] w-full overflow-y-auto pb-32 no-scrollbar bg-[#F5F4F0]"
      >
        <div className="max-w-5xl mx-auto p-6 md:p-10">
          {/* Back Button & Header */}
          <div className="mb-12">
            <button
              onClick={() => setSelectedBrand(null)}
              className="group flex items-center gap-2 text-[#1C1C1C] font-black uppercase tracking-widest text-xs mb-8"
            >
              <ArrowUp className="-rotate-90 group-hover:-translate-x-1 transition-transform" size={16} />
              Back to Ecosystem
            </button>
            <div className="flex items-center gap-6">
              <div
                className="w-20 h-20 border-4 border-[#1C1C1C] flex items-center justify-center font-black text-3xl shadow-[4px_4px_0_0_#1C1C1C]"
                style={{ backgroundColor: selectedBrand.hue }}
              >
                {selectedBrand.name[0]}
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#1C1C1C]">
                  {selectedBrand.name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="bg-[#1C1C1C] text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
                    Verified Partner
                  </div>
                  <div className="text-[10px] font-bold text-[#1C1C1C]/40 uppercase tracking-widest leading-none">
                    Since v.2019
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="grid grid-cols-3 gap-0 mb-12 border-4 border-[#1C1C1C] bg-[#1C1C1C] backdrop-blur-lg">
            {[
              { id: "pledge", label: "01. Pledging", icon: <Zap size={14} /> },
              { id: "vote", label: "02. Voting", icon: <Target size={14} /> },
              { id: "idea", label: "03. Ideation", icon: <Edit3 size={14} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex flex-col md:flex-row items-center justify-center gap-2 py-4 font-black uppercase text-[10px] md:text-sm transition-all ${activeSubTab === tab.id
                  ? "bg-[#1C1C1C] text-white"
                  : "bg-white/60 text-[#1C1C1C] hover:bg-[#F5F5F3]"
                  }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Sub-Tab Content */}
          <AnimatePresence mode="wait">
            {activeSubTab === "pledge" && (
              <motion.div
                key="pledge"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-xl font-black uppercase tracking-widest text-[#1C1C1C]">Production Ready</h3>
                  <p className="text-[10px] font-black uppercase text-[#1C1C1C]/40">Winning concepts in manufacturing</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/60 backdrop-blur-lg border-4 border-[#1C1C1C] p-6 shadow-[6px_6px_0_0_#1C1C1C] group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="font-black text-xs uppercase text-blue-600">Active Campaign</div>
                      <div className="bg-blue-600 text-white px-2 py-1 text-[9px] font-black uppercase">92% funded</div>
                    </div>
                    <h4 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">Hyper-Speed Chassis</h4>
                    <p className="text-[11px] font-bold text-[#1C1C1C]/60 uppercase mb-6 leading-relaxed">The final production run for the modular carbon fiber frame. Zero-waste manufacturing confirmed.</p>
                    <button className="w-full py-4 bg-[#1C1C1C] text-white font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-colors">
                      Pledge Allocation
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === "vote" && (
              <motion.div
                key="vote"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-xl font-black uppercase tracking-widest text-[#1C1C1C]">Finalist Selection</h3>
                  <p className="text-[10px] font-black uppercase text-[#1C1C1C]/40">Top 5 community-vetted concepts</p>
                </div>
                <div className="space-y-4">
                  {[
                    { name: "Eco-Lumina Mesh", votes: "4.2k", rank: "01" },
                    { name: "Titanium Hinge V2", votes: "3.8k", rank: "02" },
                    { name: "Bio-Plastic Shell", votes: "2.1k", rank: "03" }
                  ].map((v, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="text-2xl font-black text-[#1C1C1C]/20 w-8">{v.rank}</div>
                      <div className="flex-1 bg-white border-4 border-[#1C1C1C] p-4 flex justify-between items-center group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform cursor-pointer">
                        <span className="font-black uppercase text-sm">{v.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-black uppercase text-[#1C1C1C]/40">{v.votes} Votes</span>
                          <button className="px-4 py-1.5 bg-[#1C1C1C] text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-colors">Vote</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeSubTab === "idea" && (
              <motion.div
                key="idea"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-[#1C1C1C] text-white p-8 mb-8">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-[#00FF41]">Current Prompt</div>
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-tight italic">
                    "Modular Travel: How can we make luggage disappear?"
                  </h3>
                </div>

                <div className="bg-white border-4 border-[#1C1C1C] p-8 shadow-[10px_10px_0_0_#1C1C1C]">
                  <textarea
                    placeholder="ENTER YOUR MANIFESTO / CONCEPT IDEA..."
                    className="w-full bg-[#F5F5F3] border-4 border-[#1C1C1C] p-6 font-bold text-lg text-[#1C1C1C] focus:bg-white outline-none resize-none mb-6 h-40"
                  />
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[11px] font-black uppercase text-[#1C1C1C]/40 max-w-sm">
                      * Ideas are analyzed by AI after 21 days to select the top 5 finalists for the voting phase.
                    </p>
                    <button className="w-full md:w-auto px-12 py-5 bg-[#00FF41] border-4 border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] text-[#1C1C1C] font-black uppercase tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                      Submit Concept
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 h-[calc(100%-80px)] w-full overflow-y-auto pb-32 no-scrollbar bg-[#F5F4F0]"
    >
      <div className="max-w-5xl mx-auto p-6 md:p-10">
        <header className="mb-12 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-3 text-[#1C1C1C]/40 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs mb-2"
              >
                <Target size={14} /> Global Ecosystem
              </motion.div>
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-[#1C1C1C] leading-[0.85]">
                Verified<br /><span className="text-white drop-shadow-[2px_2px_0_#1C1C1C] [-webkit-text-stroke:2px_#1C1C1C]">Brands</span>
              </h1>
            </div>

            <div className="w-full md:w-80 relative group">
              <div className="absolute inset-0 bg-[#1C1C1C] translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform"></div>
              <div className="relative bg-white border-4 border-[#1C1C1C] p-4 flex items-center gap-3">
                <Search size={20} className="text-[#1C1C1C]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="FILTER PARTNERS..."
                  className="bg-transparent border-none outline-none font-black uppercase tracking-widest w-full text-[#1C1C1C] placeholder-[#1C1C1C]/20 text-sm"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBrands.map((brand: Brand, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 20 }}
              className="group relative cursor-pointer"
              onClick={() => setSelectedBrand(brand)}
            >
              <div className="absolute inset-0 bg-[#1C1C1C] translate-x-2 translate-y-2 rounded-none group-hover:translate-x-3 group-hover:translate-y-3 transition-transform"></div>
              <div className="relative bg-white border-4 border-[#1C1C1C] p-6 h-full flex flex-col justify-between overflow-hidden">
                {/* Background Decor */}
                <div
                  className="absolute -right-4 -top-4 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12"
                  style={{ color: brand.hue }}
                >
                  <Target size={96} />
                </div>

                <div>
                  <div className="flex justify-between items-start mb-8">
                    <div
                      className="w-12 h-12 border-4 border-[#1C1C1C] flex items-center justify-center font-black text-xl"
                      style={{ backgroundColor: brand.hue }}
                    >
                      {brand.name[0]}
                    </div>
                    <div className="bg-[#1C1C1C] text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
                      v.2024
                    </div>
                  </div>

                  <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1C1C1C] mb-1 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                    {brand.name}
                    <CheckCircle2 size={18} className="text-blue-500 fill-white" />
                  </h2>
                  <p className="text-[10px] font-bold text-[#1C1C1C]/40 uppercase tracking-widest mb-6 border-b-2 border-[#1C1C1C]/5 pb-2">
                    Official Verified Partner
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[9px] text-[#1C1C1C]/50 uppercase font-black tracking-widest mb-0.5">Liquidity Pooled</div>
                      <div className="text-2xl font-black text-[#1C1C1C]">{brand.totalRaised}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-[#1C1C1C]/50 uppercase font-black tracking-widest mb-0.5">Deployment</div>
                      <div className="text-sm font-black text-[#1C1C1C]/60">{brand.campaigns} Units</div>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-[#F0F0F0] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "70%" }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                      className="h-full"
                      style={{ backgroundColor: brand.hue }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredBrands.length === 0 && (
          <div className="py-20 text-center">
            <h3 className="text-2xl font-black text-[#1C1C1C]/20 uppercase tracking-widest italic">No Partners Found In Current Vector</h3>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ==========================================
// PROFILE VIEW
// ==========================================
function ProfileView() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 h-[calc(100%-80px)] w-full overflow-y-auto no-scrollbar bg-[#F5F4F0]"
    >
      <div className="max-w-4xl mx-auto p-6 md:p-10 pb-32">
        {!isEditing ? (
          <div className="space-y-12">
            {/* Header */}
            <header className="flex justify-between items-end">
              <div>
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-[#1C1C1C]/40 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs mb-2">Authenticated Session</motion.div>
                <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter text-[#1C1C1C] leading-[0.85]">
                  My<br /><span className="text-white drop-shadow-[2px_2px_0_#1C1C1C] [-webkit-text-stroke:2px_#1C1C1C]">Portal</span>
                </h1>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="group relative"
              >
                <div className="absolute inset-0 bg-[#1C1C1C] translate-x-1 translate-y-1 group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform"></div>
                <div className="relative bg-white border-3 border-[#1C1C1C] p-3 text-[#1C1C1C]">
                  <Edit3 size={24} strokeWidth={3} />
                </div>
              </button>
            </header>

            {/* User Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 relative group">
                <div className="absolute inset-0 bg-[#00FF41] translate-x-3 translate-y-3"></div>
                <div className="relative bg-[#1C1C1C] border-4 border-[#1C1C1C] p-8 text-white flex flex-col md:flex-row items-center gap-8">
                  <div className="w-32 h-32 bg-white border-4 border-white flex items-center justify-center text-4xl font-black text-[#1C1C1C] relative shrink-0">
                    VJ
                    <div className="absolute -bottom-4 -right-4 bg-[#00FF41] w-10 h-10 flex items-center justify-center border-4 border-[#1C1C1C] rounded-none">
                      <CheckCircle2 size={24} className="text-[#1C1C1C]" />
                    </div>
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-1">Vikram S.</h2>
                    <p className="font-bold uppercase tracking-widest text-xs opacity-60 mb-6">Tier 03 • Pro Generator</p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {["#BETA_TESTER", "#EARLY_ADOPTER", "#MAX_PLEDGER"].map(tag => (
                        <span key={tag} className="px-2 py-0.5 border border-white/20 text-[9px] font-black tracking-widest">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-1 gap-6">
                <div className="bg-white/60 backdrop-blur-lg border-4 border-[#1C1C1C] p-6 shadow-[6px_6px_0_0_#1C1C1C]">
                  <div className="text-[10px] text-[#1C1C1C]/40 uppercase font-black tracking-widest mb-1">Assets Escrowed</div>
                  <div className="text-3xl font-black text-[#1C1C1C]">$4.5K</div>
                </div>
                <div className="bg-white/60 backdrop-blur-lg border-4 border-[#1C1C1C] p-6 shadow-[6px_6px_0_0_#1C1C1C]">
                  <div className="text-[10px] text-[#1C1C1C]/40 uppercase font-black tracking-widest mb-1">Active Squads</div>
                  <div className="text-3xl font-black text-[#1C1C1C]">06</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                <Lock size={20} className="text-[#1C1C1C]" /> Active Allocation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { brand: "Nike Verified", title: "Retro 95 Neon", amount: "$100", status: "Locked", color: "#00FF41" },
                  { brand: "Sony Verified", title: "Walkman Cyber", amount: "$350", status: "Escrow", color: "#00E5FF" }
                ].map((pledge, idx) => (
                  <div key={idx} className="group relative">
                    <div className="absolute inset-0 bg-[#1C1C1C] translate-x-1.5 translate-y-1.5 transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
                    <div className="relative bg-white border-3 border-[#1C1C1C] p-5 flex justify-between items-center">
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: pledge.color }}>{pledge.brand}</div>
                        <div className="font-black text-xl uppercase text-[#1C1C1C]">{pledge.title}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-[#1C1C1C]">{pledge.amount}</div>
                        <div className="text-[9px] text-[#1C1C1C]/40 uppercase font-black flex items-center gap-1 justify-end">
                          {pledge.status === "Locked" ? <Lock size={10} /> : <Activity size={10} />} {pledge.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-12">
            <header className="flex justify-between items-end">
              <h1 className="text-6xl font-black uppercase tracking-tighter text-[#1C1C1C]">Update<br />Identity</h1>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-[#1C1C1C] text-white px-8 py-3 font-black uppercase tracking-widest hover:bg-blue-600 transition-colors"
              >
                Sync Data
              </button>
            </header>

            <div className="space-y-8 max-w-2xl">
              <div className="relative group p-10 bg-white border-4 border-[#1C1C1C] shadow-[8px_8px_0_0_#1C1C1C] flex flex-col items-center gap-6">
                <div className="w-32 h-32 bg-[#1C1C1C] border-4 border-[#1C1C1C] flex items-center justify-center text-4xl font-black relative group cursor-pointer text-white">
                  VJ
                  <div className="absolute inset-0 bg-blue-600/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Camera className="text-white" /></div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#1C1C1C]/40">Click Avatar To Upload New Mesh</p>
              </div>

              <div className="space-y-6">
                {[
                  { label: "Public Alias", val: "Vikram S." },
                  { label: "Neural Email", val: "vikram@example.com" },
                  { label: "Manifesto", val: "Collecting tech and vibes." }
                ].map((field, i) => (
                  <div key={i}>
                    <label className="block text-[10px] text-[#1C1C1C] font-black uppercase tracking-widest mb-3">{field.label}</label>
                    <input
                      type="text"
                      defaultValue={field.val}
                      className="w-full bg-white border-4 border-[#1C1C1C] p-4 font-black uppercase text-lg text-[#1C1C1C] focus:bg-blue-50 outline-none transition-colors"
                    />
                  </div>
                ))}
              </div>

              <button className="w-full py-5 bg-[#FF3D00] border-4 border-[#1C1C1C] text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#1C1C1C] transition-all shadow-[6px_6px_0_0_#1C1C1C] hover:shadow-none translate-y-0 hover:translate-x-1 hover:translate-y-1">
                <LogOut size={20} /> Terminal Termination
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ==========================================
// TRENDS VIEW
// ==========================================
function TrendsView() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [activeTrendTab, setActiveTrendTab] = useState<"PLEDGING" | "VOTING" | "SUBMITTING">("PLEDGING");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const categories = ["ALL", "TECH", "APPAREL", "HOME", "RESTAURANTS", "LOCAL"];

  const filteredCampaigns = activeCategory === "ALL"
    ? CAMPAIGNS
    : CAMPAIGNS.filter(c => c.category === activeCategory);

  if (selectedCampaign) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="absolute inset-0 h-[calc(100%-80px)] w-full overflow-y-auto pb-32 no-scrollbar bg-[#F5F4F0]"
      >
        <div className="max-w-4xl mx-auto p-6 md:p-10">
          <button
            onClick={() => setSelectedCampaign(null)}
            className="flex items-center gap-2 text-[#1C1C1C] font-black uppercase tracking-widest text-xs mb-10 group"
          >
            <X size={16} className="group-hover:rotate-90 transition-transform" /> Back to Ledger
          </button>

          <div className="relative group p-1 bg-[#1C1C1C] mb-12">
            <div className="bg-white/60 backdrop-blur-lg border-4 border-[#1C1C1C] p-8 md:p-12 relative">
              <div className="flex justify-between items-start mb-6">
                <span className="bg-[#1C1C1C] text-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">Verified Campaign</span>
                <span className="font-black text-xs uppercase" style={{ color: selectedCampaign.color }}>{selectedCampaign.deadline} REMAINING</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#1C1C1C] leading-none mb-4">{selectedCampaign.title}</h1>
              <p className="text-lg md:text-xl font-bold uppercase text-[#1C1C1C]/60 mb-8 border-l-4 border-[#1C1C1C] pl-6 italic">By {selectedCampaign.brand}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t-4 border-[#1C1C1C]">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-widest mb-4">The Concept</h3>
                  <p className="text-sm font-bold uppercase leading-relaxed text-[#1C1C1C]">{selectedCampaign.description}</p>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between font-black uppercase text-xs">
                    <span>Pledged: ${selectedCampaign.pledged.toLocaleString()}</span>
                    <span>Goal: ${selectedCampaign.goal.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-8 bg-[#1C1C1C] relative p-1 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(selectedCampaign.pledged / selectedCampaign.goal) * 100}%` }}
                      className="h-full relative overflow-hidden"
                      style={{ backgroundColor: selectedCampaign.color }}
                    >
                      <motion.div animate={{ x: [0, -40] }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,#000_20px,#000_40px)] w-[200%]" />
                    </motion.div>
                  </div>
                  <button className="w-full py-5 bg-[#00FF41] border-4 border-[#1C1C1C] shadow-[8px_8px_0_0_#1C1C1C] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-[#1C1C1C] font-black uppercase tracking-widest text-lg">
                    Lock $100 Allocation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 h-[calc(100%-80px)] w-full overflow-y-auto pb-32 no-scrollbar bg-[#F5F4F0]"
    >
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        <header className="mb-12">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-[#1C1C1C]/40 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs mb-2">Market Intelligence</motion.div>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-[#1C1C1C] leading-[0.85]">
            Global<br /><span className="text-white drop-shadow-[2px_2px_0_#1C1C1C] [-webkit-text-stroke:2px_#1C1C1C]">Trends</span>
          </h1>
        </header>

        <div className="space-y-16">
          {/* Top Level Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 group relative">
              <div className="absolute inset-0 bg-[#00FF41] translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform"></div>
              <div className="relative bg-[#1C1C1C] border-4 border-[#1C1C1C] p-8 text-white">
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                  <CloudLightning className="text-[#00FF41]" size={32} /> Hyper-Growth Clouds
                </h2>
                <div className="flex flex-wrap gap-3">
                  {["#Y2K_REVIVAL", "#NEOBRUTALISM", "#ANALOG_TECH", "#CYBER_GOTH", "#VANTABLACK", "#CARBON_FIBER", "#TRANSPARENT", "#RAW_ALUMINUM"].map((tag, i) => (
                    <motion.span
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 bg-white text-[#1C1C1C] font-black uppercase text-xs border-2 border-white hover:bg-[#00FF41] transition-colors cursor-pointer"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-lg border-4 border-[#1C1C1C] p-8 shadow-[8px_8px_0_0_#1C1C1C] flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 bg-[#1C1C1C] flex items-center justify-center mb-6">
                <Target size={32} className="text-[#00FF41]" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Alpha Signal</h3>
              <p className="text-[10px] font-bold text-[#1C1C1C]/60 uppercase leading-relaxed text-balance">
                45% increase in verified demand for titanium-based utility.
              </p>
            </div>
          </div>

          {/* Master List Section */}
          <div className="space-y-8">
            <div className="flex flex-col gap-6 border-b-8 border-[#1C1C1C] pb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <h2 className="text-4xl font-black uppercase tracking-tighter text-[#1C1C1C]">Demand Ledger</h2>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-[#1C1C1C] transition-all ${activeCategory === cat
                        ? "bg-[#1C1C1C] text-white shadow-none translate-x-1 translate-y-1"
                        : "bg-white/60 backdrop-blur-lg text-[#1C1C1C] shadow-[3px_3px_0_0_#1C1C1C] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Sub-Tabs tied to Demand Ledger */}
              <div className="grid grid-cols-3 gap-2 md:gap-4 w-full mt-4">
                {[
                  { id: "PLEDGING", icon: <Zap size={14} className="md:w-[18px]" />, count: "128 Act" },
                  { id: "VOTING", icon: <Target size={14} className="md:w-[18px]" />, count: "45 Stg" },
                  { id: "SUBMITTING", icon: <Edit3 size={14} className="md:w-[18px]" />, count: "812 Id" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTrendTab(tab.id as any)}
                    className={`p-2 md:p-4 border-2 md:border-4 border-[#1C1C1C] transition-all flex flex-col items-center gap-1 md:gap-2 text-center ${activeTrendTab === tab.id
                      ? "bg-[#1C1C1C] text-white shadow-none translate-x-0.5 translate-y-0.5"
                      : "bg-white/60 backdrop-blur-lg text-[#1C1C1C] shadow-[2px_2px_0_0_#1C1C1C] md:shadow-[6px_6px_0_0_#1C1C1C] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                      }`}
                  >
                    <div className={activeTrendTab === tab.id ? "text-white" : "text-blue-600"}>{tab.icon}</div>
                    <div className="font-black uppercase tracking-tighter text-[10px] md:text-xs">{tab.id}</div>
                    <div className="hidden md:block text-[9px] font-bold opacity-40 uppercase tracking-widest">{tab.count}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-8">
              <AnimatePresence mode="popLayout">
                {filteredCampaigns.map((campaign) => (
                  <motion.div
                    key={campaign.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative cursor-pointer"
                    onClick={() => setSelectedCampaign(campaign)}
                  >
                    <div className="absolute inset-0 bg-[#1C1C1C] translate-x-0.5 translate-y-0.5 md:translate-x-1 md:translate-y-1 group-hover:translate-x-1 md:group-hover:translate-x-2 group-hover:translate-y-1 md:group-hover:translate-y-2 transition-transform"></div>
                    <div className="relative bg-[#E5E3DF]/60 backdrop-blur-md border-2 border-[#1C1C1C] overflow-hidden flex flex-col h-full hover:border-[#00FF41] transition-colors">
                      {/* Thumbnail Image */}
                      <div className="w-full h-20 md:h-48 bg-[#1C1C1C] relative overflow-hidden group">
                        {campaign.image ? (
                          <img
                            src={campaign.image}
                            alt={campaign.title}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20 font-black text-[8px] md:text-base">NO_IMAGE</div>
                        )}
                        <div className="absolute top-1 left-1 md:top-3 md:left-3 bg-[#1C1C1C] text-white px-1 md:px-2 py-0.5 text-[6px] md:text-[9px] font-black uppercase tracking-widest backdrop-blur-md">
                          {campaign.category}
                        </div>
                        <div className="hidden md:block absolute bottom-3 right-3 w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: campaign.color }} />
                      </div>

                      <div className="p-2 md:p-5 flex flex-col flex-1">
                        <h4 className="text-[10px] md:text-xl font-black uppercase tracking-tighter text-[#1C1C1C] mb-0.5 md:mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors uppercase">{campaign.title}</h4>
                        <p className="text-[7px] md:text-[10px] font-bold text-[#1C1C1C]/60 uppercase mb-2 md:mb-6 tracking-wider">{campaign.brand}</p>

                        <div className="mt-auto space-y-1 md:space-y-3">
                          <div className="flex justify-between text-[6px] md:text-[10px] font-black uppercase tracking-widest overflow-hidden">
                            <span className="flex items-center gap-0.5 md:gap-1 truncate"><Users size={8} className="md:w-[12px]" /> {campaign.squadsCount}</span>
                            <span className="text-blue-600 truncate">{Math.round((campaign.pledged / campaign.goal) * 100)}%</span>
                          </div>
                          <div className="w-full h-1 md:h-1.5 bg-[#1C1C1C]/10 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(campaign.pledged / campaign.goal) * 100}%` }}
                              className="h-full relative overflow-hidden"
                              style={{ backgroundColor: campaign.color }}
                            >
                              <motion.div
                                animate={{ x: [0, -20] }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,white_10px,white_20px)] w-[200%]"
                              />
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
