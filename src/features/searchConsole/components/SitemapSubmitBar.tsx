import { useState, type FormEvent, type ReactNode } from "react";
import { Button, Text } from "@mantine/core";
import { Link2, Lock, Send } from "lucide-react";
import type { SearchSitemapAccess } from "@/shared/types";
import { resolveSitemapUrl } from "../sitemapUrl";
import classes from "./sitemaps.module.css";

function SitemapNotice({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className={classes.notice}>
      <span className={classes.noticeIcon}>{icon}</span>
      <div className={classes.noticeText}>
        <Text size="sm" fw={600}>
          {title}
        </Text>
        <Text size="xs" c="dimmed" mt={2}>
          {body}
        </Text>
      </div>
      {action}
    </div>
  );
}

export function SitemapSubmitBar({
  base,
  access,
  submitting,
  onSubmit,
  onReconnect,
  reconnecting,
}: {
  base: string;
  access: SearchSitemapAccess;
  submitting: boolean;
  onSubmit: (url: string) => Promise<boolean>;
  onReconnect: () => void;
  reconnecting: boolean;
}) {
  const [value, setValue] = useState("");
  const full = /^https?:\/\//i.test(value.trim());

  if (access.blockedBy === "scope") {
    return (
      <SitemapNotice
        icon={<Link2 size={16} />}
        title="Submit sitemaps without leaving Quantalog"
        body="Reconnect Google once and allow the new Search Console permission. Your linked properties stay as they are."
        action={
          <Button radius="xl" size="xs" loading={reconnecting} onClick={onReconnect} className={classes.noticeAction}>
            Reconnect Google
          </Button>
        }
      />
    );
  }

  if (access.blockedBy === "permission") {
    return (
      <SitemapNotice
        icon={<Lock size={16} />}
        title="View-only access to this property"
        body="The connected Google account is a restricted user. A property owner can give it Full access in Search Console → Settings → Users and permissions."
      />
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const url = resolveSitemapUrl(base, value);
    if (!url) return;
    if (await onSubmit(url)) setValue("");
  };

  return (
    <form className={classes.submit} onSubmit={(e) => void handleSubmit(e)}>
      <label className={classes.field}>
        {!full && (
          <span className={classes.base} title={base}>
            {base}
          </span>
        )}
        <input
          className={classes.input}
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          placeholder="sitemap.xml"
          aria-label="Sitemap URL"
          spellCheck={false}
          autoComplete="off"
          inputMode="url"
        />
      </label>
      <Button
        type="submit"
        radius="xl"
        className={classes.submitButton}
        loading={submitting}
        disabled={!value.trim()}
        leftSection={<Send size={14} />}
      >
        Submit
      </Button>
    </form>
  );
}
