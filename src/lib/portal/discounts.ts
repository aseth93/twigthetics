import Stripe from "stripe";
import { FRIEND_DISCOUNT_CODE } from "./discount-codes";

const FRIEND_DISCOUNT_COUPON_ID = "twigthetics_frnd_50_off_monthly";
const FRIEND_DISCOUNT_AMOUNT_OFF_CENTS = 5000;
const FRIEND_DISCOUNT_CURRENCY = "usd";

function isResourceMissing(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "resource_missing"
  );
}

export async function ensureFriendDiscountPromotionCode(stripe: Stripe) {
  const existingPromotionCodes = await stripe.promotionCodes.list({
    code: FRIEND_DISCOUNT_CODE,
    active: true,
    limit: 10,
  });

  const existingPromotionCode = existingPromotionCodes.data[0];

  if (existingPromotionCode) {
    return existingPromotionCode.id;
  }

  let coupon: Stripe.Coupon;

  try {
    coupon = await stripe.coupons.retrieve(FRIEND_DISCOUNT_COUPON_ID);
  } catch (error) {
    if (!isResourceMissing(error)) {
      throw error;
    }

    coupon = await stripe.coupons.create({
      id: FRIEND_DISCOUNT_COUPON_ID,
      amount_off: FRIEND_DISCOUNT_AMOUNT_OFF_CENTS,
      currency: FRIEND_DISCOUNT_CURRENCY,
      duration: "forever",
      name: "FRND $50 off monthly",
      metadata: {
        code: FRIEND_DISCOUNT_CODE,
        source: "twigthetics",
      },
    });
  }

  try {
    const promotionCode = await stripe.promotionCodes.create({
      code: FRIEND_DISCOUNT_CODE,
      promotion: {
        type: "coupon",
        coupon: coupon.id,
      },
      metadata: {
        source: "twigthetics",
      },
    });

    return promotionCode.id;
  } catch (error) {
    const retryPromotionCodes = await stripe.promotionCodes.list({
      code: FRIEND_DISCOUNT_CODE,
      active: true,
      limit: 10,
    });
    const retryPromotionCode = retryPromotionCodes.data[0];

    if (retryPromotionCode) {
      return retryPromotionCode.id;
    }

    throw error;
  }
}
