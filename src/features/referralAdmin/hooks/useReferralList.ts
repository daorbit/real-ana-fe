import { useEffect, useState } from "react";
import { useGetAdminReferralOverviewQuery, useGetAdminReferralsQuery } from "@/app/store";
import { num } from "@/shared/lib";
import { REFERRAL_STATUS_FILTERS, REFERRAL_STATUS_META } from "../lib/referralStatus";

export function useReferralList() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setSearch(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => setPage(1), [search, status]);

  const { data, isLoading, isFetching } = useGetAdminReferralsQuery({ q: search || undefined, status: status || undefined, page });
  const { data: overview } = useGetAdminReferralOverviewQuery();

  const filters = REFERRAL_STATUS_FILTERS.map((f) => {
    const count = overview ? (f.value ? overview[f.value as keyof typeof REFERRAL_STATUS_META] : overview.total) : null;
    return { value: f.value, label: f.label, count: count === null ? null : num(count) };
  });

  return {
    query,
    setQuery,
    status,
    setStatus,
    page,
    setPage,
    data,
    rows: data?.referrals ?? [],
    isLoading,
    isFetching,
    filters,
  };
}

export type ReferralListState = ReturnType<typeof useReferralList>;
