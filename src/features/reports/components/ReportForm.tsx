import type { Dispatch, Ref, SetStateAction } from "react";
import type { ShareState, Site, WhatsAppStatus } from "@/shared/types";
import type { Draft } from "@/features/reports/pages/types";
import { BasicsSection } from "./editor/BasicsSection";
import { ContentSection } from "./editor/ContentSection";
import { DeliverySection } from "./editor/DeliverySection";
import type { FormSection } from "./editor/EditorSection";
import classes from "./editor/Editor.module.css";

export type { FormSection };

interface Props {
  draft: Draft;
  setDraft: Dispatch<SetStateAction<Draft>>;
  workspaceId: string;
  sites: Site[];
  emailInput: string;
  setEmailInput: (v: string) => void;
  addEmail: () => void;
  removeEmail: (email: string) => void;
  ownerEmail: string;
  ownerMobile: string;
  wa?: WhatsAppStatus;
  waReady: boolean;
  waEntitled: boolean;
  share?: ShareState;
  sectionRef: (id: FormSection) => Ref<HTMLElement>;
}

export function ReportForm({
  draft, setDraft, workspaceId, sites, emailInput, setEmailInput, addEmail, removeEmail,
  ownerEmail, ownerMobile, wa, waReady, waEntitled, share, sectionRef,
}: Props) {
  return (
    <div className={classes.form}>
      <BasicsSection draft={draft} setDraft={setDraft} sites={sites} sectionRef={sectionRef} />
      <ContentSection draft={draft} setDraft={setDraft} share={share} sectionRef={sectionRef} />
      <DeliverySection
        draft={draft}
        setDraft={setDraft}
        workspaceId={workspaceId}
        emailInput={emailInput}
        setEmailInput={setEmailInput}
        addEmail={addEmail}
        removeEmail={removeEmail}
        ownerEmail={ownerEmail}
        ownerMobile={ownerMobile}
        wa={wa}
        waReady={waReady}
        waEntitled={waEntitled}
        sectionRef={sectionRef}
      />
    </div>
  );
}
