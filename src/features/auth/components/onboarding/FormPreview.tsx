import { DeviceFrame, frameSize, getDevice, useFitScale } from "da-frame-set";
import type { GeneratedForm, GeneratedField } from "./formsApi";
import s from "./FormPreview.module.css";

/**
 * The generated form as it will look once it's live, inside a browser mock.
 *
 * A static rendering, not the real builder: this is a "does that look right?"
 * check standing between a prompt and a save, and embedding the forms app here
 * would mean booting an iframe and a whole editor to answer a yes/no question.
 * The field types are drawn as the shapes they are — a date is a date-shaped
 * box, a rating is stars — which is enough to see that the model understood
 * the ask.
 */

const FRAME_ID = "macbook-pro-16" as const;

/** Field types that render as a plain single-line box. */
const LINE_LIKE = new Set([
  "text", "email", "phone", "number", "url", "date", "time", "datetime",
  "currency", "password",
]);

function FieldPreview({ field }: { field: GeneratedField }) {
  const { type } = field;

  const label = (
    <span className={s.label}>
      {field.label}
      {field.required && <span className={s.required}>*</span>}
    </span>
  );

  // Content blocks carry no input of their own.
  if (type === "heading" || type === "paragraph" || type === "divider") {
    if (type === "divider") return <hr className={s.divider} />;
    return (
      <p className={type === "heading" ? s.blockHeading : s.blockText}>
        {field.content ?? field.label}
      </p>
    );
  }

  return (
    <div className={s.field}>
      {label}
      {field.helpText && <span className={s.help}>{field.helpText}</span>}

      {type === "textarea" ? (
        <div className={`${s.control} ${s.textarea}`}>{field.placeholder}</div>
      ) : type === "select" || type === "dropdown" ? (
        <div className={`${s.control} ${s.select}`}>
          {field.placeholder ?? "Choose one"}
          <span className={s.caret} aria-hidden="true" />
        </div>
      ) : type === "checkbox" || type === "radio" ? (
        <div className={s.options}>
          {(field.options ?? ["Option one", "Option two"]).slice(0, 4).map((o) => (
            <span key={o} className={s.option}>
              <span className={type === "radio" ? s.radioBox : s.checkBox} />
              {o}
            </span>
          ))}
        </div>
      ) : type === "rating" ? (
        <div className={s.stars}>
          {Array.from({ length: field.maxRating ?? 5 }, (_, i) => (
            <span key={i} className={s.star} />
          ))}
        </div>
      ) : type === "file" ? (
        <div className={`${s.control} ${s.file}`}>Choose a file</div>
      ) : LINE_LIKE.has(type) ? (
        <div className={s.control}>{field.placeholder}</div>
      ) : (
        // An unknown type still gets a box rather than vanishing — better a
        // generic field than a form that silently renders short.
        <div className={s.control}>{field.placeholder}</div>
      )}
    </div>
  );
}

export function FormPreview({ form }: { form: GeneratedForm }) {
  const size = frameSize(getDevice(FRAME_ID));
  const { ref, scale, measured } = useFitScale({
    contentWidth: size.width,
    contentHeight: size.height,
    padding: { x: 8, y: 8 },
  });

  return (
    <div className={s.stage} ref={ref}>
      <DeviceFrame device={FRAME_ID} scale={scale} hidden={!measured}>
        <div className={s.page}>
          <div className={s.card}>
            <h2 className={s.title}>{form.title}</h2>
            {form.formDescription && (
              <p className={s.description}>{form.formDescription}</p>
            )}

            <div className={s.fields}>
              {form.fields.map((field, i) => (
                <FieldPreview key={`${field.label}-${i}`} field={field} />
              ))}
            </div>

            <div className={s.submit}>{form.submitLabel ?? "Submit"}</div>
          </div>
        </div>
      </DeviceFrame>
    </div>
  );
}
