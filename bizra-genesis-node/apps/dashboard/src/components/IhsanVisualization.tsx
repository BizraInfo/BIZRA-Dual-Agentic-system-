'use client';

/**
 * BIZRA Sacred Dashboard - Ihsan Score Visualization
 * Document ID: BIZRA-DASHBOARD-v1.0.0-IHSAN
 *
 * Dignity-first Ihsan score visualization with trend analysis and real-time updates.
 * Shows ethical alignment metrics with elegant visual design.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Shield, Heart } from 'lucide-react';
import { useGenesisSynapse, getIhsanColor } from '@/hooks/useGenesisSynapse';

interface IhsanPoint {
    timestamp: number;
    score: number;
    latency: number;
}

interface TrendIndicatorProps {
    current: number;
    previous: number;
}

const TrendIndicator = ({ current, previous }: TrendIndicatorProps) => {
    const diff = current - previous;
    const isPositive = diff > 0;
    const isNeutral = Math.abs(diff) < 0.001;

    if (isNeutral) {
        return (
            <div className="flex items-center gap-1 text-gray-400">
                <Minus className="w-3 h-3" />
                <span className="text-xs">Stable</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? (
                <TrendingUp className="w-3 h-3" />
            ) : (
                <TrendingDown className="w-3 h-3" />
            )}
            <span className="text-xs">
                {isPositive ? '+' : ''}{(diff * 100).toFixed(1)}%
            </span>
        </div>
    );
};

interface ScoreRingProps {
    score: number;
    size?: number;
}

const ScoreRing = ({ score, size = 120 }: ScoreRingProps) => {
    const percentage = score * 100;
    const circumference = 2 * Math.PI * (size / 2 - 8);
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getRingColor = () => {
        if (score >= 0.9) return '#10B981'; // green-500
        if (score >= 0.85) return '#3B82F6'; // blue-500
        if (score >= 0.8) return '#F59E0B'; // amber-500
        if (score >= 0.7) return '#F97316'; // orange-500
        return '#EF4444'; // red-500
    };

    return (
        <div className="relative">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={size / 2 - 8}
                    stroke="#1F2937"
                    strokeWidth="4"
                    fill="none"
                />
                {/* Progress ring */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={size / 2 - 8}
                    stroke={getRingColor()}
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    initial={{ strokeDashoffset: strokeDasharray }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    strokeLinecap="round"
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`text-2xl font-bold ${getIhsanColor(score)}`}>
                    {(score * 100).toFixed(0)}
                </div>
                <div className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
                    Ihsan
                </div>
            </div>
        </div>
    );
};

interface MiniChartProps {
    data: IhsanPoint[];
    height?: number;
}

const MiniChart = ({ data, height = 40 }: MiniChartProps) => {
    if (data.length < 2) return null;

    const scores = data.map(d => d.score);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const range = maxScore - minScore || 1;

    const points = data.map((point, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((point.score - minScore) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width="100%" height={height} className="overflow-visible">
            <polyline
                points={points}
                fill="none"
                stroke="#C9A962"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default function IhsanVisualization() {
    const { synapse, connected } = useGenesisSynapse();
    const [history, setHistory] = useState<IhsanPoint[]>([]);
    const [previousScore, setPreviousScore] = useState<number>(0);

    // Maintain Ihsan score history
    useEffect(() => {
        if (synapse?.ihsanScore !== undefined) {
            const newPoint: IhsanPoint = {
                timestamp: Date.now(),
                score: synapse.ihsanScore,
                latency: synapse.latencyUs,
            };

            setHistory(prev => {
                const updated = [...prev, newPoint];
                // Keep last 50 points for trend analysis
                return updated.slice(-50);
            });

            setPreviousScore(synapse.ihsanScore);
        }
    }, [synapse]);

    if (!connected || !synapse) {
        return (
            <div className="bg-[#0A1628]/40 border border-white/5 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-5 h-5 text-[#C9A962] animate-pulse" />
                    <h3 className="text-sm font-medium text-white">Ihsan Score</h3>
                </div>
                <div className="text-center py-8">
                    <div className="text-white/40 text-sm">Connecting to telemetry stream...</div>
                </div>
            </div>
        );
    }

    const currentScore = synapse.ihsanScore;
    const scorePercentage = (currentScore * 100).toFixed(1);

    return (
        <motion.div
            className="bg-[#0A1628]/40 border border-white/5 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#C9A962]/10 rounded-lg">
                        <Heart className="w-5 h-5 text-[#C9A962]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">Ihsan Score</h3>
                        <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
                            Ethical Alignment
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <div className={`text-lg font-bold ${getIhsanColor(currentScore)}`}>
                        {scorePercentage}%
                    </div>
                    <TrendIndicator current={currentScore} previous={previousScore} />
                </div>
            </div>

            {/* Score Ring */}
            <div className="flex justify-center mb-6">
                <ScoreRing score={currentScore} />
            </div>

            {/* Trend Chart */}
            {history.length > 1 && (
                <div className="mb-4">
                    <div className="text-[10px] text-white/40 font-mono uppercase tracking-wider mb-2">
                        Trend (Last {history.length} Updates)
                    </div>
                    <div className="bg-[#050B14]/50 rounded-lg p-3">
                        <MiniChart data={history} />
                    </div>
                </div>
            )}

            {/* Additional Metrics */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#050B14]/30 rounded-lg p-3 text-center">
                    <div className="text-[10px] text-white/40 font-mono uppercase tracking-wider mb-1">
                        Latency
                    </div>
                    <div className="text-sm font-mono text-white">
                        {synapse.latencyUs < 1000
                            ? `${synapse.latencyUs}μs`
                            : `${(synapse.latencyUs / 1000).toFixed(1)}ms`
                        }
                    </div>
                </div>

                <div className="bg-[#050B14]/30 rounded-lg p-3 text-center">
                    <div className="text-[10px] text-white/40 font-mono uppercase tracking-wider mb-1">
                        Consensus
                    </div>
                    <div className={`text-sm font-mono uppercase tracking-wider ${synapse.consensusState === 'STABLE' ? 'text-green-400' :
                            synapse.consensusState === 'PENDING' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                        {synapse.consensusState}
                    </div>
                </div>
            </div>

            {/* Dignity Message */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="text-center">
                    <div className="text-[10px] text-[#C9A962]/60 font-mono uppercase tracking-wider mb-1">
                        Dignity Status
                    </div>
                    <div className="text-xs text-white/60 leading-relaxed">
                        {currentScore >= 0.9
                            ? "Exemplary ethical alignment maintained"
                            : currentScore >= 0.8
                                ? "Strong ethical foundation present"
                                : "Attention needed for ethical optimization"
                        }
                    </div>
                </div>
            </div>
        </motion.div>
    );
}