# Gameplay Design / คู่มือระบบการเล่น

## Win condition / เป้าหมายของรอบ

เกมไม่มี win state แบบชนะหรือแพ้เพียงอย่างเดียว ผู้เล่นต้องทำ **score** ให้สูงที่สุดก่อนรอบจบที่เวลา exactly 5 นาที โดย score มาจาก population, economic output และ happiness

## Build language / ภาษาที่ใช้ในการสร้างเมือง

| Building | Cost | บทบาทเชิงกลยุทธ์ |
|---|---:|---|
| Residential | $90 | เพิ่ม population และ tax base |
| Commercial | $130 | สร้าง income และทำงานดีขึ้นเมื่ออยู่ใกล้ homes |
| Park | $70 | เพิ่ม happiness ให้พื้นที่รอบข้าง |
| Transit | $110 | ช่วย access และควบคุม congestion |
| Wat Arun | $600 | landmark ราคาแพงที่เพิ่ม score อย่างมาก |

## Learnable rules / กติกาที่เรียนรู้ได้ง่าย

- Residential สร้าง population ซึ่งเป็นฐานลูกค้าของ Commercial
- Park เพิ่ม happiness และช่วยให้ย่านที่หนาแน่นน่าอยู่ขึ้น
- Transit เป็นคำตอบเมื่อเกิด congestion หรือ access ต่ำ
- หนึ่ง tile วางได้เพียงหนึ่ง building
- การวางที่เงินไม่พอหรืออยู่นอก grid จะถูกปฏิเสธพร้อม feedback
- ทุกครั้งที่ผ่านไป 1 นาที เมืองจะเก็บ `income` เข้า Treasury ทำให้ผู้เล่นมีเงินสำหรับขยายเมืองต่อ
- การวาง Commercial ใกล้ Residential หลายหลังจะเพิ่ม income จากฐานลูกค้า

## Event vocabulary / คำศัพท์ของ event

Event ถูกออกแบบให้เป็น pressure signal สั้น ๆ และอ่านเข้าใจง่าย ไม่ใช่ simulation branch ที่ซับซ้อน: heavy rain เพิ่ม construction cost, tourist surge ช่วย Commercial, traffic ทำให้ Transit สำคัญ และ happiness check ย้ำคุณค่าของ Park โดย event จะหยุดพร้อม timer เมื่อกด Pause
