# Lensmith Filters

The community filter store for **Lensmith**, the Android filter camera.

Every filter in the Lensmith store lives in this repository. You add a filter with a pull
request; once it's reviewed and merged, it shows up in the app's **Store** for everyone.

## How it works

```
filters/<your-github-name>/<filter-name>/
├── filter.json      ← the filter itself (export it from the Lensmith app)
├── listing.json     ← store details: version, description, tags
├── thumbnail.png    ← optional, shown in the store (square, ≤ 512px)
└── assets/          ← pictures your filter uses (png / webp / jpg)
```

1. **Pull request** — checks run automatically ([validate](.github/workflows/validate.yml)):
   valid format, file types and sizes, and that the folder matches your GitHub name.
2. **Review** — a maintainer looks at the filter. Nothing reaches the app without approval.
3. **Merge** — [publish](.github/workflows/publish.yml) packages the filter as a
   `.lensmith` file, attaches it to a GitHub Release, and updates the store index.

The store index is published at **https://lensmith-app.github.io/lensmith-filters/index.json**.

## Popularity

Each filter version is a file on a GitHub Release, and GitHub counts every download. Once an
hour the publish workflow reads those counts and writes them into the index:

- `downloads` — all-time downloads across every version
- `trending` — downloads in the last 7 days

Opening or using a filter in the app never downloads it again, so counts reflect installs and updates.

## Add your filter

See **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## Related

- [lensmith-studio](https://github.com/lensmith-app/lensmith-studio) — the filter format, tools to validate and pack filters, and (soon) the web Studio.
