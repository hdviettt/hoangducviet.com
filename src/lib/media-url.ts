const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";

export function getMediaUrl(filename: string): string {
  return `${R2_PUBLIC_URL}/${filename}`;
}
