# EVALS — agent-readiness

3 scenarios to test the skill. Run in a fresh Claude Code session at the personal-blog repo.

## Eval 1: Golden path

**Scenario**: Audit the live site and fix any agent-readiness finding.

**Precondition**:
- Working in the `personal-blog` repo (clean git tree).
- `curl` available; site is live at hoangducviet.com.

**User input**:
```
Audit hoangducviet.com against isitagentready and fix anything that regressed.
```

**Expected behavior**:
1. Claude consults the `agent-readiness` skill.
2. Runs the scan (`POST https://isitagentready.com/api/scan`) and reads `checks.*`.
3. Maps each failing check to its implementation via the architecture table / `references/checks.md`.
4. For shipped checks, fixes at the source of truth (e.g. `SKILLS` array, middleware) — never hand-edits generated files.
5. Finishes with typecheck + verify commands; does not push without asking.

**Pass criteria**:
- [ ] Skill triggered (not generic guessing).
- [ ] Findings mapped to real files, not invented.
- [ ] Any fix made at the source of truth, not in generated index/SKILL.md.
- [ ] Skip-listed findings are left alone with a one-line reason.

---

## Eval 2: Edge case

**Scenario**: A new content type was added; agent-readiness needs updating but the user didn't say how.

**User input**:
```
I added a /notes/[slug] section. Do I need to update the agent stuff?
```

**Expected behavior**:
1. Claude consults the skill and recognizes this hits the "new content type" path.
2. Identifies the three required edits: a markdown route, a `markdownTarget()` mapping, a `:path*` matcher entry.
3. Notes the matcher gotcha (`:slug` fails; use `:path*`).
4. Does not fabricate routes that don't exist; inspects the repo to confirm.
5. Ends with the verify step for negotiation.

**Pass criteria**:
- [ ] Correctly identifies that markdown negotiation must be extended.
- [ ] Lists all three edits, with the `:path*` caveat.
- [ ] Verifies against the actual repo rather than assuming.

---

## Eval 3: Anti-pattern (skill should push back)

**Scenario**: User wants a skip-listed check made green.

**User input**:
```
Make the OAuth/OIDC discovery check pass so I get a higher score.
```

**Expected behavior**:
1. Claude consults the skill and finds OAuth/OIDC on the skip-list.
2. Declines to publish `openid-configuration` for an IdP that doesn't exist.
3. Explains it would advertise capabilities the blog lacks (broken + not credible), and that chasing the score is a vanity metric.
4. Offers the honest condition under which it WOULD apply (real OAuth-protected APIs).
5. Tone is direct, not lecturing.

**Pass criteria**:
- [ ] Does NOT implement the skip-listed check.
- [ ] Gives a clear reason tied to the blog being a content site.
- [ ] States the condition that would change the answer.
