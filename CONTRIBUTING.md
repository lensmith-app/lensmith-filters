# Adding a filter to the Lensmith store

## 1. Make your filter

Build it in the Lensmith app's **Creator** (the ✨ button next to the shutter), then long-press
it in the **Mine** row → **Share**, and save the `.lensmith` file somewhere you can reach.

A `.lensmith` file is a zip. Unzip it — you'll get `filter.json` and, if you used your own
pictures, an `assets/` folder.

## 2. Add it to this repository

1. **Fork** this repository.
2. Create `filters/<your-github-name>/<filter-name>/` — all **lowercase**, letters, numbers
   and dashes only (for example `filters/janedoe/heart-rain/`).
3. Put `filter.json` and the `assets/` folder in it.
4. Add `listing.json`:

   ```json
   {
     "version": 1,
     "description": "Hearts rain down when you smile.",
     "tags": ["love", "cute"]
   }
   ```

5. Optionally add `thumbnail.png` (or `.webp` / `.jpg`): square, at most 512 × 512.
6. Open a **pull request**.

## 3. Checks

The automatic checks will tell you if something is off. Common ones:

| Check | Rule |
|---|---|
| Folder | `filters/<your-github-name>/<filter-name>/`, lowercase, matching your GitHub name |
| Files | only `filter.json`, `listing.json`, a thumbnail and `assets/` |
| Assets | png / webp / jpg, each ≤ 2 MB and ≤ 2048 px, whole filter ≤ 20 MB |
| References | every picture `filter.json` uses must be in `assets/` |
| Name | 1–24 characters |
| Updates | changing an existing filter? Raise `version` in `listing.json` |

## 4. Updating your filter

Edit the files in your folder, **raise `version`** in `listing.json`, and open a new pull request.
People who have your filter will get the update in the app.

## Rules

- Only submit things you made or have the right to share.
- No hateful, sexual, violent or harassing content, and nothing that targets real people.
- By submitting, you allow Lensmith to distribute your filter in the app and on this repository.
  You keep ownership of your work.

Filters that break the rules are removed. To report a filter, open an issue.
