# Bangkok Super Metropolis

เกมสร้างเมืองแนว **arcade strategy** ที่ให้วางแผนและสร้างเมืองภายในเวลา 5 นาที พัฒนาด้วย TypeScript, Phaser 3 และ Vite

## วิธีเริ่มใช้งาน

```text
npm install
npm run dev
```

ใช้ `npm run build` เพื่อสร้าง production bundle และใช้ `npm run preview` เพื่อเปิดดู build ที่สร้างแล้ว

## คู่มือและเอกสาร

- [Architecture — โครงสร้างระบบ](docs/ARCHITECTURE.md)
- [Gameplay — กติกาและระบบการเล่น](docs/GAMEPLAY.md)
- [Development — คู่มือพัฒนา](docs/DEVELOPMENT.md)
- [File map — แผนผังไฟล์](docs/FILE-MAP.md)
- [Master Prompt — Prompt สำหรับสร้างใหม่](docs/MASTER-PROMPT.md)

## วิธีเล่น

- เริ่มเกมด้วยเงิน $900 และเวลา exactly 05:00
- เลือกอาคารจาก **Build Menu** แล้วคลิกบน **isometric tile** ที่ต้องการ
- **Residential** เพิ่มประชากรและรายได้ภาษี, **Commercial** ได้ประโยชน์จากพื้นที่อยู่อาศัย, **Park** เพิ่ม happiness, **Transit** ช่วยเรื่อง access และ **Wat Arun** เป็น landmark ราคาแพงที่เพิ่ม score
- เมืองจะรับ income เข้า Treasury ทุก 1 นาที ทำให้สามารถวางแผนสร้างอาคารต่อเนื่องได้
- เมื่อกด **Pause** ทั้ง simulation และ timer จะหยุดพร้อมกัน เมื่อเวลาหมดจะแสดง **City Report**
- ระหว่างเกมจะมี event ที่อ่านง่าย เช่น ฝนตก, นักท่องเที่ยว, รถติด และแรงกดดันด้าน happiness

ภาพในเกมใช้รูปทรง geometric ที่ render ด้วย Phaser และได้แรงบันดาลใจจาก pixel art จึงรันได้โดยไม่ต้องพึ่ง external art assets
