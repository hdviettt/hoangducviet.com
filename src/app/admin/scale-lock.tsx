// The CMS opts out of the public site's fluid root font size.
//
// globals.css scales `html { font-size }` with the reading column so the whole
// reader-facing page rides one knob. The admin must not: its chrome is measured
// in device pixels (a 48px activity rail, a 44px top bar, a 22px status bar),
// and shrinking the rem-based type around fixed-px furniture pulls the two out
// of alignment. `:root` beats globals' `html` on specificity, so this wins
// wherever it renders regardless of stylesheet order.
export function ScaleLock() {
  return (
    <style dangerouslySetInnerHTML={{ __html: ":root{font-size:16px}" }} />
  );
}
