import { SimpleGrid } from "@mantine/core";
import { Clock, Flag, Gift, KeyRound, TicketCheck, Users } from "lucide-react";
import { useGetAdminReferralOverviewQuery } from "@/app/store";
import { StatCard } from "@/shared/ui/StatCard";

export function ReferralOverviewStats() {
  const { data } = useGetAdminReferralOverviewQuery();

  const tiles = [
    { label: "Referrals", value: data?.total, icon: Users, color: "emerald" },
    { label: "Rewarded", value: data?.rewarded, icon: Gift, color: "green" },
    { label: "Pending", value: data?.pending, icon: Clock, color: "amber" },
    { label: "Flagged", value: data?.flagged, icon: Flag, color: "pink" },
    { label: "Coupons redeemed", value: data?.couponsRedeemed, icon: TicketCheck, color: "violet" },
    { label: "Referral codes", value: data?.codes, icon: KeyRound, color: "cyan" },
  ];

  return (
    <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }} spacing="md">
      {tiles.map((tile) => (
        <StatCard
          key={tile.label}
          icon={tile.icon}
          label={tile.label}
          value={tile.value ?? "—"}
          color={tile.color}
        />
      ))}
    </SimpleGrid>
  );
}
