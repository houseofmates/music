fix android mobile UI padding in this capacitor music app. the previous fix removed the fullscreen flags and yellow border, but the actual padding values are unchanged — the space is still there, just no longer framed by a visible border. we need to remove the excess padding itself.

PROJECT
- path: /home/house/projects/music
- frontend: frontend/src/ (react + tailwind css + custom index.css)
- android native: android/app/src/main/java/com/house/music/MainActivity.java
- capacitor webview renders the react app

CURRENT STATE (already done — do NOT revert these)
- MainActivity.java lines 82-83: removed FLAG_LAYOUT_FULLSCREEN / FLAG_LAYOUT_NO_LIMITS / SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN. now uses SYSTEM_UI_FLAG_VISIBLE with clearFlags(FLAG_LAYOUT_NO_LIMITS). status bar is visible and static.
- BottomNav.jsx line 447: nav element still has `border-t border-[#ffbb20]` — this yellow top border on the nav IS the "yellow rectangle" the user sees. do NOT remove this border unless asked.
- index.css lines 770-774: `.mobile-player-strip, .mobile-player-strip > div { border: none !important; outline: none !important; box-shadow: none !important; }` — this removes borders from the player strip children, not the nav itself.

WHAT IS STILL BROKEN (two separate issues)

ISSUE 1: STATUS BAR TOP PADDING
- index.css line 761: `.pt-safe { padding-top: 5px !important; }`
- this class is applied to app content to push it below the status bar
- now that the app is NOT fullscreen, this 5px is unnecessary dead space
- FIX: change `.pt-safe` to `padding-top: 0 !important;` (or remove the rule entirely if nothing else uses it — search first)

ISSUE 2: PLAYER BAR / BOTTOM NAV PADDING
the bottom area has too much vertical padding in two places:

a) the nav element (BottomNav.jsx line 447):
   className="fixed bottom-0 left-0 right-0 border-t border-[#ffbb20] flex flex-col pb-safe z-40"
   `pb-safe` adds bottom safe-area padding via index.css line 762:
   `.pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }`
   the fallback is 20px which is excessive. change the fallback to something like 8px or 0px.

b) the mobile player strip spacing:
   BottomNav.jsx line 485: `<div className="flex flex-col gap-0 px-2 py-0">` — controls row
   BottomNav.jsx line 558: `<div className="pb-0.5">` — progress bar wrapper
   BottomNav.jsx line 453: the mobile-player-strip div itself has no padding class but its children have px-2 py-0

   the overall mobile player strip + nav icons area is taller than it needs to be. the controls row has buttons that are w-10 h-10 (40px), and the progress bar adds more height. reduce vertical padding everywhere in the mobile player strip:
   - change `px-2` to `px-1.5` on the controls/progress wrapper (line 485)
   - change `pb-0.5` to `pb-0` on the progress bar wrapper (line 558)
   - ensure the nav icons row (line 611, h-14 xl:h-16) stays the same height — that's the navigation row height, don't touch that

VERIFICATION
after editing, run a grep to confirm no other `.pt-safe` or `.pb-safe` usages remain that would break, and verify the exact padding values in index.css.

do NOT touch anything else. do NOT modify MainActivity.java. do NOT change the border-t on the nav. only fix the two padding issues above.
