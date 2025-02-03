export const TIER_COLORS = [
  {
    bg: "bg-red-100",
    border: "border-red-200",
  },
  {
    bg: "bg-red-200",
    border: "border-red-300",
  },
  {
    bg: "bg-gray-100",
    border: "border-gray-200",
  },
  {
    bg: "bg-gray-200",
    border: "border-gray-300",
  },
  {
    bg: "bg-red-50",
    border: "border-red-100",
  },
] as const;

export const getTierColor = (index: number) => {
  return TIER_COLORS[index % TIER_COLORS.length];
}; 