; ── parsec_remote.ahk ──
; Parsec 원격 환경에서 우클릭/스크롤 보조
; 집 PC에서 상시 실행
;
; 체인: 일터 PC 마우스 우클릭 → Vysor(mousedown.2=KEYCODE_F12)
;       → Android → Parsec → 집 PC(F12) → AHK → 우클릭
;
; Vysor 설정 필요: "mousedown": { "2": "KEYCODE_F12" }

; F12 = 우클릭 (Vysor mousedown.2에서 전달됨)
F12::Click "Right"

; F7 = 스크롤 업 (3칸)
; F8 = 스크롤 다운 (3칸)
; Shift 조합 = 빠른 스크롤 (10칸)
F7::Send "{WheelUp 3}"
F8::Send "{WheelDown 3}"
+F7::Send "{WheelUp 10}"
+F8::Send "{WheelDown 10}"
