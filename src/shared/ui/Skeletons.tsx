import type { ReactNode } from "react";
import { Box, Card, Grid, Group, Skeleton, SimpleGrid, Stack } from "@mantine/core";
import { SwitchVisual } from "@/shared/ui/SwitchOverlay";
import classes from "./Skeletons.module.css";

const LABEL_WIDTHS = ["62%", "48%", "70%", "40%", "56%", "44%", "52%", "36%"];

const WAVE_LINE = "M0 34 C 12 30, 20 22, 32 24 S 52 32, 64 26 S 84 12, 96 16 S 116 26, 128 18 S 148 8, 160 12 L 200 6";
const WAVE_FILL = `${WAVE_LINE} L 200 48 L 0 48 Z`;

function SkeletonWave({ className }: { className?: string }) {
  return (
    <svg className={`${classes.wave} ${className ?? ""}`} viewBox="0 0 200 48" preserveAspectRatio="none" aria-hidden>
      <path d={WAVE_FILL} className={classes.waveFill} />
      <path d={WAVE_LINE} className={classes.waveLine} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function StatCardSkeleton({ spark = true, footer = false }: { spark?: boolean; footer?: boolean }) {
  return (
    <div className={classes.stat}>
      <div className={classes.statBody}>
        <div className={classes.statHead}>
          <Group gap={8} wrap="nowrap">
            <Skeleton height={16} width={16} radius={5} />
            <Skeleton height={10} width={70} radius="sm" />
          </Group>
          <Skeleton height={10} width={44} radius="sm" />
        </div>
        <Skeleton height={30} width="46%" mt={18} radius={8} />
        <Skeleton height={9} width="58%" mt={10} radius="sm" />
      </div>
      {spark && (
        <div className={classes.statSpark}>
          <SkeletonWave />
        </div>
      )}
      {footer && (
        <div className={classes.statFooter}>
          <Skeleton height={6} radius="xl" />
          <Skeleton height={9} width="72%" radius="sm" />
        </div>
      )}
    </div>
  );
}

export function SkeletonCard({ children }: { children: ReactNode }) {
  return <div className={classes.card}>{children}</div>;
}

const PANEL_CHROME = 104;
const PANEL_ROW = 48;
const PANEL_MAX_ROWS = 10;

export function PanelSkeleton({ height, className }: { height: number; className?: string }) {
  const rows = Math.min(PANEL_MAX_ROWS, Math.floor((height - PANEL_CHROME) / PANEL_ROW));
  return (
    <Box className={`${classes.card} ${className ?? ""}`} mih={height} aria-hidden>
      {rows > 0 ? (
        <>
          <SkeletonCardHead />
          <SkeletonRows rows={rows} aside={false} />
        </>
      ) : (
        <div className={classes.compact}>
          <div className={classes.headText}>
            <Skeleton height={12} width={160} radius="sm" />
            <Skeleton height={9} width={240} maw="100%" radius="sm" />
          </div>
          <Skeleton height={28} width={84} radius={8} />
        </div>
      )}
    </Box>
  );
}

export function HeroListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className={classes.card}>
      <div className={classes.head}>
        <Skeleton height={12} width={72} radius="sm" />
        <Skeleton height={9} width={110} radius="sm" />
      </div>
      <div className={classes.hero}>
        <Skeleton height={40} width={64} radius={8} />
        <Skeleton height={10} width={84} radius="sm" />
      </div>
      <Skeleton height={9} width="60%" radius="sm" />
      <div className={classes.heroRows}>
        <SkeletonRows rows={rows} aside={false} />
      </div>
    </div>
  );
}

export function SkeletonCardHead({ actions = 0 }: { actions?: number }) {
  return (
    <div className={classes.head}>
      <div className={classes.headText}>
        <Skeleton height={12} width={120} radius="sm" />
        <Skeleton height={9} width={170} radius="sm" />
      </div>
      {actions > 0 && (
        <Group gap={8} wrap="nowrap">
          {Array.from({ length: actions }).map((_, i) => (
            <Skeleton key={i} height={28} width={i === 0 ? 150 : 84} radius={8} />
          ))}
        </Group>
      )}
    </div>
  );
}

