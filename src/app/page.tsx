"use client";

import React, { useState, useRef, Suspense, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { CAMPAIGNS } from "@/data/campaigns";
import { CAMERA_POSITION, CAMERA_FOV } from "@/constants";
import type { TabId } from "@/types";

import ThreeScene from "@/components/three/ThreeScene";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import BottomNav from "@/components/ui/BottomNav";
import FeedView from "@/components/views/FeedView";
import TrendsView from "@/components/views/TrendsView";
import BrandsView from "@/components/views/BrandsView";
import ProfileView from "@/components/views/ProfileView";
import PitchView from "@/components/views/PitchView";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<TabId>("FEED");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZenMode, setIsZenMode] = useState(false);
  const [hasInteracted3D, setHasInteracted3D] = useState(false);
  const isInteractingWithObject = useRef(false);
  const dragProgressRef = useRef(0);

  const currentCampaign = CAMPAIGNS[currentIndex % CAMPAIGNS.length];

  useEffect(() => {
    const handleUp = () => { isInteractingWithObject.current = false; };
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => { window.removeEventListener("pointerup", handleUp); window.removeEventListener("pointercancel", handleUp); };
  }, []);

  return (
    <div className="fixed inset-0 w-[100dvw] h-[100dvh] bg-black overflow-hidden">

      {/* 3D CANVAS — always GPU-mounted to avoid context loss */}
      <div
        className="absolute inset-0 z-10"
        style={{
          visibility: currentTab === "FEED" ? "visible" : "hidden",
          pointerEvents: currentTab === "FEED" ? "auto" : "none",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#C8C5BC] via-[#B8B5AC] to-[#A8A59C]" />
        <div className="absolute inset-0">
          <ErrorBoundary>
            <Suspense fallback={null}>
              <Canvas
                dpr={[1, 1.5]}
                camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV }}
                gl={{
                  antialias: true,
                  powerPreference: "high-performance",
                  failIfMajorPerformanceCaveat: false,
                }}
                style={{ touchAction: "none" }}
                onCreated={({ gl }) => {
                  const canvas = gl.domElement;
                  const restore = () => gl.setSize(canvas.clientWidth, canvas.clientHeight);
                  canvas.addEventListener("webglcontextrestored", restore);
                }}
              >
                <ThreeScene
                  currentCampaign={currentCampaign}
                  currentIndex={currentIndex}
                  onInteractionStart={() => { isInteractingWithObject.current = true; setHasInteracted3D(true); }}
                  onToggleZen={() => setIsZenMode((p) => !p)}
                  dragProgressRef={dragProgressRef}
                />
              </Canvas>
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      {/* Non-feed solid background */}
      {currentTab !== "FEED" && (
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#EDEAE4] to-[#E0DDD6]" />
      )}

      {/* VIEW LAYER */}
      <div className="absolute inset-0 z-20 pointer-events-none">
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
              isPitchOpen={false}
              dragProgressRef={dragProgressRef}
            />
          )}
          {currentTab === "TRENDS" && <TrendsView key="trends" />}
          {currentTab === "BRANDS" && <BrandsView key="brands" />}
          {currentTab === "PROFILE" && <ProfileView key="profile" />}
          {currentTab === "PITCH" && <PitchView key="pitch" />}
        </AnimatePresence>
      </div>

      {/* BOTTOM NAV */}
      <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none">
        <BottomNav
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          hidden={isZenMode && currentTab === "FEED"}
        />
      </div>

    </div>
  );
}
