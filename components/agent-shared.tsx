'use client';

import { motion } from 'framer-motion';

/**
 * Shared-element layout primitives for agents.
 * Each motion element with a stable `layoutId` will smoothly morph
 * between any two pages that mount it. Agents grid → profile uses
 * this so the agent name + card frame transition fluidly.
 */

export function AgentCardName({
  slug,
  className = '',
  children,
}: {
  slug: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.span layoutId={`agent-name-${slug}`} className={className}>
      {children}
    </motion.span>
  );
}

export function AgentCardFrame({
  slug,
  className = '',
  children,
}: {
  slug: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div layoutId={`agent-frame-${slug}`} className={className}>
      {children}
    </motion.div>
  );
}
