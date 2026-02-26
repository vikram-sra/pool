"use client";

import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import ShapeModel from "./ShapeModel";
import { ORBIT_MIN_DISTANCE, ORBIT_MAX_DISTANCE, ORBIT_DAMPING, CAMERA_FOV } from "@/constants";
import { CAMPAIGNS } from "@/data/campaigns";
import type { Campaign, TabId, PledgeState } from "@/types";

interface ThreeSceneProps {
    currentCampaign: Campaign;
    currentIndex: number;
    currentTab: TabId;
    isZenMode?: boolean;
    zenYOffset?: number;
    zenXOffset?: number;
    onInteractionStart: () => void;
    dragProgressRef: React.MutableRefObject<number>;
    onToggleZen?: () => void;
}

export default function ThreeScene({ currentCampaign, currentIndex, currentTab, isZenMode, zenYOffset, zenXOffset, onInteractionStart, dragProgressRef, onToggleZen }: ThreeSceneProps) {
    const controlsRef = useRef<any>(null);
    const { gl, camera, size } = useThree();

    // Base stable Z for viewing individual products
    const stableZRef = useRef(5);

    // Calculate responsive stable Z on mount/resize
    useEffect(() => {
        const aspect = size.width / size.height;
        const vFovRad = (CAMERA_FOV * Math.PI) / 180;
        const refSize = 1.3;
        const PADDING = 1.0; // Reduced to maximize object scale
        const zForHeight = (refSize / 2 / Math.tan(vFovRad / 2)) * PADDING;
        const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * aspect);
        const zForWidth = (refSize / 2 / Math.tan(hFovRad / 2)) * PADDING;
        stableZRef.current = Math.max(zForWidth, zForHeight, ORBIT_MIN_DISTANCE + 0.5);
    }, [size]);

    // Apply smooth camera transitions based on current tab
    useFrame((state, delta) => {
        if (!controlsRef.current) return;

        let targetX = 0;
        let targetY = 0;
        let targetZ = stableZRef.current;
        let targetLookX = 0;
        let targetLookY = 0;

        switch (currentTab) {
            case "FEED":
                // In zen mode, center the object vertically for immersive viewing
                targetZ = isZenMode ? stableZRef.current * 0.9 : stableZRef.current;
                targetY = isZenMode ? 0 : -0.3;
                break;
            case "ECOSYSTEM":
                // Shifted back and left to compliment Bento Grid
                targetZ = stableZRef.current * 1.5;
                targetX = -1.5;
                targetLookX = 1;
                break;
            case "PITCH":
                // Top-down/focused look
                targetZ = stableZRef.current * 1.2;
                targetY = 1;
                break;
            case "PROFILE":
                targetZ = stableZRef.current * 1.3;
                targetX = 1.5;
                break;
        }

        if (currentTab !== "FEED" && !dragProgressRef.current) {
            state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetX, 2.5, delta);
            state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetY, 2.5, delta);
            state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetZ, 2.5, delta);
            controlsRef.current.target.x = THREE.MathUtils.damp(controlsRef.current.target.x, targetLookX, 3, delta);
            controlsRef.current.target.y = THREE.MathUtils.damp(controlsRef.current.target.y, targetLookY, 3, delta);
        } else if (currentTab === "FEED" && !dragProgressRef.current) {
            // Smoothly return the focus target to the center (with Y bias for top-heavy layout)
            controlsRef.current.target.x = THREE.MathUtils.damp(controlsRef.current.target.x, 0, 3, delta);
            controlsRef.current.target.y = THREE.MathUtils.damp(controlsRef.current.target.y, isZenMode ? 0 : -0.3, 3, delta);
        }
    });

    // Reset user rotation/zoom when campaign changes
    useEffect(() => {
        if (controlsRef.current) controlsRef.current.reset();
    }, [currentIndex]);

    // Reset zoom gracefully on zen mode exit
    useEffect(() => {
        if (!isZenMode && controlsRef.current) {
            controlsRef.current.reset();
        }
    }, [isZenMode]);

    // Zoom: allow pinch (ctrl+wheel / trackpad) but not regular scroll-wheel.
    useEffect(() => {
        const el = gl.domElement;
        if (!el) return;

        const handleWheelCapture = (e: WheelEvent) => {
            if (controlsRef.current) {
                controlsRef.current.enableZoom = e.ctrlKey;
            }
        };

        el.addEventListener("wheel", handleWheelCapture, { capture: true });
        return () => el.removeEventListener("wheel", handleWheelCapture, { capture: true });
    }, [gl]);

    return (
        <>
            {/* Clean Studio Lighting Aesthetic */}
            <ambientLight intensity={1.5} color="#ffffff" />
            <directionalLight position={[5, 10, 5]} intensity={2.5} color="#ffffff" castShadow={false} />
            <directionalLight position={[-5, 5, -5]} intensity={1.0} color="#f8fafc" />
            <directionalLight position={[0, -5, 5]} intensity={0.5} color="#e2e8f0" />
            <pointLight position={[3, 3, 3]} intensity={1.0} color="#ffffff" decay={2} />

            {/* SINGLE PREMIUM MODEL */}
            <ShapeModel
                key={currentCampaign.id}
                type={currentCampaign.modelType}
                color={currentCampaign.color}
                isZenMode={isZenMode}
                zenYOffset={zenYOffset}
                zenXOffset={zenXOffset}
                onPointerDown={() => {
                    onInteractionStart();
                }}
                onToggleZen={onToggleZen}
            />

            <Environment preset="studio" environmentIntensity={0.8} />

            <OrbitControls
                ref={controlsRef}
                enablePan={false}
                enableZoom={currentTab === "FEED"}
                enableRotate={currentTab === "FEED"}
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

