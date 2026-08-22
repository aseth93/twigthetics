export const GUIDE_PRODUCT_TYPE = "digital-guide";
export const GUIDE_ID = "lean-athletic-physique-guide";
export const GUIDE_VERSION = "3";
export const GUIDE_PRICE_CENTS = 4999;
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
