import { countryLabel } from "@/shared/lib";
import { ALPHA3_CODES, alpha3ToAlpha2 } from "@/shared/lib/countryCodes";
import type { SearchFilter, SearchFilterDimension, SearchFilterOperator, SearchType } from "@/shared/types";
import { deviceMeta } from "./deviceMeta";
import { appearanceLabel } from "./searchAppearance";
import { typeHasQueries } from "./searchMetrics";

type Option<T extends string = string> = { value: T; label: string };

const TEXT_OPERATORS: Option<SearchFilterOperator>[] = [
  { value: "contains", label: "contains" },
  { value: "notContains", label: "doesn't contain" },
  { value: "equals", label: "is exactly" },
  { value: "notEquals", label: "is not" },
  { value: "includingRegex", label: "matches regex" },
  { value: "excludingRegex", label: "doesn't match regex" },
];

const CHOICE_OPERATORS: Option<SearchFilterOperator>[] = [
  { value: "equals", label: "is" },
  { value: "notEquals", label: "is not" },
];

const ONLY_EQUALS: Option<SearchFilterOperator>[] = [{ value: "equals", label: "is" }];

const BRAND_OPTIONS: Option[] = [
  { value: "BRANDED", label: "Branded" },
  { value: "NON_BRANDED", label: "Non-branded" },
];

const DEVICE_OPTIONS: Option[] = ["MOBILE", "DESKTOP", "TABLET"].map((value) => ({
  value,
  label: deviceMeta(value).label,
}));

function countryOptions(): Option[] {
  return ALPHA3_CODES.map((code) => ({ value: code.toLowerCase(), label: countryLabel(alpha3ToAlpha2(code)) })).sort(
    (a, b) => a.label.localeCompare(b.label),
  );
}

type FilterField = {
  label: string;
  operators: Option<SearchFilterOperator>[];
  options?: () => Option[];
  placeholder?: string;
  needsQueries?: boolean;
  single?: boolean;
};

export const FILTER_FIELDS: Record<SearchFilterDimension, FilterField> = {
  query: { label: "Query", operators: TEXT_OPERATORS, placeholder: "pricing", needsQueries: true },
  page: { label: "Page", operators: TEXT_OPERATORS, placeholder: "/blog/" },
  country: { label: "Country", operators: CHOICE_OPERATORS, options: countryOptions, single: true },
  device: { label: "Device", operators: CHOICE_OPERATORS, options: () => DEVICE_OPTIONS, single: true },
  brandedClassification: {
    label: "Brand",
    operators: ONLY_EQUALS,
    options: () => BRAND_OPTIONS,
    needsQueries: true,
    single: true,
  },
  searchAppearance: { label: "Appearance", operators: ONLY_EQUALS, single: true },
};

export const MENU_FIELDS: SearchFilterDimension[] = ["query", "page", "country", "device", "brandedClassification"];

const CONFLICTS: Partial<Record<SearchFilterDimension, SearchFilterDimension>> = {
  query: "brandedClassification",
  brandedClassification: "query",
};

export function fieldAllowed(dimension: SearchFilterDimension, type: SearchType): boolean {
  return typeHasQueries(type) || !FILTER_FIELDS[dimension].needsQueries;
}

export function addFilter(filters: SearchFilter[], next: SearchFilter): SearchFilter[] {
  const conflict = CONFLICTS[next.dimension];
  const single = FILTER_FIELDS[next.dimension].single;
  const kept = filters.filter(
    (f) =>
      f.dimension !== conflict &&
      !(f.dimension === next.dimension && (single || (f.operator === next.operator && f.expression === next.expression))),
  );
  return [...kept, next];
}

function valueLabel({ dimension, expression }: SearchFilter): string {
  if (dimension === "searchAppearance") return appearanceLabel(expression);
  if (dimension === "country") return countryLabel(alpha3ToAlpha2(expression));
  const option = FILTER_FIELDS[dimension].options?.().find((o) => o.value === expression);
  return option?.label ?? expression;
}

export function filterLabel(filter: SearchFilter): string {
  const field = FILTER_FIELDS[filter.dimension];
  const operator = field.operators.find((o) => o.value === filter.operator)?.label ?? "is";
  return `${field.label} ${operator} ${valueLabel(filter)}`;
}
