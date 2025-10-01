# bun-react-tailwind-template

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun dev
```

To run for production:

```bash
bun start
```

To build for production:

```bash
bun run build
```

The build output will be generated in the `dist/` directory.

## Deployment

This project is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The deployment workflow:

1. Installs Bun and project dependencies
2. Builds the static site
3. Deploys the `dist/` directory to GitHub Pages

You can also manually trigger a deployment from the Actions tab in GitHub.

This project was created using `bun init` in bun v1.2.21. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
