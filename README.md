# Woofbook

A simple gallery where every pet is added through git: create a branch, open a pull request, get it merged, and your pet shows up on the site.

## How it works

1. **Fork** this repository (or create a branch if you have write access).
2. **Add your pet** — one JSON file and one image.
3. **Open a pull request**.
4. When the PR is **merged**, GitHub Actions rebuilds the gallery and deploys it to GitHub Pages.

## Add your pet

### 1. Create a branch

```bash
git checkout -b add-my-pet
```

### 2. Copy the template

Pick a unique id using lowercase letters, numbers, and hyphens. A good pattern is `your-github-username-pet-name`.

```bash
cp template/pet.json pets/entries/your-github-username-pet-name.json
```

### 3. Add your pet's photo

Save a photo as:

```text
pets/images/your-github-username-pet-name.jpg
```

Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`

### 4. Fill in the JSON

Edit `pets/entries/your-github-username-pet-name.json`:

```json
{
  "id": "your-github-username-pet-name",
  "name": "Buddy",
  "description": "Loves belly rubs, hates Mondays, expert at stealing socks.",
  "contributor": "your-github-username",
  "image": "pets/images/your-github-username-pet-name.jpg"
}
```

| Field | Rules |
| --- | --- |
| `id` | Unique id; must match the file name |
| `name` | Your pet's name (max 60 characters) |
| `description` | A short bio (max 280 characters) |
| `contributor` | Your GitHub username or display name |
| `image` | Path to your photo under `pets/images/` |

### 5. Open a pull request

Stage only your pet files (this skips the generated manifest):

```bash
npm run stage-pet -- your-github-username-pet-name
git commit -m "Add Buddy the golden retriever"
git push origin add-my-pet
```

Or stage manually:

```bash
git add pets/entries/your-github-username-pet-name.json pets/images/your-github-username-pet-name.jpg
git commit -m "Add Buddy the golden retriever"
git push origin add-my-pet
```

Open a PR on GitHub. CI validates your entry and rejects changes to the generated `pets/manifest.json`. Once merged, your pet appears on the live site.

## Run locally

You need to build the manifest before the gallery will show pets:

```bash
npm run build   # validate entries and generate pets/manifest.json (local only)
npm run serve   # open http://localhost:3000
```

`pets/manifest.json` is generated locally and on deploy. It is gitignored, rebuilt on merge, and rejected by CI if included in a pull request.

Optional: enable the pre-commit hook so accidental manifest commits are blocked before you push:

```bash
git config core.hooksPath .githooks
```

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages → Build and deployment**.
3. Set **Source** to **GitHub Actions** (not “Deploy from a branch”).
4. Replace `YOUR_USERNAME` in `index.html` with your GitHub username (or org name).
5. Merges to `main` run the **Deploy site** workflow automatically.

### Troubleshooting an empty gallery

If the site loads but shows **0 pets** while entries exist on `main`:

1. **Pages source** must be **GitHub Actions**. Branch deploy serves the raw repo and skips `npm run build`, so an old committed `pets/manifest.json` (often `[]`) wins.
2. **Delete `pets/manifest.json` from git** if it was committed before `.gitignore` was added:
   ```bash
   git rm --cached pets/manifest.json
   git commit -m "Stop tracking generated manifest"
   ```
3. Re-run **Actions → Deploy site → Run workflow** on `main`.

**If `/pets/manifest.json` returns 404:** GitHub is likely deploying from the `main` branch instead of the Actions artifact. Either switch **Pages → Source** to **GitHub Actions**, or let the deploy workflow finish — it syncs a built `pets/manifest.json` back to `main` for branch-based deploys.

## Project layout

```text
.
├── index.html          # Gallery page
├── app.js              # Loads pets/manifest.json
├── styles.css
├── pets/
│   ├── entries/        # One JSON file per pet (you add these)
│   ├── images/         # One photo per pet (you add these)
│   └── manifest.json   # Generated locally / on deploy — gitignored
├── template/pet.json   # Copy this to get started
└── scripts/
    ├── build-manifest.js
    └── prepare-site.js
```

## License

MIT — add your pet, share the love.
