# The Ambassador Ledger

A public, human-readable index of AI and developer ambassador programs: **what the product is**, **what ambassadors actually do**, eligibility, and apply status.

This is not a link dump and not an application bot. It does not apply to anything on your behalf.

**Live site:** [dunksmaster.github.io/ai-ambassador-programs](https://dunksmaster.github.io/ai-ambassador-programs/)

Kept by **Dorian Kane** (`dunksmaster`), Hungary. Student-only programs are marked **Gated** and hidden by default.

## GitHub Pages

The site files already live in `docs/` on `main`. GitHub’s Pages create API returns 403 for the automation token on this repo, so the owner has to flip the switch once:

1. Open [Settings → Pages](https://github.com/dunksmaster/ai-ambassador-programs/settings/pages)
2. **Build and deployment → Source:** Deploy from a branch
3. **Branch:** `main` · **folder:** `/docs` → Save

After that, `https://dunksmaster.github.io/ai-ambassador-programs/` serves this ledger. The optional Actions workflow in `.github/workflows/pages.yml` can publish the same folder if you later switch the source to GitHub Actions.

## How status is updated

`docs/programs.json` is the source of truth. The page reads that file; it does not scrape forms at runtime.

1. Open the official program URL (and the apply URL if it differs).
2. Change `status` to one of: `open`, `rolling`, `closed`, `paused`, `invite`, `gated`, `see-site`.
3. Update `statusNote`, `deadline` (ISO date or `null`), and `asOf` / `updated` at the top of the file.
4. Do not invent perks or closing dates. If the window is unclear, use `see-site`.
5. Commit. GitHub Pages publishes from `docs/` on `main`.

Statuses in this first edition are **as of 31 August 2026**. Featured AI/extra programs were checked against official pages. Shorter cards cover the rest of [geshan/developer-ambassador-programs](https://github.com/geshan/developer-ambassador-programs); those apply windows are not guessed.

## Local preview

```bash
python3 -m http.server 8080 --directory docs
```

Then open `http://localhost:8080`.
