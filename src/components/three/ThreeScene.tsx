"use client";

import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import ShapeModel from "./ShapeModel";
import { ORBIT_MIN_DISTANCE, ORBIT_MAX_DISTANCE, ORBIT_DAMPING, CAMERA_FOV } from "@/constants";
import type { Campaign } from "@/types";

interface ThreeSceneProps {
    currentCampaign: Campaign;
    currentIndex: number;
    onInteractionStart: () => void;
    onToggleZen: () => void;
    dragProgressRef: React.MutableRefObject<number>;
}

export default function ThreeScene({ currentCampaign, currentIndex, onInteractionStart, onToggleZen, dragProgressRef }: ThreeSceneProps) {
    const controlsRef = useRef<any>(null);
    const { gl, camera, size } = useThree();

    // Fixed camera Z — stable across all models, only changes on viewport resize
    useEffect(() => {
        const aspect = size.width / size.height;
        const vFovRad = (CAMERA_FOV * Math.PI) / 180;
        const refSize = 1.3;
        const PADDING = 1.8;
        const zForHeight = (refSize / 2 / Math.tan(vFovRad / 2)) * PADDING;
        const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * aspect);
        const zForWidth = (refSize / 2 / Math.tan(hFovRad / 2)) * PADDING;
        const stableZ = Math.max(zForWidth, zForHeight, ORBIT_MIN_DISTANCE + 0.5);

        camera.position.set(0, 0, stableZ);

        if (controlsRef.current) {
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.saveState();
        }
    }, [size, camera]);

    // Release rotation on pointer up
    useEffect(() => {
        const handlePointerUp = () => {
            if (controlsRef.current) controlsRef.current.enableRotate = false;
        };
        window.addEventListener("pointerup", handlePointerUp);
        return () => window.removeEventListener("pointerup", handlePointerUp);
    }, []);

    // Reset user rotation/zoom when campaign changes
    useEffect(() => {
        if (controlsRef.current) controlsRef.current.reset();
    }, [currentIndex]);

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
            {/* Programmatic studio rig for Cyberpunk/Futuristic aesthetic */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 10, 5]} intensity={4.0} color={currentCampaign.color} castShadow={false} />
            <directionalLight position={[-5, 5, -5]} intensity={2.5} color="#00E5FF" />
            <directionalLight position={[0, -5, 5]} intensity={1.2} color="#FF00FF" />
            <pointLight position={[3, 3, 3]} intensity={1.5} color="#ffffff" decay={2} />

            {/* SINGLE MODEL — only the active campaign, no Y-axis queue */}
            <ShapeModel
                key={currentCampaign.id}
                type={currentCampaign.modelType}
                color={currentCampaign.color}
                onPointerDown={() => {
                    if (controlsRef.current) controlsRef.current.enableRotate = true;
                    onInteractionStart();
                }}
                onToggleZen={onToggleZen}
            />

            <Environment preset="city" environmentIntensity={0.5} />

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
