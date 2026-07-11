import { useState } from "react";
import type { FormEvent } from "react";
import {
  Title, Text, Group, Button, SegmentedControl, Table, TextInput, Card, SimpleGrid,
  ActionIcon, ThemeIcon, Badge, Stack, Center, Collapse, Alert,
} from "@mantine/core";
import { Plus, LayoutGrid, Table2, Trash2, Pencil, Check, X, FolderKanban } from "lucide-react";
import { api } from "../api";
import { AppShell } from "../components/AppShell";
import { useWorkspace } from "../workspace";
import type { Workspace } from "../types";

export default function Workspaces() {
  const { workspaces, active, setActive, refresh, loading } = useWorkspace();
  const [view, setView] = useState("table");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const ws = await api.post<Workspace>("/api/workspaces", { name });
      setName(""); setOpen(false);
      await refresh();
      setActive(ws._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed");
    }
  };

  const saveEdit = async (id: string) => {
    try {
      await api.patch(`/api/workspaces/${id}`, { name: editName });
      setEditId(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed");
    }
  };

  const remove = async (id: string, wsName: string) => {
    if (!confirm(`Delete "${wsName}" and all its sites + analytics? This cannot be undone.`)) return;
    try {
      await api.del(`/api/workspaces/${id}`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed");
    }
  };

  return (
    <AppShell>
      <Group justify="space-between" align="flex-start" mb="lg">
        <div>
          <Title order={2}>Workspaces</Title>
          <Text c="dimmed" size="sm" mt={4}>Create, rename or remove the workspaces that group your apps.</Text>
        </div>
        <Group gap="sm">
          <SegmentedControl
            value={view} onChange={setView} size="sm"
            data={[
              { value: "table", label: <Center><Table2 size={15} /></Center> },
              { value: "card", label: <Center><LayoutGrid size={15} /></Center> },
            ]}
          />
          <Button leftSection={<Plus size={16} />} onClick={() => setOpen((v) => !v)}>New</Button>
        </Group>
      </Group>

      {error && <Alert color="red" variant="light" mb="md">{error}</Alert>}

      <Collapse expanded={open}>
        <Card withBorder radius="md" padding="md" mb="md">
          <form onSubmit={create}>
            <Group align="flex-end">
              <TextInput label="Workspace name" placeholder="e.g. Acme Inc" value={name} onChange={(e) => setName(e.currentTarget.value)} required style={{ flex: 1 }} data-autofocus />
              <Button type="submit">Create</Button>
              <Button variant="default" onClick={() => setOpen(false)}>Cancel</Button>
            </Group>
          </form>
        </Card>
      </Collapse>

      {loading ? (
        <Text c="dimmed">Loading…</Text>
      ) : workspaces.length === 0 && !open ? (
        <Center mih="40vh">
          <Stack align="center" gap="sm">
            <ThemeIcon variant="light" size={56} radius="md"><FolderKanban size={28} /></ThemeIcon>
            <Text c="dimmed">No workspaces yet.</Text>
            <Button leftSection={<Plus size={16} />} onClick={() => setOpen(true)}>Create your first</Button>
          </Stack>
        </Center>
      ) : view === "table" ? (
        <Card withBorder radius="md" padding={0}>
          <Table verticalSpacing="sm" horizontalSpacing="lg" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th><Table.Th>Slug</Table.Th><Table.Th>Created</Table.Th><Table.Th ta="right">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {workspaces.map((w) => (
                <Table.Tr key={w._id}>
                  <Table.Td>
                    {editId === w._id ? (
                      <TextInput size="xs" value={editName} onChange={(e) => setEditName(e.currentTarget.value)} w={220} autoFocus />
                    ) : (
                      <Group gap="xs">
                        <Text fw={600} c="indigo" style={{ cursor: "pointer" }} onClick={() => setActive(w._id)}>{w.name}</Text>
                        {active?._id === w._id && <Badge size="xs" variant="light" color="green">active</Badge>}
                      </Group>
                    )}
                  </Table.Td>
                  <Table.Td c="dimmed">/{w.slug}</Table.Td>
                  <Table.Td c="dimmed">{new Date(w.createdAt).toLocaleDateString()}</Table.Td>
                  <Table.Td>
                    <Group gap={4} justify="flex-end">
                      {editId === w._id ? (
                        <>
                          <ActionIcon variant="subtle" color="green" onClick={() => saveEdit(w._id)}><Check size={15} /></ActionIcon>
                          <ActionIcon variant="subtle" color="gray" onClick={() => setEditId(null)}><X size={15} /></ActionIcon>
                        </>
                      ) : (
                        <>
                          <ActionIcon variant="subtle" color="gray" onClick={() => { setEditId(w._id); setEditName(w.name); }}><Pencil size={15} /></ActionIcon>
                          <ActionIcon variant="subtle" color="red" onClick={() => remove(w._id, w.name)}><Trash2 size={15} /></ActionIcon>
                        </>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {workspaces.map((w) => (
            <Card key={w._id} withBorder radius="md" padding="lg">
              <Group justify="space-between">
                <ThemeIcon variant="light" size="lg" radius="md"><FolderKanban size={18} /></ThemeIcon>
                <Group gap={4}>
                  <ActionIcon variant="subtle" color="green" onClick={() => setActive(w._id)} title="Set active"><Check size={15} /></ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => remove(w._id, w.name)} title="Delete"><Trash2 size={15} /></ActionIcon>
                </Group>
              </Group>
              <Group gap="xs" mt="sm">
                <Text fw={650}>{w.name}</Text>
                {active?._id === w._id && <Badge size="xs" variant="light" color="green">active</Badge>}
              </Group>
              <Text c="dimmed" size="sm">/{w.slug}</Text>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </AppShell>
  );
}
