export const GUIDE_PRODUCT_TYPE = "digital-guide";
export const GUIDE_ID = "lean-athletic-physique-guide";
export const GUIDE_VERSION = "3";
export const GUIDE_LIST_PRICE_CENTS = 4999;
export const GUIDE_LAUNCH_PRICE_CENTS = 2999;
export const GUIDE_LAUNCH_OFFER_ENDS_AT = "2026-09-08T06:59:59.000Z";
export const GUIDE_LAUNCH_OFFER_CODE = "LAUNCH29";
export const GUIDE_PRICE_CENTS = GUIDE_LIST_PRICE_CENTS;
export const GUIDE_CURRENCY = "usd";
export const GUIDE_TITLE = "The Lean, Athletic Physique Guide";
export const GUIDE_FILE_NAME =
  "twigthetics-lean-athletic-physique-guide-v3-abe-seth.pdf";

export function isGuideCheckoutMetadata(
  metadata: Record<string, string> | null | undefined,
) {
  return (
    metadata?.productType === GUIDE_PRODUCT_TYPE &&
    metadata?.guideId === GUIDE_ID
  );
}

export function formatGuidePrice(priceCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceCents / 100);
}

export function getGuideOffer(now = Date.now()) {
  const offerEndsAt = new Date(GUIDE_LAUNCH_OFFER_ENDS_AT);
  const isLaunchOfferActive = now <= offerEndsAt.getTime();
  const priceCents = isLaunchOfferActive
    ? GUIDE_LAUNCH_PRICE_CENTS
    : GUIDE_LIST_PRICE_CENTS;

  return {
    priceCents,
    formattedPrice: formatGuidePrice(priceCents),
    listPriceCents: GUIDE_LIST_PRICE_CENTS,
    formattedListPrice: formatGuidePrice(GUIDE_LIST_PRICE_CENTS),
    isLaunchOfferActive,
    offerCode: isLaunchOfferActive ? GUIDE_LAUNCH_OFFER_CODE : null,
    offerEndsAt: GUIDE_LAUNCH_OFFER_ENDS_AT,
  };
}

export function isAcceptedGuideCheckoutAmount(
  amountTotal: number | null,
  metadata: Record<string, string> | null | undefined,
) {
  if (typeof amountTotal !== "number") {
    return false;
  }

  const metadataAmount = Number(metadata?.chargedPriceCents || "");

  if (Number.isInteger(metadataAmount) && metadataAmount > 0) {
    return amountTotal === metadataAmount;
  }

  return [GUIDE_LIST_PRICE_CENTS, GUIDE_LAUNCH_PRICE_CENTS].includes(amountTotal);
}
