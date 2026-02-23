"use client";

import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import ShapeModel from "./ShapeModel";
import { CAMPAIGNS } from "@/data/campaigns";
import { MODEL_RENDER_WINDOW, ORBIT_MIN_DISTANCE, ORBIT_MAX_DISTANCE, ORBIT_DAMPING } from "@/constants";
import type { Campaign } from "@/types";

interface ThreeSceneProps {
    currentCampaign: Campaign;
    currentIndex: number;
    onInteractionStart: () => void;
    onToggleZen: () => void;
}

export default function ThreeScene({ currentCampaign, currentIndex, onInteractionStart, onToggleZen }: ThreeSceneProps) {
    const controlsRef = useRef<any>(null);
    const { gl } = useThree();

    // Release rotation on pointer up
    useEffect(() => {
        const handlePointerUp = () => {
            if (controlsRef.current) controlsRef.current.enableRotate = false;
        };
        window.addEventListener("pointerup", handlePointerUp);
        return () => window.removeEventListener("pointerup", handlePointerUp);
    }, []);

    // Reset camera when campaign changes
    useEffect(() => {
        if (controlsRef.current) controlsRef.current.reset();
    }, [currentIndex]);

    // Zoom interceptor: allow pinch-to-zoom only, not scroll-to-zoom
    useEffect(() => {
        const el = gl.domElement;
        if (!el) return;

        const handleWheelCapture = (e: WheelEvent) => {
            if (controlsRef.current) {
                controlsRef.current.enableZoom = e.ctrlKey; // ctrlKey = trackpad pinch
            }
        };

        const handleTouchStart = (e: TouchEvent) => {
            if (controlsRef.current && e.touches.length > 1) {
                controlsRef.current.enableZoom = true;
            }
        };

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

            {/* Only render models within render window for performance */}
            {CAMPAIGNS.map((campaign: Campaign, i: number) => {
                if (Math.abs(i - currentIndex) > MODEL_RENDER_WINDOW) return null;
                return (
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
                );
            })}

            <OrbitControls
                ref={controlsRef}
                enablePan={false}
                enableZoom={true}
                enableRotate={false}
                minDistance={ORBIT_MIN_DISTANCE}
                maxDistance={ORBIT_MAX_DISTANCE}
                enableDamping={true}
                dampingFactor={ORBIT_DAMPING}
                touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
                makeDefault
            />
        </>
    );
}
