# Woofbook

A simple gallery where every pet is added through git: create a branch, open a pull request, get it merged, and your pet shows up on the site.

## How it works

1. **Fork** this repository (or create a branch if you have write access).
2. **Add your pet** — one JSON file and one image.
3. **Open a pull request**.
4. When the PR is **merged**, GitHub Actions rebuilds the gallery and deploys it to GitHub Pages.

No database, no admin panel — just files in git.

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
| `id` | Unique slug; must match the file name |
| `name` | Your pet's name (max 60 characters) |
| `description` | A short bio (max 280 characters) |
| `contributor` | Your GitHub username or display name |
| `image` | Path to your photo under `pets/images/` |

### 5. Open a pull request

```bash
git add pets/entries/your-github-username-pet-name.json pets/images/your-github-username-pet-name.jpg
git commit -m "Add Buddy the golden retriever"
git push origin add-my-pet
```

Open a PR on GitHub. A workflow will validate your entry. Once merged, your pet appears on the live site.

**Do not edit or commit `pets/manifest.json`** — it is generated automatically when the site is built and is listed in `.gitignore`.

## Run locally

You need to build the manifest before the gallery will show pets:

```bash
npm run build   # validate entries and generate pets/manifest.json (local only)
npm run serve   # open http://localhost:3000
```

`pets/manifest.json` is not stored in git. GitHub Actions generates it on every deploy.

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Replace `YOUR_USERNAME` in `index.html` with your GitHub username (or org name).
4. Merges to `main` will deploy automatically.

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
    └── build-manifest.js
```

## License

MIT — add your pet, share the love.
