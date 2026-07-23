// Meta descriptions are budgeted in characters, not words — Google truncates
// the snippet at roughly 160. Soft guidance only: warn near the edge, flag
// overflows, never block saving.
const DESC_LIMIT = 160;
const DESC_WARN = 140;

export default function DescriptionMeter({ value }: { value: string }) {
  const chars = value.trim().length;
  const words = value.trim().split(/\s+/).filter(Boolean).length;
  const tone =
    chars > DESC_LIMIT
      ? "text-md-error"
      : chars >= DESC_WARN
        ? "text-md-warning"
        : "text-md-on-surface-variant/80";
  return (
    <div className="mt-1 flex items-center justify-between text-[12px] leading-4">
      <span className={tone}>
        {chars}/{DESC_LIMIT} characters
        {chars > DESC_LIMIT && " — Google will cut this off"}
      </span>
      <span className="text-md-on-surface-variant/60">{words} words</span>
    </div>
  );
}
