"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
    MODEL_Y_SPREAD,
    MODEL_LERP_FACTOR,
    MODEL_SCALE_LERP,
    MODEL_ACTIVE_SCALE,
    MODEL_HIDDEN_SCALE,
    MODEL_VISIBLE_THRESHOLD,
} from "@/constants";

// Pre-allocate reusable Vector3 to avoid GC pressure in useFrame
const _tempVec = new THREE.Vector3();

// ── Module-level singleton textures ─────────────────────────────────────────
// Created once and shared across ALL ShapeModel instances to avoid GPU memory
// blow-up (previously we were creating new textures per instance × per render
// window, which caused WebGL context loss on lower-end GPUs).
// Guards for SSR: typeof document check.

function makeBrushedTex(): THREE.CanvasTexture | null {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 256; c.height = 256; // 256 is plenty for a roughness map
    const ctx = c.getContext("2d")!;
    for (let y = 0; y < 256; y++) {
        const v = 90 + Math.random() * 80;
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(0, y, 256, 1);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
    return t;
}

function makeMatteTex(): THREE.CanvasTexture | null {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 128; c.height = 128;
    const ctx = c.getContext("2d")!;
    const img = ctx.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) {
        const v = 100 + Math.random() * 80;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 4);
    return t;
}

// Lazy singletons — created on first model mount, then reused
let _brushedTex: THREE.CanvasTexture | null = null;
let _matteTex: THREE.CanvasTexture | null = null;

function getBrushedTex() { return (_brushedTex ??= makeBrushedTex()); }
function getMatteTex() { return (_matteTex ??= makeMatteTex()); }

interface ShapeModelProps {
    type: string;
    color: string;
    index: number;
    currentIndex: number;
    dragProgressRef: React.MutableRefObject<number>;
    onPointerDown: () => void;
    onToggleZen: () => void;
}

