import type { ReactNode } from "react";
import { ActionIcon, Anchor, Button, Group, Modal, Text, Tooltip } from "@mantine/core";
import { ArrowLeft, BookOpen, RefreshCw, X } from "lucide-react";
import cardClasses from "@/features/auth/components/settings/ConnectionCard.module.css";
import { BrandMark } from "../logos/BrandMarks";
import { AsideBlock } from "./StudioParts";
import classes from "./IntegrationStudio.module.css";

interface Props {
  opened: boolean;
  onClose: () => void;
  brand: string;
  title: string;
  subtitle?: ReactNode;
  badge?: ReactNode;
  docsUrl?: string;
  closeDisabled?: boolean;
  aside?: ReactNode;
  footer?: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  refreshDisabled?: boolean;
  children: ReactNode;
}

export function IntegrationStudio({
  opened,
  onClose,
  brand,
  title,
  subtitle,
  badge,
  docsUrl,
  closeDisabled,
  aside,
  footer,
  onRefresh,
  refreshing,
  refreshDisabled,
  children,
}: Props) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      padding={0}
      withCloseButton={false}
      classNames={{ content: classes.modalContent, body: classes.modalBody }}
      closeOnEscape={!closeDisabled}
      transitionProps={{ transition: "fade", duration: 160 }}
    >
      <div className={classes.studio}>
        <header className={classes.topbar}>
          <Button
            type="button"
            variant="subtle"
            color="gray"
            size="compact-sm"
            className={classes.back}
            leftSection={<ArrowLeft size={16} />}
            disabled={closeDisabled}
            onClick={onClose}
          >
            <span className={classes.backLabel}>Connections</span>
          </Button>
          <span className={classes.divider} aria-hidden />

          <div className={classes.identity}>
            <span className={`${classes.mark} ${cardClasses.mark}`} data-brand={brand} aria-hidden>
              <BrandMark id={brand} size={22} />
            </span>
            <div className={classes.identityText}>
              <Group gap={8} wrap="nowrap">
                <Text fw={650} truncate>
                  {title}
                </Text>
                {badge}
              </Group>
              {subtitle && (
                <Text size="xs" c="dimmed" truncate>
                  {subtitle}
                </Text>
              )}
            </div>
          </div>

          <Group gap={6} wrap="nowrap" className={classes.actions}>
            {onRefresh && (
              <Tooltip label="Refresh" withArrow>
                <ActionIcon
                  variant="default"
                  size={34}
                  onClick={onRefresh}
                  loading={refreshing}
                  disabled={refreshDisabled}
                  aria-label="Refresh"
                >
                  <RefreshCw size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            <Tooltip label="Close" withArrow>
              <ActionIcon
                variant="default"
                size={34}
                onClick={onClose}
                disabled={closeDisabled}
                aria-label="Close"
              >
                <X size={17} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </header>

        <div className={classes.layout}>
          {(aside || docsUrl) && (
            <aside className={classes.aside}>
              {aside}
              {docsUrl && (
                <AsideBlock label="Guide">
                  <Anchor href={docsUrl} target="_blank" rel="noreferrer" size="sm" className={classes.guide}>
                    <BookOpen size={15} />
                    {title} setup guide
                  </Anchor>
                </AsideBlock>
              )}
            </aside>
          )}
          <div className={classes.main}>
            <div className={classes.scroll}>
              <div className={classes.inner}>{children}</div>
            </div>
            {footer && (
              <footer className={classes.footer}>
                <div className={classes.footerInner}>{footer}</div>
              </footer>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
