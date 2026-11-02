# Bullet Hell Chess

**Play it: https://dreadfulspark.github.io/bullet-hell-chess/**

Chess with no turns. Every piece has a cooldown, both armies move at the same time, and enemy attacks are telegraphed with red arrows, so you dodge them like bullets. Clear 15 waves of hazards and bosses to win, then go endless.

It's a single HTML file with no dependencies beyond two Google Fonts. Music and sound effects are generated in the browser.

## How to play

- Tap a piece, then a square, or drag it. A full ring means the piece is ready.
- Tap a piece that's still cooling down to queue a move. It fires the moment the ring fills.
- Red arrows show enemy moves winding up. Move the target before the reticle closes.
- Take their king to clear the wave. Lose yours and the run ends.
- **P** or **Esc** pauses. **Space** uses Stopwatch if you have it.

## What's in it

- **22 power-ups.** Pick 2 at the start of each run, then one more after every wave, with one reroll per wave.
- **8 hazards:** lava, ice, portals, conveyors, fog, meteors, lasers and quicksand.
- **6 bosses:** the Iron King, Summoner, Blinker, Warlord, Hydra and Juggernaut. Each one becomes enraged at 1 HP.
- **Golden pieces** worth 5× points, if you catch them before they escape.
- **Endless mode** after wave 15, with stacking twists.
- **12 badges** to unlock, a run report at the end, and progress that saves between visits.
- **Music** that changes for menus, waves and bosses, and a board that pulses on the beat.

How the latest batch of features was chosen: [docs/ideas-tournament.md](docs/ideas-tournament.md) (100 ideas, 20 survivors).

## Development

- `bullet-hell-chess.html` is the game source. It's written as a page body without the `<html>`/`<head>` wrapper.
- Run `./build.sh` to regenerate `index.html`, the full page that GitHub Pages serves.
- `.claude/serve.ps1` is a local test server, and `.claude/bot.js` is a balance-testing bot. Open `http://localhost:5173/?shim&bot` and run `BOT.chunk('mid', 40, .55, .7)` in the console to simulate 40 runs.
