# Agent skills: what Redwan uses, how to install them, how to use them

This is the set of skills used to review and fix HomeNet work. `AGENT_RULES.md` (kept in the local `docs/` folder, which git ignores: ask Redwan for a copy) says *which skill for which task*; this page says *how to get each one* and *how to run it*. It also records how a review-and-fix round goes, so it can be repeated on any PR.

## 1. Install

Skills live in two places. Use the one that matches the tool.

| Tool | Where a skill goes |
| --- | --- |
| Claude Code | a folder `~/.claude/skills/<name>/SKILL.md` (a user skill), or a plugin installed with `/plugin` |
| Antigravity and other agents | `.agents/skills/<name>/SKILL.md` in the project |

### 1.1 Plugins (Claude Code)

Add the marketplace once, then install the plugin. The plugin's skills appear as `plugin:skill`.

```text
/plugin marketplace add <owner>/<repo>
/plugin install <plugin>@<marketplace>
```

If you do not know the marketplace name, run `/plugin` after the first command and pick the plugin from the list. Update with `/plugin marketplace update`.

| Plugin | Marketplace source (repo) | Skills you will use |
| --- | --- | --- |
| `ui-design-review` | `uxkin/agent` | `ui-review`, `ui-compare`, `ui-polish` (also as commands `review`, `compare`, `polish`) |
| `mobile-app-design` | `uxkin/agent` | iOS and app screen review (`ios-review`, `ios-screens`, `ios-flows`) |
| `backend-design` | `sheitabrk/backend-design` | `design`, `audit`, `security-discipline`, `migration-safety`, `query-discipline` |
| `clean-backend` | `AllanOps/Clean-Backend` (marketplace `allanops`) | `clean-backend` |
| `coding-skills` | marketplace `coding-skills` (repo not recorded here; ask Redwan) | `code-hotspots`, `cyclomatic-complexity`, `connascence`, `module-depth`, `keyset-pagination` and about 25 more |
| `searchfit-seo` | `searchfit/searchfit-seo` (marketplace `searchfit-seo`) | `technical-seo`, `on-page-seo`, `schema-markup`, `seo-audit` |
| `system-design-skills` | `proyecto26/system-design-skills` | `design`, `api-design`, `caching`, `resilience-failure` |
| `hzblj-skills` | `hzblj/skills` (marketplace `hzblj`) | `clean-review`, `refactor`, `orchestrate`, React Native and animation skills |
| `ux-agent-skills` | `carlsz/ux-agent-skills` | UX review skills |
| `clean-architecture` | `morcoss/clean-architecture-plugin` | `ca_scan`, `ca_layer_of` (dependency checks) |
| `code-graph` | `jsnavarroc/code-graph` | code graph for large repos |
| `vercel` | `vercel/vercel-plugin` | `nextjs`, `deployments-cicd`, `verification` |
| `remotion` | `remotion-dev/claude-code-plugin` | video and motion work |
| `senior-engineering-partner` | `bjgreenberg/senior-engineering-partner` | senior-engineer review prompts |
| `hostinger` | `hostinger/claude-plugin` | deploy to Hostinger |
| `agent-memory` | `Keshab0310/agent-memory` | memory search |

`code-review`, `security-review` and `simplify` are built into Claude Code: nothing to install.

### 1.2 User skills (copy the folder)

These are single folders. Copy each into `~/.claude/skills/` (Claude Code) or `.agents/skills/` (Antigravity).

| Skill | Source | Install |
| --- | --- | --- |
| `impeccable` | `github.com/pbakaus/impeccable` | follow the install steps in the repo's README; `npx impeccable update` refreshes an installed copy |
| `21st-ui-build`, `21st-ui-review`, `21st-ui-explore`, `21st-cli-use`, `21st-design-sync`, `21st-registry`, `21st-ai` | 21st.dev | `npx @21st-dev/cli` (then `npx @21st-dev/cli login`); the skills call this CLI |
| `accessibility-scan`, `-inspect`, `-fix`, `-diff`, `-audit` | AccessLint | `npx @accesslint/cli init`; the skills run `npx -y @accesslint/cli@latest scan` |
| `ui-ux-pro-max`, `design-audit`, `web-design-guidelines`, `ui-typography`, `frontend-design`, `vercel-react-best-practices`, `vercel-react-native-skills`, `vercel-composition-patterns` | not recorded on Redwan's machine | ask Redwan for the folder (zip of `~/.claude/skills/<name>`) and copy it in; do not guess a download command |

