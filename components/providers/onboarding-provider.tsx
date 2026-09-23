"use client";

import type { ReactNode } from "react";

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider = ({ children }: OnboardingProviderProps) => {
  return <>{children}</>;
};
