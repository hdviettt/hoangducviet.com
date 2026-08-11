interface ViewCountProps {
  count: number;
  /** When true, pushes itself to the far right via `ml-auto`. Used in
   *  post-detail metadata row to separate the engagement signal from
   *  the date/reading-time cluster. */
  rightAligned?: boolean;
}

// View-count display is turned off on the public site. The number still
// gets fetched from PostHog and the admin analytics dashboard is unaffected;
// only the reader-facing eye-icon badge is hidden. To re-enable, restore the
// previous render from git history.
export function ViewCount(_props: ViewCountProps) {
  return null;
}
