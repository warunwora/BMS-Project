export async function getTierData(tierId) {
  const response = await fetch(`/api/tiers/${tierId}`);
  if (!response.ok) throw new Error("Failed to fetch tier data");
  return response.json();
}

export async function getAllTiers() {
  const response = await fetch("/api/tiers");
  if (!response.ok) throw new Error("Failed to fetch tiers");
  return response.json();
}

export async function calculateDiscount(subtotal, tierId) {
  if (!tierId) return 0;
  const tier = await getTierData(tierId);
  return (subtotal * (tier.discount_percentage || 0)) / 100;
}

export async function calculatePoints(netAmount, tierId) {
  if (!tierId) return 0;
  const tier = await getTierData(tierId);
  const multiplier = tier.point_multiplier || 1;
  return Math.ceil(netAmount * multiplier);
}

export async function calculateDiscountAndPoints(subtotal, tierId) {
  if (!tierId) return { discount: 0, points: 0 };
  const tier = await getTierData(tierId);
  const discount = (subtotal * (tier.discount_percentage || 0)) / 100;
  const netAmount = subtotal - discount;
  const points = Math.ceil(netAmount * (tier.point_multiplier || 1));
  return { discount, points, netAmount };
}
