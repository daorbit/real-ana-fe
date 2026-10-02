import { Button } from "@mantine/core";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";

export function AskOrbitSearchButton({ onClick, label = "Ask Orbit" }: { onClick: () => void; label?: string }) {
  return (
    <Button variant="light" color="emerald" leftSection={<OrbitMark size={15} />} onClick={onClick}>
      {label}
    </Button>
  );
}
