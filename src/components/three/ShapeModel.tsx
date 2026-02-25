"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MODEL_ACTIVE_SCALE } from "@/constants";

const _tempVec = new THREE.Vector3();

// ── Singleton textures ──────────────────────────────────────────────────────
function makeBrushedTex(): THREE.CanvasTexture | null {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 256; c.height = 256;
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

let _brushedTex: THREE.CanvasTexture | null = null;
let _matteTex: THREE.CanvasTexture | null = null;
function getBrushedTex() { return (_brushedTex ??= makeBrushedTex()); }
function getMatteTex() { return (_matteTex ??= makeMatteTex()); }

/** Per-model normalization so all models appear the same visual size. */
const MODEL_FIT: Record<string, number> = {
    shoe: 1.0,
    walkman: 1.0,
    camera: 1.0,
    synth: 0.65,
    watch: 0.8,
    keyboard: 0.6,
    drone: 0.9,
    espresso: 0.85,
    speaker: 0.8,
    suitcase: 0.95,
    shell: 0.85,
    board: 0.5,
    console: 0.85,
    chair: 0.75,
    earbuds: 1.2,
};

interface ShapeModelProps {
    type: string;
    color: string;
    onPointerDown: () => void;
    onToggleZen: () => void;
}

export default function ShapeModel({ type, color, onPointerDown, onToggleZen }: ShapeModelProps) {
    const groupRef = useRef<THREE.Group>(null);
    const time = useRef(0);
    const pointerMoved = useRef(false);
    const fitScale = MODEL_FIT[type] ?? 1.0;
    const targetScale = MODEL_ACTIVE_SCALE * fitScale;

    useFrame((_state, delta) => {
        time.current += delta;
        if (!groupRef.current) return;
        groupRef.current.position.x = Math.sin(time.current * 0.5) * 0.05;
        groupRef.current.position.y = Math.sin(time.current * 2) * 0.05;
        _tempVec.set(targetScale, targetScale, targetScale);
        groupRef.current.scale.lerp(_tempVec, 0.12);
    });

    const isChrome = type === "shell" || type === "camera" || type === "watch" || type === "suitcase";
    const isBrushedMetal = type === "walkman" || type === "synth" || type === "espresso" || type === "keyboard" || type === "drone";
    const isTransparent = type === "earbuds" || type === "speaker";
    const isMatte = !isChrome && !isBrushedMetal && !isTransparent;

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
    const whiteMat = <meshStandardMaterial color="#FAFAFA" roughness={0.4} metalness={0.1} />;
    const glassMat = (
        <meshStandardMaterial transparent opacity={0.25} roughness={0.06} metalness={0.1} color="#FFFFFF" />
    );
    const glowMat = (
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.3} metalness={0.5} />
    );

    const handlePointerDown = (e: THREE.Event) => {
        (e as any).stopPropagation();
        pointerMoved.current = false;
        onPointerDown();
    };
    const handlePointerMove = () => { pointerMoved.current = true; };
    const handleClick = (e: THREE.Event) => {
        (e as any).stopPropagation();
        if (!pointerMoved.current) onToggleZen();
    };
    const props = { onPointerDown: handlePointerDown, onPointerMove: handlePointerMove, onClick: handleClick };

    const renderModel = () => {
        switch (type) {
            // ── SHOE (Nike Retro 95 Neon) ── Chrome spiked sneaker
            case "shoe": {
                const chromeMat = <meshStandardMaterial color="#E8E8E8" roughness={0.02} metalness={1.0} envMapIntensity={2.5} />;
                const spikeMat = <meshStandardMaterial color="#CCCCCC" roughness={0.05} metalness={1.0} envMapIntensity={2.0} />;
                const spikePositions: [number, number, number][] = [
                    [-0.3, 0.2, 0.42], [-0.1, 0.3, 0.42], [0.1, 0.35, 0.42], [0.3, 0.25, 0.42], [0.5, 0.1, 0.4],
                    [-0.3, 0.2, -0.42], [-0.1, 0.3, -0.42], [0.1, 0.35, -0.42], [0.3, 0.25, -0.42], [0.5, 0.1, -0.4],
                    [-0.4, 0.42, 0], [-0.2, 0.47, 0], [0.0, 0.47, 0], [0.2, 0.42, 0], [0.4, 0.32, 0],
                    [0.7, 0.2, 0.2], [0.7, 0.2, -0.2], [0.7, 0.35, 0], [0.8, 0.1, 0],
                    [-0.7, 0.0, 0.25], [-0.7, 0.0, -0.25], [-0.8, 0.05, 0], [-0.6, 0.15, 0.35], [-0.6, 0.15, -0.35],
                ];
                return (
                    <group position={[0, -0.2, 0]} rotation={[0.15, -0.5, 0.05]} {...props}>
                        <mesh position={[0, -0.55, 0]}><boxGeometry args={[2.2, 0.3, 1.0]} />{chromeMat}</mesh>
                        <mesh position={[0, -0.35, 0]}><boxGeometry args={[2.1, 0.2, 0.95]} />{chromeMat}</mesh>
                        <mesh position={[0.4, -0.35, 0]}><capsuleGeometry args={[0.08, 0.5, 8, 16]} />{glassMat}</mesh>
                        <mesh position={[-0.4, -0.35, 0]}><capsuleGeometry args={[0.06, 0.35, 8, 16]} />{glassMat}</mesh>
                        <mesh position={[0, 0.05, 0]} rotation={[0, 0, 0.05]}><capsuleGeometry args={[0.38, 1.3, 16, 32]} />{chromeMat}</mesh>
                        <mesh position={[-0.75, -0.15, 0]} scale={[0.45, 0.35, 0.8]}><sphereGeometry args={[1, 16, 16, 0, Math.PI]} />{chromeMat}</mesh>
                        <mesh position={[0.78, 0.05, 0]} scale={[0.3, 0.55, 0.65]}><boxGeometry />{chromeMat}</mesh>
                        <mesh position={[-0.1, 0.5, 0]} rotation={[0, 0, 0.25]} scale={[0.35, 0.25, 0.45]}><boxGeometry />{chromeMat}</mesh>
                        <mesh position={[0.2, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.3, 0.05, 8, 24]} />{chromeMat}</mesh>
                        <mesh position={[0, 0.05, 0.43]} rotation={[0, 0, -0.12]}><boxGeometry args={[1.1, 0.06, 0.02]} />{glowMat}</mesh>
                        <mesh position={[0, 0.05, -0.43]} rotation={[0, 0, -0.12]}><boxGeometry args={[1.1, 0.06, 0.02]} />{glowMat}</mesh>
                        {spikePositions.map(([x, y, z], i) => (
                            <mesh key={i} position={[x, y, z]} rotation={[z > 0 ? 0 : Math.PI, 0, 0]}>
                                <coneGeometry args={[0.04, 0.18, 6]} />{spikeMat}
                            </mesh>
                        ))}
                        {Array.from({ length: 10 }).map((_, i) => (
                            <group key={`s${i}`}>
                                <mesh position={[(i - 4.5) * 0.2, -0.7, 0.45]}><coneGeometry args={[0.03, 0.1, 4]} />{spikeMat}</mesh>
                                <mesh position={[(i - 4.5) * 0.2, -0.7, -0.45]}><coneGeometry args={[0.03, 0.1, 4]} />{spikeMat}</mesh>
                            </group>
                        ))}
                        {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
                            <mesh key={`e${i}`} position={[x, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.04, 0.015, 4, 12]} />{chromeMat}</mesh>
                        ))}
                    </group>
                );
            }

            // ── WALKMAN (Sony Walkman Cyber) ──
            // Classic cassette player: body, cassette window, buttons, headphone jack
            case "walkman":
                return (
                    <group rotation={[0.1, 0.2, 0]} {...props}>
                        {/* Main body */}
                        <mesh castShadow><boxGeometry args={[1.4, 2.0, 0.5]} />{mat}</mesh>
                        {/* Rounded corners - edge trim */}
                        <mesh position={[0, 0, 0.26]} scale={[1.3, 1.9, 0.02]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        {/* Cassette window - frosted glass */}
                        <mesh position={[0, 0.35, 0.26]}>
                            <boxGeometry args={[1.0, 0.6, 0.03]} />{glassMat}
                        </mesh>
                        {/* Cassette reels visible through window */}
                        <mesh position={[-0.22, 0.35, 0.27]} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.12, 0.03, 8, 24]} />{accentMat}
                        </mesh>
                        <mesh position={[0.22, 0.35, 0.27]} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.12, 0.03, 8, 24]} />{accentMat}
                        </mesh>
                        {/* Control buttons row */}
                        {[-0.4, -0.15, 0.1, 0.35].map((x, i) => (
                            <mesh key={i} position={[x, -0.55, 0.26]} scale={[0.18, 0.1, 0.04]}>
                                <boxGeometry />{accentMat}
                            </mesh>
                        ))}
                        {/* Volume slider */}
                        <mesh position={[0.72, 0, 0]} scale={[0.05, 0.6, 0.3]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        {/* Slider knob */}
                        <mesh position={[0.76, 0.1, 0]}>
                            <sphereGeometry args={[0.06, 12, 12]} />{glowMat}
                        </mesh>
                        {/* Headphone jack */}
                        <mesh position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />{accentMat}
                        </mesh>
                        {/* Status LED */}
                        <mesh position={[-0.5, -0.8, 0.26]}>
                            <sphereGeometry args={[0.04, 8, 8]} />{glowMat}
                        </mesh>
                    </group>
                );

            // ── CAMERA (Leica Ghost Edition) ──
            // Rangefinder: body, lens barrel, viewfinder, hotshoe, controls
            case "camera":
                return (
                    <group rotation={[0.05, 0.3, 0]} {...props}>
                        {/* Main body */}
                        <mesh castShadow><boxGeometry args={[2.0, 1.2, 0.7]} />{mat}</mesh>
                        {/* Grip side */}
                        <mesh position={[0.8, -0.1, 0.1]} scale={[0.45, 1.0, 0.85]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        {/* Lens barrel outer */}
                        <mesh position={[-0.15, 0, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.42, 0.45, 0.5, 32]} />{mat}
                        </mesh>
                        {/* Lens barrel inner */}
                        <mesh position={[-0.15, 0, 0.75]} rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.35, 0.38, 0.3, 32]} />{accentMat}
                        </mesh>
                        {/* Front glass element */}
                        <mesh position={[-0.15, 0, 0.92]} rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.32, 0.32, 0.03, 32]} />{glassMat}
                        </mesh>
                        {/* Viewfinder bump */}
                        <mesh position={[0.45, 0.65, -0.1]} scale={[0.5, 0.2, 0.35]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        {/* Viewfinder eye piece */}
                        <mesh position={[0.45, 0.65, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />{glassMat}
                        </mesh>
                        {/* Hotshoe */}
                        <mesh position={[0, 0.63, 0]} scale={[0.6, 0.06, 0.3]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        {/* Shutter button */}
                        <mesh position={[0.65, 0.65, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />{glowMat}
                        </mesh>
                        {/* Film advance lever */}
                        <mesh position={[0.8, 0.63, 0]} rotation={[0, -0.4, 0]}>
                            <boxGeometry args={[0.4, 0.05, 0.08]} />{accentMat}
                        </mesh>
                        {/* Focus ring groove lines */}
                        {[0, 0.08, -0.08].map((y, i) => (
                            <mesh key={i} position={[-0.15, y, 0.62]} rotation={[Math.PI / 2, 0, 0]}>
                                <torusGeometry args={[0.4, 0.008, 4, 48]} />{accentMat}
                            </mesh>
                        ))}
                    </group>
                );

            // ── SYNTH (TE OP-3 BRUTE) ──
            // Brutalist synth: slab body, keys, knobs, small screen, speaker grille
            case "synth":
                return (
                    <group rotation={[-0.25, 0.15, 0]} {...props}>
                        {/* Main body slab */}
                        <mesh castShadow><boxGeometry args={[3.2, 0.2, 1.4]} />{mat}</mesh>
                        {/* Angled back */}
                        <mesh position={[0, 0.15, -0.55]} rotation={[0.3, 0, 0]} scale={[3.2, 0.08, 0.4]}>
                            <boxGeometry />{mat}
                        </mesh>
                        {/* Keys - 2 octaves */}
                        {Array.from({ length: 16 }).map((_, i) => {
                            const x = (i - 7.5) * 0.185;
                            const isBlack = [1, 3, 6, 8, 10, 13].includes(i);
                            return (
                                <mesh key={i} position={[x, isBlack ? 0.18 : 0.14, 0.35]}
                                    scale={[0.15, isBlack ? 0.08 : 0.06, isBlack ? 0.35 : 0.5]}>
                                    <boxGeometry />{isBlack ? accentMat : whiteMat}
                                </mesh>
                            );
                        })}
                        {/* Knob row */}
                        {[-1.0, -0.6, -0.2, 0.2, 0.6, 1.0].map((x, i) => (
                            <group key={i} position={[x, 0.12, -0.35]}>
                                <mesh rotation={[Math.PI / 2, 0, 0]}>
                                    <cylinderGeometry args={[0.06, 0.06, 0.08, 16]} />{accentMat}
                                </mesh>
                                <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
                                    <cylinderGeometry args={[0.01, 0.01, 0.1, 4]} />{glowMat}
                                </mesh>
                            </group>
                        ))}
                        {/* Mini OLED screen */}
                        <mesh position={[1.25, 0.12, -0.35]}>
                            <boxGeometry args={[0.4, 0.04, 0.25]} />{glowMat}
                        </mesh>
                        {/* Speaker grille (left) */}
                        <mesh position={[-1.4, 0.12, -0.1]}>
                            <cylinderGeometry args={[0.15, 0.15, 0.04, 16]} />{accentMat}
                        </mesh>
                    </group>
                );

            // ── WATCH (Braun AW10 1989) ──
            // Classic minimalist: round case, numbered dial, band, crown
            case "watch":
                return (
                    <group rotation={[0.2, 0.3, 0.1]} {...props}>
                        {/* Case */}
                        <mesh rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.9, 0.9, 0.2, 64]} />{mat}
                        </mesh>
                        {/* Bezel ring */}
                        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                            <torusGeometry args={[0.88, 0.04, 8, 64]} />{accentMat}
                        </mesh>
                        {/* Crystal glass */}
                        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.11]}>
                            <cylinderGeometry args={[0.82, 0.82, 0.03, 64]} />{glassMat}
                        </mesh>
                        {/* Dial face */}
                        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.09]}>
                            <cylinderGeometry args={[0.78, 0.78, 0.01, 64]} />{whiteMat}
                        </mesh>
                        {/* Hour markers */}
                        {Array.from({ length: 12 }).map((_, i) => {
                            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
                            return (
                                <mesh key={i} position={[Math.cos(a) * 0.65, Math.sin(a) * 0.65, 0.1]}
                                    scale={i % 3 === 0 ? [0.06, 0.12, 0.02] : [0.03, 0.08, 0.02]}>
                                    <boxGeometry />{accentMat}
                                </mesh>
                            );
                        })}
                        {/* Hour hand */}
                        <mesh position={[0, 0.18, 0.1]} scale={[0.03, 0.35, 0.015]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        {/* Minute hand */}
                        <mesh position={[0.2, 0.1, 0.1]} rotation={[0, 0, -0.8]} scale={[0.02, 0.5, 0.015]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        {/* Crown */}
                        <mesh position={[0.95, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.08, 0.1, 0.15, 16]} />{accentMat}
                        </mesh>
                        {/* Top strap */}
                        <mesh position={[0, 1.3, -0.02]} scale={[0.5, 0.9, 0.1]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        {/* Bottom strap */}
                        <mesh position={[0, -1.3, -0.02]} scale={[0.5, 0.9, 0.1]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        {/* Strap buckle */}
                        <mesh position={[0, -1.8, 0]} scale={[0.35, 0.08, 0.12]}>
                            <boxGeometry />{mat}
                        </mesh>
                    </group>
                );

            // ── KEYBOARD (Keychron Q1 HE Carbon) ──
            // Mech keyboard: angled body, keycaps grid, rgb strip, USB port
            case "keyboard":
                return (
                    <group rotation={[-0.15, 0.2, 0]} {...props}>
                        {/* Main case */}
                        <mesh castShadow position={[0, 0, 0]}>
                            <boxGeometry args={[3.4, 0.25, 1.4]} />{mat}
                        </mesh>
                        {/* Front lip */}
                        <mesh position={[0, -0.05, 0.65]}>
                            <boxGeometry args={[3.4, 0.15, 0.15]} />{mat}
                        </mesh>
                        {/* Keycap rows - 5 rows × 14 keys */}
                        {Array.from({ length: 5 }).map((_, row) =>
                            Array.from({ length: 14 }).map((_, col) => {
                                const x = (col - 6.5) * 0.23;
                                const z = (row - 2) * 0.22;
                                return (
                                    <mesh key={`${row}-${col}`} position={[x, 0.17, z]}
                                        scale={[0.19, 0.06, 0.18]}>
                                        <boxGeometry />{accentMat}
                                    </mesh>
                                );
                            })
                        )}
                        {/* Spacebar */}
                        <mesh position={[0, 0.17, 0.5]} scale={[1.2, 0.06, 0.18]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        {/* RGB underglow strip */}
                        <mesh position={[0, -0.13, 0.7]}>
                            <boxGeometry args={[3.2, 0.02, 0.04]} />{glowMat}
                        </mesh>
                        {/* USB-C port */}
                        <mesh position={[0, 0.05, -0.71]} rotation={[Math.PI / 2, 0, 0]}>
                            <capsuleGeometry args={[0.03, 0.08, 4, 8]} />{accentMat}
                        </mesh>
                        {/* Feet angle bumps */}
                        <mesh position={[-1.3, -0.15, -0.55]} scale={[0.2, 0.08, 0.08]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        <mesh position={[1.3, -0.15, -0.55]} scale={[0.2, 0.08, 0.08]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                    </group>
                );

            // ── DRONE (DJI Avata Pro X) ──  
            // FPV drone: central body, 4 ducted props, front camera, antennas
            case "drone":
                return (
                    <group rotation={[0.2, 0.4, 0.05]} {...props}>
                        {/* Central body */}
                        <mesh castShadow>
                            <boxGeometry args={[0.8, 0.35, 0.8]} />{mat}
                        </mesh>
                        {/* Body rounded top */}
                        <mesh position={[0, 0.15, 0]} scale={[0.75, 0.15, 0.75]}>
                            <sphereGeometry args={[1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />{mat}
                        </mesh>
                        {/* 4 ducted propeller guards */}
                        {[[-0.7, 0, -0.7], [0.7, 0, -0.7], [-0.7, 0, 0.7], [0.7, 0, 0.7]].map((pos, i) => (
                            <group key={i} position={pos as [number, number, number]}>
                                {/* Duct ring */}
                                <mesh rotation={[Math.PI / 2, 0, 0]}>
                                    <torusGeometry args={[0.38, 0.05, 8, 24]} />{mat}
                                </mesh>
                                {/* Propeller blades */}
                                <mesh rotation={[0, Math.PI / 4, 0]} scale={[0.6, 0.015, 0.06]}>
                                    <boxGeometry />{accentMat}
                                </mesh>
                                <mesh rotation={[0, -Math.PI / 4, 0]} scale={[0.6, 0.015, 0.06]}>
                                    <boxGeometry />{accentMat}
                                </mesh>
                                {/* Motor hub */}
                                <mesh rotation={[Math.PI / 2, 0, 0]}>
                                    <cylinderGeometry args={[0.06, 0.06, 0.08, 12]} />{accentMat}
                                </mesh>
                                {/* Arm connecting to body */}
                                <mesh position={[pos[0] > 0 ? -0.25 : 0.25, 0, pos[2] > 0 ? -0.25 : 0.25]}
                                    scale={[0.12, 0.1, 0.12]}
                                    rotation={[0, Math.atan2(pos[2], pos[0]) + Math.PI, 0]}>
                                    <boxGeometry />{mat}
                                </mesh>
                            </group>
                        ))}
                        {/* Front camera gimbal */}
                        <mesh position={[0, -0.08, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />{accentMat}
                        </mesh>
                        <mesh position={[0, -0.08, 0.52]} rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />{glassMat}
                        </mesh>
                        {/* Rear LED */}
                        <mesh position={[0, 0.05, -0.42]}>
                            <boxGeometry args={[0.3, 0.04, 0.02]} />{glowMat}
                        </mesh>
                        {/* Antennas */}
                        <mesh position={[-0.25, 0.25, -0.3]} scale={[0.02, 0.2, 0.02]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        <mesh position={[0.25, 0.25, -0.3]} scale={[0.02, 0.2, 0.02]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                    </group>
                );

            // ── ESPRESSO (La Marzocco Linea Mini-S) ──
            // Espresso machine: body, group head, portafilter, drip tray, gauge
            case "espresso":
                return (
                    <group rotation={[0.05, 0.35, 0]} {...props}>
                        {/* Main body */}
                        <mesh castShadow><boxGeometry args={[1.6, 1.6, 1.3]} />{mat}</mesh>
                        {/* Top plate */}
                        <mesh position={[0, 0.85, 0]} scale={[1.7, 0.08, 1.4]}>
                            <boxGeometry />{mat}
                        </mesh>
                        {/* Cup rail */}
                        <mesh position={[0, 0.92, 0]}>
                            <boxGeometry args={[1.5, 0.04, 0.04]} />{accentMat}
                        </mesh>
                        {/* Group head (front) */}
                        <mesh position={[0, 0.2, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.25, 0.28, 0.2, 24]} />{accentMat}
                        </mesh>
                        {/* Portafilter handle */}
                        <mesh position={[0, -0.1, 0.75]} rotation={[0.3, 0, 0]}>
                            <capsuleGeometry args={[0.04, 0.5, 4, 12]} />{accentMat}
                        </mesh>
                        {/* Portafilter basket */}
                        <mesh position={[0, 0.0, 0.75]} rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.2, 0.15, 0.1, 24]} />{accentMat}
                        </mesh>
                        {/* Steam wand */}
                        <mesh position={[0.65, 0.1, 0.6]} rotation={[0.5, 0, 0.1]}>
                            <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />{accentMat}
                        </mesh>
                        {/* Steam wand tip */}
                        <mesh position={[0.68, -0.15, 0.85]}>
                            <sphereGeometry args={[0.04, 8, 8]} />{accentMat}
                        </mesh>
                        {/* Drip tray */}
                        <mesh position={[0, -0.85, 0.3]}>
                            <boxGeometry args={[1.4, 0.06, 0.8]} />{accentMat}
                        </mesh>
                        {/* Pressure gauge */}
                        <mesh position={[-0.5, 0.55, 0.66]} rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />{glassMat}
                        </mesh>
                        <mesh position={[-0.5, 0.55, 0.68]} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.11, 0.01, 4, 24]} />{accentMat}
                        </mesh>
                        {/* Power indicator */}
                        <mesh position={[0.55, 0.55, 0.66]}>
                            <sphereGeometry args={[0.04, 8, 8]} />{glowMat}
                        </mesh>
                    </group>
                );

            // ── SPEAKER (B&O Beosound Glass) ──
            // Cylindrical glass speaker: transparent body, driver visible, base
            case "speaker":
                return (
                    <group rotation={[0, 0.2, 0]} {...props}>
                        {/* Outer glass cylinder */}
                        <mesh castShadow>
                            <cylinderGeometry args={[0.7, 0.85, 2.4, 32, 1, true]} />{glassMat}
                        </mesh>
                        {/* Inner aluminum core */}
                        <mesh>
                            <cylinderGeometry args={[0.35, 0.35, 2.0, 32]} />{mat}
                        </mesh>
                        {/* Top driver */}
                        <mesh position={[0, 1.0, 0]}>
                            <cylinderGeometry args={[0.6, 0.6, 0.08, 32]} />{accentMat}
                        </mesh>
                        {/* Driver dome */}
                        <mesh position={[0, 1.06, 0]} scale={[0.5, 0.15, 0.5]}>
                            <sphereGeometry args={[1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />{mat}
                        </mesh>
                        {/* Bottom base - weighted */}
                        <mesh position={[0, -1.25, 0]}>
                            <cylinderGeometry args={[0.9, 0.9, 0.15, 32]} />{accentMat}
                        </mesh>
                        {/* LED ring on base */}
                        <mesh position={[0, -1.15, 0]} rotation={[0, 0, 0]}>
                            <torusGeometry args={[0.85, 0.015, 4, 64]} />{glowMat}
                        </mesh>
                        {/* Mid-range driver ring */}
                        <mesh position={[0, 0, 0]}>
                            <torusGeometry args={[0.5, 0.03, 8, 32]} />{accentMat}
                        </mesh>
                        {/* Sound waveguide slots */}
                        {[0.5, 0, -0.5].map((y, i) => (
                            <mesh key={i} position={[0, y, 0]} rotation={[0, (i * Math.PI) / 3, 0]}>
                                <torusGeometry args={[0.36, 0.008, 4, 32]} />{glowMat}
                            </mesh>
                        ))}
                    </group>
                );

            // ── SUITCASE (Rimowa Cabin Titanium) ──
            // Hard-shell case: ribbed body, telescopic handle, wheels, latches
            case "suitcase":
                return (
                    <group rotation={[0.05, 0.3, 0]} {...props}>
                        {/* Main shell */}
                        <mesh castShadow><boxGeometry args={[1.3, 1.9, 0.55]} />{mat}</mesh>
                        {/* Ribbed texture lines */}
                        {Array.from({ length: 8 }).map((_, i) => (
                            <mesh key={i} position={[0, (i - 3.5) * 0.22, 0.285]}>
                                <boxGeometry args={[1.28, 0.02, 0.02]} />{accentMat}
                            </mesh>
                        ))}
                        {/* Top telescopic handle */}
                        <mesh position={[-0.25, 1.05, 0]} scale={[0.06, 0.2, 0.3]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        <mesh position={[0.25, 1.05, 0]} scale={[0.06, 0.2, 0.3]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        <mesh position={[0, 1.18, 0]} scale={[0.55, 0.08, 0.15]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        {/* Wheels */}
                        {[[-0.5, -1.0, 0.25], [0.5, -1.0, 0.25], [-0.5, -1.0, -0.25], [0.5, -1.0, -0.25]].map((pos, i) => (
                            <mesh key={i} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
                                <cylinderGeometry args={[0.08, 0.08, 0.05, 12]} />{accentMat}
                            </mesh>
                        ))}
                        {/* TSA lock latches */}
                        <mesh position={[-0.35, 0.5, 0.3]} scale={[0.2, 0.08, 0.04]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        <mesh position={[0.35, 0.5, 0.3]} scale={[0.2, 0.08, 0.04]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        {/* Side handle */}
                        <mesh position={[0.68, 0, 0]} scale={[0.08, 0.35, 0.1]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        {/* Brand badge */}
                        <mesh position={[0, 0.75, 0.29]} scale={[0.3, 0.06, 0.01]}>
                            <boxGeometry />{glowMat}
                        </mesh>
                    </group>
                );

            // ── SHELL (Arcteryx Dune Shell / Jacket) ──
            // Technical jacket: torso shell, hood, zipper, arm segments
            case "shell":
                return (
                    <group rotation={[0, 0.2, 0]} {...props}>
                        {/* Torso */}
                        <mesh castShadow position={[0, 0, 0]}>
                            <capsuleGeometry args={[0.7, 0.8, 8, 24]} />{mat}
                        </mesh>
                        {/* Hood */}
                        <mesh position={[0, 1.15, -0.15]} scale={[0.65, 0.55, 0.65]}>
                            <sphereGeometry args={[1, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.7]} />{mat}
                        </mesh>
                        {/* Hood brim */}
                        <mesh position={[0, 1.15, 0.3]} rotation={[0.3, 0, 0]} scale={[0.55, 0.08, 0.3]}>
                            <boxGeometry />{mat}
                        </mesh>
                        {/* Left arm */}
                        <mesh position={[-0.9, 0.2, 0]} rotation={[0, 0, 0.4]}>
                            <capsuleGeometry args={[0.2, 0.7, 6, 16]} />{mat}
                        </mesh>
                        {/* Right arm */}
                        <mesh position={[0.9, 0.2, 0]} rotation={[0, 0, -0.4]}>
                            <capsuleGeometry args={[0.2, 0.7, 6, 16]} />{mat}
                        </mesh>
                        {/* Center zipper */}
                        <mesh position={[0, 0, 0.72]} scale={[0.03, 1.4, 0.02]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        {/* Zipper pull */}
                        <mesh position={[0, 0.5, 0.74]}>
                            <boxGeometry args={[0.06, 0.1, 0.03]} />{glowMat}
                        </mesh>
                        {/* Chest pocket zipper */}
                        <mesh position={[0.35, 0.35, 0.68]} rotation={[0, 0, 0.1]}>
                            <boxGeometry args={[0.3, 0.02, 0.02]} />{accentMat}
                        </mesh>
                        {/* Hem drawcord */}
                        <mesh position={[-0.4, -0.6, 0.55]}>
                            <sphereGeometry args={[0.03, 6, 6]} />{accentMat}
                        </mesh>
                        <mesh position={[0.4, -0.6, 0.55]}>
                            <sphereGeometry args={[0.03, 6, 6]} />{accentMat}
                        </mesh>
                    </group>
                );

            // ── BOARD (Dyson Sonic Board / Hover board) ──
            // Futuristic levitation board: deck, air vents, LED strips, foot pads
            case "board":
                return (
                    <group rotation={[0.15, 0.3, 0.05]} {...props}>
                        {/* Main deck */}
                        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
                            <capsuleGeometry args={[0.35, 3.0, 16, 32]} />{mat}
                        </mesh>
                        {/* Deck top surface */}
                        <mesh position={[0, 0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
                            <capsuleGeometry args={[0.28, 2.8, 8, 16]} />{accentMat}
                        </mesh>
                        {/* Foot pad left */}
                        <mesh position={[-0.8, 0.22, 0]} scale={[0.5, 0.04, 0.5]}>
                            <boxGeometry />{glowMat}
                        </mesh>
                        {/* Foot pad right */}
                        <mesh position={[0.8, 0.22, 0]} scale={[0.5, 0.04, 0.5]}>
                            <boxGeometry />{glowMat}
                        </mesh>
                        {/* Air vents underneath */}
                        {[-1.0, -0.4, 0.2, 0.8].map((x, i) => (
                            <mesh key={i} position={[x, -0.25, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
                                <torusGeometry args={[0.15, 0.02, 4, 16]} />{accentMat}
                            </mesh>
                        ))}
                        {/* LED strip along edge */}
                        <mesh position={[0, 0, 0.38]} rotation={[0, 0, Math.PI / 2]}>
                            <capsuleGeometry args={[0.015, 2.8, 4, 8]} />{glowMat}
                        </mesh>
                        <mesh position={[0, 0, -0.38]} rotation={[0, 0, Math.PI / 2]}>
                            <capsuleGeometry args={[0.015, 2.8, 4, 8]} />{glowMat}
                        </mesh>
                        {/* Front & rear bumpers */}
                        <mesh position={[-1.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.12, 0.12, 0.6, 12]} />{accentMat}
                        </mesh>
                        <mesh position={[1.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.1, 0.1, 0.5, 12]} />{accentMat}
                        </mesh>
                    </group>
                );

            // ── CONSOLE (Nintendo Super Famicom V2) ──
            // Retro console: flat body, cartridge slot, buttons, controller ports
            case "console":
                return (
                    <group rotation={[0.1, 0.25, 0]} {...props}>
                        {/* Main body */}
                        <mesh castShadow><boxGeometry args={[2.2, 0.4, 1.6]} />{mat}</mesh>
                        {/* Top surface color accent */}
                        <mesh position={[0, 0.22, 0]}>
                            <boxGeometry args={[2.15, 0.02, 1.55]} />{whiteMat}
                        </mesh>
                        {/* Cartridge slot */}
                        <mesh position={[0, 0.25, -0.2]}>
                            <boxGeometry args={[1.0, 0.08, 0.15]} />{accentMat}
                        </mesh>
                        {/* Eject button */}
                        <mesh position={[-0.6, 0.25, -0.5]} scale={[0.25, 0.06, 0.12]}>
                            <boxGeometry />{glowMat}
                        </mesh>
                        {/* Power/Reset buttons */}
                        <mesh position={[0.55, 0.25, -0.5]} scale={[0.15, 0.06, 0.12]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        <mesh position={[0.8, 0.25, -0.5]} scale={[0.15, 0.06, 0.12]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        {/* Front controller ports */}
                        {[-0.4, 0.4].map((x, i) => (
                            <mesh key={i} position={[x, 0.05, 0.82]} rotation={[Math.PI / 2, 0, 0]}>
                                <cylinderGeometry args={[0.1, 0.1, 0.05, 8]} />{accentMat}
                            </mesh>
                        ))}
                        {/* Logo area center */}
                        <mesh position={[0, 0.24, 0.3]} scale={[0.4, 0.02, 0.15]}>
                            <boxGeometry />{glowMat}
                        </mesh>
                        {/* Color accent stripes (SNES style) */}
                        <mesh position={[0, 0.24, 0.55]} scale={[2.1, 0.01, 0.08]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        {/* Ventilation slots on side */}
                        {[-0.3, 0, 0.3].map((z, i) => (
                            <mesh key={i} position={[-1.12, 0.1, z]} scale={[0.02, 0.15, 0.12]}>
                                <boxGeometry />{accentMat}
                            </mesh>
                        ))}
                    </group>
                );

            // ── CHAIR (Herman Miller Aeron Extreme) ──
            // Ergonomic office chair: mesh seat, headrest, adjustable arms, star base
            case "chair":
                return (
                    <group position={[0, -0.2, 0]} rotation={[0, 0.3, 0]} {...props}>
                        {/* Seat frame */}
                        <mesh position={[0, 0.5, 0.1]}>
                            <boxGeometry args={[1.3, 0.08, 1.2]} />{accentMat}
                        </mesh>
                        {/* Seat mesh surface */}
                        <mesh position={[0, 0.55, 0.1]}>
                            <boxGeometry args={[1.2, 0.03, 1.1]} />{mat}
                        </mesh>
                        {/* Backrest frame */}
                        <mesh position={[0, 1.35, -0.45]} rotation={[-0.12, 0, 0]}>
                            <boxGeometry args={[1.15, 1.35, 0.06]} />{accentMat}
                        </mesh>
                        {/* Backrest mesh */}
                        <mesh position={[0, 1.35, -0.42]} rotation={[-0.12, 0, 0]}>
                            <boxGeometry args={[1.05, 1.25, 0.02]} />{mat}
                        </mesh>
                        {/* Lumbar support pad */}
                        <mesh position={[0, 0.85, -0.38]} rotation={[-0.12, 0, 0]} scale={[0.8, 0.2, 0.06]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        {/* Left armrest */}
                        <mesh position={[-0.7, 0.75, 0.1]} scale={[0.08, 0.5, 0.08]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        <mesh position={[-0.7, 1.0, 0.15]} scale={[0.15, 0.04, 0.35]}>
                            <boxGeometry />{mat}
                        </mesh>
                        {/* Right armrest */}
                        <mesh position={[0.7, 0.75, 0.1]} scale={[0.08, 0.5, 0.08]}>
                            <boxGeometry />{accentMat}
                        </mesh>
                        <mesh position={[0.7, 1.0, 0.15]} scale={[0.15, 0.04, 0.35]}>
                            <boxGeometry />{mat}
                        </mesh>
                        {/* Center post */}
                        <mesh>
                            <cylinderGeometry args={[0.06, 0.08, 1.0, 8]} />{accentMat}
                        </mesh>
                        {/* Star base - 5 legs */}
                        {Array.from({ length: 5 }).map((_, i) => {
                            const a = (i / 5) * Math.PI * 2;
                            return (
                                <group key={i}>
                                    <mesh position={[Math.cos(a) * 0.45, -0.5, Math.sin(a) * 0.45]}
                                        rotation={[0, -a, Math.PI / 2]}>
                                        <capsuleGeometry args={[0.03, 0.4, 4, 8]} />{accentMat}
                                    </mesh>
                                    {/* Caster wheel */}
                                    <mesh position={[Math.cos(a) * 0.7, -0.55, Math.sin(a) * 0.7]}
                                        rotation={[0, 0, Math.PI / 2]}>
                                        <sphereGeometry args={[0.05, 8, 8]} />{accentMat}
                                    </mesh>
                                </group>
                            );
                        })}
                    </group>
                );

            // ── EARBUDS (Nothing Ear Zero) ──
            // Transparent earbuds case: pill case, visible internals, LED
            case "earbuds":
                return (
                    <group rotation={[0.3, 0.2, 0.1]} {...props}>
                        {/* Case body */}
                        <mesh castShadow>
                            <capsuleGeometry args={[0.5, 0.4, 16, 32]} />{glassMat}
                        </mesh>
                        {/* Case interior visible */}
                        <mesh>
                            <capsuleGeometry args={[0.42, 0.3, 8, 16]} />{accentMat}
                        </mesh>
                        {/* Lid seam line */}
                        <mesh rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.5, 0.01, 4, 32]} />{accentMat}
                        </mesh>
                        {/* Left earbud well */}
                        <mesh position={[-0.18, 0.15, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />{accentMat}
                        </mesh>
                        {/* Right earbud well */}
                        <mesh position={[0.18, 0.15, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />{accentMat}
                        </mesh>
                        {/* Left earbud (visible through glass) */}
                        <mesh position={[-0.18, 0.15, 0.38]}>
                            <sphereGeometry args={[0.12, 12, 12]} />{mat}
                        </mesh>
                        {/* Right earbud */}
                        <mesh position={[0.18, 0.15, 0.38]}>
                            <sphereGeometry args={[0.12, 12, 12]} />{mat}
                        </mesh>
                        {/* LED indicator */}
                        <mesh position={[0, -0.05, 0.52]}>
                            <sphereGeometry args={[0.03, 8, 8]} />{glowMat}
                        </mesh>
                        {/* USB-C port */}
                        <mesh position={[0, -0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <capsuleGeometry args={[0.03, 0.08, 4, 8]} />{accentMat}
                        </mesh>
                        {/* Internal circuit traces (decorative) */}
                        <mesh position={[0, -0.1, 0.3]} rotation={[0.8, 0, 0]}>
                            <boxGeometry args={[0.4, 0.005, 0.15]} />{glowMat}
                        </mesh>
                    </group>
                );

            default:
                return <mesh castShadow {...props}><boxGeometry args={[1, 1, 1]} />{mat}</mesh>;
        }
    };

    return <group ref={groupRef} scale={[0, 0, 0]}>{renderModel()}</group>;
}
