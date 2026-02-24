/**
 * Daily Insight Component
 *
 * Displays a daily insight from the knowledge graph
 * Changes once per day based on day-of-year
 * Allows users to bookmark and share insights
 *
 * Philosophy: "Indeed, in the creation of the heavens and the earth and the alternation
 *             of the night and the day are signs for those of understanding" (Quran 3:190)
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDailyInsight } from '@/lib/live-data';
import {
  Sparkles,
  Share2,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export function DailyInsight() {
  const { data: insight, isLoading, mutate } = useDailyInsight();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // In production, save to localStorage or user profile
    if (typeof window !== 'undefined') {
      const bookmarks = JSON.parse(localStorage.getItem('bizra-bookmarks') || '[]');
      if (!isBookmarked) {
        bookmarks.push(insight?.id);
        localStorage.setItem('bizra-bookmarks', JSON.stringify(bookmarks));
      } else {
        const filtered = bookmarks.filter((id: string) => id !== insight?.id);
        localStorage.setItem('bizra-bookmarks', JSON.stringify(filtered));
      }
    }
  };

  const handleCopy = async () => {
    if (!insight) return;

    const text = `${insight.header}\n\n${insight.content}\n\n— Source: ${insight.source}\nvia BIZRA House of Wisdom`;

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (!insight) return;

    setIsSharing(true);

    if (navigator.share) {
      try {
        await navigator.share({
          title: insight.header,
          text: insight.content,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback: copy link
      await handleCopy();
    }

    setIsSharing(false);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      vision: 'text-bizra-vision',
      philosophy: 'text-bizra-philosophy',
      technical: 'text-bizra-technical',
      learning: 'text-bizra-gold',
      insight: 'text-bizra-accent',
    };
    return colors[category as keyof typeof colors] || 'text-bizra-accent';
  };

  const getCategoryBg = (category: string) => {
    const colors = {
      vision: 'bg-bizra-vision/10',
      philosophy: 'bg-bizra-philosophy/10',
      technical: 'bg-bizra-technical/10',
      learning: 'bg-bizra-gold/10',
      insight: 'bg-bizra-accent/10',
    };
    return colors[category as keyof typeof colors] || 'bg-bizra-accent/10';
  };

  if (isLoading || !insight) {
    return (
      <div className="animate-pulse bg-gradient-to-br from-bizra-secondary to-bizra-primary rounded-2xl h-80 border border-bizra-accent/20" />
    );
  }

  return (
    <motion.div
      className="relative bg-gradient-to-br from-bizra-secondary via-bizra-primary to-bizra-secondary/50 rounded-2xl p-6 border border-bizra-accent/20 shadow-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Header */}
      <div className="relative flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2 rounded-xl bg-bizra-gold/20"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="w-6 h-6 text-bizra-gold" />
          </motion.div>
          <div>
            <h3 className="text-sm font-semibold text-bizra-text-secondary uppercase tracking-wider">
              Daily Insight
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs px-2 py-1 rounded-md ${getCategoryBg(insight.category)} ${getCategoryColor(insight.category)} font-medium capitalize`}
              >
                {insight.category}
              </span>
              <span className="text-xs text-bizra-text-secondary">
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleCopy}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Copy to clipboard"
          >
            <AnimatePresence mode="wait">
              {isCopied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-4 h-4 text-green-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy className="w-4 h-4 text-bizra-text-secondary" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            onClick={handleShare}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSharing}
            title="Share"
          >
            <Share2 className="w-4 h-4 text-bizra-text-secondary" />
          </motion.button>

          <motion.button
            onClick={handleBookmark}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 text-bizra-gold" />
            ) : (
              <Bookmark className="w-4 h-4 text-bizra-text-secondary" />
            )}
          </motion.button>

          <motion.button
            onClick={() => mutate()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-bizra-text-secondary" />
          </motion.button>
        </div>
      </div>

      {/* Arabic text (if available) */}
      {insight.arabic && (
        <motion.div
          className="text-right mb-6 text-3xl font-amiri text-bizra-gold leading-loose px-4 py-3 bg-black/20 rounded-xl border border-bizra-gold/10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {insight.arabic}
        </motion.div>
      )}

      {/* Insight header */}
      <motion.h2
        className="text-2xl font-bold text-bizra-accent mb-4 leading-tight"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {insight.header}
      </motion.h2>

      {/* Insight content */}
      <motion.p
        className="text-bizra-text-primary leading-relaxed mb-6 text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {insight.content}
      </motion.p>

      {/* Footer metadata */}
      <motion.div
        className="flex items-center justify-between text-sm text-bizra-text-secondary border-t border-bizra-accent/10 pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          <span>Source: {insight.source}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            Confidence:
            <span className="text-bizra-gold font-semibold">
              {(insight.confidence * 100).toFixed(0)}%
            </span>
          </span>

          {insight.word_count && (
            <span className="text-bizra-text-secondary/60">
              {insight.word_count} words
            </span>
          )}

          {insight.contains_arabic && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-bizra-gold/20 text-bizra-gold">
              العربية
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
