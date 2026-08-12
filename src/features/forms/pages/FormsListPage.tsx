import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Text, Button, Stack, Center, Loader, Box, ThemeIcon, SimpleGrid, Group, Badge,
  Menu, ActionIcon, Alert, Modal, TextInput, Tooltip,
} from "@mantine/core";
import {
  Plus, ClipboardList, MoreVertical, Trash2, ExternalLink, Inbox, Copy, Check,
  PauseCircle, PlayCircle, PenLine,
} from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { PageHeader, PageStack } from "@/shared/ui/Page";
import { StatTile } from "@/features/reports/pages/ReportCard";
import {
  useGetFormsQuery, useCreateFormMutation, useDeleteFormMutation, useSetFormStatusMutation,
} from "@/app/store";
import { useWorkspace, useActiveBilling, usePermissions } from "@/features/workspace/context";
import { notify, errMessage, confirmDelete } from "@/shared/lib/notify";
import { hostedFormUrl } from "@/features/forms/lib/download";
import type { Form } from "@/features/forms/lib/types";

/**
 * Every form in the workspace.
 *
 * The two numbers this page has to make obvious are the two that cost money:
 * how many published forms are left on the plan, and whether the workspace is
 * over its submission allowance. The second one is deliberately not framed as a
 * failure — over the line, leads are still captured and it is the notifications
 * that stop, so the banner says exactly that rather than implying data loss.
 */
