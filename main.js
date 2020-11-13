/**
 * An array of status effect icons which can be applied to Tokens
 * @type {Array}
 */
CONFIG.statusEffects = [
  "modules/conditions5e/icons/dead.svg",
  "modules/conditions5e/icons/unconscious.svg",
  "modules/conditions5e/icons/stunned.svg",
  "modules/conditions5e/icons/exhaustion1.svg",

  "modules/conditions5e/icons/incapacitated.svg",
  "modules/conditions5e/icons/paralyzed.svg",
  "modules/conditions5e/icons/petrified.svg",
  "modules/conditions5e/icons/exhaustion2.svg",

  "modules/conditions5e/icons/grappled.svg",
  "modules/conditions5e/icons/restrained.svg",
  "modules/conditions5e/icons/prone.svg",
  "modules/conditions5e/icons/exhaustion3.svg",

  "modules/conditions5e/icons/charmed.svg",
  "modules/conditions5e/icons/frightened.svg",
  "modules/conditions5e/icons/poisoned.svg",
  "modules/conditions5e/icons/exhaustion4.svg",

  "modules/conditions5e/icons/blinded.svg",
  "modules/conditions5e/icons/deafened.svg",
  "modules/conditions5e/icons/diseased.svg",
  "modules/conditions5e/icons/exhaustion5.svg",
  // spells
  "modules/conditions5e/icons/bane.svg",
  "modules/conditions5e/icons/barkskin.svg",
  "modules/conditions5e/icons/bless.svg",
  "modules/conditions5e/icons/darkvision.svg",

  "modules/conditions5e/icons/dragon-breath.svg",
  "modules/conditions5e/icons/enhance-ability.svg",
  "modules/conditions5e/icons/faerie-fire.svg",
  "modules/conditions5e/icons/fire-shield.svg",

  "modules/conditions5e/icons/foresight.svg",
  "modules/conditions5e/icons/fortunes-favor.svg",
  "modules/conditions5e/icons/freedom-of-movement.svg",
  "modules/conditions5e/icons/guiding-bolt.svg",

  "modules/conditions5e/icons/haste.svg",
  "modules/conditions5e/icons/heat-metal.svg",
  "modules/conditions5e/icons/heroism.svg",
  "modules/conditions5e/icons/hex.svg",

  "modules/conditions5e/icons/hunters-mark.svg",
  "modules/conditions5e/icons/mage-armor.svg",
  "modules/conditions5e/icons/pass-without-trace.svg",
  "modules/conditions5e/icons/shillelagh.svg",

  "modules/conditions5e/icons/slow.svg",
  "modules/conditions5e/icons/vicious-mockery.svg",
];
  
// Condition Types
CONFIG.conditionTypes = {
  "blinded": "Blinded",
  "charmed": "Charmed",
  "dead": "Dead",
  "deafened": "Deafened",
  "diseased": "Diseased",
  "exhaustion": "Exhaustion",
  "exhaustion1": "Exhaustion Level 1",
  "exhaustion2": "Exhaustion Level 2",
  "exhaustion3": "Exhaustion Level 3",
  "exhaustion4": "Exhaustion Level 4",
  "exhaustion5": "Exhaustion Level 5",
  "frightened": "Frightened",
  "grappled": "Grappled",
  "incapacitated": "Inacapacitated",
  "invisible": "Invisible",
  "paralyzed": "Paralyzed",
  "petrified": "Petrified",
  "poisoned": "Poisoned",
  "prone": "Prone",
  "restrained": "Restrained",
  "stunned": "Stunned",
  "unconscious": "Unconscious",
  "wounded": "Wounded",
  // spell effects
  "bane": "Bane",
  "barkskin": "Barkskin",
  "beaconOfHope": "Beacon of Hope",
  "bless": "Bless",
  "darkvision": "Darkvision",
  "dragonsBreath": "Dragon's Breath",
  "enhanceAbility": "Enhance Ability",
  "faerieFire": "Faerie Fire",
  "fireShield": "Fire Shield",
  "foresight": "Foresight",
  "fortunesFavor": "Fortune's Favor",
  "freedomOfMovement": "Freedom of Movement",
  "guidingBolt": "Guiding Bolt",
  "haste": "Haste",
  "heatMetal": "Heat Metal",
  "heroism": "Heroism",
  "hex": "Hex",
  "huntersMark": "Hunter's Mark",
  "mageArmor": "Mage Armor",
  "passWithoutTrace": "Pass Without Trace",
  "shillelagh": "Shillelagh",
  "slow": "Slow",
  "viciousMockery": "Vicious Mockery"
};

// Replace selected control icons
CONFIG.controlIcons.visibility = "modules/conditions5e/icons/invisible.svg";
CONFIG.controlIcons.defeated = "modules/conditions5e/icons/dead.svg";

// Patch CombatTracker to work with token HUD overlay
Hooks.once("ready", function() {
  let newClass = CombatTracker;
  newClass = trPatchLib.patchMethod(newClass, "_onCombatantControl", 21,
    `if ( isDefeated && !token.data.overlayEffect ) token.toggleOverlay(CONFIG.controlIcons.defeated);`,
    `if ( isDefeated && token.data.overlayEffect !== CONFIG.controlIcons.defeated ) token.toggleOverlay(CONFIG.controlIcons.defeated);`);
  if (!newClass) return;
  CombatTracker.prototype._onCombatantControl = newClass.prototype._onCombatantControl;
});

// Function to use token overlay to show status as wounded, unconscious, or dead
Token.prototype._updateHealthOverlay = function(tok) {
  console.log("conditions5e | _updateHealthOverlay");
  let maxHP = tok.actor.data.data.attributes.hp.max;
  let curHP = tok.actor.data.data.attributes.hp.value;
  let priorHealth = tok.data.overlayEffect;
  let newHealth = null;
  if ( curHP <= 0 ) {
    if ( priorHealth === "modules/conditions5e/icons/dead.svg" ) newHealth = priorHealth;
    else newHealth = "modules/conditions5e/icons/almostdead.svg";
  }
  else if ( curHP / maxHP < 0.5 ) newHealth = "modules/conditions5e/icons/wounded.svg";
  if ( newHealth !== priorHealth ) {
    if ( newHealth === null ) tok.toggleOverlay(priorHealth);
    else tok.toggleOverlay(newHealth);
  }
};

// This hook is required for Tokens NOT linked to an Actor
Hooks.on("updateToken", (scene, sceneID, update, tokenData, userId) => {
  console.log("conditions5e | firing updateToken");
  let token = canvas.tokens.get(update._id);
  if (token.owner) token._updateHealthOverlay(token);
});

// This hook is required for Tokens linked to an Actor
Hooks.on("updateActor", (entity, updated) => {
  console.log("conditions5e | firing updateActor");
  if (entity.owner) entity.getActiveTokens(true).map(x => x._updateHealthOverlay(x));
});
