# Cards Against Your Friends

CAH-like game but with memes from your friends and family

## Installation

```bash
pnpm i
```

## Environment

Copy sample env and configure values accordingly.

```bash
cp .env.sample .env
```

## Usage

_Project requires Docker_

**Development**

This project uses tilt to run docker containers for local development:
[Download Tilt](https://docs.tilt.dev/install.html)

Once Tilt is installed, run:

```bash
tilt up
```

Alternatively development without Tilt can be started with:

```bash
npm run docker:dev
```

- App served @ `http://localhost:4200`

**Initial Startup**
Game prompts and prompt responses are ignored in the source. Must manually create `prompts` and `prompt_responses` exports as `Array<string>` for each at `server/content`

---

**Running in Production**

```bash
npm run docker
```

---

## All commands

| Command              | Description                                                    |
| -------------------- | -------------------------------------------------------------- |
| `npm run docker:dev` | Run in docker, HMR enabled and serve @ `http://localhost:4200` |
| `npm run docker`     | Build app, run in docker, and serve @ `http://localhost:4200`  |
| `npm run test`       | Run tests                                                      |
| `npm run lint`       | Run linter                                                     |
| `npm run check`      | Run linting, type-checking, and tests                          |
