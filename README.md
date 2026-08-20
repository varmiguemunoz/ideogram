<div align="center">

# 🎨 Congen

### Personal AI image generation, on your desktop

Train a model of **yourself** once, then generate as many images as you want.
Your photos and your API keys never leave your machine.

<br>

![Electron](https://img.shields.io/badge/Electron-43.4-47848F?style=for-the-badge&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-WAL-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---

## 📑 Table of contents

| Section | What is in it |
| :------ | :------------ |
| [✨ What Congen does](#-what-congen-does) | The product in plain language |
| [🏛️ Architecture](#️-architecture) | The three layers and why they exist |
| [🗂️ Project layout](#️-project-layout) | Folder by folder |
| [🚀 Getting started](#-getting-started) | Install and run |
| [🔄 How it all works](#-how-it-all-works) | The two flows, end to end |
| [🌐 API reference](#-api-reference) | Every endpoint |
| [🧩 The api in depth](#-the-api-in-depth) | Hexagonal architecture |
| [💻 The ui in depth](#-the-ui-in-depth) | Hooks and services |
| [🖥️ The electron in depth](#️-the-electron-in-depth) | The shell |
| [🔐 Security](#-security) | Where secrets live |
| [🗄️ Database](#️-database) | Schema and migrations |
| [📦 Building](#-building) | Packaging a desktop app |
| [🧪 Testing](#-testing) | What is covered |
| [🛠️ Troubleshooting](#️-troubleshooting) | Known issues |

---

## ✨ What Congen does

Congen is a **desktop app** that fine tunes an image model on your own face and then generates images of you in different scenes.

```
   📸  20 photos of you
        │
        ▼
   🧠  Train a personal LoRA model on Replicate   ⏱️  ~20 min   💵  ~$2
        │
        ▼
   🎨  Generate unlimited images from prompts     ⏱️  ~30 sec  💵  ~$0.02
```

### 🎯 Feature highlights

| | Feature | Description |
| :-: | :------ | :---------- |
| 🧠 | **Personal model training** | Fine tunes `ostris/flux-dev-lora-trainer` on 20 of your photos |
| 🎭 | **Scenario catalog** | Pick a scene: mirror selfie, beach, or office |
| 🖼️ | **Framing control** | Headshot or knees up |
| 👕 | **Clothing prompts** | Free text description of what you are wearing |
| 📜 | **Generation history** | Every image you have made, with live status |
| 🔁 | **Crash resilient** | Restart mid training and it picks the run back up |
| 🔐 | **Local secrets** | API tokens encrypted with your OS keychain, never written in plain text |
| 🔌 | **Offline first data** | All state in a local SQLite file. No cloud account, no telemetry |

---

## 🏛️ Architecture

Congen is **three independent programs** that happen to ship together.

```
┌──────────────────────────────────────────────────────────────────┐
│                          🖥️  ELECTRON                            │
│                                                                  │
│   The shell. Owns a window, the native file dialog, encrypted    │
│   credential storage, and the lifetime of the api process.       │
│                                                                  │
│   ❌ Zero business logic.                                        │
└────────────────┬─────────────────────────────────────────────────┘
                 │  spawns as a utilityProcess
                 │  loads into a BrowserWindow
                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                            💻  UI                                │
│                                                                  │
│   React + Tailwind. A completely standalone Vite project that    │
│   also runs in a plain browser with npm run dev.                 │
│                                                                  │
│   components/  →  markup only, no logic                          │
│   hooks/       →  all screen behaviour                           │
│   services/    →  every request to the api                       │
└────────────────┬─────────────────────────────────────────────────┘
                 │  HTTP  ·  127.0.0.1:4317
                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                            ⚙️  API                               │
│                                                                  │
│   Express + SQLite. Owns 100% of the business logic: training,   │
│   generation, prompts, validation, persistence, and every call   │
│   to Replicate and Vercel Blob.                                  │
│                                                                  │
│   Hexagonal architecture, four business modules.                 │
└────────────────┬─────────────────────────────────────────────────┘
                 │
       ┌─────────┴─────────┐
       ▼                   ▼
   ☁️  Replicate      📦  Vercel Blob
   train + generate   training zip hosting
```

### 🧭 The one rule everything follows

> **All logic lives in the api.**
> The UI renders and asks. Electron opens a window and holds one secret.

If a piece of code would still be needed in a browser only version of this app, it does not belong in Electron. If a rule decides whether something is valid, it lives in the api and nowhere else.

### 💡 Why three layers

| Benefit | What it means in practice |
| :------ | :------------------------ |
| 🔍 **Findable bugs** | Image generation broken? Only look in `api/`. Button looks wrong? Only `ui/`. Window will not open? Only `electron/`. |
| 🧪 **Testable core** | The api is plain Node. It runs and is tested with no Electron and no browser. |
| 🌍 **Future proof** | The api has no Electron dependency, so a hosted web version is a deployment change, not a rewrite. |
| 🔒 **Small trust surface** | Only Electron ever touches your keychain. The renderer is sandboxed and never sees a file path. |

---

## 🗂️ Project layout

```
congen/
├── 📄 package.json              npm workspaces root, dev and build scripts
│
├── ⚙️  api/                      ← ALL business logic  ·  89 files, 3.1k lines
│   ├── src/
│   │   ├── modules/             four business modules
│   │   │   ├── 🔐 credentials/    provider tokens in memory
│   │   │   ├── 📸 photos/         the training photo selection
│   │   │   ├── 🧠 training/       runs, polling, the trained model
│   │   │   └── 🎨 generation/     prompts, images, history, catalog
│   │   ├── shared/              cross cutting only
│   │   ├── container.ts         the composition root
│   │   ├── server.ts            express wiring
│   │   └── index.ts             boot
│   └── scripts/bundle.mjs       esbuild bundle for packaging
│
├── 💻 ui/                        ← React + Tailwind  ·  44 files, 1.9k lines
│   └── src/
│       ├── components/          markup only
│       │   ├── atoms/             Button, Input, Textarea, Banner …
│       │   ├── molecules/         FileList, GenerationCard …
│       │   ├── organisms/         the five forms
│       │   └── pages/             Training, Generation, Settings
│       ├── hooks/               🪝 all the logic
│       ├── services/            🌐 all the requests
│       ├── store/               zustand, state only
│       └── config.ts
│
└── 🖥️  electron/                 ← the shell  ·  10 files, 544 lines
    ├── src/
    │   ├── main.ts              lifecycle only
    │   ├── preload.ts           a three method bridge
    │   ├── window/              window creation and hardening
    │   ├── api/                 http client + utilityProcess manager
    │   ├── credentials/         safeStorage encryption
    │   └── ipc/                 three handlers
    └── scripts/prepare-resources.mjs
```

---

## 🚀 Getting started

### 📋 Prerequisites

| Requirement | Notes |
| :---------- | :---- |
| **Node.js 22 or newer** | `better-sqlite3` and the api bundle target Node 22 |
| **A Replicate account** | With billing enabled. Training costs real money |
| **A Vercel Blob store** | Used to hand your training zip to Replicate |
| **20 photos of yourself** | Varied angle, lighting, and background. 1024px or larger |

### 1️⃣ Install

```bash
git clone <your-repo> congen
cd congen
npm install          # installs all three workspaces at once
```

### 2️⃣ Configure the api

```bash
cp api/.env.example api/.env
```

```ini
PORT=4317
DB_PATH=./data/congen.db
```

> 💡 Your **Replicate** and **Vercel Blob** tokens do *not* go in this file.
> You enter them in the app's Settings tab and they are encrypted by your OS keychain.

### 3️⃣ Run

```bash
npm run dev
```

That single command starts all three layers together:

```
🔵  API       tsx watch  →  http://127.0.0.1:4317
🟢  UI        vite       →  http://localhost:5173
🟣  ELECTRON  waits for both, then opens the window
```

### 🧑‍💻 Running a layer on its own

```bash
npm run dev -w congen-api     # just the api, poke it with curl
npm run dev -w congen-ui      # just the frontend, in a plain browser
```

> The UI degrades gracefully outside Electron. Everything works except saving
> credentials and the native photo picker, which report that they need the
> desktop app.

---

## 🔄 How it all works

### 🧠 Training flow

```
 1  👤  You click "Choose photos"
             │
 2  🖥️  ELECTRON opens the native OS dialog
             │   returns absolute paths, which the renderer never sees
             ▼
 3  ⚙️  POST /api/photos/register
        PhotoSelection entity dedupes and persists to SQLite
             │   answers with a selectionId and basenames only
             ▼
 4  👤  You type a trigger word and hit "Start training"
             │
 5  💻  POST /api/training/start
             ▼
 6  ⚙️  StartTrainingCommand:
        ✅ validate the trigger word
        ✅ confirm the selection matches this session
        ✅ confirm exactly 20 readable photos
        ✅ confirm a destination model is set
        📦 zip the photos
        ☁️  upload the zip to Vercel Blob
        🚀 POST the run to Replicate
        💾 record it and clear the selection, atomically
             ▼
 7  🔁  TrainingPoller checks every 10s until it settles
        on success: save the version, delete the zip
             ▼
 8  💻  The UI polls GET /api/state every 3s and updates live
```

### 🎨 Generation flow

```
 1  👤  Pick a scenario, a framing, describe the clothing
             │
 2  💻  POST /api/generation/start
             ▼
 3  ⚙️  StartGenerationCommand:
        ✅ validate scenario and framing
        ✅ confirm a trained model exists
        📝 PromptBuilder assembles the prompt
        💾 record the row first, so a failure is visible
        🚀 POST the prediction to Replicate
             ▼
 4  🔁  GenerationPoller tracks it, one timer per image
             ▼
 5  💻  The history list polls while anything is running
```

### 📝 How a prompt is built

The prompt is assembled from four parts in a fixed order:

```
  <trigger word> , <framing clause> , <mask clause> , [clothing] , <scenario clause>
```

> ⚠️ The **trigger word** and the **mask clause** are concatenated
> unconditionally. There is no parameter, flag, or code path in `PromptBuilder`
> that can omit either of them. Only the clothing segment is user text, and it
> is normalized and capped at 300 characters before it is used.

### 🔁 Crash resilience

On every boot the api runs `container.resume()`:

| Situation | What happens |
| :-------- | :----------- |
| A training run was in flight | Polling resumes from the stored prediction id |
| A generation was in flight | Same, one poller per image |
| The run is older than 24h | Marked `failed`, so nothing hangs forever |
| Replicate returns 404 | Treated as abandoned and marked `failed` |
| Photos were selected but unused | Restored from SQLite under a **fresh** selection id |

---

## 🌐 API reference

Base URL `http://127.0.0.1:4317`. Bound to localhost only.

### 📨 The response envelope

Every endpoint answers with the same shape, success or failure:

```jsonc
// ✅ success
{ "ok": true, "value": { /* ... */ } }

// ❌ failure
{ "ok": false, "code": "E_NOT_TRAINED", "message": "Training has not completed successfully yet." }
```

| Code | Meaning | HTTP |
| :--- | :------ | :--: |
| `E_INVALID_INPUT` | Malformed request | 400 |
| `E_NO_CREDS` | A provider token is missing | 400 |
| `E_NO_MODEL` | No destination model set | 400 |
| `E_NOT_TRAINED` | No finished model yet | 400 |
| `E_NO_KEYCHAIN` | OS secure storage unavailable | 400 |
| `E_UPSTREAM` | Replicate or Blob failed | 502 |

### 🔗 Endpoints

| Method | Path | Module | Purpose |
| :----: | :--- | :----- | :------ |
| `GET` | `/api/health` | — | 💚 Liveness check |
| `POST` | `/api/internal/credentials` | 🔐 credentials | Electron pushes decrypted tokens |
| `GET` | `/api/internal/credentials/status` | 🔐 credentials | Which tokens are loaded |
| `POST` | `/api/model` | 🧠 training | Set the destination model `owner/name` |
| `POST` | `/api/photos/register` | 📸 photos | Add picked photos to the selection |
| `POST` | `/api/photos/remove` | 📸 photos | Remove one photo by index |
| `POST` | `/api/training/start` | 🧠 training | Kick off a training run |
| `GET` | `/api/state` | 🧠 training | Current training state |
| `GET` | `/api/training/requirements` | 🧠 training | How many photos are required |
| `POST` | `/api/generation/start` | 🎨 generation | Generate an image |
| `GET` | `/api/generations` | 🎨 generation | History, newest first |
| `GET` | `/api/catalog` | 🎨 generation | Scenario and framing options |

> 🔒 `/api/internal/*` is only ever called by Electron, never by the renderer.

---

## 🧩 The api in depth

The api follows **hexagonal architecture**. Business logic sits in the middle and knows nothing about Express, SQLite, or Replicate.

### 🧅 The layers

```
        interface/        🔌  controllers + routes. HTTP only.
             │
             ▼
        application/      🎯  commands, queries, and PORTS (interfaces)
             │                Orchestrates. No SQL, no fetch, no timers.
             ▼
          domain/         💎  entities, value objects, business rules
                              Pure. Zero imports from anywhere else.
             ▲
             │
      infrastructure/     🔧  adapters that IMPLEMENT the ports
                              The only place better-sqlite3, express,
                              @vercel/blob and fetch may be imported.
```

### 📦 The four modules

| Module | Files | Owns |
| :----- | :---: | :--- |
| 🔐 **credentials** | 9 | The decrypted provider tokens, in memory only |
| 📸 **photos** | 13 | The training photo selection and what counts as a photo |
| 🧠 **training** | 25 | Destination model, trigger word, runs, polling, the trained version |
| 🎨 **generation** | 25 | Prompts, the scenario and framing catalog, images, history |

> 💡 **Replicate is not a module.** It is an external provider, so it is an
> *adapter* behind two ports named for their role, `TrainingProviderPort` and
> `ImageGeneratorPort`. Swapping to another provider means writing one adapter
> and changing one line in the composition root.

### 🧱 Anatomy of a module

```
modules/training/
├── domain/                       💎 pure business
│   ├── training-run.entity.ts       the aggregate + the 24h abandon rule
│   ├── trigger-word.vo.ts           validates itself on construction
│   ├── destination-model.vo.ts      the owner/name format rule
│   ├── training-status.vo.ts
│   └── training.errors.ts           typed errors carrying an ErrCode
│
├── application/                  🎯 orchestration
│   ├── commands/
│   │   ├── start-training.command.ts       the whole start sequence
│   │   ├── sync-training-status.command.ts ONE poll tick, no timer
│   │   └── resume-training.command.ts
│   ├── queries/
│   ├── ports/                            interfaces the commands need
│   └── training.poller.ts                the only file that knows about timers
│
├── infrastructure/               🔧 the real implementations
│   ├── persistence/sqlite-training-run.repository.ts
│   ├── replicate-training-provider.adapter.ts
│   ├── vercel-blob-file-storage.adapter.ts
│   └── adm-zip-archive-builder.adapter.ts
│
├── interface/                    🔌 HTTP
└── training.module.ts            the module's composition root
```

### 🎨 Design decisions worth knowing

<details>
<summary><b>🚨 Errors are thrown, not returned</b></summary>

<br>

Domain and application layers **throw** typed `DomainError` subclasses. Controllers stay thin and let them escape. One middleware catches everything and serializes it into the `Result` envelope the renderer expects.

This removed the `if (!result.ok) return result` chains that used to run through every orchestrator, without changing the wire format at all.

</details>

<details>
<summary><b>⏱️ Polling is split from the work</b></summary>

<br>

`SyncTrainingStatusCommand` performs **one tick** and reports `settled` or `still-running`. It knows nothing about timers. `TrainingPoller` owns the interval and cancels itself once the command says the run is done.

The result is that a single poll tick can be run and tested in isolation, which was impossible when the loop and the logic were interleaved.

</details>

<details>
<summary><b>🔀 Modules never import each other's internals</b></summary>

<br>

Generation needs the trained version, which training owns. Instead of importing across the boundary, generation declares its own `TrainedModelProviderPort` and a single adapter satisfies it. That adapter is the **only** file in the generation module aware a training module exists.

</details>

<details>
<summary><b>⚡ Statements are prepared once</b></summary>

<br>

Every repository prepares its SQL in the constructor and stores it as a private field. `better-sqlite3` is synchronous and rewards reuse, and this replaced the previous code, which called `db.prepare` on every single call.

</details>

---

## 💻 The ui in depth

The rule here is simple: **components render, hooks decide, services fetch.**

```
   components/          🎨  markup only. Read everything from a hook.
        │
        ▼
     hooks/             🪝  all screen behaviour and state
        │
        ▼
    services/           🌐  the only place fetch is called
        │
        ▼
       api
```

### 🪝 The hooks

| Hook | Responsibility |
| :--- | :------------- |
| `useSubmit` | The shared submit pattern: pending flag, message, error flag, success branch |
| `usePolling` | A safe interval that pauses when the window is hidden |
| `useBootstrap` | Loads training and credential state, then keeps it fresh |
| `useCatalog` | Scenarios, framings, and the required photo count, all from the api |
| `useCredentials` | The credentials form |
| `useDestinationModel` | The model slug form |
| `useTraining` | The whole training screen: pick, remove, start, retry |
| `useGeneration` | The generation form |
| `useGenerationHistory` | The history list, live while anything runs |

### 🧼 What `useSubmit` removed

The same seven line block was written out by hand in **four** components. Now:

```ts
const { submit, submitting, message, isError } = useSubmit();

await submit(() => credentialsService.save({ replicate, blob }), {
  pending: 'Saving…',
  success: 'Credentials saved.',
});
```

### 📉 The result

| Component | Logic lines before | After |
| :-------- | :----------------: | :---: |
| `App.tsx` | 37 | **14** |
| `TrainingForm.tsx` | 77 | **42** |
| `CredentialsForm.tsx` | 41 | **14** |
| `GenerationForm.tsx` | 34 | **29** |
| `GenerationHistory.tsx` | 27 | **7** |
| `ModelForm.tsx` | 26 | **12** |
| **Total** | **242** | **118** |

> ✅ Every line of JSX is **byte identical** to before the refactor. Only the
> code above each `return` changed.

### 📡 A note on polling

The UI used to receive push events over Electron IPC. The api is a plain HTTP server with no push channel, so anything live is polled instead:

- ⏱️ Every **3 seconds**
- ▶️ Only while a training or generation is **actually in flight**
- ⏸️ Paused entirely while the window is **hidden**

> The clean upgrade later is server sent events from the api. Only the hooks
> would change.

---

## 🖥️ The electron in depth

Electron is a **shell**. It owns exactly four things.

| | Responsibility | Why it cannot live elsewhere |
| :-: | :------------- | :--------------------------- |
| 🪟 | The window | Obviously |
| 📁 | The native file dialog | Only the main process can open one |
| 🔐 | Encrypted credential storage | `safeStorage` exists only in the main process |
| ⚙️ | The api child process | Something has to start and stop it |

### 🌉 The preload bridge is three methods

```ts
window.congenNative = {
  setCredentials,     // 🔐 encrypts to disk, then pushes to the api
  credentialsStatus,  // 🔐 reads the encrypted file
  pickPhotos,         // 📁 native dialog, registers paths with the api
};
```

> ❌ `removePhoto` used to be here. It was a pure proxy with no native
> capability behind it, so it was removed and the UI calls
> `POST /api/photos/remove` directly.

### 🛡️ Window hardening

```ts
contextIsolation: true    // ✅ renderer cannot reach Node
nodeIntegration:  false   // ✅ no require in the page
sandbox:          true    // ✅ OS level sandbox
```

Plus `setWindowOpenHandler` sends any new window to your real browser and denies it in app, and a `will-navigate` guard refuses to move the app window away from where it started.

### 🔄 How the api gets started

In a **packaged build** Electron forks the api with `utilityProcess`, Electron's own child process API.

| Why `utilityProcess` | |
| :------------------- | :- |
| 🧹 Auto cleanup | Electron tears the child down on exit, so a crash cannot orphan a server holding port 4317 |
| 🔒 Keeps the fuse on | It does not use `ELECTRON_RUN_AS_NODE`, so the `RunAsNode: false` security fuse stays enabled |
| 📋 Real logs | `stdio: 'pipe'` means api output reaches the console, which is what makes a packaged only failure diagnosable |

In **development** it does nothing, because `npm run dev` already runs the api with hot reload.

---

## 🔐 Security

### 🔑 Where your tokens live

```
   👤  You type your tokens into Settings
              │
              ▼
   🖥️  ELECTRON  encrypts them with safeStorage
              │   your OS keychain, Keychain on macOS, DPAPI on Windows
              ▼
        💾  <userData>/credentials.enc     ← encrypted at rest
              │
              │  on every launch, decrypt and push over localhost
              ▼
   ⚙️  API  holds them in memory ONLY
              │   ❌ never written to disk
              │   ❌ never logged
              ▼
        ☁️  Replicate  ·  📦 Vercel Blob
```

> 🐧 **On Linux**, `safeStorage` can silently fall back to a plaintext backend.
> Congen detects that and refuses to save rather than quietly writing your
> tokens in the clear. You will get `E_NO_KEYCHAIN`.

### 🛡️ Other properties

| | Property |
| :-: | :------- |
| 🏠 | The api binds `127.0.0.1` only. Nothing is exposed to your network |
| 🚫 | The renderer never sees an absolute file path, only basenames |
| 📴 | No telemetry, no analytics, no cloud account |
| 🗄️ | All state in one local SQLite file you can delete at any time |

---

## 🗄️ Database

A single SQLite file, WAL mode, foreign keys on.

| Environment | Location |
| :---------- | :------- |
| 🧑‍💻 Development | `api/data/congen.db` |
| 📦 Packaged | Electron's `userData` directory, passed in as `DB_PATH` |

### 📊 Schema

<table>
<tr><th colspan="2">🔧 <code>app_state</code> · exactly one row</th></tr>
<tr><td><code>trigger_word</code></td><td>The token that summons your likeness</td></tr>
<tr><td><code>destination_model</code></td><td>Replicate model as <code>owner/name</code></td></tr>
<tr><td><code>trained_version</code></td><td>The published version, once training succeeds</td></tr>
<tr><td><code>training_status</code></td><td><code>idle · pending · processing · succeeded · failed</code></td></tr>
<tr><td><code>training_prediction_id</code></td><td>The Replicate run being polled</td></tr>
<tr><td><code>training_zip_url</code></td><td>Scratch blob, deleted on success</td></tr>
<tr><td><code>training_started_at</code></td><td>Drives the 24h abandon rule</td></tr>
<tr><td><code>training_selection_paths</code></td><td>JSON array of photo paths</td></tr>
</table>

<table>
<tr><th colspan="2">🖼️ <code>generations</code> · one row per image</th></tr>
<tr><td><code>scenario</code> · <code>framing</code></td><td>Constrained by CHECK constraints</td></tr>
<tr><td><code>clothing_description</code></td><td>Your free text, sanitized</td></tr>
<tr><td><code>prompt</code></td><td>The full assembled prompt</td></tr>
<tr><td><code>prediction_id</code></td><td>The Replicate run</td></tr>
<tr><td><code>output_url</code></td><td>The finished image</td></tr>
<tr><td><code>status</code> · <code>error</code></td><td>Live state</td></tr>
<tr><td><code>created_at</code> · <code>updated_at</code></td><td>Indexed for the history list</td></tr>
</table>

### 🔀 Migrations

Numbered `.sql` files applied in order, tracked by SQLite's built in `user_version`.

```
api/src/shared/infrastructure/database/migrations/
└── 001_initial_schema.sql
```

To add a schema change, drop in `002_your_change.sql`. `MigrationRunner` applies anything newer than the current `user_version`, inside a transaction.

---

## 📦 Building

```bash
npm run build
```

That runs four steps in order:

```
 1  ⚙️  tsc the api                    →  api/dist
 2  📦  esbuild bundle the api         →  api/dist-bundle/index.js
 3  💻  vite build the ui              →  ui/dist
 4  🖥️  stage resources + forge package →  electron/out
```

### 🧊 Why the api gets bundled

`api/dist` is loose compiled TypeScript that still requires `express`, `cors`, `@vercel/blob` and `adm-zip` at run time, none of which would be in the app bundle. The esbuild step inlines every pure JavaScript dependency into one CommonJS file and leaves only `better-sqlite3` external, because native modules must be loaded, not bundled.

The `.sql` migrations are copied next to it, since `MigrationRunner` reads them from disk at boot.

### 🧬 The native module

`better-sqlite3` is compiled against a specific ABI. Because the api runs inside Electron's Node runtime via `utilityProcess`, it must match **Electron's** ABI, not system Node's.

That is why it is declared as a dependency of the **electron** workspace as well. Forge's `rebuildConfig` rebuilds it against Electron for the packaged output, while the api workspace keeps its own system Node build for development.

---

## 🧪 Testing

```bash
npm run test -w congen-api      # vitest
npm run typecheck -w congen-api
npm run typecheck -w congen-ui
npm run typecheck -w congen-electron
```

Test files live in `api/src/__tests__/` and cover the pure, high value pieces:

| Suite | What it locks down |
| :---- | :----------------- |
| 📝 `prompt.test.ts` | The trigger word and mask clause can never be dropped |
| 🗄️ `db.test.ts` | Row mapping, the abandon rule, repository round trips |
| ☁️ `replicate.test.ts` | Request shapes and error mapping, with a stubbed fetch |
| 🔐 `secure-store.test.ts` | Encryption round trip and the Linux plaintext refusal |
| 🎭 `catalog.test.ts` | Every scenario and framing has a clause |
| 📸 `selection.test.ts` | Photo deduplication |

> ℹ️ Some suites reach the new code through small shim files that translate the
> old function signatures. Each shim documents what moved where.

---

## 🛠️ Troubleshooting

<details>
<summary><b>🔴 "Secure credential storage is not available on this system"</b></summary>

<br>

You are on Linux and `safeStorage` fell back to a plaintext backend. Congen refuses to write your tokens unencrypted. Install a keyring such as `gnome-keyring` or `kwallet` and relaunch.

</details>

<details>
<summary><b>🔴 The window opens but nothing loads</b></summary>

<br>

The api did not come up. Check the console for `[api]` lines. In development, confirm port 4317 is free:

```bash
lsof -i :4317
curl http://127.0.0.1:4317/api/health
```

</details>

<details>
<summary><b>🔴 "Se requieren exactamente 20 fotos validas"</b></summary>

<br>

The trainer needs exactly 20, not a minimum. The api re-checks the file system at submit time, so a photo that was moved, renamed, or deleted since you picked it no longer counts. Re-pick and try again.

</details>

<details>
<summary><b>🔴 Training says failed immediately</b></summary>

<br>

Usually one of:
- No destination model set. Settings tab, `owner/name` format
- The Replicate model does not exist yet. Create it on Replicate first
- Billing is not enabled on your Replicate account

The `E_UPSTREAM` message passes Replicate's own reason straight through.

</details>

<details>
<summary><b>🟡 A second instance will not open</b></summary>

<br>

That is deliberate. The api binds a fixed port, so a second instance would fail to start its own copy and quietly talk to the first one's. Launching again focuses the existing window.

</details>

---

## ⚠️ Known gaps

Honest status, so nothing surprises you.

| | Item |
| :-: | :--- |
| 🧪 | The **packaged build is unverified**. `electron-forge make` has not been run end to end. The native module rebuild under npm workspaces is the likely first snag |
| 🌐 | The full flow has **not been run against a live Replicate account** yet |
| 📡 | Live updates are **polling**, not push. Server sent events are the clean upgrade |
| 🔢 | The root `package.json` declares `engines: node >= 24`, but the toolchain targets Node 22. Worth aligning |

---

<div align="center">

### 🏗️ Built with

**Electron 43** · **React 19** · **TypeScript 5.9** · **Express 4**
**better-sqlite3** · **Tailwind 4** · **Zustand** · **Vite**

<br>

*Hexagonal architecture in the api · Atomic design in the ui · A shell for Electron*

<br>

Made by [**varmiguemunoz**](https://github.com/varmiguemunoz)

</div>
