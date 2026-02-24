"use client";

import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import ShapeModel from "./ShapeModel";
import { CAMPAIGNS } from "@/data/campaigns";
import { MODEL_RENDER_WINDOW, ORBIT_MIN_DISTANCE, ORBIT_MAX_DISTANCE, ORBIT_DAMPING, CAMERA_FOV, MODEL_ACTIVE_SCALE } from "@/constants";
import type { Campaign } from "@/types";

/** Approximate world-space extents (width × height) of each model at scale=1 */
const MODEL_EXTENTS: Record<string, { w: number; h: number }> = {
    shoe: { w: 1.8, h: 1.4 },
    walkman: { w: 1.2, h: 1.8 },
    camera: { w: 1.8, h: 1.1 },
    synth: { w: 2.8, h: 0.5 },
    watch: { w: 1.6, h: 2.8 },
    keyboard: { w: 3.0, h: 1.5 },
    drone: { w: 1.8, h: 1.2 },
    espresso: { w: 1.6, h: 2.0 },
    speaker: { w: 1.6, h: 2.3 },
    suitcase: { w: 1.2, h: 1.9 },
    shell: { w: 2.4, h: 2.4 },
    board: { w: 3.6, h: 1.0 },
    console: { w: 2.0, h: 0.8 },
    chair: { w: 1.2, h: 2.5 },
    earbuds: { w: 0.8, h: 1.5 },
};

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

    // Fit model to screen: derive camera Z from model extents + FOV so the
    // active object always fills the viewport width without clipping.
    // Additionally, offset the camera look-at target downward so the model
    // is centred in the visible area ABOVE the bottom overlay (info panel +
    // BottomNav ≈ 220 px).  The "red line" the user sees is the top of that
    // overlay, so we push the target up by half the overlay's world height.
    useEffect(() => {
        const aspect = size.width / size.height;
        const vFovRad = (CAMERA_FOV * Math.PI) / 180;
        const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * aspect);

        const ext = MODEL_EXTENTS[currentCampaign.modelType] ?? { w: 2, h: 2 };
        const scaledW = ext.w * MODEL_ACTIVE_SCALE;
        const scaledH = ext.h * MODEL_ACTIVE_SCALE;

        // 1.7 = 70% breathing room — pulls camera back for a less zoomed-in feel
        const PADDING = 1.7;
        const zForWidth = (scaledW / 2 / Math.tan(hFovRad / 2)) * PADDING;
        const zForHeight = (scaledH / 2 / Math.tan(vFovRad / 2)) * PADDING;
        const targetZ = Math.max(zForWidth, zForHeight, ORBIT_MIN_DISTANCE + 0.5);

        // True center — target is always world origin (0, 0, 0)
        camera.position.set(0, 0, targetZ);

        if (controlsRef.current) {
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.saveState();
        }
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

    // Zoom: allow pinch (ctrl+wheel / trackpad) but not regular scroll-wheel.
    // We only toggle enableZoom — we do NOT call stopPropagation/stopImmediatePropagation
    // so the event still bubbles to window and FeedView's wheel handler fires normally.
    useEffect(() => {
        const el = gl.domElement;
        if (!el) return;

        const handleWheelCapture = (e: WheelEvent) => {
            if (controlsRef.current) {
                // ctrl+wheel = trackpad pinch → allow zoom
                // plain wheel = scroll intent → disable zoom so OrbitControls ignores it
                controlsRef.current.enableZoom = e.ctrlKey;
            }
        };

        el.addEventListener("wheel", handleWheelCapture, { capture: true });
        return () => el.removeEventListener("wheel", handleWheelCapture, { capture: true });
    }, [gl]);

    return (
        <>
            {/* Programmatic studio rig — no external HDR fetch, zero PMREM cost */}
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 10, 5]} intensity={2.5} color={currentCampaign.color} castShadow={false} />
            <directionalLight position={[-5, 5, -5]} intensity={1.5} color="#ffffff" />
            <directionalLight position={[0, -5, 5]} intensity={0.8} color="#e8f0ff" />
            <pointLight position={[3, 3, 3]} intensity={1.0} color="#ffffff" decay={2} />

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
                        dragProgressRef={dragProgressRef}
                        onPointerDown={() => {
                            if (controlsRef.current) controlsRef.current.enableRotate = true;
                            onInteractionStart();
                        }}
                        onToggleZen={onToggleZen}
                    />
                );
            })}

            {/* Environment removed — use programmatic lights only to avoid HDR fetch on init */}

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
