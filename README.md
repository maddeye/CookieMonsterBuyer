[![CI](https://github.com/maddeye/CookieMonsterBuyer/actions/workflows/publish.yml/badge.svg)](https://github.com/maddeye/CookieMonsterBuyer/actions/workflows/publish.yml)

# CookieMonsterBuyer

A Cookie Clicker mod that automatically buys the best upgrades and buildings using Cookie Monster's recommendations.

## Features
- **Autobuy**: Automatically purchases the best upgrade or building based on Cookie Monster's payback period (PP) and color coding.
- **Blue Upgrade Priority**: Always prioritizes "Blue" (best) upgrades as determined by Cookie Monster.
- **Configurable Delay**: Set how often the autobuyer checks and buys (minimum 1 second).
- **Purchase Logging**: Optionally log purchases and autobuyer actions to the console.
- **Seamless Integration**: Works as an extension to the Cookie Monster mod.

## Requirements
- [Cookie Monster](https://cookie-monster.team/) must be installed and loaded before this mod.
- Cookie Clicker (Steam or Web version).


## Using

## Bookmarklet

Copy this code and save it as a bookmark. Paste it in the URL section. To activate, click the bookmark when the game's open.
```js
javascript: (function () {
  Game.LoadMod('https://cookiemonsterteam.github.io/CookieMonster/dist/CookieMonster.js');
})();
```
## Load Manually
1. **Open Game**
2. **Open Console (Press F12)**
1. **Install Cookie Monster** 
2. **Load CookieMonsterBuyer**:
     ```js
     Game.LoadMod('https://maddeye.github.io/CookieMonsterBuyer/CookieMonsterBuyer.js');
     ```

## Settings
- Open the **Options** menu in Cookie Clicker.
- Find the **Cookie Monster Buyer** section.
- **Enable/Disable** the autobuyer with the toggle button.
- **Show/Hide Logs** to control console logging.
- **Set Autobuy Delay** (in seconds, minimum 1) to control how often the mod checks for purchases.
- The mod will always prioritize "Blue" upgrades (as marked by Cookie Monster) and otherwise buy the best value upgrade or building.

## How it Works
- Waits for Cookie Monster to load and uses its data to determine the best purchases.
- Only buys upgrades marked as "Blue" immediately; otherwise, compares payback period (PP) for upgrades and buildings.
- Delay and logging are fully user-configurable in the options menu.

## Credits
- Mod by Madd Eye
- Powered by [Cookie Monster](https://cookie-monster.team/) 