import classes from "./LanguagePicker.module.css";

const FLAG_CDN = "https://flagcdn.com";

export function Flag({ code }: { code: string }) {
  return (
    <img
      src={`${FLAG_CDN}/${code}.svg`}
      alt=""
      width={20}
      height={15}
      loading="lazy"
      decoding="async"
      className={classes.flag}
    />
  );
}
