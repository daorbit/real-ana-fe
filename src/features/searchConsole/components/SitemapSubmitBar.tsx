import { useState, type FormEvent, type ReactNode } from "react";
import { Button, Text } from "@mantine/core";
import { Check, Link2, Lock, Send } from "lucide-react";
import type { SearchSitemapAccess } from "@/shared/types";
import { resolveSitemapUrl } from "../sitemapUrl";
import classes from "./sitemaps.module.css";

const LOOKS_LIKE_SITEMAP = /(\.xml|\.txt)(\.gz)?$|sitemap/i;

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
  const trimmed = value.trim();
  const full = /^https?:\/\//i.test(trimmed);
  const looksValid = LOOKS_LIKE_SITEMAP.test(trimmed);

  if (access.blockedBy === "scope") {
    return (
      <SitemapNotice
        icon={<Link2 size={17} />}
        title="Submit sitemaps without leaving Quantalog"
        body="Reconnect Google once and allow the new Search Console permission. Your linked properties stay as they are."
        action={
          <Button radius="md" size="sm" loading={reconnecting} onClick={onReconnect} className={classes.noticeAction}>
            Reconnect Google
          </Button>
        }
      />
    );
  }

  if (access.blockedBy === "permission") {
    return (
      <SitemapNotice
        icon={<Lock size={17} />}
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
    <div>
      <label className={classes.eyebrow} htmlFor="sitemap-url">
        Add a sitemap
      </label>
      <form className={classes.urlBar} onSubmit={(e) => void handleSubmit(e)}>
        <span className={classes.dots} aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <label className={classes.urlField} htmlFor="sitemap-url">
          <Lock size={13} aria-hidden />
          {!full && (
            <span className={classes.base} title={base} aria-hidden>
              {base}
            </span>
          )}
          <input
            id="sitemap-url"
            className={classes.urlInput}
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            placeholder="sitemap.xml"
            spellCheck={false}
            autoComplete="off"
            inputMode="url"
          />
          {looksValid && (
            <span className={classes.urlOk} aria-hidden>
              <Check size={12} strokeWidth={3} />
            </span>
          )}
        </label>
        <Button
          type="submit"
          className={classes.submitButton}
          loading={submitting}
          disabled={!trimmed}
          leftSection={<Send size={14} />}
        >
          Submit
        </Button>
      </form>
      <div className={classes.hint}>Type the path, or paste the full sitemap URL. Google reads new sitemaps within a few hours to a few days.</div>
    </div>
  );
}
