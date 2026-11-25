import { brickRows, type BrickRow } from "@/shared/lib/brickRows";
import type { SearchConsoleTabId } from "../searchConsoleTabs";

const TABLE_ROW = 52;

const HEADLINE: BrickRow = { height: 84 };
const CHART: BrickRow = { height: 340 };

export const OVERVIEW_ROWS: BrickRow[] = [
  HEADLINE,
  { height: 158, cols: 4 },
  CHART,
  { height: 300 },
  { height: 320, cols: 2 },
];

export const INSIGHTS_ROWS: BrickRow[] = [HEADLINE, { height: 170 }, { height: 420, split: "lead" }];

export const BREAKDOWN_ROWS: BrickRow[] = [{ height: 40 }, ...brickRows(8, TABLE_ROW)];

export const DEVICES_ROWS: BrickRow[] = [{ height: 400, split: "trail" }];

export const VITALS_ROWS: BrickRow[] = [HEADLINE, { height: 170, cols: 5 }, CHART, ...brickRows(4, TABLE_ROW)];

export const INDEXING_ROWS: BrickRow[] = [HEADLINE, { height: 110, cols: 4 }, ...brickRows(6, TABLE_ROW)];

export const LINKS_ROWS: BrickRow[] = [{ height: 40 }, { height: 110, cols: 5 }, { height: 280 }, { height: 280, cols: 2 }];

export const SITEMAPS_ROWS: BrickRow[] = [{ height: 110 }, ...brickRows(4, 68)];

export const TABLE_ROWS: BrickRow[] = brickRows(5, TABLE_ROW);

export const PROPERTY_PICKER_ROWS: BrickRow[] = [{ height: 440, split: "trail" }];

export const QUERY_SHEET_ROWS: BrickRow[] = [{ height: 110, cols: 2 }, { height: 110, cols: 2 }, { height: 220 }, ...brickRows(4, TABLE_ROW)];

const CONSOLE_HEAD: BrickRow[] = [{ height: 48 }, { height: 40 }];

const TAB_ROWS: Record<SearchConsoleTabId, BrickRow[]> = {
  overview: OVERVIEW_ROWS,
  insights: INSIGHTS_ROWS,
  queries: BREAKDOWN_ROWS,
  pages: BREAKDOWN_ROWS,
  countries: BREAKDOWN_ROWS,
  devices: DEVICES_ROWS,
  appearance: BREAKDOWN_ROWS,
  vitals: VITALS_ROWS,
  indexing: INDEXING_ROWS,
  links: LINKS_ROWS,
  sitemaps: SITEMAPS_ROWS,
};

export function consoleRows(tab: SearchConsoleTabId): BrickRow[] {
  return [...CONSOLE_HEAD, ...TAB_ROWS[tab]];
}
