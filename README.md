# DRPG2

A first-person dungeon crawler inspired by Wizardry Gaiden IV, built with TypeScript and HTML5 Canvas.

Create a party of adventurers from 11 races and 14 classes, explore procedurally generated dungeons, battle monsters in turn-based combat, and manage your party's survival in a world where death has real consequences.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:8080 in your browser.

## Controls

| Context | Keys | Action |
|---------|------|--------|
| Menus | Arrow Keys or K/J | Navigate up/down |
| Menus | Enter | Select |
| Menus | Esc | Back |
| Dungeon | Arrow Keys or KJHL | Move (K=fwd, J=back, H/L=turn) |
| Dungeon | M | Map |
| Dungeon | Tab | Inventory |
| Dungeon | Esc | Return to town |
| Combat | Arrow Keys | Select action/target |
| Combat | Enter | Confirm |

## Development

```bash
npm run dev          # Dev server with hot reload
npm run build        # Production build
npm run typecheck    # TypeScript checking
```