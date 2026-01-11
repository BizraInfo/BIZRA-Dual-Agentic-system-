'use client';

/**
 * BIZRA Sacred Dashboard - Real-time Physics Telemetry Display
 * Document ID: BIZRA-DASHBOARD-v1.0.0-PHYSICS
 *
 * Dignity-first physics telemetry visualization with real-time updates.
 * Shows CPU, memory, and GPU usage with elegant visual indicators.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, HardDrive, Zap, Activity } from 'lucide-react';
import { useGenesisSynapse } from '@/hooks/useGenesisSynapse';

interface TelemetryBarProps {
    label: string;
    value: number;
    maxValue: number;
    color: string;
    icon: React.ReactNode;
    unit: string;
}

const TelemetryBar = ({ label, value, maxValue, color, icon, unit }: TelemetryBarProps) => {
    const percentage = Math.min((value / maxValue) * 100, 100);

    return (
        <div className="bg-[#0A1628]/40 border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${color.replace('text-', 'bg-').replace('-500', '-500/20')}`}>
                        {icon}
                    </div>
                    <span className="text-xs font-mono text-white/60 uppercase tracking-wider">
                        {label}
                    </span>
                </div>
                <div className="text-right">
                    <div className="text-sm font-mono text-white">
                        {value.toFixed(1)}{unit}
                    </div>
                    <div className="text-[10px] text-white/40">
                        {percentage.toFixed(0)}%
                    </div>
                </div>
            </div>

            <div className="relative">
                <div className="h-2 bg-[#050B14] rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full ${color.replace('text-', 'bg-')} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>

                {/* Pulse effect for high usage */}
                <AnimatePresence>
                    {percentage > 80 && (
                        <motion.div
                            className="absolute inset-0 h-2 bg-gradient-to-r from-transparent via-red-500/30 to-transparent rounded-full"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            exit={{ x: '100%' }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

interface ServiceStatusProps {
    name: string;
    status: 'healthy' | 'unhealthy' | 'unknown';
}

const ServiceStatus = ({ name, status }: ServiceStatusProps) => {
    const getStatusColor = () => {
        switch (status) {
            case 'healthy': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'unhealthy': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
        }
    };

    return (
        <motion.div
            className={`px-3 py-1 rounded-full border text-xs font-mono ${getStatusColor()}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {name}: {status}
        </motion.div>
    );
};

export default function PhysicsTelemetry() {
    const { synapse, connected } = useGenesisSynapse();
    const [history, setHistory] = useState<Array<{
        timestamp: number;
        cpu: number;
        memory: number;
        gpu: number | null;
    }>>([]);

    // Maintain rolling history for smooth animations
    useEffect(() => {
        if (synapse?.resources) {
            const newPoint = {
                timestamp: Date.now(),
                cpu: synapse.resources.cpuUsage,
                memory: synapse.resources.memoryUsage,
                gpu: synapse.resources.gpuUsage,
            };

            setHistory(prev => {
                const updated = [...prev, newPoint];
                // Keep last 20 points for smooth transitions
                return updated.slice(-20);
            });
        }
    }, [synapse]);

    if (!connected || !synapse) {
        return (
            <div className="bg-[#0A1628]/40 border border-white/5 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-5 h-5 text-yellow-500 animate-pulse" />
                    <h3 className="text-sm font-medium text-white">Physics Telemetry</h3>
                </div>
                <div className="text-center py-8">
                    <div className="text-white/40 text-sm">Connecting to telemetry stream...</div>
                </div>
            </div>
        );
    }

    const { resources, services } = synapse;

    return (
        <motion.div
            className="bg-[#0A1628]/40 border border-white/5 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#C9A962]/10 rounded-lg">
                    <Activity className="w-5 h-5 text-[#C9A962]" />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white">Physics Telemetry</h3>
                    <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
                        Real-time System Resources
                    </p>
                </div>
                <div className="ml-auto px-2 py-0.5 text-[8px] border border-[#C9A962]/30 text-[#C9A962] rounded font-mono">
                    OWNERSHIP CERTIFIED: NODE0
                </div>
            </div>

            {/* Resource Bars */}
            <div className="space-y-4 mb-6">
                <TelemetryBar
                    label="CPU Usage"
                    value={resources.cpuUsage}
                    maxValue={100}
                    color="text-blue-500"
                    icon={<Cpu className="w-4 h-4 text-blue-500" />}
                    unit="%"
                />

                <TelemetryBar
                    label="Memory Usage"
                    value={resources.memoryUsage}
                    maxValue={100}
                    color="text-purple-500"
                    icon={<HardDrive className="w-4 h-4 text-purple-500" />}
                    unit="%"
                />

                {resources.gpuUsage !== null && (
                    <TelemetryBar
                        label="GPU Usage"
                        value={resources.gpuUsage}
                        maxValue={100}
                        color="text-green-500"
                        icon={<Zap className="w-4 h-4 text-green-500" />}
                        unit="%"
                    />
                )}
            </div>

            {/* Service Status */}
            <div>
                <div className="text-[10px] text-white/40 font-mono uppercase tracking-wider mb-3">
                    Service Health
                </div>
                <div className="flex flex-wrap gap-2">
                    <ServiceStatus name="PostgreSQL" status={services.postgres} />
                    <ServiceStatus name="Redis" status={services.redis} />
                    <ServiceStatus name="Ollama" status={services.ollama} />
                    <ServiceStatus name="Neo4j" status={services.neo4j} />
                </div>
            </div>

            {/* Connection Status */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-white/40">NODE STATUS</span>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-400 uppercase tracking-wider">
                            {synapse.consensusState}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}