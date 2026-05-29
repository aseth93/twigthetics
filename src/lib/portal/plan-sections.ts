export const PLAN_SECTION_KEYS = [
  "training",
  "nutrition",
  "supplements",
  "cardio",
  "misc",
] as const;

export type PlanSectionKey = (typeof PLAN_SECTION_KEYS)[number];

export type PlanSections = Record<PlanSectionKey, string>;

export const PLAN_SECTION_LABELS: Record<PlanSectionKey, string> = {
  training: "Training plan",
  nutrition: "Nutrition plan",
  supplements: "Supplement plan",
  cardio: "Cardio",
  misc: "Misc",
};

const PLAN_SERIALIZER_MARKER = "[TWIGTHETICS_PLAN_V1]";

function emptySections(): PlanSections {
  return {
    training: "",
    nutrition: "",
    supplements: "",
    cardio: "",
    misc: "",
  };
}

export function serializePlanSections(sections: Partial<PlanSections>) {
  const normalized = PLAN_SECTION_KEYS.reduce<PlanSections>((accumulator, key) => {
    accumulator[key] = sections[key]?.trim() || "";
    return accumulator;
  }, emptySections());

  const bodyParts = [PLAN_SERIALIZER_MARKER];

  PLAN_SECTION_KEYS.forEach((key) => {
    bodyParts.push(`## ${PLAN_SECTION_LABELS[key]}`);
    bodyParts.push(normalized[key] || "Not set yet.");
  });

  return bodyParts.join("\n\n").trim();
}

export function parsePlanSections(body: string): {
  sections: PlanSections;
  isStructured: boolean;
} {
  const normalizedBody = body.trim();

  if (!normalizedBody) {
    return {
      sections: emptySections(),
      isStructured: false,
    };
  }

  const sections = emptySections();
  const isStructured = normalizedBody.includes(PLAN_SERIALIZER_MARKER);

  if (!isStructured) {
    sections.training = normalizedBody;
    return {
      sections,
      isStructured: false,
    };
  }

  const withoutMarker = normalizedBody.replace(PLAN_SERIALIZER_MARKER, "").trim();
  const matches = withoutMarker.matchAll(
    /##\s+(Training plan|Nutrition plan|Supplement plan|Cardio|Misc)\s+([\s\S]*?)(?=\n##\s+|$)/g,
  );

  for (const match of matches) {
    const [, label, content] = match;
    const key = (
      Object.entries(PLAN_SECTION_LABELS).find(([, value]) => value === label)?.[0] ||
      "misc"
    ) as PlanSectionKey;
    const value = content.trim();
    sections[key] = value === "Not set yet." ? "" : value;
  }

  return {
    sections,
    isStructured: true,
  };
}

export function getPlanSectionPreview(sections: PlanSections) {
  for (const key of PLAN_SECTION_KEYS) {
    const value = sections[key].trim();

    if (value) {
      return value;
    }
  }

  return "";
}

export function getPopulatedPlanSectionKeys(sections: PlanSections) {
  return PLAN_SECTION_KEYS.filter((key) => sections[key].trim().length > 0);
}