export function SkeletonRows({ rows = 5, aside = true }: { rows?: number; aside?: boolean }) {
  return (
    <>
      <div className={classes.columns}>
        <Skeleton height={8} width={46} radius="sm" />
        <div className={classes.columnsEnd}>
          <Skeleton height={8} width={40} radius="sm" />
          {aside && <Skeleton height={8} width={40} radius="sm" />}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={classes.row}>
          <div className={classes.rowMain}>
            <Skeleton height={10} width={LABEL_WIDTHS[i % LABEL_WIDTHS.length]} radius="sm" />
            <Skeleton height={4} width={`${92 - i * 12}%`} radius="xl" />
          </div>
          <Skeleton height={10} width={38} radius="sm" />
          {aside && <Skeleton height={10} width={34} radius="sm" />}
        </div>
      ))}
    </>
  );
}

export function ListSkeleton({ rows = 5, aside = true }: { rows?: number; aside?: boolean }) {
  return (
    <div className={classes.card}>
      <SkeletonCardHead />
      <SkeletonRows rows={rows} aside={aside} />
    </div>
  );
}

function ChartBones({ height }: { height: number }) {
  return (
    <>
      <Box h={height} className={classes.chartArea}>
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className={classes.gridLine} />
        ))}
        <SkeletonWave className={classes.chartWave} />
      </Box>
      <div className={classes.chartTicks}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height={8} width={34} radius="sm" />
        ))}
      </div>
    </>
  );
}

export function ChartSkeleton({ height = 220, bare = false }: { height?: number; bare?: boolean }) {
  if (bare) return <Skeleton height={height} radius={12} />;
  return (
    <div className={classes.card}>
      <SkeletonCardHead actions={2} />
      <div className={classes.chartLegend}>
        <Skeleton height={8} width={78} radius="sm" />
        <Skeleton height={8} width={92} radius="sm" />
      </div>
      <ChartBones height={height} />
    </div>
  );
}

export function FlowGraphSkeleton() {
  return (
    <div className={classes.flow}>
      {Array.from({ length: 3 }).map((_, col) => (
        <Group key={col} gap={10} wrap="nowrap" flex={1} miw={0}>
          <div className={classes.flowColumn}>
            <Group justify="space-between" wrap="nowrap">
              <Skeleton height={10} width={72} radius="sm" />
              <Skeleton height={8} width={56} radius="sm" />
            </Group>
            {Array.from({ length: 3 }).map((__, row) => (
              <div key={row} className={classes.flowNode}>
                <Skeleton height={10} width={LABEL_WIDTHS[(col + row) % LABEL_WIDTHS.length]} radius="sm" />
                <Group justify="space-between" wrap="nowrap">
                  <Skeleton height={16} width={52} radius="sm" />
                  <Skeleton height={8} width={48} radius="sm" />
                </Group>
                <Skeleton height={4} width={`${90 - row * 22}%`} radius="xl" />
              </div>
            ))}
          </div>
          {col < 2 && <Skeleton height={2} className={classes.flowArrow} radius="xl" />}
        </Group>
      ))}
    </div>
  );
}

/** The Workspaces page while its data loads. */
export function WorkspacesSkeleton() {
  return (
    <>
      <Group justify="space-between" align="flex-start" mb="xl">
        <div>
          <Skeleton height={28} width={180} radius="sm" />
          <Skeleton height={12} width={280} mt={10} radius="sm" />
        </div>
        <Skeleton height={36} width={160} radius="md" />
      </Group>

      <Stack gap="md">
        <PanelSkeleton height={206} />
        <PanelSkeleton height={96} />
      </Stack>
    </>
  );
}

/**
 * The Scheduled posts page while its list loads.
 *
 * Built from the timeline's own classes rather than from plain stacked cards,
 * because the thing that makes this page recognisable is its shape: a fixed
 * gutter of times down the left, a centred column of cards beside it, capped
 * well short of the window. A full-width skeleton is not a quieter version of
 * that layout — it is a different one, and the page visibly rearranges itself
 * the moment real rows arrive.
 *
 * The page header is not drawn here. It renders above this, already real, and
 * a second ghost of it underneath reads as two headers.
 */
