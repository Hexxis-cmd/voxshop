# VoxShop

An AI-powered 3D voxel workshop. Generate, sculpt, animate, and export voxel models using any AI engine — CLI agents, direct API keys, or fully offline with local models. No subscription required.

[![Support on PayPal](https://img.shields.io/badge/Support-PayPal-blue?style=for-the-badge&logo=paypal)](https://www.paypal.com/ncp/payment/MNF5JL9WPEJ92)

---

## Setup

**Prerequisites:** Node.js (LTS)

```bash
npm install
```

**Start:**
```bash
npm run dev
```

Or double-click `start.bat`.

This launches the bridge server (port 4269) and the Vite dev server (port 3000). Open `http://localhost:3000` in your browser.

---

## Connecting AI

### Option A — CLI Worker (Free for students with gemini pro, any agent/or model)

Works with Gemini CLI, Claude Code, or any CLI tool that reads/writes files.

In **Settings → Local Worker**, set the bridge URL to `http://localhost:4269/api/generate`.

Open a terminal in the project folder:

**Gemini CLI:**
```
gemini --yolo
> Activate the skill in ./skills/VOXEL_SKILL.md
```
Flash models work, but pro will give better results. (Gemini is offering a year for pro for free to students, i highly recommend checking that out)

**Claude Code:**
```
claude
> Activate the skill in ./skills/VOXEL_SKILL.md
```

P.S. CLI wont hang indefinitely so you will need to tell it to check for requests as you make them, this is tedious but its a work around if you do not have api key but do have pro access in your terminals. enjoy. :)
---

### Option B — Direct API Key

In **Settings → Direct API**, set the endpoint, model, and key.

| Provider | Endpoint | Model |
|----------|----------|-------|
| Google AI Studio (free tier) | `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` | `gemini-2.5-flash` |
| OpenAI | `https://api.openai.com/v1/chat/completions` | `gpt-4o` |
| Groq (fast free tier) | `https://api.groq.com/openai/v1/chat/completions` | `llama-3.3-70b-versatile` |

---

### Option C — Local Model (Offline)

**Ollama:**
1. Install [Ollama](https://ollama.com) and pull a model: `ollama pull llama3.2`
2. Settings → Direct API → Endpoint: `http://localhost:11434/v1/chat/completions`, Model: `llama3.2`, Key: `ollama`

**LM Studio:**
1. Load a model and start the local server in LM Studio
2. Settings → Direct API → Endpoint: `http://localhost:1234/v1/chat/completions`, Model: match whatever is loaded

---

## Feature Guide

### CREATE Menu

**AI Generation**
Click `CREATE → AI Generation`, type a description, can be simple 1 word like "troll" or you can get more detailed with it, though keep in mind this is to make building your models quicker, it is not perfect, then click submit. The AI generates and loads the model directly into the viewport. Works with all three AI connection methods above.

**Iterative Morph (ITERATE)**
Load or generate a model, then click the `ITERATE` button on the right toolbar. Lock any voxels you want to preserve first, then describe what to change. The AI only modifies unlocked voxels.

**AI Reconstruction (DISMANTLE)**
Click `DISMANTLE` or the death sequence to scatter the current model into an explosion of voxels. The `REBUILD OPTIONS` menu then appears — choose `AI Reconstruction` to describe a new form, and the voxels fly into the new shape.

**Load Fox Template**
Loads a built-in red fox model as a starting point or reference.

**New Empty Scene**
Clears the viewport to a blank grid.

---

### Converters

**Image to Voxel**
`CREATE → Image to Voxel` — select any PNG or JPG.
- PNG with a transparent background: imports as a solid 3D slab shaped like the image cutout (clean flat faces on front and back).
- Fully opaque image (photo, no transparency): imports as a flat single-layer plane.

**Text to Voxel**
`CREATE → Text to Voxel` — type any text. Instantly generates flat 3D lettering.

**Mesh to Voxel**
`CREATE → Import — 3D Mesh` — import a GLB, OBJ, STL, PLY, or FBX file. VoxShop voxelizes the mesh geometry. A resolution prompt appears: enter a number (16–128) or `auto`.

---

### Procedural Generation

`CREATE → Procedural` — one-click generation:
- **Sphere** — filled voxel sphere
- **Terrain** — heightmap terrain chunk
- **Noise Blob** — organic noise-based form

---

### SCULPT (Editing Studio)

Click `SCULPT` on the right toolbar to open the sculpting panel.

**Tools**
| Tool | Action |
|------|--------|
| Move | Click and drag a voxel to reposition it |
| Paint | Click to recolor voxels |
| Add | Click empty space adjacent to a voxel to add one |
| Delete | Click a voxel to remove it |
| Lock | Click a voxel to protect it from AI changes and accidental edits |
| Fill | Flood-fill all connected voxels of the same color |

**Brush**
Switch between Point, Sphere, and Cube brush shapes. Sphere and Cube brushes have an adjustable size slider.

**Mirror Pipeline**
Enables symmetry sculpting. Toggle X, Y, or Z to mirror every brush stroke across that axis simultaneously.

**Transform**
One-click model-wide transforms:
- **Flip X / Y / Z** — mirror the entire model along that axis
- **Rot CCW / Rot CW** — rotate the model 90° around the Y axis

**Material Tag**
Assign a PBR material type to new voxels:
| Material | Use case |
|----------|----------|
| Standard | Skin, stone, wood, cloth |
| Metallic | Armor, robots, weapons |
| Glass | Eyes, gems, crystals, windows |
| Emissive | Fire, glow, neon, bioluminescence |

**Color Picker**
Infinite color wheel plus a palette of colors already present in the current model.

**Undo / Redo**
Full unlimited undo and redo for all sculpt operations.

---

### RIGGING (Kinematics Engine)

Click `RIGGING` on the right toolbar.

**1. Choose a Skeleton Profile**
Select from Humanoid, Quadruped, Bird, or any custom skeleton profile.

**2. Solve Initial Weights**
Click `Solve Initial Weights` — VoxShop auto-assigns bone weights based on proximity.

**3. Weight Painting (optional)**
Click any bone in the list to activate it, then paint directly on the model to manually adjust which voxels belong to that bone.

**4. Compile**
Click `Compile Manual Edits` to apply your weight painting.

**5. Preview Animations**
Click any animation in the Sequencer (Idle, Walk, Attack, etc.) to preview it live. Click `Stop Sequencer` to return to bind pose. `Shatter Preview` triggers a physics explosion using the rig.

---

### RENDER Settings

Click `RENDER` on the right toolbar.

- **Bloom** — toggle glow and adjust intensity
- **Ambient Occlusion** — bakes soft shadows into the geometry (also baked into exports)
- **Tone Mapping** — Off / Cinematic / ACES Filmic
- **Solid Surface Preview** — toggles between individual voxels and a merged greedy-meshed surface view

---

### Scene Builder

Place multiple saved models into a shared scene.

1. Generate or sculpt a model, then click **Save** in the toolbar
2. Open `CREATE` — your saved model appears under **Saved Library**
3. Hover the model and click the **pin icon** to place it in the scene
4. The **Scene Objects** panel (bottom-left) appears — use the arrow buttons to reposition each object
5. Click the X to remove an object from the scene
6. Scene layout persists across page refreshes

---

### EXPORT

Open the `EXPORT` dropdown in the top-right toolbar.

| Format | Button | Notes |
|--------|--------|-------|
| GLB (static) | Game-Ready (.glb) | Geometry only, no animation clips. Best for static props. |
| GLB (animated) | 3D Animation (.glb) | Full rig + all animation clips baked in. Best for game characters. |
| OBJ | Static Mesh (.obj) | Wavefront OBJ, no rig |
| PLY | Point Cloud (.ply) | |
| STL | 3D Printing (.stl) | Ready for slicers |
| VOX | MagicaVoxel (.vox) | Opens in MagicaVoxel |
| QB | Qubicle (.qb) | Opens in Qubicle |
| PNG | 2D Snapshot (.png) | Screenshots the current viewport |
| NBT | .NBT | Minecraft structure (load with Structure Blocks) |
| Schematic | .SCHEM | WorldEdit legacy format |
| Litematic | .LITE | Litematica mod format |
| JSON | Workstation Data | Full voxel data including materials, bones, weights, and locks |
| Log | Prompt History | All AI prompts used to build the model |

The same export options are also available inside the **Rigging** panel, with the addition of a **Rigged Only .GLB** option (rig without animation clips).

---

### IMPORT

Open `CREATE` and scroll to the import sections.

**Native Voxel**
| Format | Notes |
|--------|-------|
| Voxel Studio JSON | VoxShop's own format — preserves all materials, bones, and locks |
| MagicaVoxel (.vox) | Imports palette and geometry |
| Qubicle (.qb) | Imports compressed and uncompressed |
| Minecraft NBT | Structure file or VoxShop NBT export |
| Minecraft Schematic | WorldEdit .schematic (gzip-compressed) |
| Minecraft Litematic | Litematica .litematic — full BlockStatePalette support |

**3D Mesh (Voxelized)**
All mesh imports prompt for a voxel resolution before converting.
| Format | Notes |
|--------|-------|
| GLB / GLTF | If the file was exported from VoxShop, original voxel data is restored exactly. Otherwise the mesh is voxelized. |
| OBJ | Voxelized |
| STL | Voxelized |
| PLY | Voxelized |
| FBX | Voxelized via Three.js FBXLoader |

---

## Developer

Built by **[Hexxis-Cmd](https://github.com/Hexxis-cmd/voxshop)**.

VoxShop is free and open. If it's useful to you, consider supporting development:

[![Support on PayPal](https://img.shields.io/badge/Support-PayPal-blue?style=for-the-badge&logo=paypal)](https://www.paypal.com/ncp/payment/MNF5JL9WPEJ92)

---

## License

SPDX-License-Identifier: Apache-2.0
