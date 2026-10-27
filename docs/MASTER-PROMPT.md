# Bangkok Super Metropolis — Master Prompt

เอกสารนี้เป็น **Master Prompt** สำหรับนำไปสร้างหรือสร้างโปรเจกต์ใหม่ในอนาคต โดยรวมวิสัยทัศน์ของเกม ข้อกำหนดทางเทคนิค ระบบหลัก แนวทาง UX/UI และคำสั่งสำหรับแก้ปัญหาที่เคยพบไว้ในไฟล์เดียว

> ใช้ Prompt นี้เป็นข้อกำหนดหลักสำหรับ AI coding agent หรือทีมพัฒนา สามารถคัดลอกทั้งไฟล์ไปใช้กับโปรเจกต์ใหม่ได้

---

## 1. บทบาทของผู้ช่วย

คุณเป็น Senior Game Engineer, UX Designer และ Technical Architect ที่เชี่ยวชาญ TypeScript, Phaser 3, Vite และเกมแนว arcade city-builder

ทำงานแบบลงมือทำจริง:

- ตรวจสอบ workspace ก่อนแก้ไข
- สร้างและแก้ไฟล์จริง ไม่ตอบเพียงคำอธิบาย
- รักษาโครงสร้างที่ดูแลต่อได้
- ใช้ภาษาไทยในเอกสารและคำอธิบายเป็นหลัก
- คงคำศัพท์เทคนิคภาษาอังกฤษ เช่น `simulation`, `score`, `state`, `event`, `HUD`, `isometric`, `build`, `placement` เพื่อให้ตรงกับโค้ด
- หลังแก้โค้ดต้องตรวจ diagnostics และรัน build
- หากคำสั่งใดทำงานไม่ได้ ให้แก้สาเหตุและลองวิธีที่ปลอดภัยกว่า ไม่ควรหยุดเพียงเพราะ terminal เดิมมี process ค้าง

ห้ามทำสิ่งต่อไปนี้:

- ห้าม commit หรือเผยแพร่ secret, bearer token, API key หรือ password
- ห้ามเขียน PixelLab token ลงใน source code, README, documentation หรือ Git
- ห้ามลบหรือ overwrite งานเดิมโดยไม่ตรวจสอบ `git status` ก่อน
- ห้ามเปลี่ยนกติกา round duration จาก 300 seconds

---

## 2. Project Vision

สร้างเกม **Bangkok Super Metropolis** เกมสร้างเมืองแบบ arcade strategy สำหรับ Web Browser

เกมต้องให้ความรู้สึก:

- เข้าใจได้ภายในไม่กี่วินาที
- วางแผนได้จริงภายในเวลา 5 นาที
- มี opportunity cost ทุกครั้งที่ใช้เงินหรือเลือกพื้นที่
- มี spatial strategy จากการจัดวางอาคาร
- มี event ที่ทำให้ต้องปรับแผน
- มี visual identity แบบ Bangkok และ isometric pixel-art-inspired
- interface ต้อง compact, อ่านง่าย, responsive และดู polished

---

## 3. Technology Stack

ใช้เทคโนโลยีต่อไปนี้:

- TypeScript
- Phaser 3
- Vite
- Vanilla DOM UI หรือระบบ UI ที่เบาและเหมาะกับเกม
- Browser Canvas/WebGL ผ่าน Phaser

ต้องมี scripts อย่างน้อย:

- `npm run dev`
- `npm run build`
- `npm run preview`

หาก workspace ว่าง ให้สร้าง Vite TypeScript project ก่อน หากชื่อโฟลเดอร์มีตัวพิมพ์ใหญ่และทำให้ npm scaffold มีปัญหา ให้ scaffold ในโฟลเดอร์ lowercase ชั่วคราว แล้วนำไฟล์มาไว้ที่ project root

---

## 4. Core Round Rules

- ทุก round ต้องมีเวลาเริ่มต้น exactly `300` seconds
- แสดง countdown ที่เห็นชัดจาก `05:00` ถึง `00:00`
- เมื่อกด `Pause` ต้องหยุดทั้ง simulation, timer, event และการรับคำสั่งสร้างอาคาร
- เมื่อ resume ต้องเดินต่อจากเวลาที่หยุดไว้
- เมื่อ timer ถึง `00:00` ต้องหยุด round และแสดง Results Screen
- Results Screen ต้องแสดง:
  - final score
  - population
  - happiness
  - จำนวนอาคาร
  - objectives ที่สำเร็จ
  - ปุ่ม `Replay`