export function SocialPostsSkeleton() {
  return (
    <Stack className="post-timeline" gap={34}>
      {Array.from({ length: 2 }).map((_, day) => (
        <div key={day}>
          {/* The day heading sits over the card column, not over the gutter,
              so it lines up with the real headings it replaces. */}
          <Skeleton
            height={13}
            width={110}
            mb="md"
            radius="sm"
            ml="var(--post-gutter, 92px)"
          />
          <Stack gap={10}>
            {Array.from({ length: day === 0 ? 2 : 1 }).map((_, i) => (
              <Group key={i} className="post-slot" align="flex-start" wrap="nowrap" gap={0}>
                {/* The gutter, kept even though it holds only a ghost of the
                    clock: it is what sets the card column's left edge. */}
                <Box className="post-slot__time">
                  <Skeleton height={13} width={58} radius="sm" ml="auto" />
                  <Skeleton height={10} width={42} radius="sm" ml="auto" mt={6} />
                </Box>

                <Box className="post-slot__card">
                  <Group gap={8} wrap="nowrap" align="center" p="md" pb={8}>
                    <Skeleton height={28} width={28} radius="xl" />
                    <Skeleton height={12} width={120} radius="sm" />
                  </Group>
                  <Box px="md" pb={12}>
                    <Skeleton height={12} width="45%" mb={8} radius="sm" />
                    <Skeleton height={10} width="90%" radius="sm" />
                  </Box>
                  {/* The foot: the row of actions every real card carries, so
                      the card keeps its full height and nothing below it
                      shifts when the list lands. */}
                  <Group className="post-slot__foot" justify="space-between" wrap="nowrap" gap="sm">
                    <Skeleton height={10} width={140} radius="sm" />
                    <Group gap={6} wrap="nowrap">
                      <Skeleton height={26} width={104} radius="sm" />
                      <Skeleton height={26} width={26} radius="sm" />
                      <Skeleton height={26} width={26} radius="sm" />
                    </Group>
                  </Group>
                </Box>
              </Group>
            ))}
          </Stack>
        </div>
      ))}
    </Stack>
  );
}

/**
 * The Reports page while its schedules load.
 *
 * Three stat tiles over a stack of schedule cards, which is what lands. The
 * page header and the mail warning render above this and are already real, so
 * neither is ghosted here.
 */
export function ReportsSkeleton() {
  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} withBorder radius="lg" padding="lg">
            <Group gap="sm" wrap="nowrap" mb="md">
              <Skeleton height={34} width={34} radius="md" />
              <Skeleton height={10} width={90} radius="sm" />
            </Group>
            <Skeleton height={26} width="45%" radius="sm" />
            <Skeleton height={10} width="70%" mt={10} radius="sm" />
          </Card>
        ))}
      </SimpleGrid>

      <Stack gap="md">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} withBorder radius="lg" padding="lg">
            <Group justify="space-between" wrap="nowrap" align="flex-start" gap="md">
              <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                <Skeleton height={38} width={38} radius="md" />
                <div style={{ flex: 1 }}>
                  <Skeleton height={13} width={`${42 - i * 6}%`} radius="sm" />
                  <Skeleton height={10} width={`${68 - i * 6}%`} mt={8} radius="sm" />
                </div>
              </Group>
              <Group gap={8} wrap="nowrap">
                <Skeleton height={22} width={68} radius="xl" />
                <Skeleton height={28} width={28} radius="sm" />
              </Group>
            </Group>
            <Skeleton height={10} width="55%" mt="md" radius="sm" />
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}

/**
 * The pricing grid on its own: the heading and its controls, then the plan
 * cards. This is everything `PlansTab` draws, and nothing else.
 *
 * Shared by the Billing page's skeleton and onboarding's, so the placeholder
 * cannot drift from the real grid in one place and not the other.
 */