export default function FormsListPage() {
  const navigate = useNavigate();
  const { active } = useWorkspace();
  const billing = useActiveBilling();
  const { canEdit, canDelete } = usePermissions();
  const workspaceId = active?._id ?? "";

  const { data: forms = [], isLoading } = useGetFormsQuery(workspaceId, { skip: !workspaceId });
  const [create, { isLoading: creating }] = useCreateFormMutation();
  const [remove] = useDeleteFormMutation();
  const [setStatus] = useSetFormStatusMutation();

  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const published = forms.filter((f) => f.status === "published");
  const totalResponses = forms.reduce((sum, f) => sum + f.submissionCount, 0);

  const formQuota = billing?.forms;
  const atFormCap = Boolean(formQuota && published.length >= formQuota.planQuota);
  const overSubmissions = Boolean(
    formQuota && formQuota.submissions.used >= formQuota.submissions.planQuota,
  );

  const submit = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      const form = await create({ workspaceId, name }).unwrap();
      setNewOpen(false);
      setNewName("");
      // Straight into the builder: a form with no fields is not useful, and
      // landing back on a list means finding the row you just made.
      navigate(`/app/forms/${form.id}`);
    } catch (e) {
      notify.error(errMessage(e, "Could not create this form"));
    }
  };

  const destroy = (form: Form) =>
    confirmDelete({
      title: "Delete this form?",
      body: form.submissionCount
        ? `"${form.name}" and its ${form.submissionCount} response${form.submissionCount === 1 ? "" : "s"} will be deleted. This cannot be undone — export them first if you need them.`
        : `"${form.name}" will be deleted.`,
      onConfirm: async () => {
        try {
          await remove(form.id).unwrap();
          notify.success("Form deleted");
        } catch (e) {
          notify.error(errMessage(e, "Could not delete this form"));
        }
      },
    });

  const toggle = async (form: Form) => {
    const action = form.status === "published" ? "close" : "reopen";
    try {
      await setStatus({ id: form.id, action }).unwrap();
      notify.success(action === "close" ? "Form closed to new responses" : "Form is accepting responses again");
    } catch (e) {
      notify.error(errMessage(e, "Could not change this form"));
    }
  };

  return (
    <AppShell>
      <PageStack maxWidth="100%">
        <PageHeader
          title="Forms"
          description="Build a contact or lead form, share it as a link, and read the responses here."
          actions={
            canEdit && (
              <Tooltip
                label="Your plan's published form limit is reached — close one, or upgrade."
                disabled={!atFormCap}
                withArrow
              >
                <Button
                  leftSection={<Plus size={15} />}
                  onClick={() => setNewOpen(true)}
                  disabled={!workspaceId}
                >
                  New form
                </Button>
              </Tooltip>
            )
          }
        />

        {overSubmissions && (
          <Alert color="orange" radius="md" icon={<Inbox size={16} />}>
            <Text size="sm" fw={600}>
              You have used this cycle's {formQuota?.submissions.planQuota} responses.
            </Text>
            <Text size="sm">
              Responses are still being captured — nothing is being lost. Email notifications are
              paused until you upgrade.
            </Text>
          </Alert>
        )}

        {isLoading ? (
          <Center py={64}><Loader size="sm" /></Center>
        ) : !forms.length ? (
          <Box className="surface-card" py={64} px="xl">
            <Stack align="center" gap={6}>
              <ThemeIcon size={56} radius="xl" variant="light" color="emerald" mb="xs">
                <ClipboardList size={26} />
              </ThemeIcon>
              <Text fw={650} size="lg">No forms yet</Text>
              <Text size="sm" c="dimmed" ta="center" maw={460} lh={1.6}>
                A form gets its own hosted page — share the link or drop it into your site as an
                iframe. No script to install, and it works even if you have no site set up here.
              </Text>
              {canEdit && (
                <Button mt="xl" leftSection={<Plus size={15} />} onClick={() => setNewOpen(true)}>
                  Build your first form
                </Button>
              )}
            </Stack>
          </Box>
        ) : (
          <Stack gap="lg">
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <StatTile
                icon={ClipboardList}
                label="Published"
                value={String(published.length)}
                hint={formQuota ? `of ${formQuota.planQuota} on your plan` : `${forms.length} in total`}
              />
              <StatTile
                icon={Inbox}
                label="Responses"
                value={String(totalResponses)}
                hint={
                  formQuota
                    ? `${formQuota.submissions.used} of ${formQuota.submissions.planQuota} this cycle`
                    : "across every form"
                }
              />
              <StatTile
                icon={PenLine}
                label="Drafts"
                value={String(forms.filter((f) => f.status === "draft").length)}
                hint="Drafts do not count against your plan"
              />
            </SimpleGrid>

            <Stack gap="sm">
              {forms.map((form) => (
                <FormRow
                  key={form.id}
                  form={form}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  onOpen={() => navigate(`/app/forms/${form.id}`)}
                  onResponses={() => navigate(`/app/forms/${form.id}/responses`)}
                  onToggle={() => toggle(form)}
                  onDelete={() => destroy(form)}
                />
              ))}
            </Stack>
          </Stack>
        )}
      </PageStack>

      <Modal opened={newOpen} onClose={() => setNewOpen(false)} title="New form" centered>
        <Stack gap="md">
          <TextInput
            label="What is this form for?"
            placeholder="Contact us"
            description="Only you see this — it is how the form is listed here."
            value={newName}
            onChange={(e) => setNewName(e.currentTarget.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            data-autofocus
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={submit} loading={creating} disabled={!newName.trim()}>
              Create and start building
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AppShell>
  );
}

function FormRow({
  form,
  canEdit,
  canDelete,
  onOpen,
  onResponses,
  onToggle,
  onDelete,
}: {
  form: Form;
  canEdit: boolean;
  canDelete: boolean;
  onOpen: () => void;
  onResponses: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const url = hostedFormUrl(form.formKey);

  const statusColor = form.status === "published" ? "teal" : form.status === "closed" ? "orange" : "gray";
  const statusLabel = form.status === "published" ? "Live" : form.status === "closed" ? "Closed" : "Draft";

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Box className="surface-card" p="md">
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Stack gap={4} style={{ minWidth: 0 }}>
          <Group gap="xs">
            <Text fw={650} truncate>{form.name}</Text>
            <Badge size="sm" variant="light" color={statusColor}>{statusLabel}</Badge>
          </Group>
          <Text size="xs" c="dimmed">
            {form.submissionCount} response{form.submissionCount === 1 ? "" : "s"}
            {form.lastSubmissionAt
              ? ` · last on ${new Date(form.lastSubmissionAt).toLocaleDateString()}`
              : " · none yet"}
            {" · "}
            {form.fields.filter((f) => !f.hidden).length} field
            {form.fields.filter((f) => !f.hidden).length === 1 ? "" : "s"}
          </Text>
        </Stack>

        <Group gap={6} wrap="nowrap">
          <Button size="xs" variant="light" onClick={onResponses}>
            Responses
          </Button>
          {canEdit && (
            <Button size="xs" variant="subtle" onClick={onOpen}>
              Edit
            </Button>
          )}
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <MoreVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={copied ? <Check size={14} /> : <Copy size={14} />}
                onClick={copy}
              >
                {copied ? "Link copied" : "Copy link"}
              </Menu.Item>
              <Menu.Item
                leftSection={<ExternalLink size={14} />}
                component="a"
                href={url}
                target="_blank"
                rel="noreferrer"
                disabled={form.status === "draft"}
              >
                Open hosted page
              </Menu.Item>
              {canEdit && form.status !== "draft" && (
                <Menu.Item
                  leftSection={
                    form.status === "published" ? <PauseCircle size={14} /> : <PlayCircle size={14} />
                  }
                  onClick={onToggle}
                >
                  {form.status === "published" ? "Stop accepting responses" : "Accept responses again"}
                </Menu.Item>
              )}
              {canDelete && (
                <>
                  <Menu.Divider />
                  <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={onDelete}>
                    Delete form
                  </Menu.Item>
                </>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </Box>
  );
}
