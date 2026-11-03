import type { ReactNode } from "react";
import { ActionIcon, Button, Group, Modal, Text } from "@mantine/core";
import { BookOpen, ChevronLeft, X } from "lucide-react";
import { RefreshButton } from "@/shared/ui/Refresh";
import { StudioPageHero } from "./StudioPageHero";
import { StudioAsideContext } from "./studioAsideContext";
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
  customHero?: boolean;
  children: ReactNode;
}

function PageTopbar({
  title,
  closeDisabled,
  onClose,
  onRefresh,
  refreshing,
  refreshDisabled,
}: Pick<Props, "title" | "closeDisabled" | "onClose" | "onRefresh" | "refreshing" | "refreshDisabled">) {
  return (
    <header className={classes.topbar}>
      <div className={classes.topbarSide}>
        <Button
          type="button"
          variant="subtle"
          size="compact-md"
          className={classes.pageBack}
          leftSection={<ChevronLeft size={17} />}
          disabled={closeDisabled}
          onClick={onClose}
        >
          Apps
        </Button>
      </div>
      <Text fw={600} size="sm" truncate className={classes.pageTitle}>
        {title}
      </Text>
      <Group gap={6} wrap="nowrap" justify="flex-end" className={classes.topbarSide}>
        {onRefresh && (
          <RefreshButton
            hint="Refresh"
            refreshing={Boolean(refreshing)}
            disabled={refreshing || refreshDisabled}
            onRefresh={onRefresh}
          />
        )}
        <ActionIcon variant="default" radius="xl" size={30} onClick={onClose} disabled={closeDisabled} aria-label="Close">
          <X size={14} />
        </ActionIcon>
      </Group>
    </header>
  );
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
  customHero,
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
        <PageTopbar
          title={title}
          closeDisabled={closeDisabled}
          onClose={onClose}
          onRefresh={onRefresh}
          refreshing={refreshing}
          refreshDisabled={refreshDisabled}
        />
        <div className={classes.scroll}>
          <div className={classes.pageInner}>
            {!customHero && (
              <StudioPageHero
                brand={brand}
                name={title}
                tagline={subtitle}
                badge={badge}
                actions={
                  docsUrl && (
                    <Button
                      component="a"
                      href={docsUrl}
                      target="_blank"
                      rel="noreferrer"
                      radius="xl"
                      variant="default"
                      leftSection={<BookOpen size={15} />}
                    >
                      Setup guide
                    </Button>
                  )
                }
              />
            )}
            <StudioAsideContext.Provider value={aside ?? null}>{children}</StudioAsideContext.Provider>
          </div>
        </div>
        {footer && (
          <footer className={classes.footer}>
            <div className={classes.footerInner}>{footer}</div>
          </footer>
        )}
      </div>
    </Modal>
  );
}
