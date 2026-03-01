"use client";

import React, { useState, useRef, Suspense, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { CAMPAIGNS } from "@/data/campaigns";
import { CAMERA_POSITION, CAMERA_FOV } from "@/constants";
import type { TabId, PledgeState } from "@/types";

import ThreeScene from "@/components/three/ThreeScene";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import BottomNav from "@/components/ui/BottomNav";
import FeedView from "@/components/views/FeedView";
import EcosystemView from "@/components/views/EcosystemView";
import ProfileView from "@/components/views/ProfileView";
import PitchView from "@/components/views/PitchView";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<TabId>("FEED");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZenMode, setIsZenMode] = useState(false);
  const [zenYOffset, setZenYOffset] = useState(0);
  const [zenXOffset, setZenXOffset] = useState(0);
  const [hasInteracted3D, setHasInteracted3D] = useState(false);
  const [pledgeStates, setPledgeStates] = useState<Record<number, PledgeState>>({});

  const isInteractingWithObject = useRef(false);
  const dragProgressRef = useRef(0);

  const currentCampaign = CAMPAIGNS[currentIndex % CAMPAIGNS.length];

  // Hydrate pledges
  useEffect(() => {
    try { setPledgeStates(JSON.parse(localStorage.getItem('dp-pledges') ?? '{}')); } catch { }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('dp-pledges', JSON.stringify(pledgeStates)); } catch { }
  }, [pledgeStates]);

  const handlePledge = (campaignId: number) => {
    const current = pledgeStates[campaignId] ?? "initiated";
    if (current === "initiated") {
      setPledgeStates(prev => ({ ...prev, [campaignId]: "escrowed" }));
      setTimeout(() => setPledgeStates(prev => ({ ...prev, [campaignId]: "locked" })), 1500);
    }
  };

  useEffect(() => {
    const handleUp = () => { isInteractingWithObject.current = false; };
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => { window.removeEventListener("pointerup", handleUp); window.removeEventListener("pointercancel", handleUp); };
  }, []);

  return (
    <div className="fixed inset-0 w-[100dvw] h-[100dvh] bg-[#F9FAFB] overflow-hidden">

      {/* 3D CANVAS — conditionally visible based on tab */}
      <div className={`absolute inset-0 z-10 transition-opacity duration-300 ${currentTab === "FEED" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-white">
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
                  currentTab={currentTab}
                  isZenMode={isZenMode}
                  zenYOffset={zenYOffset}
                  zenXOffset={zenXOffset}
                  onInteractionStart={() => { isInteractingWithObject.current = true; setHasInteracted3D(true); }}
                  dragProgressRef={dragProgressRef}
                  onToggleZen={() => {
                    setIsZenMode(prev => {
                      if (prev) { setZenYOffset(0); setZenXOffset(0); }
                      return !prev;
                    });
                  }}
                />
              </Canvas>
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      {/* 
        Solid background is completely removed! 
        The 3D Scene is now the persistent foundation across all views.
      */}

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
              setIsZenMode={(val: boolean) => {
                setIsZenMode(val);
                if (!val) { setZenYOffset(0); setZenXOffset(0); }
              }}
              zenYOffset={zenYOffset}
              setZenYOffset={setZenYOffset}
              zenXOffset={zenXOffset}
              setZenXOffset={setZenXOffset}
              hasInteracted3D={hasInteracted3D}
              isPitchOpen={false}
              dragProgressRef={dragProgressRef}
              pledgeState={pledgeStates[currentCampaign.id] ?? "initiated"}
              onPledge={handlePledge}
            />
          )}
          {currentTab === "ECOSYSTEM" && <EcosystemView key="ecosystem" />}
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
