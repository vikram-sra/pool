"use client";

import React, { useState, useRef, Suspense, useEffect } from "react";
import { ShieldCheck, CheckCircle2, Lock, Activity, Users, Zap, Share2, Info, ArrowUp, X, User, Edit3, Save, Camera, LogOut, Search, Compass, Target, CloudLightning } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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
    specs: ["Air Max Cushioning", "Mesh Upper", "Neon ACCents", "Retro 1995 Box"],
    squads: [{ name: "Sneakerheads", amount: "+$4.2k" }, { name: "The 90s Club", amount: "+$2.8k" }]
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
    specs: ["Dual DAC", "Cassette Window Screen", "Bluetooth 5.3", "FLAC Support", "40hr Battery"],
    squads: [{ name: "Audiophiles", amount: "+$45k" }, { name: "Retro Tech", amount: "+$22k" }]
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
    specs: ["Full Frame Sensor", "No LCD", "Optical Viewfinder", "Weather Sealed"],
    squads: [{ name: "Street Shooters", amount: "+$120k" }, { name: "Analogue Purists", amount: "+$65k" }]
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
    specs: ["Gore-Tex PRO", "Sand-Proof Zippers", "Heat Vents", "Packable Design"],
    squads: [{ name: "Techwear Ninjas", amount: "+$8.2k" }, { name: "Dune Fans", amount: "+$4.5k" }]
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
    specs: ["Quartz Movement", "Leather Strap", "33mm Face", "Original 1989 Tooling"],
    squads: [{ name: "Minimalists", amount: "+$15k" }, { name: "Architects", amount: "+$12k" }]
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
    specs: ["Sapphire Crystal", "Active Noise Cancelling", "Hi-Res Audio", "Bone Conduction"],
    squads: [{ name: "Tech Enthusiasts", amount: "+$19k" }, { name: "Audiophiles", amount: "+$9k" }]
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
function ShapeModel({ type, color, index, currentIndex }: { type: string; color: string; index: number; currentIndex: number }) {
  const groupRef = useRef<any>(null);
  const time = useRef(Math.random() * 100); // offset randomness

  useFrame((state, delta) => {
    time.current += delta;
    if (groupRef.current) {
      // Add a very subtle idle breathing/floating animation instead of aggressive rotation
      // Let OrbitControls handle the main rotation interactivity.
      if (index === currentIndex) {
        groupRef.current.position.x = Math.sin(time.current * 0.5) * 0.05;
      } else {
        groupRef.current.rotation.y = time.current * 0.2; // inactive ones still slowly spin
      }

      // Animate Scroll Position
      const targetY = (index - currentIndex) * 6;
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY + Math.sin(time.current * 2) * 0.1, 0.08);

      // Scale down so tiny it disappears when inactive
      const targetScale = index === currentIndex ? 0.5 : 0.001;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);

      // We can keep it visible but shrink it away to preserve a smooth entrance/exit animated transition
      groupRef.current.visible = groupRef.current.scale.x > 0.01;
    }
  });

  // Dynamically assign some visual texture based on type
  // Make certain items purely chrome, others brushed metal or matte
  const isChrome = type === "shell" || type === "camera" || type === "watch";
  const isBrushedMetal = type === "walkman" || type === "synth";

  const mat = <meshPhysicalMaterial
    color={isChrome ? "#FFFFFF" : color} // Overwrite color to white for pure chrome
    roughness={isChrome ? 0.05 : isBrushedMetal ? 0.4 : 0.8}
    metalness={isChrome ? 1 : isBrushedMetal ? 0.8 : 0.2}
    clearcoat={isChrome ? 1 : 0.2}
    transmission={type === "camera" || type === "earbuds" ? 0.4 : 0}
    thickness={type === "camera" || type === "earbuds" ? 0.8 : 0}
  />;

  const renderModel = () => {
    switch (type) {
      case "shoe":
        return (
          <group position={[0, -0.5, 0]}>
            <mesh castShadow position={[0, 0, 0]}><capsuleGeometry args={[0.5, 1, 16, 32]} />{mat}</mesh>
            <mesh castShadow position={[0.5, -0.2, 0]} rotation={[0, 0, Math.PI / 4]}><cylinderGeometry args={[0.3, 0.3, 1.2]} />{mat}</mesh>
          </group>
        );
      case "walkman":
        return <mesh castShadow><boxGeometry args={[1.2, 1.8, 0.4]} />{mat}</mesh>;
      case "camera":
        return (
          <group>
            <mesh castShadow><boxGeometry args={[1.6, 1, 0.6]} />{mat}</mesh>
            <mesh castShadow position={[0, 0, 0.4]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.4, 0.4, 0.5, 32]} />{mat}</mesh>
          </group>
        );
      case "shell":
        return <mesh castShadow><sphereGeometry args={[1.2, 16, 16]} />{mat}</mesh>;
      case "synth":
        return (
          <group>
            <mesh castShadow><boxGeometry args={[2.5, 0.8, 0.2]} />{mat}</mesh>
            <mesh castShadow position={[-0.8, 0, 0.15]}><boxGeometry args={[0.4, 0.4, 0.2]} />{mat}</mesh>
            <mesh castShadow position={[0, 0, 0.15]}><boxGeometry args={[0.4, 0.4, 0.2]} />{mat}</mesh>
            <mesh castShadow position={[0.8, 0, 0.15]}><boxGeometry args={[0.4, 0.4, 0.2]} />{mat}</mesh>
          </group>
        );
      case "watch":
        return (
          <group>
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.8, 0.8, 0.2, 32]} />{mat}</mesh>
            <mesh castShadow position={[0, 0.8, 0]}><boxGeometry args={[0.4, 1, 0.1]} />{mat}</mesh>
            <mesh castShadow position={[0, -0.8, 0]}><boxGeometry args={[0.4, 1, 0.1]} />{mat}</mesh>
          </group>
        );
      case "board":
        return <mesh castShadow rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.4, 2.5, 16, 16]} />{mat}</mesh>;
      case "console":
        return (
          <group>
            <mesh castShadow><boxGeometry args={[1.8, 0.5, 1.4]} />{mat}</mesh>
            <mesh castShadow position={[0, 0.3, -0.3]}><boxGeometry args={[1.2, 0.2, 0.6]} />{mat}</mesh>
          </group>
        );
      case "chair":
        return (
          <group position={[0, -0.5, 0]}>
            <mesh castShadow position={[0, 0.5, 0]}><boxGeometry args={[1, 0.2, 1]} />{mat}</mesh>
            <mesh castShadow position={[0, 1.2, -0.4]}><boxGeometry args={[0.8, 1.2, 0.1]} />{mat}</mesh>
            <mesh castShadow position={[0, -0.2, 0]}><cylinderGeometry args={[0.2, 0.2, 1]} />{mat}</mesh>
          </group>
        );
      case "earbuds":
        return (
          <group>
            <mesh castShadow><sphereGeometry args={[0.5, 32, 32]} />{mat}</mesh>
            <mesh castShadow position={[0, -0.6, 0]}><cylinderGeometry args={[0.1, 0.1, 0.8]} />{mat}</mesh>
          </group>
        );
      default:
        return <mesh castShadow><boxGeometry args={[1, 1, 1]} />{mat}</mesh>;
    }
  };

  return <group ref={groupRef}>{renderModel()}</group>;
}