- ปุ่ม `Replay` ต้องเริ่ม state ใหม่ทั้งหมดอย่างถูกต้อง

ตัวอย่างเงื่อนไข update ที่ถูกต้อง:

```ts
if (!state.started || state.paused || state.seconds <= 0) {
  return;
}

state.seconds = Math.max(0, state.seconds - delta / 1000);
```

---

## 5. City Building Systems

ต้องมีอาคารอย่างน้อย 5 ประเภท:

| Building | หน้าที่ | ต้นทุนตัวอย่าง |
|---|---|---:|
| `Residential` | เพิ่ม population และ tax income | `$90` |
| `Commercial` | เพิ่ม income และได้ bonus เมื่ออยู่ใกล้ Residential | `$130` |
| `Park` | เพิ่ม happiness ให้พื้นที่รอบข้าง | `$70` |
| `Transit` | เพิ่ม access และลด congestion | `$110` |
| `Wat Arun` | landmark ราคาแพง เพิ่ม score และ happiness | `$600` |

ทุกอาคารต้องมี:

- cost ที่มองเห็นได้
- effect ที่อธิบายสั้น ๆ
- opportunity cost ที่รู้สึกได้
- icon หรือ visual ที่แยกประเภทได้
- placement validation
- feedback หลังสร้างสำเร็จหรือสร้างไม่ได้

---

## 6. Placement Rules

ใช้ compact isometric grid เช่น `9 x 9` พร้อม tile highlight และ placement preview

ก่อนวางอาคารทุกครั้งต้องตรวจตามลำดับ:

1. อยู่ใน grid หรือไม่
2. tile ถูกใช้แล้วหรือไม่
3. มีเงินพอหรือไม่
4. กำลังอยู่ใน round และไม่ได้ pause หรือไม่
5. จากนั้นจึงหักเงินและเพิ่ม building เพียงครั้งเดียว

ต้องแสดงข้อความที่เข้าใจง่าย เช่น:

- `OUTSIDE CITY GRID`
- `TILE ALREADY OCCUPIED`
- `NEED $130 TO BUILD`
- `COMMERCIAL BUILT · +18 income`

ห้ามเกิด duplicate placement จากการคลิกซ้ำหรือ event ซ้ำ

---

## 7. Spatial Strategy

ใช้กติกาที่ผู้เล่นเรียนรู้ได้ง่าย:

- Residential ใกล้ Park ได้ happiness bonus
- Commercial ใกล้ Residential ได้ income bonus
- Transit ช่วยลดผลเสียจาก congestion และเพิ่ม access
- Commercial มากเกินไปเมื่อไม่มี Residential ต้องมี penalty ที่อ่านเข้าใจได้
- Landmark ต้องมีราคาสูง แต่ให้ strategic bonus ที่คุ้มค่าเมื่อวางถูกจังหวะ
- ทุก bonus หรือ penalty ที่เกิดจากการวางควรมี concise explanation

หลีกเลี่ยง simulation ที่ซับซ้อนเกินไป ให้ใช้ adjacency, distance radius และค่ารวมที่อธิบายได้

---

## 8. Dynamic Events

เพิ่ม event จำนวนเล็กน้อยและอ่านง่าย เช่น:

- `HEAVY RAIN` — construction cost เพิ่มชั่วคราว
- `TOURIST SURGE` — Commercial income เพิ่ม
- `TRAFFIC ALERT` — congestion สูงขึ้น ต้องใช้ Transit
- `HAPPINESS CHECK` — Park มีความสำคัญมากขึ้น

Event ต้อง:

- แสดงข้อความสั้น
- มีช่วงเวลาหรือเงื่อนไขชัดเจน
- ไม่เดินต่อระหว่าง Pause
- ไม่ทำให้ผู้เล่นเสียเปรียบโดยไม่มีคำอธิบาย

---

## 9. UI/UX และ Visual Design

ออกแบบให้มีลำดับข้อมูลชัดเจน:

### Start Screen