`ui-ux-pro-max` needs Python 3 (`python3 --version`; on Windows `winget install Python.Python.3.12`).

Check a skill loaded: start the tool and type `/` plus its name. If it is listed, it works.

## 2. Which skill, in what order

The order that worked on PR 200 (admin shell):

| Step | Skill | What it gives |
| --- | --- | --- |
| 1. Read the diff | `gh pr diff`, then `code-review` (`high`) | correctness, duplicated code, convention breaks, ranked findings |
| 2. Look at the screen | `design-audit`, `ui-design-review:ui-review` | hierarchy, spacing, targets, copy, accessibility (needs the page rendered) |
| 3. Find where to spend effort | `coding-skills:code-hotspots` | files that change often and are big; fix those properly, leave quiet files alone |
| 4. Fix UI | `ui-ux-pro-max`, then `impeccable` to refine | touch targets (44 px), roles, one heading, no repeated banners |
| 5. Prove it | `npm run check:push`, then tests for each fix | the push gate in `AGENT_RULES.md` section 3 |
| 6. Security-touching files | `security-review` | auth, links, uploads, tokens |
| 7. Backend contract | `backend-design:design`, `clean-backend` | an API written down (issue) before anyone codes it |
| 8. Whole-site SEO | `searchfit-seo:technical-seo` | crawl, index, structured data, content gaps |

Use one design skill per task (`ui-ux-pro-max` for the default, `impeccable` for larger redesigns). Do not run several design skills on the same screen.

### How to run them

- Type the command and say what to review: `/code-review high https://github.com/naeemsadik/HomeNet/pull/200`.
- Give a target, not "the app": a PR link, a folder (`src/features/admin`), or a screen name.
- Ask for the report first and the fix second. Say which findings to fix.
- Ask for what was **not** checked. A review that says "not rendered" is more useful than one that sounds finished.

## 3. How the thinking goes

### Redwan's process (what to copy)

1. **Start from what a user would see.** A screenshot of a broken screen (the filter bar overlap, the failing "Request changes" dialog) comes before any code.
2. **Use several lenses on one change.** Code review, design audit and UI review each find different things; the zip file and the lint error came from the code review, the repeated banners from the design audit.
3. **Do not trust a summary.** Check the PR against its description ("UI fixed, workflow easier") and ask what was actually run.
4. **Insist on no new bugs.** "Don't make mistakes, check corner cases": every fix gets a test, and the push gate must pass.
5. **Write decisions down for the team.** A missing API becomes a backend issue with the request, response and corner cases; a teammate is asked for review by name.
6. **Hand work to the right owner.** Frontend rework goes to the frontend developer with the skills to use; backend design goes to the backend developer.
7. **Ship in small steps.** Fix, push, open or update the PR, merge, then look again.

### The agent's process on PR 200 (a summary of steps and decisions, not a transcript)

1. **Read** the PR: 18 files, 1,343 additions, one commit. Noted the body was empty and one file was a 26.7 MB zip.
2. **Run before opining**: `typecheck` passed, 16 admin tests passed, but ESLint reported an error (an unused import), which would block the push.
3. **Check what could not be seen**: the admin pages need a login, so the UI review is from code and says so.
4. **Rank findings** by how much they hurt a person: a button that always fails, then duplicated navigation, then targets and roles, then polish.
5. **Choose the smallest structural fix.** Every tab existed twice (inline and as a route). The agent kept the routes, made `/admin` a redirect, and deleted the inline copies, instead of patching both.
6. **Fix with a test each**: the notification helper (one copy, with the rule "filter to Pending only when the notification says a listing is queued"), the highlight ordering and not-found message, the 44 px targets, the redirect.
7. **Verify** with the whole gate, not only the touched tests.
8. **Report the gaps**: the zip is removed from the tree but still sits in the branch's history; the feedback button is hidden behind a flag until the API exists; nothing was rendered with a real admin login.

## 4. Checklist before a PR

- `npm run check:push` passes.
- `assets.zip`, `.env` and other binaries or secrets are not in the diff (`git diff --stat main...HEAD`).
- A new behaviour has a test; a new button has a role, a label and a 44 px target.
- The PR description says what was checked and what was not.
- A feature whose API does not exist yet is behind a flag, not shown and failing.
