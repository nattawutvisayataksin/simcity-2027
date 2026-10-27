# File Map / แผนผังไฟล์

```text
.
├── .github/copilot-instructions.md  ข้อกำหนดของ workspace
├── docs/
│   ├── ARCHITECTURE.md              Runtime boundaries และแผนแยกโมดูล
│   ├── DEVELOPMENT.md               Commands, QA และ secret hygiene
│   ├── FILE-MAP.md                  แผนผังไฟล์นี้
│   ├── GAMEPLAY.md                  Rules, buildings และ events
│   └── MASTER-PROMPT.md             Prompt สำหรับสร้างโปรเจกต์ใหม่
├── index.html                       Browser entry point
├── package.json                     Scripts และ dependencies
├── README.md                        Quick start
└── src/
    ├── main.ts                      Composition root และ prototype loop
    ├── style.css                    UI theme และ responsive layout
    ├── game/                        พื้นที่สำหรับ simulation modules ที่จะแยกออกมา
    └── ui/                          พื้นที่สำหรับ UI modules
```

โฟลเดอร์ `game/` และ `ui/` ที่ยังว่างเป็นการเตรียม boundary ไว้ล่วงหน้า เพื่อให้ refactor ครั้งต่อไปย้าย logic ได้โดยไม่กระทบ public gameplay contract
