import { getAssetUrl } from "@/lib/storage/url";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function getStorageUrl(bucket: string, path: string | null | undefined) {
  return getAssetUrl(path, bucket) ?? undefined
}
