"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useContentRow } from "@/hooks/useContentRow";
import { ContentRow, ContentRowVariant } from "./content-row";
import { ContentRowSkeleton } from "./content-row-skeleton";

export interface ContentRowLoaderProps {
  rowId: string;
  title: string;
  href: string;
  minCount?: number;
  variant?: ContentRowVariant;
  enrich?: boolean;
  hide?: boolean;
}

/**
 * Client-side component that loads a content row with a guaranteed minimum number of items
 */
export function ContentRowLoader({
  rowId,
  title,
  href,
  minCount = 20,
  variant = "standard",
  enrich = false,
  hide = false,
}: ContentRowLoaderProps) {
  const { items, isLoading, error } = useContentRow({
    rowId,
    count: minCount,
    enrich,
    hide,
  });

  if (hide) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key={`skeleton-${rowId}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <ContentRowSkeleton
            title={title}
            href={href}
            count={Math.min(minCount, 10)}
            variant={variant}
          />
        </motion.div>
      ) : error ? (
        <motion.div
          key={`error-${rowId}`}
          className="space-y-4 py-4 px-4 md:px-6 lg:px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-red-500 text-sm">
            Failed to load {title}: {error.message}
          </div>
        </motion.div>
      ) : items.length === 0 ? (
        <motion.div
          key={`empty-${rowId}`}
          className="space-y-4 py-4 px-4 md:px-6 lg:px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-muted-foreground text-sm">
            No content available for {title}
          </div>
        </motion.div>
      ) : (
        <motion.section
          key={`content-${rowId}`}
          id={rowId}
          className="my-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <ContentRow
            title={title}
            items={items}
            href={href}
            variant={variant}
          />
        </motion.section>
      )}
    </AnimatePresence>
  );
}
