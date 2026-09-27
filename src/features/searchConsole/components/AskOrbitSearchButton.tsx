import { Button } from "@mantine/core";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";

export function AskOrbitSearchButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="light" color="emerald" leftSection={<OrbitMark size={15} />} onClick={onClick}>
      Ask Orbit
    </Button>
  );
}