export function PlansGridSkeleton() {
  return (
    <div>
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="lg">
        <div>
          <Skeleton height={19} width={80} radius="sm" />
          <Skeleton height={11} width={300} mt={9} radius="sm" />
        </div>
        {/* Currency, billing cycle, and the refresh button. */}
        <Group gap="sm" wrap="nowrap" visibleFrom="sm">
          <Skeleton height={34} width={92} radius="md" />
          <Skeleton height={34} width={210} radius="md" />
          <Skeleton height={30} width={30} radius="md" />
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {Array.from({ length: 3 }).map((_, i) => (
          /*
           * Sized to the plan card it stands in for, which carries an icon, a
           * name and tagline, a price, a CTA, and a quota line above eight
           * features. A shorter placeholder would be honest about knowing
           * less, but it collapses to a fraction of the real height and the
           * page jumps when the plans land — so the shape here tracks the real
           * card's rather than being decorative.
           */
          <Card key={i} withBorder radius="lg" padding="lg">
            <Skeleton height={34} width={34} radius="md" />
            <Skeleton height={17} width="42%" mt="md" radius="sm" />
            <Skeleton height={11} width="85%" mt={10} radius="sm" />
            <Skeleton height={40} width="55%" mt={22} radius="sm" />
            <Skeleton height={42} mt={26} radius="md" />

            {/* The plan's headline quota, above the rule and the check list. */}
            <Skeleton height={12} width="52%" mt={28} radius="sm" />
            <Stack gap={13} mt={16}>
              {Array.from({ length: 8 }).map((__, r) => (
                <Group key={r} gap={10} wrap="nowrap" align="center">
                  <Skeleton height={13} width={13} radius="sm" />
                  <Skeleton height={10} width={`${84 - (r % 4) * 12}%`} radius="sm" />
                </Group>
              ))}
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </div>
  );
}

/**
 * The Billing page while usage and the plan catalogue load.
 *
 * The usage panel is one wide card of side-by-side meters rather than separate
 * cards, so it is ghosted as a single bordered block — splitting it into tiles
 * would settle into a different layout the moment the real one arrives.
 */
export function BillingSkeleton() {
  return (
    <Stack gap={28}>
      {/* The usage card: the plan and its renewal date across the top, then the
          cycle's six meters in one row. */}
      <Card withBorder radius="lg" padding={28}>
        <Group justify="space-between" wrap="wrap" gap="lg">
          <Group gap={18} wrap="nowrap">
            <Skeleton height={64} width={64} radius={18} />
            <div>
              <Skeleton height={9} width={80} radius="sm" />
              <Skeleton height={26} width={150} mt={10} radius="sm" />
              <Skeleton height={11} width={240} mt={10} radius="sm" />
            </div>
          </Group>
          <Group gap={10}>
            <Skeleton height={36} width={130} radius="md" />
            <Skeleton height={36} width={130} radius="md" />
          </Group>
        </Group>
      </Card>

      <Group gap={28}>
        {[70, 70, 84, 130].map((w, i) => (
          <Skeleton key={i} height={14} width={w} radius="sm" />
        ))}
      </Group>

      <PlansGridSkeleton />
    </Stack>
  );
}

function SettingsSectionSkeleton({ rows }: { rows: number }) {
  return (
    <Box>
      <Skeleton height={14} width={120} radius="sm" />
      <Skeleton height={10} width="60%" mt={6} mb="sm" radius="sm" />
      <Card withBorder radius="md" padding="lg">
        <Stack gap="lg">
          {Array.from({ length: rows }).map((_, i) => (
            <Group key={i} justify="space-between" wrap="nowrap" gap="md">
              <Box flex={1}>
                <Skeleton height={12} width="35%" radius="sm" />
                <Skeleton height={10} width="70%" mt={8} radius="sm" />
              </Box>
              <Skeleton height={36} width={240} radius="sm" />
            </Group>
          ))}
        </Stack>
      </Card>
    </Box>
  );
}

export function BrandingSkeleton() {
  return (
    <Grid gap="xl">
      <Grid.Col span={{ base: 12, lg: 7 }}>
        <Stack gap="xl">
          <SettingsSectionSkeleton rows={3} />
          <SettingsSectionSkeleton rows={2} />
        </Stack>
      </Grid.Col>

      <Grid.Col span={{ base: 12, lg: 5 }}>
        <Card withBorder radius="md" padding="md">
          <Skeleton height={14} width={100} radius="sm" />
          <Skeleton height={10} width="70%" mt={6} mb="sm" radius="sm" />
          <Skeleton height={30} radius="sm" mb="sm" />
          <Skeleton height={440} radius="md" />
        </Card>
      </Grid.Col>
    </Grid>
  );
}

/** Full-screen boot state, shown while the session is being restored. */
export function AppBootSkeleton() {
  return <SwitchVisual sublabel="Restoring your session…" />;
}
