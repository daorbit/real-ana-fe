import { BarChart3, Share2, Users } from "lucide-react";
import { StepFooter } from "./StepFooter";
import f from "./FormSteps.module.css";

const WHY = [
  {
    icon: BarChart3,
    term: "Everything in one place",
    gloss: "Analytics, forms, SEO and scheduling",
  },
  {
    icon: Users,
    term: "Scoped access",
    gloss: "Invite teammates to just this workspace",
  },
  {
    icon: Share2,
    term: "Switch any time",
    gloss: "Move between workspaces from the sidebar",
  },
];

/** Up to two initials from the name, for the monogram tile. */
function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Title and lede live on the shell — this is the step's controls only. */
export function WorkspaceStepBody({
  wsName,
  wsError,
  onChange,
  onSubmit,
}: {
  wsName: string;
  wsError: string | null;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const initials = initialsOf(wsName);

  return (
    <div>
      <div className={f.wsHero}>
        <div className={f.monogram} aria-hidden>
          {/* Re-keyed so each change of initials pops in. */}
          <span key={initials} className={f.monogramText}>
            {initials || "?"}
          </span>
        </div>

        <div className={f.wsField}>
          <label className={f.eyebrow} htmlFor="onb-ws-name">
            Workspace name
          </label>
          <input
            id="onb-ws-name"
            className={f.bigInput}
            placeholder="Acme Inc"
            value={wsName}
            aria-invalid={Boolean(wsError)}
            aria-describedby="onb-ws-hint"
            onChange={(e) => onChange(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            autoComplete="organization"
            data-autofocus
          />
          <div id="onb-ws-hint" className={wsError ? f.error : f.hint}>
            {wsError ?? "Usually your company or team. You can rename it later."}
          </div>
        </div>
      </div>

      <ul className={f.perks}>
        {WHY.map(({ icon: Icon, term, gloss }) => (
          <li key={term} className={f.perk}>
            <div className={f.perkIcon}>
              <Icon size={16} aria-hidden />
            </div>
            <div className={f.perkTerm}>{term}</div>
            <div className={f.perkGloss}>{gloss}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WorkspaceStepFooter({
  loading,
  onBack,
  onSubmit,
}: {
  loading: boolean;
  /** Absent on the workspace-only path, where this is the first screen. */
  onBack?: () => void;
  onSubmit: () => void;
}) {
  return <StepFooter onBack={onBack} onSubmit={onSubmit} loading={loading} />;
}
