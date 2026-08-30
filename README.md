# Song & Verse

A frontend-only ticket booking site for a private singing and poetry evening on 1 September. No backend — the reservation is saved in the browser.

## Start locally

```bash
npm install
npm run dev
```

## Before you share it

The Google Meet salon is already set in `src/config.js`:

```js
meetLink: "https://meet.google.com/kmj-xcrx-xnf",
```

After she picks a time and issues a ticket, this link is printed on the pass and opens from **Join Google Meet**.

## Host on GitHub Pages

1. Push this project to a GitHub repository.
2. In the repo: **Settings → Pages → Source → GitHub Actions**.
3. Push to `main`. The included workflow builds the site and publishes `dist`.

Or publish a local build yourself:

```bash
npm run build
```

Then upload the `dist` folder to Pages, or use any static host.