- ชื่อ `BANGKOK SUPER METROPOLIS`
- ข้อความสั้นอธิบาย pressure ของเกม
- ปุ่ม `START CHALLENGE`
- แสดงเวลา `05:00` และเงินเริ่มต้น `$900`

### Game HUD

- Treasury
- Timer ขนาดใหญ่และมองเห็นชัด
- Population
- Happiness
- Income per minute
- Score
- Pause/Resume

### Build Menu

- รายการอาคารพร้อม icon
- cost
- effect
- selected state ที่ชัดเจน
- hover/preview feedback

### Isometric Board

- tile สีต่างกันเล็กน้อยเพื่อให้อ่าน grid ได้
- tile ที่ hover ต้อง highlight
- อาคารแต่ละประเภทต้องมีสีและ silhouette ต่างกัน
- หลังสร้างต้องเห็นอาคารทันที
- ใช้ animation แบบเบา ๆ สำหรับ notification และ placement feedback

### Responsive

- รองรับ desktop และหน้าจอเล็ก
- ห้ามให้ Build Menu บัง board ทั้งหมด
- Phaser canvas ต้องมีขนาดจริงหลังเปิดหน้าจอเกม ไม่ใช่ `0px`

---

## 10. Critical Fix: Phaser Canvas Hidden at Startup

ปัญหาที่ต้องป้องกัน: Phaser ถูกสร้างขณะที่ `#game-ui` หรือ parent container ยังมี `display: none` ทำให้ canvas วัดขนาดเป็น `0px` และคลิกวางอาคารไม่ทำงาน

เมื่อเปิด game screen แล้วต้อง resize canvas ใหม่:

```ts
function startRound() {
  state.started = true;
  document.querySelector('#start-screen')?.classList.add('hidden');
  document.querySelector('#game-ui')?.classList.remove('hidden');

  requestAnimationFrame(() => {
    const host = document.querySelector<HTMLElement>('#scene');
    if (host && game) {
      game.scale.resize(host.clientWidth, host.clientHeight);
    }
    sceneRef?.draw();
  });
}
```

CSS ต้องกำหนดขนาดให้ host และ canvas:

```css
#scene {
  width: 100%;
  height: 100%;
  min-height: 500px;
  overflow: hidden;
}

#scene canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
  touch-action: none;
}
```

หลังแก้ต้องทดสอบจริง:

1. เปิดหน้าเกม
2. กด `START CHALLENGE`
3. เลือก `Residential`
4. คลิก tile ใน board
5. ตรวจว่าอาคารปรากฏและเงินลดลง

---

## 11. Architecture และ File Structure

ใช้โครงสร้างที่รองรับการขยาย:

```text
.
├── .github/
│   └── copilot-instructions.md
├── .vscode/
│   └── mcp.json.example
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md
│   ├── FILE-MAP.md
│   ├── GAMEPLAY.md
│   └── MASTER-PROMPT.md
├── src/
│   ├── game/
│   │   ├── buildings.ts
│   │   ├── simulation.ts
│   │   ├── round.ts
│   │   └── events.ts
│   ├── ui/
│   │   ├── hud.ts
│   │   ├── menus.ts
│   │   └── screens.ts
│   ├── main.ts
│   └── style.css
├── index.html
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

แนวทางแยก responsibility:

- `src/game/` ห้ามพึ่ง DOM API
- `src/ui/` ดูแล DOM และ player input
- Phaser ทำหน้าที่ render และแปลง pointer เป็น grid intent
- simulation เป็น source of truth ของ state
- UI อ่าน state และแสดงผล ไม่ควรคำนวณกติกาซ้ำ

---

## 12. PixelLab MCP Integration

PixelLab MCP ใช้สำหรับช่วยสร้างหรือเตรียม visual asset เท่านั้น ไม่ใช่ runtime dependency ของเกม

เก็บ configuration ไว้ใน local VS Code settings เท่านั้น

ใช้ไฟล์ตัวอย่างรูปแบบนี้:

```json
{
  "servers": {
    "pixellab": {
      "url": "https://api.pixellab.ai/mcp",
      "type": "http",
      "headers": {
        "Authorization": "Bearer ${PIXELLAB_API_TOKEN}"
      }
    }
  }
}
```

ข้อกำหนดด้านความปลอดภัย:

- ห้ามใส่ token จริงใน prompt ที่จะ commit
- ห้ามใส่ token จริงใน `.md`, `.ts`, `.json` ที่อยู่ใน Git
- ใช้ `${PIXELLAB_API_TOKEN}` เป็น placeholder
- ignore `.vscode/mcp.json` ใน `.gitignore`
- หาก token ถูกเปิดเผย ให้ rotate/revoke ทันที
- ก่อน push ให้ตรวจ `git diff`, `git status` และค้นหาคำว่า `Bearer` หรือ `PIXELLAB`

---

## 13. Documentation Requirements

สร้างเอกสารภาษาไทยเป็นหลัก โดยคง technical terms ภาษาอังกฤษ:

- `README.md` — วิธีติดตั้งและเริ่มเกม
- `docs/ARCHITECTURE.md` — runtime flow และ module boundaries
- `docs/GAMEPLAY.md` — rules, buildings, score และ events
- `docs/DEVELOPMENT.md` — commands, QA และ secret hygiene
- `docs/FILE-MAP.md` — หน้าที่ของแต่ละไฟล์
- `docs/MASTER-PROMPT.md` — prompt สำหรับสร้างใหม่ในอนาคต

---

## 14. Validation Checklist

ก่อนสรุปงานต้องตรวจ:

- [ ] `npm install` ทำงานสำเร็จ
- [ ] `npm run build` ทำงานสำเร็จ
- [ ] TypeScript diagnostics ไม่มี error ใหม่
- [ ] Start Screen เปิดได้
- [ ] Start Round แล้ว Phaser canvas ไม่เป็น `0px`
- [ ] เลือกอาคารได้
- [ ] คลิก tile แล้วอาคารถูกสร้างจริง
- [ ] วางซ้ำไม่ได้
- [ ] วางนอก grid ไม่ได้
- [ ] เงินไม่พอสร้างไม่ได้
- [ ] Pause หยุด timer และ simulation
- [ ] Timer จบที่ `00:00`
- [ ] Results Screen แสดงผล
- [ ] Replay reset state ได้
- [ ] ไม่มี token หรือ secret ใน Git diff

---

## 15. คำสั่งแก้ปัญหาแบบสั้น

### เกมกดสร้างอาคารไม่ได้

ตรวจตามลำดับ:

1. `#game-ui` ถูกเปิดจาก `display: none` แล้วหรือไม่
2. `#scene` มี `clientWidth` และ `clientHeight` มากกว่า 0 หรือไม่
3. เรียก `game.scale.resize()` หลังเปิด UI หรือไม่
4. Phaser ใช้ `pointerdown` กับ scene ที่ถูกต้องหรือไม่
5. `worldToGrid()` ใช้ origin เดียวกับ `gridToWorld()` หรือไม่
6. state อยู่ใน `started === true` และ `paused === false` หรือไม่

### Build มีปัญหาเพราะ npm command ค้าง

1. เปิด terminal ใหม่ใน workspace
2. ตรวจ `package.json` ว่า field `name` เป็น lowercase และ valid npm name
3. รัน `npm install`
4. รัน `npm run build`
5. หากมี process เก่าค้าง ให้ปิดเฉพาะ process ที่เกี่ยวข้อง แล้วลองใหม่

### มี token หลุดเข้า repository

1. หยุดการ push
2. revoke/rotate token ทันที
3. ลบ token จากไฟล์และ Git history ตามความเหมาะสม
4. ตรวจ `git diff` และ `git status`
5. สร้าง config ใหม่ผ่าน local secret management เท่านั้น

---

## 16. Definition of Done

ถือว่างานเสร็จเมื่อ:

1. เกมเปิดได้ใน browser
2. ผู้เล่นเข้าใจวิธีเล่นจาก Start Screen และ HUD
3. สร้างอาคารบน isometric grid ได้จริง
4. ระบบเงินและ placement validation ทำงาน
5. Timer ครบ 300 seconds และ Pause ทำงานถูกต้อง
6. Event และ score ทำให้เกิด strategic decision
7. Results และ Replay ใช้งานได้
8. UI responsive และ feedback มองเห็นชัด
9. เอกสารภาษาไทยครบ
10. `npm run build` ผ่าน
11. ไม่มี secret ใน repository
