# Development Guide / คู่มือพัฒนา

## Commands / คำสั่งที่ใช้

- `npm install` — ติดตั้ง dependencies
- `npm run dev` — เปิด Vite development server
- `npm run build` — ตรวจ type และสร้าง production bundle
- `npm run preview` — เปิด production bundle ในเครื่อง

## Deploy ขึ้น GitHub Pages

โปรเจกต์มี workflow ที่ `.github/workflows/deploy-pages.yml` สำหรับ build และ deploy อัตโนมัติเมื่อมีการ push ไป branch `main` หลังเปิดใช้งาน GitHub Pages ใน repository settings แบบ `GitHub Actions` แล้ว URL จะอยู่ในรูปแบบ:

`https://<owner>.github.io/<repository>/`

การ deploy จริงต้องใช้ GitHub authentication และสิทธิ์ push ของเจ้าของ repository ไม่ควรใส่ token ไว้ในโปรเจกต์

## Change checklist / รายการตรวจสอบก่อนส่งงาน

1. อ่าน `.github/copilot-instructions.md`
2. รักษาระยะเวลารอบเกมที่ `300` seconds
3. ตรวจว่า Pause หยุด Phaser update path และ timer
4. ทดสอบวางบน occupied tile, นอก grid และกรณีเงินไม่พอ
5. รัน `npm run build`
6. ห้ามเพิ่ม credentials, ไฟล์ `.env` หรือ `.vscode/mcp.json` เข้า Git

## PixelLab MCP / การจัดการ secret

PixelLab MCP endpoint เป็น configuration data ไม่ใช่ application dependency ให้เก็บไว้เฉพาะใน local VS Code user/workspace settings ห้ามนำ bearer token มาใส่ใน repository, README, source files หรือ commits หาก token ถูกเปิดเผยแล้ว ควร rotate token ก่อนแชร์ repository

ไฟล์ตัวอย่างอยู่ที่ `.vscode/mcp.json.example` โดยใช้ `${PIXELLAB_API_TOKEN}` เป็น placeholder เท่านั้น ให้สร้างไฟล์ local ชื่อ `.vscode/mcp.json` เองในเครื่องและแทนค่าด้วย token ผ่าน secret management ของผู้ใช้ ไฟล์จริงถูก ignore โดย Git
