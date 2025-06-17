Game.registerMod("CookieMonsterBuyer", {
  init: function () {
    const mod = this;

    if (localStorage.getItem("CookieMonsterBuyer_enabled") === null)
      localStorage.setItem("CookieMonsterBuyer_enabled", "true");
    if (localStorage.getItem("CookieMonsterBuyer_showLogs") === null)
      localStorage.setItem("CookieMonsterBuyer_showLogs", "false");

    mod.enabled = localStorage.getItem("CookieMonsterBuyer_enabled") === "true";
    mod.showLogs = localStorage.getItem("CookieMonsterBuyer_showLogs") === "true";
    mod.ready = false;

    // Add default buy delay if not set
    if (localStorage.getItem("CookieMonsterBuyer_buyDelay") === null)
      localStorage.setItem("CookieMonsterBuyer_buyDelay", "5");
    mod.buyDelay = Math.max(1, parseInt(localStorage.getItem("CookieMonsterBuyer_buyDelay"), 10) || 5); // in seconds
    let autobuyInterval = null;

    console.log("[CookieMonsterBuyer] Mod loaded. Waiting for Cookie Monster...");

    const waitForCM = setInterval(() => {
      if (
        typeof CookieMonsterData !== "undefined" &&
        CookieMonsterData.Objects1?.Cursor &&
        typeof CookieMonsterData.Objects1.Cursor.pp === "number" &&
        CookieMonsterData.Upgrades && Object.keys(CookieMonsterData.Upgrades).length > 0
      ) {
        clearInterval(waitForCM);
        mod.ready = true;
        console.log("[CookieMonsterBuyer] Cookie Monster detected. Starting autobuyer.");
        startAutobuyLoop();
      }
    }, 1000);

    mod.inject = function () {
      if (Game.onMenu !== 'prefs') return;
      if (document.getElementById("cookieMonsterBuyerSection")) return;

      const menu = l('menu');
      const section = document.createElement('div');
      section.className = 'subsection';
      section.id = 'cookieMonsterBuyerSection';

      section.innerHTML = `
        <div class="title">Cookie Monster Buyer</div>
        <div class="listing">
          <a class="smallFancyButton" id="cookieMonsterBuyerToggle">${mod.enabled ? "Disable" : "Enable"}</a>
          <label> Automatically buys the best building (1/10/100) if no better upgrade is available.</label>
        </div>
        <div class="listing">
          <a class="smallFancyButton" id="cookieMonsterBuyerLogToggle">${mod.showLogs ? "Hide Logs" : "Show Logs"}</a>
          <label> Show purchase logs in console</label>
        </div>
        <div class="listing">
          <label>Autobuy delay (seconds, min 1): </label>
          <input type="number" id="cookieMonsterBuyerDelayInput" min="1" value="${mod.buyDelay}" style="width: 50px;">
        </div>
      `;

      const insertAfter = menu.querySelector('.block');
      if (insertAfter && insertAfter.nextSibling) {
        menu.insertBefore(section, insertAfter.nextSibling);
      } else {
        menu.appendChild(section);
      }

      document.getElementById("cookieMonsterBuyerToggle").onclick = function () {
        mod.enabled = !mod.enabled;
        localStorage.setItem("CookieMonsterBuyer_enabled", mod.enabled);
        this.textContent = mod.enabled ? "Disable" : "Enable";
        console.log("[CookieMonsterBuyer] Toggled:", mod.enabled);
      };

      document.getElementById("cookieMonsterBuyerLogToggle").onclick = function () {
        mod.showLogs = !mod.showLogs;
        localStorage.setItem("CookieMonsterBuyer_showLogs", mod.showLogs);
        this.textContent = mod.showLogs ? "Hide Logs" : "Show Logs";
        console.log("[CookieMonsterBuyer] Logging is now", mod.showLogs ? "enabled" : "disabled");
      };

      document.getElementById("cookieMonsterBuyerDelayInput").onchange = function () {
        let val = Math.max(1, parseInt(this.value, 10) || 1);
        this.value = val;
        mod.buyDelay = val;
        localStorage.setItem("CookieMonsterBuyer_buyDelay", val);
        // Update the running interval
        if (autobuyInterval) clearInterval(autobuyInterval);
        startAutobuyLoop();
        console.log(`[CookieMonsterBuyer] Autobuy delay set to ${val} seconds.`);
      };
    };

    const oldUpdateMenu = Game.UpdateMenu;
    Game.UpdateMenu = function () {
      if (oldUpdateMenu) oldUpdateMenu();
      if (Game.onMenu === 'prefs') {
        Game.mods.CookieMonsterBuyer.inject();
      }
    };

    function startAutobuyLoop() {
      if (autobuyInterval) clearInterval(autobuyInterval);
      autobuyInterval = setInterval(() => {
        if (!mod.enabled || !mod.ready) return;
      
        const bestUpgrade = getBestUpgrade();
        const bestBuilding = getBestBuilding();
        
        const upgradePP = bestUpgrade?.pp ?? Infinity;
        const buildingPP = bestBuilding?.data?.pp ?? Infinity;
        
        const upgrade = bestUpgrade?.obj;
        const building = bestBuilding ? Game.Objects[bestBuilding.name] : null;
        const upgradeColor = bestUpgrade?.cmEntry?.colour;

        // If the best upgrade is "Blue", always wait for/buy it
        if (upgrade && upgradeColor === "Blue") {
          if (Game.cookies >= upgrade.getPrice()) {
            upgrade.buy();
            if (mod.showLogs) {
              console.log(`[CookieMonsterBuyer] Bought upgrade: ${upgrade.name} at ${Beautify(upgrade.getPrice())}`);
            }
          } else if (mod.showLogs) {
            console.log(`[CookieMonsterBuyer] Waiting for blue upgrade: ${upgrade.name} (need ${Beautify(upgrade.getPrice())})`);
          }
          return;
        }

        // Otherwise, compare PP as before
        if (upgrade && upgradePP < buildingPP && Game.cookies >= upgrade.getPrice()) {
          upgrade.buy();
          if (mod.showLogs) {
            console.log(`[CookieMonsterBuyer] Bought upgrade: ${upgrade.name} at ${Beautify(upgrade.getPrice())}`);
          }
          return;
        }

        // Otherwise, buy the best building if affordable
        if (building && Game.cookies >= building.getPrice(bestBuilding.bulk)) {
          building.buy(bestBuilding.bulk);
          if (mod.showLogs) {
            console.log(`[CookieMonsterBuyer] Bought ${bestBuilding.bulk}x ${bestBuilding.name} at ${Beautify(building.getPrice(bestBuilding.bulk))}`);
          }
        }
      }, mod.buyDelay * 1000);
    }

    function getBestUpgrade() {
      if (!Array.isArray(Game.UpgradesInStore)) return null;

      const storeUpgrades = Game.UpgradesInStore
        .map(u => {
          const cmEntry = CookieMonsterData.Upgrades?.[u.name];
          return {
            obj: u,
            pp: cmEntry?.pp ?? Infinity,
            cmEntry: cmEntry
          };
        })
        .filter(entry => typeof entry.pp === 'number' && isFinite(entry.pp));

      if (!storeUpgrades.length) {
        return null;
      }

      const best = storeUpgrades.reduce((a, b) => (a.pp < b.pp ? a : b));
      return best;
    }
    
    function getBestBuilding() {
      const sets = [
        { obj: CookieMonsterData.Objects1, bulk: 1 },
        { obj: CookieMonsterData.Objects10, bulk: 10 },
        { obj: CookieMonsterData.Objects100, bulk: 100 },
      ];

      let best = null;

      for (const { obj, bulk } of sets) {
        for (const [name, data] of Object.entries(obj)) {
          if (!data || typeof data.pp !== "number" || !isFinite(data.pp)) continue;
          if (!best || data.pp < best.data.pp) {
            best = { name, data, bulk };
          }
        }
      }

      return best;
    }
  }
});
