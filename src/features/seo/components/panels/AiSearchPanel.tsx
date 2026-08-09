import {
  Alert, Anchor, Badge, Box, Divider, Group, RingProgress, SimpleGrid, Stack, Table, Text,
} from "@mantine/core";
import {
  Bot, FileText, HelpCircle, MessagesSquare, Quote, ShieldCheck, UserCheck,
} from "lucide-react";
import type { SeoAiSearch } from "@/shared/types";
import { scoreColor, scoreLabel } from "@/features/seo/components/ScoreRing";
import { Empty, Panel, CheckRow, SEVERITY } from "@/features/seo/components/shared/Panel";
import { Tile } from "@/features/seo/components/shared/Tile";

/**
 * How well the page is set up to be found and quoted by AI answer engines.
 *
 * The panel keeps the two halves of that question visually separate, because
 * they are not equally urgent: a blocked retrieval crawler means the page
 * cannot appear in an AI answer at all, while missing schema only means it is
 * quoted less often. Training-only crawlers are shown but never scored as
 * failures — opting out of model training is a legitimate choice.
 */

/** Copy for each crawler purpose, so the table explains itself without a legend. */
const PURPOSE = {
  answers: "Cites live",
  training: "Trains model",
  both: "Search + AI",
} as const;

function CrawlerTable({ crawlers }: { crawlers: SeoAiSearch["crawlers"] }) {
  return (
    <Box style={{ overflowX: "auto" }}>
      <Table verticalSpacing={7} fz="sm" miw={420}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Crawler</Table.Th>
            <Table.Th>Used for</Table.Th>
            <Table.Th ta="right">Access</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {crawlers.map((c) => {
            // Blocking a training bot is a preference, not a fault, so it reads
            // as a neutral "Blocked" rather than a red failure.
            const isRetrieval = c.purpose === "answers" || c.purpose === "both";
            const color = c.allowed ? "teal" : isRetrieval ? "red" : "gray";
            return (
              <Table.Tr key={c.agent}>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {c.label}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {c.agent}
                    {c.explicit ? "" : " · via *"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed">
                    {PURPOSE[c.purpose]}
                  </Text>
                </Table.Td>
                <Table.Td ta="right">
                  <Badge size="sm" variant="light" color={color}>
                    {c.allowed ? "Allowed" : "Blocked"}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Box>
  );
}

export function AiSearchPanel({ aiSearch }: { aiSearch?: SeoAiSearch | null }) {
  if (!aiSearch) {
    return (
      <Empty>
        This report predates the AI search check. Run a new audit to see how answer engines read
        this page.
      </Empty>
    );
  }

  const { crawlers, llmsTxt, answerReadiness: ready, findings, score } = aiSearch;
  const retrieval = crawlers.filter((c) => c.purpose === "answers" || c.purpose === "both");
  const blockedRetrieval = retrieval.filter((c) => !c.allowed);

  return (
    <Stack gap="lg">
      {blockedRetrieval.length > 0 && (
        <Alert color="red" icon={<Bot size={16} />} title="Blocked from AI answers">
          robots.txt blocks {blockedRetrieval.map((c) => c.agent).join(", ")} from this page. These
          crawlers fetch pages to cite, so the page cannot be quoted in AI search results until the
          rules are relaxed.
        </Alert>
      )}

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <Tile
          label="AI readiness"
          value={String(score)}
          icon={MessagesSquare}
          tone={score >= 80 ? "good" : score >= 50 ? "warn" : "bad"}
          hint="Crawler access is most of this score — structure cannot help a page nothing may fetch."
        />
        <Tile
          label="Answer crawlers"
          value={`${retrieval.length - blockedRetrieval.length}/${retrieval.length}`}
          icon={Bot}
          tone={blockedRetrieval.length === 0 ? "good" : "bad"}
          hint="Crawlers that fetch pages to cite in live answers."
        />
        <Tile
          label="Question headings"
          value={String(ready.questionHeadings)}
          icon={HelpCircle}
          tone={ready.questionHeadings > 0 ? "good" : "warn"}
          hint="Headings phrased as questions are the shape answer engines lift from."
        />
        <Tile
          label="Quotable schema"
          value={String(ready.quotableSchemaTypes.length)}
          icon={Quote}
          tone={ready.quotableSchemaTypes.length > 0 ? "good" : "warn"}
          hint="FAQPage, HowTo, Article and friends — schema types an answer can be built from."
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <Panel
          title="AI crawler access"
          description="Which answer engines robots.txt lets reach this page."
          icon={Bot}
          color="indigo"
          right={
            <Group gap={8} wrap="nowrap">
              <RingProgress
                size={40}
                thickness={4}
                roundCaps
                sections={[{ value: score, color: scoreColor(score) }]}
                label={
                  <Text ta="center" size="xs" fw={700}>
                    {score}
                  </Text>
                }
              />
              <Text size="xs" c={scoreColor(score)}>
                {scoreLabel(score)}
              </Text>
            </Group>
          }
        >
          <CrawlerTable crawlers={crawlers} />
        </Panel>

        <Stack gap="lg">
          <Panel
            title="Answer readiness"
            description="Whether what they find is quotable."
            icon={Quote}
            color="teal"
          >
            <Stack gap={0}>
              <CheckRow
                ok={ready.hasFaqSchema}
                label="FAQ or Q&A schema"
                detail="Marks question-and-answer pairs as directly extractable"
                icon={HelpCircle}
              />
              <Divider />
              <CheckRow
                ok={ready.hasArticleSchema}
                label="Article schema"
                detail="Identifies the page as editorial content with a headline"
                icon={FileText}
              />
              <Divider />
              <CheckRow
                ok={ready.hasOrganizationSchema}
                label="Organization or WebSite schema"
                detail="How an answer engine learns what to call your brand"
                icon={ShieldCheck}
              />
              <Divider />
              <CheckRow
                ok={ready.hasAuthor}
                label="Machine-readable author"
                icon={UserCheck}
              />
              <Divider />
              <CheckRow ok={ready.hasDate} label="Publish or update date" />
              <Divider />
              <CheckRow
                ok={ready.wordCount >= 300}
                label="Enough substance to summarise"
                detail={`${ready.wordCount} words`}
              />
            </Stack>

            {ready.quotableSchemaTypes.length > 0 && (
              <Group gap={6} mt="md">
                {ready.quotableSchemaTypes.map((t) => (
                  <Badge key={t} size="sm" variant="light" color="teal">
                    {t}
                  </Badge>
                ))}
              </Group>
            )}
          </Panel>

          <Panel
            title="llms.txt"
            description="An optional file pointing LLMs at the pages you want quoted."
            icon={FileText}
            color="grape"
          >
            <CheckRow
              ok={llmsTxt.present}
              label={llmsTxt.present ? llmsTxt.title || "Present" : "Not published"}
              detail={
                llmsTxt.present
                  ? `${llmsTxt.linkCount} link${llmsTxt.linkCount === 1 ? "" : "s"} · ${llmsTxt.bytes} bytes`
                  : "An emerging convention, not a requirement"
              }
              icon={FileText}
            />
            {llmsTxt.present && (
              <Anchor href={llmsTxt.url} target="_blank" size="xs" mt="xs" display="block" truncate>
                {llmsTxt.url}
              </Anchor>
            )}
          </Panel>
        </Stack>
      </SimpleGrid>

      {findings.length > 0 && (
        <Panel
          title="What to change"
          description="Ranked by how much it affects being cited."
          icon={MessagesSquare}
          color="yellow"
        >
          <Stack gap={0}>
            {findings.map((f, i) => {
              const sev = SEVERITY[f.severity];
              const Icon = sev.icon;
              return (
                <Box key={`${f.severity}-${i}`}>
                  {i > 0 && <Divider />}
                  <Group gap="sm" align="flex-start" wrap="nowrap" py={10}>
                    <Icon size={15} color={sev.rail} style={{ flexShrink: 0, marginTop: 2 }} />
                    <Text size="sm" style={{ minWidth: 0 }}>
                      {f.message}
                    </Text>
                  </Group>
                </Box>
              );
            })}
          </Stack>
        </Panel>
      )}
    </Stack>
  );
}
