/**
 * Living Tree Component
 *
 * Animated visualization of BIZRA knowledge graph
 * - Roots: Quran + Hadith (6,236 + 34,178 = 40,414 nodes)
 * - Trunk: Your 3-year vision (221 insights)
 * - Branches: 44 knowledge domains
 * - Leaves: Individual insights, growing in real-time
 *
 * Philosophy: "From roots to tree, from vision to reality"
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useGraphStats } from '@/lib/live-data';
import { Sparkles, TrendingUp } from 'lucide-react';

interface TreeNode {
  id: string;
  x: number;
  y: number;
  size: number;
  category: 'quran' | 'hadith' | 'insight' | 'vision' | 'philosophy' | 'technical';
  label?: string;
  opacity: number;
}

interface TreeBranch {
  from: { x: number; y: number };
  to: { x: number; y: number };
  width: number;
  opacity: number;
}

const COLORS = {
  quran: '#fcbf49',    // Gold
  hadith: '#4ecdc4',   // Cyan
  insight: '#aa96da',  // Purple
  vision: '#ff6b6b',   // Red
  philosophy: '#95e1d3', // Light cyan
  technical: '#f38181', // Light red
};

export function LivingTree() {
  const { data: stats, isLoading } = useGraphStats();
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [branches, setBranches] = useState<TreeBranch[]>([]);
  const [hoveredNode, setHoveredNode] = useState<TreeNode | null>(null);
  const [showPulse, setShowPulse] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Generate tree structure based on live data
  const generateTree = useCallback((statsData: typeof stats) => {
    if (!statsData) return { nodes: [], branches: [] };

    const centerX = 400;
    const baseY = 550;
    const newNodes: TreeNode[] = [];
    const newBranches: TreeBranch[] = [];

    // ROOT: Quran (center bottom)
    const rootNode = {
      id: 'root-quran',
      x: centerX,
      y: baseY,
      size: 35,
      category: 'quran' as const,
      label: 'القرآن الكريم',
      opacity: 1,
    };
    newNodes.push(rootNode);

    // FIRST LEVEL: Hadith collections (2 main branches)
    const hadithLeft = {
      id: 'hadith-left',
      x: centerX - 150,
      y: baseY - 100,
      size: 25,
      category: 'hadith' as const,
      label: 'Hadith',
      opacity: 0.9,
    };

    const hadithRight = {
      id: 'hadith-right',
      x: centerX + 150,
      y: baseY - 100,
      size: 25,
      category: 'hadith' as const,
      opacity: 0.9,
    };

    newNodes.push(hadithLeft, hadithRight);
    newBranches.push(
      {
        from: { x: rootNode.x, y: rootNode.y },
        to: { x: hadithLeft.x, y: hadithLeft.y },
        width: 4,
        opacity: 0.7,
      },
      {
        from: { x: rootNode.x, y: rootNode.y },
        to: { x: hadithRight.x, y: hadithRight.y },
        width: 4,
        opacity: 0.7,
      }
    );

    // SECOND LEVEL: Insights (distributed across categories)
    const categories = statsData.categories || {};
    const totalInsights = statsData.insights || 221;
    const visibleInsights = Math.min(totalInsights, 80); // Cap for performance

    for (let i = 0; i < visibleInsights; i++) {
      const angle = (i / visibleInsights) * Math.PI * 2 - Math.PI;
      const tier = Math.floor(i / 20);
      const radius = 180 + tier * 60 + Math.random() * 30;

      const x = centerX + Math.cos(angle) * radius;
      const y = baseY - 150 - Math.abs(Math.sin(angle)) * (100 + tier * 40);

      // Determine category based on proportion
      let category: typeof nodes[0]['category'] = 'insight';
      const rand = Math.random() * totalInsights;
      if (rand < (categories.vision || 9)) category = 'vision';
      else if (rand < (categories.vision || 9) + (categories.philosophy || 9)) category = 'philosophy';
      else if (rand < (categories.vision || 9) + (categories.philosophy || 9) + (categories.technical || 8)) category = 'technical';

      const node: TreeNode = {
        id: `insight-${i}`,
        x,
        y,
        size: 4 + Math.random() * 6,
        category,
        opacity: 0.6 + Math.random() * 0.4,
      };

      newNodes.push(node);

      // Connect to nearest parent (hadith node)
      const parentNode = x < centerX ? hadithLeft : hadithRight;
      newBranches.push({
        from: { x: parentNode.x, y: parentNode.y },
        to: { x: node.x, y: node.y },
        width: 1 + Math.random(),
        opacity: 0.3 + Math.random() * 0.2,
      });
    }

    return { nodes: newNodes, branches: newBranches };
  }, []);

  // Update tree when stats change
  useEffect(() => {
    if (!stats) return;

    const { nodes: newNodes, branches: newBranches } = generateTree(stats);
    setNodes(newNodes);
    setBranches(newBranches);

    // Show pulse animation when data updates
    setShowPulse(true);
    setTimeout(() => setShowPulse(false), 1000);
  }, [stats, generateTree]);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw branches first (behind nodes)
      branches.forEach(branch => {
        ctx.strokeStyle = `rgba(252, 191, 73, ${branch.opacity * 0.5})`;
        ctx.lineWidth = branch.width;
        ctx.beginPath();
        ctx.moveTo(branch.from.x, branch.from.y);
        ctx.lineTo(branch.to.x, branch.to.y);
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach(node => {
        const color = COLORS[node.category];
        const isHovered = hoveredNode?.id === node.id;

        // Glow effect for hovered node
        if (isHovered) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = color;
        }

        ctx.fillStyle = color;
        ctx.globalAlpha = node.opacity;
        ctx.beginPath();
        ctx.arc(node.x, node.y, isHovered ? node.size * 1.3 : node.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Draw label for root and hadith nodes
        if (node.label) {
          ctx.fillStyle = '#fff';
          ctx.font = node.category === 'quran' ? 'bold 18px Amiri, serif' : '14px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(node.label, node.x, node.y + node.size + 8);
        }
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes, branches, hoveredNode]);

  // Handle mouse interaction
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find node under cursor
    const found = nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < node.size;
    });

    setHoveredNode(found || null);
  }, [nodes]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-bizra-accent animate-pulse">Growing the tree...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
      />

      {/* Live stats overlay */}
      <AnimatePresence>
        {showPulse && (
          <motion.div
            className="absolute top-4 right-4 bg-bizra-accent/20 backdrop-blur-sm rounded-full p-2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <Sparkles className="w-5 h-5 text-bizra-gold" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-xl p-5 border border-bizra-accent/30 shadow-2xl"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-bizra-gold animate-pulse" />
            <span className="text-bizra-text-secondary text-xs uppercase tracking-wide">
              Live Data
            </span>
          </div>

          <div>
            <div className="text-bizra-accent font-bold text-3xl tabular-nums">
              {stats?.total_nodes.toLocaleString()}
            </div>
            <div className="text-bizra-text-secondary text-xs mt-1">
              Nodes in House of Wisdom
            </div>
          </div>

          <div className="h-px bg-bizra-accent/20 my-3" />

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-bizra-text-secondary">Quranic Verses</span>
              <span className="text-bizra-gold font-semibold">
                {stats?.quranic_verses.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-bizra-text-secondary">Hadith</span>
              <span className="text-bizra-accent font-semibold">
                {stats?.hadith_count.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-bizra-text-secondary">Insights</span>
              <span className="text-bizra-vision font-semibold flex items-center gap-1">
                {stats?.insights.toLocaleString()}
                <TrendingUp className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hovered node tooltip */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-bizra-accent/30 max-w-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[hoveredNode.category] }}
              />
              <span className="text-sm font-semibold capitalize">
                {hoveredNode.category}
              </span>
            </div>
            {hoveredNode.label && (
              <div className="text-bizra-text-primary">
                {hoveredNode.label}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md rounded-lg p-4 border border-bizra-accent/20">
        <div className="text-xs text-bizra-text-secondary mb-2 uppercase tracking-wide">
          Categories
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(COLORS).map(([category, color]) => (
            <div key={category} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="capitalize">{category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
