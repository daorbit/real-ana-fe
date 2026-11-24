const LABELS: Record<string, string> = {
  AMP_BLUE_LINK: "AMP page",
  AMP_TOP_STORIES: "AMP top stories",
  EDU_Q_AND_A: "Education Q&A",
  FORUMS: "Discussions and forums",
  JOB_DETAILS: "Job details",
  JOB_LISTING: "Job listing",
  MERCHANT_LISTINGS: "Merchant listings",
  ORGANIC_SHOPPING: "Shopping listings",
  PRODUCT_SNIPPETS: "Product snippets",
  RECIPE_FEATURE: "Recipe gallery",
  RECIPE_RICH_SNIPPET: "Recipe rich result",
  REVIEW_SNIPPET: "Review snippet",
  RICHCARD: "Rich results",
  TPF_QA: "Q&A rich result",
  TRANSLATED_RESULT: "Translated results",
  VIDEO: "Video",
};

export function humanizeCode(value: string): string {
  return value.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export function appearanceLabel(code: string): string {
  return LABELS[code] ?? humanizeCode(code);
}
