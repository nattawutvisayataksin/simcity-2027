# Bangkok Super Metropolis — Architecture / โครงสร้างระบบ

## Runtime flow / ลำดับการทำงาน

```text
Browser
  └─ index.html
      └─ src/main.ts (composition root)
          ├─ Phaser game loop and isometric renderer
          ├─ DOM HUD, menus, pause and result overlays
          └─ simulation state and rules
```

## Current modules / โมดูลปัจจุบัน

Prototype ถูกเก็บไว้ค่อนข้าง compact ใน `src/main.ts` เพื่อให้ทดลองเกมได้เร็ว ส่วนโฟลเดอร์ด้านล่างเป็นขอบเขตสำหรับขยายระบบในอนาคต:

- `src/game/` — กติกา simulation แบบ deterministic, definitions ของอาคาร, events, scoring และ objectives
- `src/ui/` — DOM HUD, หน้าจอ start/pause/results และตัวเชื่อมต่อ Build Menu
- `src/assets/` — พื้นที่สำหรับ pixel-art sprites และเสียงแบบ local ในอนาคต ต้องระบุที่มาของ asset ให้ชัดเจน
- `src/style.css` — visual system และ responsive layout
- `docs/` — เอกสาร product, gameplay, technical และ art

## Boundaries ที่ต้องรักษาไว้

1. Simulation ห้ามผูกกับ DOM APIs เพื่อให้เขียน deterministic tests ได้ในอนาคต
2. Phaser มีหน้าที่ render state และส่ง player intent ไปยัง simulation
3. Timer เป็นเจ้าของโดย simulation และเดินต่อเมื่อ `started && !paused` เท่านั้น
4. การวางอาคารต้อง validate bounds, occupancy และ affordability ก่อน mutate state เพียงครั้งเดียว
5. ห้ามเก็บ secret หรือ API token ใน source control; PixelLab MCP ต้องอยู่ใน user-local VS Code settings

## Suggested extraction order / ลำดับการแยกไฟล์ที่แนะนำ

1. Extract `BuildingKind`, definitions and `Building` into `src/game/buildings.ts`.
2. Extract state and `recalculate()` into `src/game/simulation.ts`.
3. Extract timer/events into `src/game/round.ts`.
4. Extract HUD listeners and templates into `src/ui/hud.ts`.
5. Add unit tests around placement, pause, score and the 300-second boundary.
