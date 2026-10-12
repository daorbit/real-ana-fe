import { Center, Loader, Pagination, TextInput } from "@mantine/core";
import { Search, Users } from "lucide-react";
import { num } from "@/shared/lib";
import { EmptyState } from "@/shared/ui/EmptyState";
import { FilterChips } from "@/shared/ui/FilterChips";
import type { AdminReferral } from "@/shared/types";
import type { ReferralAction } from "../../hooks/useReferralActions";
import type { ReferralListState } from "../../hooks/useReferralList";
import { ReferralMobileList } from "./ReferralMobileList";
import classes from "./ReferralMobile.module.css";

interface Props {
  list: ReferralListState;
  busy: string | null;
  onAct: (referral: AdminReferral, action: ReferralAction) => void;
}

export function ReferralListMobile({ list, busy, onAct }: Props) {
  const { query, setQuery, status, setStatus, page, setPage, data, rows, isLoading, isFetching, filters } = list;

  return (
    <div className={classes.stack}>
      <div className={classes.toolbar}>
        <TextInput
          className={classes.search}
          placeholder="Search"
          leftSection={<Search size={16} />}
          rightSection={isFetching ? <Loader size={14} /> : null}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          aria-label="Search by name, email or code"
        />
        <FilterChips value={status} onChange={setStatus} data={filters} ariaLabel="Filter by status" />
      </div>

      {isLoading ? (
        <Center py="xl"><Loader size="sm" /></Center>
      ) : !rows.length ? (
        <EmptyState compact icon={Users} title="No referrals found" description="Referrals appear here as people sign up with a referral link." />
      ) : (
        <div>
          <ReferralMobileList rows={rows} busy={busy} onAct={onAct} />
          {data && <p className={classes.listMeta}>{num(data.total)} referrals</p>}
        </div>
      )}

      {data && data.pages > 1 && (
        <div className={classes.pager}>
          <Pagination value={page} onChange={setPage} total={data.pages} size="sm" siblings={0} radius="xl" />
        </div>
      )}
    </div>
  );
}
