"use client";

import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import ShapeModel from "./ShapeModel";
import { CAMPAIGNS } from "@/data/campaigns";
import { MODEL_RENDER_WINDOW, ORBIT_MIN_DISTANCE, ORBIT_MAX_DISTANCE, ORBIT_DAMPING, CAMERA_FOV, MODEL_ACTIVE_SCALE } from "@/constants";
import type { Campaign } from "@/types";

/** Approximate world-space extents (width × height) of each model at scale=1 */
const MODEL_EXTENTS: Record<string, { w: number; h: number }> = {
    shoe:     { w: 1.8, h: 1.4 },
    walkman:  { w: 1.2, h: 1.8 },
    camera:   { w: 1.8, h: 1.1 },
    synth:    { w: 2.8, h: 0.5 },
    watch:    { w: 1.6, h: 2.8 },
    keyboard: { w: 3.0, h: 1.5 },
    drone:    { w: 1.8, h: 1.2 },
    espresso: { w: 1.6, h: 2.0 },
    speaker:  { w: 1.6, h: 2.3 },
    suitcase: { w: 1.2, h: 1.9 },
    shell:    { w: 2.4, h: 2.4 },
    board:    { w: 3.6, h: 1.0 },
    console:  { w: 2.0, h: 0.8 },
    chair:    { w: 1.2, h: 2.5 },
    earbuds:  { w: 0.8, h: 1.5 },
};

interface ThreeSceneProps {
    currentCampaign: Campaign;
    currentIndex: number;
    onInteractionStart: () => void;
    onToggleZen: () => void;
}

export default function ThreeScene({ currentCampaign, currentIndex, onInteractionStart, onToggleZen }: ThreeSceneProps) {
    const controlsRef = useRef<any>(null);
    const { gl, camera, size } = useThree();

    // Fit model to screen: derive camera Z from model extents + FOV so the
    // active object always fills the viewport width without clipping.
    useEffect(() => {
        const aspect = size.width / size.height;
        const vFovRad = (CAMERA_FOV * Math.PI) / 180;
        const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * aspect);

        const ext = MODEL_EXTENTS[currentCampaign.modelType] ?? { w: 2, h: 2 };
        const scaledW = ext.w * MODEL_ACTIVE_SCALE;
        const scaledH = ext.h * MODEL_ACTIVE_SCALE;

        // 1.3 = 30% breathing room so model isn't edge-to-edge
        const PADDING = 1.3;
        const zForWidth  = (scaledW / 2 / Math.tan(hFovRad  / 2)) * PADDING;
        const zForHeight = (scaledH / 2 / Math.tan(vFovRad / 2)) * PADDING;

        const targetZ = Math.max(zForWidth, zForHeight, ORBIT_MIN_DISTANCE + 0.5);
        camera.position.set(0, 0, targetZ);
        // Persist as "home" so OrbitControls.reset() snaps back here
        if (controlsRef.current) controlsRef.current.saveState();
    }, [size, camera, currentCampaign]);

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

    // Zoom: block regular scroll-wheel zoom, allow pinch (mobile + trackpad)
    useEffect(() => {
        const el = gl.domElement;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            // ctrl+wheel = trackpad pinch → let OrbitControls handle it
            // regular wheel = scroll → block it from reaching OrbitControls
            if (!e.ctrlKey) e.stopImmediatePropagation();
        };

        el.addEventListener("wheel", handleWheel, { capture: true });
        return () => el.removeEventListener("wheel", handleWheel, { capture: true });
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
