"use client";

import React from "react";

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
    retryKey: number;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, retryKey: 0 };
    }

    static getDerivedStateFromError(): Partial<State> {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("[ErrorBoundary] 3D render error:", error, info);
    }

    handleRetry = () => {
        this.setState(prev => ({ hasError: false, retryKey: prev.retryKey + 1 }));
    };

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback ?? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#F5F4F0]">
                        <div className="text-center space-y-4 p-8">
                            <div className="w-16 h-16 mx-auto border-4 border-[#1C1C1C] flex items-center justify-center font-black text-2xl">
                                ⚠
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-[#1C1C1C]/60">
                                3D Engine Unavailable
                            </p>
                            <button
                                onClick={this.handleRetry}
                                className="px-6 py-2 bg-[#1C1C1C] text-white text-xs font-black uppercase tracking-widest"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )
            );
        }

        return (
            <React.Fragment key={this.state.retryKey}>
                {this.props.children}
            </React.Fragment>
        );
    }
}