function ThreeScene({ currentCampaign, currentIndex }: { currentCampaign: Campaign, currentIndex: number }) {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 10, 5]} intensity={2.5} color={currentCampaign.color} />
      <directionalLight position={[-5, 5, -5]} intensity={1.5} color="#ffffff" />

      {CAMPAIGNS.map((campaign: Campaign, i: number) => (
        <ShapeModel key={campaign.id} type={campaign.modelType} color={campaign.color} index={i} currentIndex={currentIndex} />
      ))}

      {/* Removed maxPolarAngle to allow full 360 spherical rotation */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.15} // Increased damping for a "snappier" but still smooth feel
        makeDefault // Ensure it grabs pointer events correctly
      />
    </>
  );
}

// --- MAIN APP COMPONENT ---
export default function Home() {
  const [currentTab, setCurrentTab] = useState<"FEED" | "TRENDS" | "BRANDS" | "PROFILE">("FEED");
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentCampaign = CAMPAIGNS[currentIndex % CAMPAIGNS.length];

  return (
    <main className="h-[100dvh] w-[100dvw] bg-[#E5E3DF] text-[#1C1C1C] relative flex justify-center items-center overflow-hidden font-sans selection:bg-[#1C1C1C] selection:text-white">

      {/* GLOBAL 3D CANVAS - STAYS MOUNTED FOREVER TO PREVENT WEBGL CONTEXT LOSS */}
      <div className={`absolute inset-0 bg-gradient-to-br from-[#F5F4F0] to-[#E5E3DF] transition-opacity duration-700 pointer-events-auto ${currentTab === "FEED" ? "opacity-100 z-10" : "opacity-0 -z-50 delay-500"}`}>
        <div className="absolute inset-0 top-[-10vh]">
          <Suspense fallback={null}>
            <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }} gl={{ preserveDrawingBuffer: true }} style={{ touchAction: 'none' }}>
              <ThreeScene currentCampaign={currentCampaign} currentIndex={currentIndex} />
            </Canvas>
          </Suspense>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentTab === "FEED" && <FeedView key="feed" currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} currentCampaign={currentCampaign} />}
        {currentTab === "TRENDS" && <TrendsView key="trends" />}
        {currentTab === "BRANDS" && <BrandsView key="brands" />}
        {currentTab === "PROFILE" && <ProfileView key="profile" />}
      </AnimatePresence>

      {/* FLOATING BOTTOM NAVIGATION BAR */}
      <nav className="absolute bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[600px] h-[70px] bg-[#F5F5F3] border-4 border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] z-50 flex items-center justify-between p-1 overflow-hidden">
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
function FeedView({ currentIndex, setCurrentIndex, currentCampaign }: { currentIndex: number, setCurrentIndex: React.Dispatch<React.SetStateAction<number>>, currentCampaign: Campaign }) {
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
    // Determine if this is a pinch-to-zoom trackpad event
    if (e.ctrlKey) {
      return; // Do not scroll feed, let OrbitControls handle zoom
    }

    if (activeView !== "none") return;

    // Check strict timestamp cooldown to prevent chain-skipping from trackpad inertia
    const now = Date.now();
    if (now - lastScrollTime.current < 1200) return;

    if (e.deltaY > 50) {
      handleNext();
      lastScrollTime.current = now;
    } else if (e.deltaY < -50) {
      handlePrev();
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

  const handleDragEnd = (event: any, info: any) => {
    if (activeView !== "none") return;
    if (info.offset.y < -150 && info.velocity.y < -500) {
      handleNext();
    } else if (info.offset.y > 150 && info.velocity.y > 500) {
      handlePrev();
    }
  };

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
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="text-[12vw] font-black uppercase whitespace-nowrap leading-[0.8] tracking-tighter"
            >
              {currentCampaign.title}
            </motion.h1>
          </AnimatePresence>
        </div>
      </div>

      {/* Swipe Surface Container (Replaced drag with pointer-events-none to allow OrbitControls) */}
      <motion.div
        className="absolute inset-0 z-10 flex flex-col justify-end pointer-events-none"
      >
        {/* 
          Disabled invisible drag catchers to allow OrbitControls full screen access. 
          Swipe interactions are now handled by trackpad wheel, and users can swipe 
          the models directly to rotate them. 
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
              <div className="flex items-center gap-1.5">
                <div className="font-black text-sm md:text-base text-[#1C1C1C] drop-shadow-[1px_1px_0_#FFFFFF] uppercase bg-[#E5E3DF]/80 px-2 py-1 backdrop-blur-md border-[2px] border-[#1C1C1C] shadow-[2px_2px_0_0_#1C1C1C] flex items-center gap-1.5">
                  {currentCampaign.brand}
                  <CheckCircle2 size={14} className="text-blue-500 fill-[#1C1C1C] shrink-0" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter leading-[1] text-[#1C1C1C] drop-shadow-[1px_1px_0_#FFFFFF] w-[90%] md:w-[70%] mt-2 uppercase">
                {currentCampaign.title}
              </h2>
              <p className="text-xs md:text-sm font-bold text-[#1C1C1C] line-clamp-2 w-[85%] md:w-[60%] leading-snug mt-1 bg-[#E5E3DF]/80 backdrop-blur-md p-2 border-l-[3px] border-2 border-[#1C1C1C] shadow-[2px_2px_0_0_#1C1C1C] pointer-events-auto" style={{ borderLeftColor: currentCampaign.color }}>
                {currentCampaign.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Sidebar Nav - STATIC */}
        <div className={`absolute right-2 md:right-4 bottom-[140px] md:bottom-36 flex flex-col gap-6 z-20 pointer-events-auto items-center transition-opacity duration-300 ${activeView !== "none" ? "opacity-0 pointer-events-none delay-0" : "opacity-100 delay-300"}`}>
          <motion.button onClick={() => setActiveView("squads")} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1.5 group">
            <div className="w-12 h-12 bg-[#F5F5F3]/90 backdrop-blur-md border-[3px] border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] flex items-center justify-center group-hover:bg-[#1C1C1C] transition-all">
              <Users size={24} className="text-[#1C1C1C] group-hover:text-[#F5F5F3]" />
            </div>
            <span className="text-[10px] font-black text-[#1C1C1C] uppercase drop-shadow-[1px_1px_0_#FFFFFF] bg-[#E5E3DF]/80 px-2 rounded">{currentCampaign.squadsCount}</span>
          </motion.button>

          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1.5 group">
            <div className="w-12 h-12 bg-[#F5F5F3]/90 backdrop-blur-md border-[3px] border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] flex items-center justify-center group-hover:bg-[#1C1C1C] transition-all">
              <ShieldCheck size={24} className="text-[#1C1C1C] group-hover:text-[#F5F5F3]" />
            </div>
            <span className="text-[10px] font-black text-[#1C1C1C] uppercase drop-shadow-[1px_1px_0_#FFFFFF] bg-[#E5E3DF]/80 px-2 rounded">Secure</span>
          </motion.button>

          <motion.button onClick={() => setActiveView("specs")} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1.5 group">
            <div className="w-12 h-12 bg-[#F5F5F3]/90 backdrop-blur-md border-[3px] border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] flex items-center justify-center group-hover:bg-[#1C1C1C] transition-all">
              <Info size={24} className="text-[#1C1C1C] group-hover:text-[#F5F5F3]" />
            </div>
            <span className="text-[10px] font-black text-[#1C1C1C] uppercase drop-shadow-[1px_1px_0_#FFFFFF] bg-[#E5E3DF]/80 px-2 rounded">Specs</span>
          </motion.button>
        </div>

        {/* Bottom Action Area - STATIC BUT VALUE UPDATES ANIMATE */}
        <div className={`absolute bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[600px] z-20 pointer-events-none flex flex-col gap-4 transition-transform duration-300 ${activeView !== "none" ? "translate-y-[150%]" : "translate-y-0"}`}>

          <div className="w-full flex flex-col gap-0 pointer-events-auto border-4 border-[#1C1C1C] bg-[#F5F5F3] shadow-[8px_8px_0_0_#1C1C1C]">
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

      {currentIndex === 0 && activeView === "none" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} className="absolute top-[35vh] left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><ArrowUp size={32} className="text-[#1C1C1C] drop-shadow-[2px_2px_0_#FFFFFF]" /></motion.div>
        </motion.div>
      )}

      {/* --- OVERLAY VIEWS (BOTTOM SHEETS) --- */}
      <AnimatePresence>
        {activeView !== "none" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#1C1C1C]/40 backdrop-blur-md z-40 flex flex-col justify-end pb-[80px]" onClick={() => setActiveView("none")}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} onClick={(e) => e.stopPropagation()} className="w-full h-[70vh] bg-[#F5F5F3] border-t-8 border-t-[#1C1C1C] p-6 flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
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
                        <li key={i} className="flex justify-between bg-white p-4 border-l-8 border-[#1C1C1C] border-2 shadow-[4px_4px_0_0_#1C1C1C] uppercase font-black text-xl" style={{ borderLeftColor: currentCampaign.color }}> <span>{sq.name}</span> <span className="text-[#1C1C1C]/80">{sq.amount}</span> </li>
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
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-0 h-[calc(100%-80px)] w-full overflow-y-auto pb-20 no-scrollbar p-6 bg-[#E5E3DF]">
      <header className="mb-8 mt-4 sticky top-0 bg-[#E5E3DF] z-10 pb-4 border-b-4 border-[#1C1C1C]">
        <h1 className="text-5xl font-black uppercase tracking-tighter flex items-center gap-3 text-[#1C1C1C] drop-shadow-[2px_2px_0_#FFF]">
          <Compass className="text-electric-green" size={40} /> Brands
        </h1>
        <p className="text-[#1C1C1C]/60 font-bold uppercase tracking-widest mt-2">Verified Demand Partners</p>

        <div className="mt-4 flex items-center bg-[#F5F5F3] border-4 border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] p-3">
          <Search size={20} className="text-[#1C1C1C]/50 mr-2" />
          <input type="text" placeholder="SEARCH BRANDS..." className="bg-transparent border-none outline-none font-black uppercase tracking-widest w-full text-[#1C1C1C] placeholder-[#1C1C1C]/30" />
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {BRANDS.map((brand: Brand, i: number) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-[#E5E3DF] p-5 border-[3px] border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] hover:bg-[#F5F5F3] transition-colors group cursor-pointer relative overflow-hidden">

            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 group-hover:scale-125 transition-all">
              <Target size={64} style={{ color: brand.hue }} />
            </div>

            <div className="flex justify-between items-start mb-6 align-top">
              <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2 text-[#1C1C1C]">
                {brand.name}
                <CheckCircle2 size={16} className="text-blue-500 fill-[#1C1C1C] shrink-0" />
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t-4 border-[#1C1C1C] pt-4">
              <div>
                <div className="text-[10px] text-[#1C1C1C]/60 uppercase font-black tracking-widest mb-1">Pledged</div>
                <div className="text-xl font-black drop-shadow-[1px_1px_0_#FFF]" style={{ color: brand.hue }}>{brand.totalRaised}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#1C1C1C]/60 uppercase font-black tracking-widest mb-1">Campaigns</div>
                <div className="text-xl font-black text-[#1C1C1C]">{brand.campaigns} Active</div>
              </div>
            </div>
          </motion.div>
        ))}
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
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-0 h-[calc(100%-80px)] w-full overflow-y-auto no-scrollbar bg-[#E5E3DF]">

      {!isEditing ? (
        <div className="p-6 pb-20">
          {/* Header */}
          <header className="flex justify-between items-start mt-4 mb-8">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1C1C1C] drop-shadow-[2px_2px_0_#FFFFFF]">Profile</h1>
            <button onClick={() => setIsEditing(true)} className="p-3 bg-[#F5F5F3] hover:bg-[#1C1C1C] text-[#1C1C1C] hover:text-white border-4 border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] transition-all">
              <Edit3 size={20} strokeWidth={3} />
            </button>
          </header>

          {/* User Card */}
          <div className="bg-[#E5E3DF] border-4 border-[#1C1C1C] p-6 shadow-[8px_8px_0_0_#1C1C1C] mb-10 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF41] opacity-20 blur-3xl rounded-full mix-blend-multiply"></div>
            <div className="w-32 h-32 bg-[#1C1C1C] border-4 border-[#1C1C1C] flex items-center justify-center text-4xl font-black shrink-0 relative text-white">
              VJ
              <div className="absolute -bottom-3 -right-3 bg-blue-500 w-8 h-8 flex items-center justify-center border-4 border-[#1C1C1C] rounded-full">
                <CheckCircle2 className="text-white w-5 h-5" />
              </div>
            </div>
            <div className="text-center md:text-left w-full z-10">
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-1 text-[#1C1C1C]">Vikram S.</h2>
              <p className="font-bold uppercase tracking-widest text-sm mb-4 text-[#1C1C1C]/70">Elite Pledger • Level 12</p>

              <div className="flex gap-4 justify-center md:justify-start">
                <div className="bg-[#F5F5F3] p-3 border-4 border-[#1C1C1C] flex-1 md:flex-none">
                  <div className="text-xs text-[#1C1C1C]/50 uppercase font-black">Escrowed</div>
                  <div className="text-xl font-black text-[#1C1C1C]">$4,500</div>
                </div>
                <div className="bg-[#F5F5F3] p-3 border-4 border-[#1C1C1C] flex-1 md:flex-none">
                  <div className="text-xs text-[#1C1C1C]/50 uppercase font-black">Squads</div>
                  <div className="text-xl font-black text-[#1C1C1C]">6</div>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-black uppercase tracking-tighter mb-4 border-b-4 border-[#1C1C1C] pb-2 text-[#1C1C1C]">Active Pledges</h3>
          <div className="space-y-4">
            {/* Simple list of active pledges */}
            <div className="bg-[#F5F5F3] p-4 border-[3px] border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] flex justify-between items-center group cursor-pointer hover:bg-[#1C1C1C] hover:text-[#F5F5F3] transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#00FF41] opacity-20 blur-xl rounded-full"></div>
              <div>
                <div className="text-xs font-bold text-[#00AA22] group-hover:text-[#00FF41] mb-1 uppercase tracking-widest transition-colors">Nike Verified</div>
                <div className="font-black text-xl uppercase text-[#1C1C1C] group-hover:text-[#F5F5F3] transition-colors">Retro 95 Neon</div>
              </div>
              <div className="text-right z-10">
                <div className="text-xl font-black text-[#1C1C1C] group-hover:text-[#F5F5F3] transition-colors">$100</div>
                <div className="text-xs text-[#1C1C1C]/60 group-hover:text-[#F5F5F3]/80 uppercase font-bold drop-shadow-sm flex items-center gap-1 justify-end transition-colors"><Lock size={12} /> Locked</div>
              </div>
            </div>
            <div className="bg-[#F5F5F3] p-4 border-[3px] border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] flex justify-between items-center group cursor-pointer hover:bg-[#1C1C1C] hover:text-[#F5F5F3] transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#00E5FF] opacity-20 blur-xl rounded-full"></div>
              <div>
                <div className="text-xs font-bold text-[#008899] group-hover:text-[#00E5FF] mb-1 uppercase tracking-widest transition-colors">Sony Verified</div>
                <div className="font-black text-xl uppercase text-[#1C1C1C] group-hover:text-[#F5F5F3] transition-colors">Walkman Cyber</div>
              </div>
              <div className="text-right z-10">
                <div className="text-xl font-black text-[#1C1C1C] group-hover:text-[#F5F5F3] transition-colors">$350</div>
                <div className="text-xs text-[#008899] group-hover:text-[#00E5FF] uppercase font-bold drop-shadow-sm flex items-center gap-1 justify-end transition-colors"><Activity size={12} /> Escrow</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // EDIT PROFILE SCREEN
        <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-6 bg-[#E5E3DF] min-h-full pb-32 overflow-y-auto no-scrollbar">
          <header className="flex justify-between items-center mb-8 mt-4">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-[#1C1C1C] drop-shadow-[2px_2px_0_#FFFFFF]">Edit Setup</h1>
            <button onClick={() => setIsEditing(false)} className="bg-[#00FF41] text-[#1C1C1C] px-4 py-2 font-black uppercase hover:bg-[#1C1C1C] hover:text-[#00FF41] transition-colors border-4 border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C]">
              Done
            </button>
          </header>

          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 bg-[#1C1C1C] border-4 border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] flex items-center justify-center text-4xl font-black relative group cursor-pointer text-white">
              VJ
              <div className="absolute inset-0 bg-[#E5E3DF]/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity border-4 border-[#1C1C1C]"><Camera className="text-[#1C1C1C]" /></div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs text-[#1C1C1C] font-black uppercase tracking-widest mb-2">Display Name</label>
              <input type="text" defaultValue="Vikram S." className="w-full bg-[#F5F5F3] border-4 border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] p-4 font-black uppercase text-xl text-[#1C1C1C] focus:bg-[#E5E3DF] outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-[#1C1C1C] font-black uppercase tracking-widest mb-2">Email Address (Private)</label>
              <input type="email" defaultValue="vikram@example.com" className="w-full bg-[#F5F5F3] border-4 border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] p-4 font-black text-xl text-[#1C1C1C] focus:bg-[#E5E3DF] outline-none placeholder-[#1C1C1C]/40 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-[#1C1C1C] font-black uppercase tracking-widest mb-2">Bio / Vibe</label>
              <textarea rows={3} defaultValue="Collecting tech and vibes." className="w-full bg-[#F5F5F3] border-4 border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] p-4 font-bold text-lg text-[#1C1C1C] focus:bg-[#E5E3DF] outline-none resize-none transition-colors" />
            </div>
          </div>

          <button className="w-full mt-12 py-5 bg-[#FF0000] border-4 border-[#1C1C1C] shadow-[4px_4px_0_0_#1C1C1C] text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#1C1C1C] hover:text-[#FF0000] transition-colors relative">
            <LogOut size={20} /> Log Out Device
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

// ==========================================
// TRENDS VIEW
// ==========================================
function TrendsView() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-0 h-[calc(100%-80px)] w-full overflow-y-auto pb-24 no-scrollbar p-6 bg-[#E5E3DF]">
      <header className="mb-8 mt-4 sticky top-0 bg-[#E5E3DF] z-10 pb-4 border-b-4 border-[#1C1C1C]">
        <h1 className="text-5xl font-black uppercase tracking-tighter flex items-center gap-3 text-[#1C1C1C] drop-shadow-[2px_2px_0_#FFF]">
          <CloudLightning className="text-[#00FF41] drop-shadow-[1px_1px_0_#1C1C1C]" size={40} /> Trends
        </h1>
        <p className="text-[#1C1C1C]/60 font-bold uppercase tracking-widest mt-2">Macro Market Vectors</p>
      </header>

      <div className="flex flex-col gap-6">
        <div className="bg-[#1C1C1C] p-6 border-4 border-[#1C1C1C] text-[#F5F5F3] shadow-[8px_8px_0_0_#1C1C1C]">
          <h2 className="text-2xl font-black uppercase tracking-widest mb-4">Trend Clouds</h2>
          <div className="flex flex-wrap gap-3">
            {["#Y2K_REVIVAL", "#NEOBRUTALISM", "#ANALOG_TECH", "#CYBER_GOTH", "#VANTABLACK", "#CARBON_FIBER", "#TRANSPARENT", "#RAW_ALUMINUM"].map((tag: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-[#F5F5F3] text-[#1C1C1C] font-bold uppercase text-sm border-2 border-[#1C1C1C] shadow-[2px_2px_0_0_#1C1C1C] hover:bg-[#1C1C1C] hover:text-[#F5F5F3] transition-colors cursor-pointer">{tag}</span>
            ))}
          </div>
        </div>

        <div className="bg-[#F5F5F3] p-6 border-4 border-[#1C1C1C] shadow-[8px_8px_0_0_#1C1C1C]">
          <h2 className="text-xl font-black uppercase tracking-widest mb-4 text-[#1C1C1C]">Active Vectors</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b-2 border-[#1C1C1C]/10 pb-3">
              <span className="font-bold uppercase text-[#1C1C1C]">Hardware Keyboards</span>
              <span className="text-[#00FF41] font-black drop-shadow-[1px_1px_0_#1C1C1C] text-xl">+420%</span>
            </div>
            <div className="flex justify-between items-center border-b-2 border-[#1C1C1C]/10 pb-3">
              <span className="font-bold uppercase text-[#1C1C1C]">Clear Electronics</span>
              <span className="text-[#00FF41] font-black drop-shadow-[1px_1px_0_#1C1C1C] text-xl">+315%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold uppercase text-[#1C1C1C]">E-Ink Displays</span>
              <span className="text-[#00FF41] font-black drop-shadow-[1px_1px_0_#1C1C1C] text-xl">+190%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
