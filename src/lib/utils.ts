import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const calculateDiff = (base: number, scen: number) => {
  if (base === 0) return 0;
  return ((scen - base) / base) * 100;
};