export default function ShapeModel({ type, color, index, currentIndex, dragProgressRef, onPointerDown, onToggleZen }: ShapeModelProps) {
    const groupRef = useRef<THREE.Group>(null);
    const time = useRef(Math.random() * 100);
    const pointerMoved = useRef(false);

    useFrame((_state, delta) => {
        time.current += delta;
        if (!groupRef.current) return;

        if (index === currentIndex) {
            groupRef.current.position.x = Math.sin(time.current * 0.5) * 0.05;
        } else {
            groupRef.current.rotation.y = time.current * 0.2;
        }

        // dragProgressRef.current is positive when dragging up (toward next item).
        // Adding it to targetY shifts all models up, revealing the next item below.
        const targetY = (currentIndex - index) * MODEL_Y_SPREAD
            + dragProgressRef.current * MODEL_Y_SPREAD;
        groupRef.current.position.y = THREE.MathUtils.lerp(
            groupRef.current.position.y,
            targetY + Math.sin(time.current * 2) * 0.1,
            MODEL_LERP_FACTOR
        );

        const targetScale = index === currentIndex ? MODEL_ACTIVE_SCALE : MODEL_HIDDEN_SCALE;
        _tempVec.set(targetScale, targetScale, targetScale);
        groupRef.current.scale.lerp(_tempVec, MODEL_SCALE_LERP);
        groupRef.current.visible = groupRef.current.scale.x > MODEL_VISIBLE_THRESHOLD;
    });

    const isChrome = type === "shell" || type === "camera" || type === "watch" || type === "suitcase";
    const isBrushedMetal = type === "walkman" || type === "synth" || type === "espresso" || type === "keyboard" || type === "drone";
    const isTransparent = type === "earbuds" || type === "speaker";
    const isMatte = !isChrome && !isBrushedMetal && !isTransparent;

    // Use shared singleton textures — no per-instance allocation
    const brushedTex = isBrushedMetal ? getBrushedTex() : null;
    const matteTex = isMatte ? getMatteTex() : null;

    const mat = (
        <meshStandardMaterial
            color={isChrome ? "#E8E8E8" : color}
            roughness={isChrome ? 0.05 : isBrushedMetal ? 0.35 : 0.75}
            metalness={isChrome ? 1 : isBrushedMetal ? 0.9 : 0.1}
            roughnessMap={isBrushedMetal ? brushedTex : isMatte ? matteTex : null}
            transparent={isTransparent}
            opacity={isTransparent ? 0.55 : 1}
            envMapIntensity={isChrome ? 2 : isBrushedMetal ? 1.0 : 0.4}
        />
    );

    const accentMat = <meshStandardMaterial color="#1C1C1C" roughness={0.2} metalness={0.8} />;
    // Cheap frosted glass — simple transparency
    const glassMat = (
        <meshStandardMaterial
            transparent
            opacity={0.25}
            roughness={0.06}
            metalness={0.1}
            color="#FFFFFF"
        />
    );

    const handlePointerDown = (e: THREE.Event) => {
        (e as any).stopPropagation();
        pointerMoved.current = false;
        onPointerDown();
    };

    const handlePointerMove = () => {
        pointerMoved.current = true;
    };

    const handleClick = (e: THREE.Event) => {
        (e as any).stopPropagation();
        if (!pointerMoved.current) onToggleZen();
    };

    const props = { onPointerDown: handlePointerDown, onPointerMove: handlePointerMove, onClick: handleClick };

    const renderModel = () => {
        switch (type) {
            case "shoe":
                return (
                    <group position={[0, -0.5, 0]} {...props}>
                        <mesh castShadow><capsuleGeometry args={[0.5, 1.2, 16, 32]} />{mat}</mesh>
                        <mesh castShadow position={[0.4, -0.2, 0]} rotation={[0, 0, Math.PI / 4]}><cylinderGeometry args={[0.3, 0.4, 1.3, 32]} />{mat}</mesh>
                        <mesh position={[0, -0.6, 0]} scale={[1.1, 0.2, 1.1]}><boxGeometry />{accentMat}</mesh>
                    </group>
                );
            case "walkman":
                return (
                    <group {...props}>
                        <mesh castShadow><boxGeometry args={[1.2, 1.8, 0.4]} />{mat}</mesh>
                        <mesh position={[0, 0.2, 0.21]} scale={[0.8, 0.6, 0.02]}><boxGeometry />{glassMat}</mesh>
                        <mesh position={[0.65, 0.4, 0]} scale={[0.1, 0.4, 0.2]}><boxGeometry />{accentMat}</mesh>
                        <mesh position={[-0.65, -0.4, 0]} scale={[0.1, 0.2, 0.1]}><boxGeometry />{accentMat}</mesh>
                    </group>
                );
            case "camera":
                return (
                    <group {...props}>
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
                    <group {...props}>
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
                    <group {...props}>
                        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.8, 0.8, 0.15, 64]} />{mat}</mesh>
                        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.08]}><cylinderGeometry args={[0.75, 0.75, 0.02, 64]} />{glassMat}</mesh>
                        <mesh position={[0, 1.1, 0]} scale={[0.5, 0.8, 0.08]}><boxGeometry />{accentMat}</mesh>
                        <mesh position={[0, -1.1, 0]} scale={[0.5, 0.8, 0.08]}><boxGeometry />{accentMat}</mesh>
                        <mesh position={[0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.1, 0.1, 0.2]} />{accentMat}</mesh>
                    </group>
                );
            case "keyboard":
                return (
                    <group {...props} rotation={[-0.2, 0, 0]}>
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
                    <group {...props}>
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
                    <group {...props}>
                        <mesh castShadow><boxGeometry args={[1.5, 1.8, 1.5]} />{mat}</mesh>
                        <mesh position={[0, 0.95, 0]} scale={[1.6, 0.1, 1.6]}><boxGeometry />{mat}</mesh>
                        <mesh position={[0, -0.2, 0.8]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.8]} />{mat}</mesh>
                        <mesh position={[0, -0.6, 0.8]}><boxGeometry args={[0.4, 0.1, 0.4]} />{accentMat}</mesh>
                        <mesh position={[0.7, 0.5, 0.76]}><sphereGeometry args={[0.2, 16, 16]} />{accentMat}</mesh>
                    </group>
                );
            case "speaker":
                return (
                    <group {...props}>
                        <mesh castShadow><cylinderGeometry args={[0.8, 1, 2.2, 32]} />{mat}</mesh>
                        <mesh><cylinderGeometry args={[0.7, 0.7, 2, 32]} />{accentMat}</mesh>
                        <mesh position={[0, 1.15, 0]}><cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />{mat}</mesh>
                    </group>
                );
            case "suitcase":
                return (
                    <group {...props}>
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
                    <group {...props}>
                        <mesh castShadow><sphereGeometry args={[1, 32, 32]} />{mat}</mesh>
                        <mesh scale={[1.1, 0.8, 1.1]}><sphereGeometry args={[1, 32, 32]} />{mat}</mesh>
                        <mesh position={[0, 1.2, 0]} scale={[0.2, 0.4, 0.2]}><boxGeometry />{accentMat}</mesh>
                    </group>
                );
            case "board":
                return (
                    <group {...props}>
                        <mesh castShadow rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.4, 2.8, 16, 32]} />{mat}</mesh>
                        <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 0.2, 1.2]}><boxGeometry />{accentMat}</mesh>
                        {[-1, 1].map((x, i) => (
                            <mesh key={i} position={[x, -0.5, 0]} scale={[0.3, 0.1, 0.3]}><boxGeometry />{accentMat}</mesh>
                        ))}
                    </group>
                );
            case "console":
                return (
                    <group {...props}>
                        <mesh castShadow><boxGeometry args={[2, 0.6, 1.6]} />{mat}</mesh>
                        <mesh position={[0, 0.35, -0.2]}><boxGeometry args={[1.4, 0.1, 0.8]} />{accentMat}</mesh>
                        <mesh position={[-0.6, 0.35, 0.5]}><sphereGeometry args={[0.15, 16, 16]} />{accentMat}</mesh>
                        <mesh position={[0.6, 0.35, 0.5]}><sphereGeometry args={[0.15, 16, 16]} />{accentMat}</mesh>
                    </group>
                );
            case "chair":
                return (
                    <group position={[0, -0.5, 0]} {...props}>
                        <mesh castShadow position={[0, 0.6, 0]}><boxGeometry args={[1.2, 0.15, 1.2]} />{mat}</mesh>
                        <mesh castShadow position={[0, 1.4, -0.5]} rotation={[-0.1, 0, 0]}><boxGeometry args={[1.1, 1.3, 0.1]} />{mat}</mesh>
                        <mesh><cylinderGeometry args={[0.1, 0.1, 1.2]} />{accentMat}</mesh>
                        <mesh position={[0, -0.6, 0]} scale={[1, 0.1, 1]}><cylinderGeometry args={[0.8, 0.8, 1]} />{accentMat}</mesh>
                    </group>
                );
            case "earbuds":
                return (
                    <group {...props}>
                        <mesh castShadow><sphereGeometry args={[0.6, 32, 32]} />{mat}</mesh>
                        <mesh position={[0, -0.4, 0]}><cylinderGeometry args={[0.15, 0.1, 0.8]} />{mat}</mesh>
                        <mesh position={[0, 0.1, 0.5]} scale={[0.2, 0.2, 0.1]}><sphereGeometry />{accentMat}</mesh>
                    </group>
                );
            default:
                return <mesh castShadow {...props}><boxGeometry args={[1, 1, 1]} />{mat}</mesh>;
        }
    };

    return <group ref={groupRef}>{renderModel()}</group>;
}
