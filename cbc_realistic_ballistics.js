"use strict";

// Browser port of CBCRealisticBallistics 1.3.2. Keep constants and the
// seed-derived wind hash identical to RealisticFlightModel.java.
(function exposeCBCRealisticBallistics(global) {
  const TICKS_PER_SECOND = 20;
  const EARTH_ANGULAR_SPEED = 7.2921159e-5;
  const MASK_64 = (1n << 64n) - 1n;
  const TWO_POW_53 = 9007199254740992;

  // Every ballistic cannon family found in the 6.8.3 JAR set. Material and
  // single/dual barrel variants which use identical ammunition are grouped.
  const CANNONS = [
    { id: "manual", name: "Custom / projectile native size", caliber: null },
    { id: "cbc_big_cannon", name: "CBC Big Cannon (all materials)", caliber: 0.875 },
    { id: "cbc_drop_mortar", name: "CBC Drop Mortar", caliber: 0.305 },
    { id: "cbc_autocannon", name: "CBC Autocannon (steel)", caliber: 0.020, velocityModel: "cbc_autocannon" },
    { id: "military_small_single", name: "Military Supplement Small Single Cannon", caliber: 0.060, velocityModel: "military_dual" },
    { id: "military_small_dual", name: "Military Supplement Small Dual Cannon", caliber: 0.060, velocityModel: "military_dual" },
    { id: "military_small_medium_single", name: "Military Supplement Medium Single Cannon", caliber: 0.080, velocityModel: "military_dual" },
    { id: "military_small_medium_dual", name: "Military Supplement Medium Dual Cannon", caliber: 0.080, velocityModel: "military_dual" },
    { id: "military_large_single", name: "Military Supplement Large Cannon", caliber: 0.120, velocityModel: "military_dual" },
    { id: "military_large_dual", name: "Military Supplement Giant Cannon", caliber: 0.240, velocityModel: "military_dual" },
    { id: "military_projectile_rack", name: "Military Supplement Projectile Rack", caliber: 0.533, velocityModel: "military_rack" },
    { id: "military_torpedo_tube", name: "Military Supplement Torpedo Tube", caliber: 0.533, velocityModel: "military_torpedo" },
    { id: "modern_medium_cannon", name: "CBC Modern Warfare Medium Cannon (steel)", caliber: 0.155, velocityModel: "modern_medium" },
    { id: "modern_rotary_cannon", name: "CBC Modern Warfare Rotary Cannon (steel)", caliber: 0.020, velocityModel: "modern_rotary" },
    { id: "modern_gun_launcher", name: "CBC Modern Warfare Gun Launcher", caliber: 0.125 },
    { id: "modern_torpedo_tube", name: "CBC Modern Warfare Torpedo Tube", caliber: 0.533, velocityModel: "military_torpedo" },
    { id: "cbc_at_heavy_autocannon", name: "CBC AT Heavy Autocannon (steel)", caliber: 0.045, velocityModel: "cbc_autocannon" },
    { id: "cbc_at_twin_autocannon", name: "CBC AT Twin Autocannon (steel)", caliber: 0.020, velocityModel: "cbc_autocannon" },
    { id: "cbc_at_vertical_twin_autocannon", name: "CBC AT Vertical Twin Autocannon (steel)", caliber: 0.020, velocityModel: "cbc_autocannon" },
    { id: "cbc_at_rocket_pod", name: "CBC AT Rocket Pod (steel)", caliber: 0.122, velocityModel: "cbc_at_rocket" },
    { id: "cbc_at_medium_rocket_rail", name: "CBC AT Medium Rocket Rail (steel)", caliber: 0.220, velocityModel: "cbc_at_rocket" },
    { id: "cbcatfix_big_rocket_rail", name: "CBC AT Fix Big Rocket Rail (steel)", caliber: 0.300, velocityModel: "cbc_at_rocket" },
    { id: "arcon_cannon", name: "ARCON Cannon", caliber: 0.120, velocityModel: "arcon" }
  ];

  // Values below are the launch speeds used by the installed 6.8.3 mods.
  // CBC works in blocks/tick, therefore all values are converted to m/s by x20.
  const MILITARY_DUAL_SPEED_BPT = {
    "cbcmoreshells:normal_ap_shot": 8,
    "cbcmoreshells:normal_ap_shell": 8,
    "cbcmoreshells:normal_apbc_shell": 8,
    "cbcmoreshells:normal_sap_shell": 8,
    "cbcmoreshells:normal_he_shell": 8,
    "cbcmoreshells:normal_incendiary_he_shell": 8,
    "cbcmoreshells:normal_antiair_he_shell": 8,
    "cbcmoreshells:extended_ap_shot": 10,
    "cbcmoreshells:extended_antiair_he_shell": 12
  };

  const MILITARY_RACK_SPEED_BPT = {
    "cbcmoreshells:aphe_bomb": 0.2,
    "cbcmoreshells:he_bomb": 0.2,
    "cbcmoreshells:aphe_bouncing_bomb": 0.2,
    "cbcmoreshells:he_bouncing_bomb": 0.2,
    "cbcmoreshells:aphe_rocket": 2,
    "cbcmoreshells:he_rocket": 2,
    "cbcmoreshells:dual_aphe_rocket": 2,
    "cbcmoreshells:dual_he_rocket": 2,
    "cbcmoreshells:aphe_loitering_rocket": 0.5,
    "cbcmoreshells:he_loitering_rocket": 0.5,
    "cbcmoreshells:racked_torpedo": 0.25,
    "cbcmoreshells:depth_charge": 0.2
  };

  const MILITARY_TORPEDO_SPEED_BPT = {
    "cbcmoreshells:early_torpedo": 0.829,
    "cbcmoreshells:gambler_medium_range_torpedo": 1.005,
    "cbcmoreshells:highspeed_long_range_torpedo": 1.407,
    "cbcmoreshells:light_high_speed_torpedo": 1.307,
    "cbcmoreshells:long_range_shrapnel_torpedo": 1.09,
    "cbcmoreshells:long_range_torpedo": 1.005,
    "cbcmoreshells:medium_range_deepwater_torpedo": 1.055,
    "cbcmoreshells:medium_range_deepwater_torpedo_typeb": 0.97,
    "cbcmoreshells:medium_range_torpedo": 1.055,
    "cbcmoreshells:medium_range_torpedo_typeb": 1.15,
    "cbcmoreshells:primary_torpedo": 0.905,
    "cbcmoreshells:reductive_highspeed_torpedo": 1.307,
    "cbcmoreshells:reductive_long_range_torpedo": 1.005,
    "cbcmoreshells:reductive_medium_range_torpedo": 1.055,
    "cbcmoreshells:reinforced_long_range_torpedo": 0.779,
    "cbcmoreshells:reinforced_medium_range_torpedo": 0.98,
    "cbcmoreshells:reinforced_reductive_medium_range_torpedo": 1.005,
    "cbcmoreshells:reinforced_reductive_short_range_torpedo": 0.93,
    "cbcmoreshells:reinforced_short_range_torpedo": 0.955,
    "cbcmoreshells:short_range_torpedo": 1.055,
    "cbcmoreshells:slow_long_range_torpedo": 0.678,
    "cbcmoreshells:ultraspeed_torpedo": 1.482
  };

  function barrelVelocityMps(totalLength, baseSpeed, speedPerBarrel, maxIncreases, multiplier) {
    const barrelCount = Math.max(0, Math.floor(Number(totalLength) || 0) - 1);
    const speedBpt = baseSpeed * multiplier
      + Math.min(barrelCount, maxIncreases) * speedPerBarrel * multiplier;
    return speedBpt * TICKS_PER_SECOND;
  }

  function fixedMuzzleVelocity(cannonId, projectileId, totalLength) {
    const cannon = CANNONS.find((entry) => entry.id === cannonId);
    switch (cannon?.velocityModel) {
      case "military_dual": return (MILITARY_DUAL_SPEED_BPT[projectileId] ?? 4) * TICKS_PER_SECOND;
      case "military_rack": return (MILITARY_RACK_SPEED_BPT[projectileId] ?? 0.5) * TICKS_PER_SECOND;
      case "military_torpedo": return (MILITARY_TORPEDO_SPEED_BPT[projectileId] ?? 1) * TICKS_PER_SECOND;
      case "cbc_autocannon": return barrelVelocityMps(totalLength, 3, 1.5, 4, 1);
      case "modern_medium": return barrelVelocityMps(totalLength, 3, 1, 11, 1);
      case "modern_rotary": return barrelVelocityMps(totalLength, 3, 1.5, 3, 1);
      case "cbc_at_rocket": return barrelVelocityMps(totalLength, 3, 1.5, 4, 0.5);
      case "arcon": return 25 * TICKS_PER_SECOND;
      default: return null;
    }
  }

  const RAW_PROJECTILES = [
    ["arcon:bops_projectile", 8],
    ["cbcatfix:flak_shell", 2], ["cbcatfix:heat_shell", 2],
    ["cbcatfix:heavy_he_shell", 4], ["cbcatfix:hesh_shell", 2.5],
    ["cbcmodernwarfare:ap_mediumshell", 5], ["cbcmodernwarfare:apds_autocannon", 3.5],
    ["cbcmodernwarfare:apds_mediumshell", 5], ["cbcmodernwarfare:apds_shot", 8],
    ["cbcmodernwarfare:apfsds_mediumshell", 6], ["cbcmodernwarfare:aphe_mediumshell", 4],
    ["cbcmodernwarfare:canister_autocannon", 1], ["cbcmodernwarfare:canister_burst", 0.25],
    ["cbcmodernwarfare:canister_mediumshell", 1], ["cbcmodernwarfare:he_autocannon", 1],
    ["cbcmodernwarfare:he_mediumshell", 1], ["cbcmodernwarfare:heap_mediumshell", 1],
    ["cbcmodernwarfare:heap_shell", 2], ["cbcmodernwarfare:heat_jet", 5],
    ["cbcmodernwarfare:hef_mediumshell", 1], ["cbcmodernwarfare:hefrag_shell", 2],
    ["cbcmodernwarfare:hvap_autocannon", 2.5], ["cbcmodernwarfare:munitions_contraption", 2],
    ["cbcmodernwarfare:smoke_grenade", 0], ["cbcmodernwarfare:smoke_mediumshell", 1],
    ["cbcmoreshells:airdropped_shrapnel_torpedo", 0.1], ["cbcmoreshells:airdropped_torpedo", 0.1],
    ["cbcmoreshells:antiair_he_shell", 0.1], ["cbcmoreshells:antiair_machine_gun_bullet", 0.5],
    ["cbcmoreshells:antiair_shrapnel_burst", 8], ["cbcmoreshells:antiair_shrapnel_shell", 0.1],
    ["cbcmoreshells:ap_super_heavy_shot", 16.5], ["cbcmoreshells:apbc_shell", 13],
    ["cbcmoreshells:apbc_shot", 14], ["cbcmoreshells:apfsds_shot", 14],
    ["cbcmoreshells:aphe_bomb", 24], ["cbcmoreshells:aphe_bouncing_bomb", 24],
    ["cbcmoreshells:aphe_cannon_rocket", 7.5], ["cbcmoreshells:aphe_loitering_rocket", 14],
    ["cbcmoreshells:aphe_rocket", 14], ["cbcmoreshells:baguette_shot", 8],
    ["cbcmoreshells:baked_apfsds_shot", 7], ["cbcmoreshells:beef_noodle", 0.1],
    ["cbcmoreshells:bubble_drink", 14], ["cbcmoreshells:cannon_torpedo", 0.1],
    ["cbcmoreshells:deepwater_shrapnel_torpedo", 0.1], ["cbcmoreshells:depth_charge", 0.1],
    ["cbcmoreshells:dual_aphe_rocket", 13.5], ["cbcmoreshells:dual_he_rocket", 0.1],
    ["cbcmoreshells:early_torpedo", 0.1], ["cbcmoreshells:extended_antiair_he_shell", 0.1],
    ["cbcmoreshells:extended_ap_shot", 8], ["cbcmoreshells:gambler_medium_range_torpedo", 0.1],
    ["cbcmoreshells:he_bomb", 0.1], ["cbcmoreshells:he_bouncing_bomb", 0.1],
    ["cbcmoreshells:he_cannon_rocket", 0.1], ["cbcmoreshells:he_loitering_rocket", 0.1],
    ["cbcmoreshells:he_rocket", 0.1], ["cbcmoreshells:hesh_shell", 0.1],
    ["cbcmoreshells:highspeed_long_range_torpedo", 0.1], ["cbcmoreshells:highspeed_torpedo", 0.1],
    ["cbcmoreshells:incendiary_he_shell", 0.1], ["cbcmoreshells:inferior_he_shell", 0.1],
    ["cbcmoreshells:light_high_speed_torpedo", 0.1], ["cbcmoreshells:long_range_shrapnel_torpedo", 0.1],
    ["cbcmoreshells:long_range_torpedo", 0.1], ["cbcmoreshells:medium_range_deepwater_torpedo", 0.1],
    ["cbcmoreshells:medium_range_deepwater_torpedo_typeb", 0.1], ["cbcmoreshells:medium_range_torpedo", 0.1],
    ["cbcmoreshells:medium_range_torpedo_typeb", 0.1], ["cbcmoreshells:normal_antiair_he_shell", 0.1],
    ["cbcmoreshells:normal_ap_shell", 6.5], ["cbcmoreshells:normal_ap_shot", 8.75],
    ["cbcmoreshells:normal_apbc_shell", 6.25], ["cbcmoreshells:normal_he_shell", 0.1],
    ["cbcmoreshells:normal_incendiary_he_shell", 0.1], ["cbcmoreshells:normal_sap_shell", 4.25],
    ["cbcmoreshells:primary_torpedo", 0.1], ["cbcmoreshells:racked_torpedo", 0.1],
    ["cbcmoreshells:reductive_highspeed_torpedo", 0.1], ["cbcmoreshells:reductive_long_range_torpedo", 0.1],
    ["cbcmoreshells:reductive_medium_range_torpedo", 0.1], ["cbcmoreshells:reinforced_long_range_torpedo", 0.1],
    ["cbcmoreshells:reinforced_medium_range_torpedo", 0.1], ["cbcmoreshells:reinforced_reductive_medium_range_torpedo", 0.1],
    ["cbcmoreshells:reinforced_reductive_short_range_torpedo", 0.1], ["cbcmoreshells:reinforced_short_range_torpedo", 0.1],
    ["cbcmoreshells:sap_shell", 7.5], ["cbcmoreshells:sharpnel_torpedo", 0.1],
    ["cbcmoreshells:shelless_ap_shot", 5], ["cbcmoreshells:shelless_he_shell", 0.1],
    ["cbcmoreshells:shelless_incendiary_he_shell", 0.1], ["cbcmoreshells:shelless_sap_shell", 5],
    ["cbcmoreshells:short_range_torpedo", 0.1], ["cbcmoreshells:slow_long_range_torpedo", 0.1],
    ["cbcmoreshells:torpedo_burst", 12], ["cbcmoreshells:ultraspeed_torpedo", 0.1],
    ["createbigcannons:ap_autocannon", 2], ["createbigcannons:ap_shell", 6],
    ["createbigcannons:ap_shot", 8], ["createbigcannons:bag_of_grapeshot", 2],
    ["createbigcannons:drop_mortar_shell", 2], ["createbigcannons:flak_autocannon", 1],
    ["createbigcannons:flak_burst", 0.75], ["createbigcannons:fluid_blob_burst", 0],
    ["createbigcannons:fluid_shell", 2], ["createbigcannons:grapeshot_burst", 1.5],
    ["createbigcannons:he_shell", 2], ["createbigcannons:machine_gun_bullet", 0.5],
    ["createbigcannons:mortar_stone", 4], ["createbigcannons:shot", 3],
    ["createbigcannons:shrapnel_burst", 0.75], ["createbigcannons:shrapnel_shell", 2],
    ["createbigcannons:smoke_shell", 2], ["createbigcannons:traffic_cone", 30],
    ["cbc_at:ap_rocket", 2], ["cbc_at:flak_rocket", 2], ["cbc_at:he_rocket", 2],
    ["cbc_at:hei_rocket", 2], ["cbc_at:medium_ap_rocket", 3], ["cbc_at:medium_he_rocket", 3],
    ["cbc_at:medium_hef_rocket", 3], ["cbc_at:medium_heat_rocket", 3],
    ["cbc_at:ha_ap_projectile", 4], ["cbc_at:ha_apds_projectile", 4],
    ["cbc_at:ha_apdsfs_projectile", 4], ["cbc_at:ha_he_projectile", 4],
    ["cbc_at:ha_hef_projectile", 4], ["cbc_at:ha_heat_projectile", 4],
    ["cbc_at:ha_smoke_projectile", 4], ["cbc_at:ha_heat_copper_ray", 0.25],
    ["cbc_at:apds_projectile", 2], ["cbc_at:apdsfs_projectile", 2],
    ["cbc_at:he_projectile", 2], ["cbc_at:hei_projectile", 2],
    ["cbc_at:cluster_projectile", 2],
    ["vestalihy:ptur_jet", 240]
  ];

  function inferDiameter(id) {
    const value = id.toLowerCase();
    if (value.includes("mediumshell")) return 0.155;
    if (value.includes("cbc_at:ha_")) return 0.045;
    if (value.includes("machine_gun") || value.includes("autocannon")
        || /cbc_at:(apds|apdsfs|he|hei|cluster)_projectile/.test(value)) return 0.020;
    if (value.includes("mediumshell") || value.includes("normal_")
        || value.includes("extended_")) return 0.4;
    return 0.8;
  }

  function inferCd(id) {
    const value = id.toLowerCase();
    if (value.includes("traffic_cone")) return 0.9;
    if (value.includes("mortar") || value.includes("grapeshot")) return 0.47;
    if (value.includes("mediumshell")) {
      if (value.includes("apfsds") || value.includes("apds")) return 0.18;
      if (value.includes("aphe") || value.includes(":ap_")) return 0.22;
      return 0.25;
    }
    if (value.endsWith(":ap_shot") || value.endsWith(":shot") || value.includes("solid_shot")) return 0.28;
    if (value.includes("ap_shell") || value.includes("apshell")) return 0.22;
    if (value.includes("autocannon") || value.includes("machine_gun")) return 0.2;
    if (value.includes("shell")) return 0.25;
    return 0.3;
  }

  const PROJECTILES = RAW_PROJECTILES
    .map(([id, referenceMass]) => ({ id, referenceMass, diameter: inferDiameter(id), cd: inferCd(id) }))
    .sort((a, b) => a.id.localeCompare(b.id));
  const PROJECTILE_MAP = new Map(PROJECTILES.map((entry) => [entry.id, entry]));

  const INTERNAL_PROJECTILE_PARTS = /(?:_burst$|heat_jet$|ha_heat_copper_ray$|ptur_jet$)/;
  const DUAL_CANNON_AMMO = /^cbcmoreshells:(?:normal_|extended_)/;
  const RACK_AMMO = /^cbcmoreshells:(?:(?:aphe|he)_(?:bomb|bouncing_bomb|loitering_rocket|rocket)|dual_(?:aphe|he)_rocket|racked_torpedo|depth_charge)$/;
  const TORPEDO_TUBE_AMMO = /^cbcmoreshells:(?:early_torpedo|gambler_medium_range_torpedo|highspeed_long_range_torpedo|light_high_speed_torpedo|medium_range_(?:deepwater_)?torpedo(?:_typeb)?|primary_torpedo|reductive_(?:highspeed|long_range|medium_range)_torpedo|reinforced_(?:long_range|medium_range|short_range|reductive_medium_range|reductive_short_range)_torpedo|short_range_torpedo|slow_long_range_torpedo|ultraspeed_torpedo)$/;
  const CORE_AUTOCANNON_AMMO = /^(?:createbigcannons:(?:ap_autocannon|flak_autocannon|machine_gun_bullet)|cbcmodernwarfare:(?:apds|canister|he|hvap)_autocannon|cbcmoreshells:antiair_machine_gun_bullet)$/;
  const CBC_AT_LIGHT_AUTOCANNON_AMMO = /^cbc_at:(?:apds|apdsfs|he|hei|cluster)_projectile$/;
  const CBC_AT_HEAVY_AUTOCANNON_AMMO = /^cbc_at:ha_(?:ap|apds|apdsfs|he|hef|heat|smoke)_projectile$/;

  function isLoadableProjectile(id) {
    return !INTERNAL_PROJECTILE_PARTS.test(id) && !id.endsWith(":smoke_grenade");
  }

  function isBigCannonProjectile(id) {
    if (id.startsWith("createbigcannons:")) {
      return !CORE_AUTOCANNON_AMMO.test(id) && !INTERNAL_PROJECTILE_PARTS.test(id);
    }
    if (id.startsWith("cbcatfix:")) return true;
    if (/^cbcmodernwarfare:(?:apds_shot|heap_shell|hefrag_shell)$/.test(id)) return true;
    if (id.startsWith("cbcmoreshells:")) {
      return isLoadableProjectile(id) && !DUAL_CANNON_AMMO.test(id)
        && !RACK_AMMO.test(id) && !TORPEDO_TUBE_AMMO.test(id)
        && !CORE_AUTOCANNON_AMMO.test(id);
    }
    return false;
  }

  function isProjectileCompatible(cannonId, projectileId) {
    if (!isLoadableProjectile(projectileId)) return false;
    switch (cannonId) {
      case "manual": return true;
      case "cbc_big_cannon": return isBigCannonProjectile(projectileId);
      case "cbc_drop_mortar": return /^(?:createbigcannons:(?:drop_mortar_shell|mortar_stone))$/.test(projectileId);
      case "cbc_autocannon":
      case "modern_rotary_cannon": return CORE_AUTOCANNON_AMMO.test(projectileId);
      case "military_small_single":
      case "military_small_dual":
      case "military_small_medium_single":
      case "military_small_medium_dual":
      case "military_large_single":
      case "military_large_dual": return DUAL_CANNON_AMMO.test(projectileId);
      case "military_projectile_rack": return RACK_AMMO.test(projectileId);
      case "military_torpedo_tube": return TORPEDO_TUBE_AMMO.test(projectileId);
      case "modern_medium_cannon": return /^cbcmodernwarfare:[a-z0-9_]*mediumshell$/.test(projectileId);
      case "modern_gun_launcher": return projectileId === "cbcmodernwarfare:munitions_contraption";
      case "modern_torpedo_tube": return TORPEDO_TUBE_AMMO.test(projectileId);
      case "cbc_at_heavy_autocannon": return CBC_AT_HEAVY_AUTOCANNON_AMMO.test(projectileId);
      case "cbc_at_twin_autocannon":
      case "cbc_at_vertical_twin_autocannon": return CBC_AT_LIGHT_AUTOCANNON_AMMO.test(projectileId);
      case "cbc_at_rocket_pod": return /^cbc_at:(?:ap|flak|he|hei)_rocket$/.test(projectileId);
      case "cbc_at_medium_rocket_rail": return /^cbc_at:medium_(?:ap|he|hef|heat)_rocket$/.test(projectileId);
      case "cbcatfix_big_rocket_rail": return /^cbc_at:(?:medium_)?(?:ap|flak|he|hei|hef|heat)_rocket$/.test(projectileId);
      case "arcon_cannon": return projectileId === "arcon:bops_projectile";
      default: return false;
    }
  }

  function projectileDefaults(id) {
    return PROJECTILE_MAP.get(id) || { id, referenceMass: 2, diameter: 0.8, cd: inferCd(id || "") };
  }

  function u64(value) { return BigInt.asUintN(64, value); }
  function mix64(value) {
    let v = u64(value);
    v = u64((v ^ (v >> 30n)) * 0xBF58476D1CE4E5B9n);
    v = u64((v ^ (v >> 27n)) * 0x94D049BB133111EBn);
    return u64(v ^ (v >> 31n));
  }
  function javaHash(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) hash = (Math.imul(31, hash) + text.charCodeAt(i)) | 0;
    return BigInt(hash);
  }
  function parseSeed(value) {
    try { return BigInt(String(value).trim() || "0"); } catch (_) { return 0n; }
  }
  function windSeed(config) {
    return mix64(parseSeed(config.worldSeed) ^ parseSeed(config.seedSalt)
      ^ u64(javaHash(config.dimensionId || "minecraft:overworld") * 0x9E3779B97F4A7C15n));
  }
  function latticeNoise(seed, x, z, channel) {
    const value = mix64(seed ^ mix64(BigInt(x) * 0x632BE59BD9B4E019n)
      ^ mix64(BigInt(z) * 0x9E3779B97F4A7C15n) ^ channel);
    return Number(value >> 11n) / TWO_POW_53 * 2 - 1;
  }
  function smoothStep(value) { return value * value * (3 - 2 * value); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smoothNoise(seed, x, z, channel) {
    const x0 = Math.floor(x); const z0 = Math.floor(z);
    const tx = smoothStep(x - x0); const tz = smoothStep(z - z0);
    const n00 = latticeNoise(seed, x0, z0, channel);
    const n10 = latticeNoise(seed, x0 + 1, z0, channel);
    const n01 = latticeNoise(seed, x0, z0 + 1, channel);
    const n11 = latticeNoise(seed, x0 + 1, z0 + 1, channel);
    return lerp(lerp(n00, n10, tx), lerp(n01, n11, tx), tz);
  }

  function windAt(position, config) {
    if (!config.windEnabled) return [0, 0, 0];
    let rain = 0; let thunder = 0;
    if (config.weatherAffectsWind) {
      if (config.weather === "rain") rain = 1;
      if (config.weather === "thunder") { rain = 1; thunder = 1; }
    }
    const base = config.windSpeed + config.rainWindBonus * rain + config.thunderWindBonus * thunder;
    const gust = config.gustSpeed + config.rainGustBonus * rain + config.thunderGustBonus * thunder;
    if (base <= 0 && gust <= 0) return [0, 0, 0];
    const size = Math.max(16, config.windRegionSize);
    const seed = config._windSeed ?? (config._windSeed = windSeed(config));
    const speedNoise = smoothNoise(seed, position[0] / size, position[2] / size, 0x51EEDn);
    const directionNoise = smoothNoise(seed, position[0] / size, position[2] / size, 0xD1CE7n);
    const verticalNoise = smoothNoise(seed, position[0] / size, position[2] / size, 0xA17n);
    const regionalMultiplier = Math.max(0, 1 + speedNoise * config.windSpeedVariation);
    const altitude = Math.max(0, position[1] - config.seaLevelY);
    const altitudeGain = Math.max(0, config.altitudeWindMultiplier - 1);
    const altitudeFactor = 1 + Math.min(altitudeGain, Math.log1p(altitude / 10) * 0.08);
    const speed = Math.max(0, (base * regionalMultiplier + gust * speedNoise) * altitudeFactor) / 20;
    const direction = (config.windDirection + directionNoise * config.windDirectionVariation) * Math.PI / 180;
    return [Math.sin(direction) * speed,
      gust * config.verticalTurbulence * verticalNoise / 20,
      Math.cos(direction) * speed];
  }

  function machMultiplier(mach) {
    if (mach < 0.75) return 1;
    if (mach < 0.95) return lerp(1, 1.65, (mach - 0.75) / 0.2);
    if (mach < 1.1) return lerp(1.65, 2.05, (mach - 0.95) / 0.15);
    if (mach < 1.5) return lerp(2.05, 1.45, (mach - 1.1) / 0.4);
    if (mach < 3) return lerp(1.45, 1.1, (mach - 1.5) / 1.5);
    return 1.1;
  }
  function length(v) { return Math.hypot(v[0], v[1], v[2]); }
  function acceleration(position, velocity, tick, config) {
    const wind = windAt(position, config);
    const relative = [velocity[0] - wind[0], velocity[1] - wind[1], velocity[2] - wind[2]];
    const relativeSpeed = length(relative);
    const altitude = position[1] - config.seaLevelY;
    const temperature = 15 + (config.biomeTemperature - 0.8) * 20 - Math.max(0, altitude) * 0.0065;
    const density = Math.max(0.02, Math.min(3, 1.225 * Math.exp(-altitude / config.scaleHeight)
      * (288.15 / Math.max(150, temperature + 273.15))));
    const soundSpeed = Math.max(250, 331.3 + 0.606 * temperature);
    const cd = config.cd * machMultiplier(relativeSpeed * 20 / soundSpeed);
    const diameter = Math.max(0.05, config.diameter);
    const area = Math.PI * diameter * diameter * 0.25;
    const relativeMass = Math.sqrt(Math.max(0.25, config.referenceMass) / 2);
    const massKg = Math.max(0.1, config.projectileDensity * area * diameter
      * config.lengthCalibers * config.solidFraction * relativeMass);
    let drag = relativeSpeed > 1e-12
      ? 0.5 * density * cd * area / massKg * relativeSpeed * relativeSpeed : 0;
    drag = Math.min(drag, relativeSpeed * 0.25);
    let ax = relativeSpeed > 1e-12 ? -relative[0] / relativeSpeed * drag : 0;
    let ay = -config.gravity / 400 + (relativeSpeed > 1e-12 ? -relative[1] / relativeSpeed * drag : 0);
    let az = relativeSpeed > 1e-12 ? -relative[2] / relativeSpeed * drag : 0;

    if (config.enableCoriolis) {
      const latitude = config.latitude * Math.PI / 180;
      const oy = EARTH_ANGULAR_SPEED * Math.sin(latitude);
      const oz = -EARTH_ANGULAR_SPEED * Math.cos(latitude);
      const vmx = velocity[0] * 20; const vmy = velocity[1] * 20; const vmz = velocity[2] * 20;
      ax += -2 / 400 * (oy * vmz - oz * vmy);
      ay += -2 / 400 * (oz * vmx);
      az += -2 / 400 * (-oy * vmx);
    }
    if (config.enableSpinDrift) {
      const horizontal = Math.hypot(velocity[0], velocity[2]);
      if (horizontal > 1e-12) {
        const amount = config.gravity / 400 * config.spinDriftFactor * Math.min(1, tick / 100);
        ax += velocity[2] / horizontal * amount;
        az += -velocity[0] / horizontal * amount;
      }
    }
    return [ax, ay, az];
  }

  function simulateToTarget(pitchDeg, yawDeg, start, target, speedBpt, config, collectPath) {
    const yaw = yawDeg * Math.PI / 180; const pitch = pitchDeg * Math.PI / 180;
    const horizontal = Math.cos(pitch) * speedBpt;
    let velocity = [Math.sin(yaw) * horizontal, Math.sin(pitch) * speedBpt, Math.cos(yaw) * horizontal];
    let position = [...start];
    const dx = target[0] - start[0]; const dz = target[2] - start[2];
    const targetRange = Math.hypot(dx, dz);
    const ux = dx / targetRange; const uz = dz / targetRange;
    const rightX = uz; const rightZ = -ux;
    const path = collectPath ? [{ x: 0, y: 0 }] : null;
    let previousAlong = 0; let previousPosition = [...position];
    const maxTicks = Math.min(20000, Math.max(1, config.maxTicks || 2000));
    for (let tick = 0; tick < maxTicks; tick += 1) {
      const accel = acceleration(position, velocity, tick, config);
      const next = [position[0] + velocity[0] + accel[0] * 0.5,
        position[1] + velocity[1] + accel[1] * 0.5,
        position[2] + velocity[2] + accel[2] * 0.5];
      const along = (next[0] - start[0]) * ux + (next[2] - start[2]) * uz;
      if (collectPath) path.push({ x: Math.hypot(next[0] - start[0], next[2] - start[2]), y: next[1] - start[1] });
      if (along >= targetRange && previousAlong < targetRange) {
        const fraction = (targetRange - previousAlong) / Math.max(1e-12, along - previousAlong);
        const hit = [lerp(previousPosition[0], next[0], fraction),
          lerp(previousPosition[1], next[1], fraction), lerp(previousPosition[2], next[2], fraction)];
        return { ok: true, yError: hit[1] - target[1],
          crossError: (hit[0] - target[0]) * rightX + (hit[2] - target[2]) * rightZ,
          ticks: tick + fraction, position: hit, path };
      }
      previousAlong = along; previousPosition = position; position = next;
      velocity = [velocity[0] + accel[0], velocity[1] + accel[1], velocity[2] + accel[2]];
      if (tick > 10 && position[1] < Math.min(start[1], target[1]) - 512 && velocity[1] < 0) break;
    }
    return { ok: false, yError: Infinity, crossError: Infinity, ticks: -1, path };
  }

  function refineSolution(initialPitch, initialYaw, start, target, speedBpt, config) {
    let pitch = initialPitch; let yaw = initialYaw;
    for (let iteration = 0; iteration < 12; iteration += 1) {
      const base = simulateToTarget(pitch, yaw, start, target, speedBpt, config, false);
      if (!base.ok) return null;
      if (Math.hypot(base.yError, base.crossError) < 0.01) break;
      const step = 0.05;
      const pitchSample = simulateToTarget(pitch + step, yaw, start, target, speedBpt, config, false);
      const yawSample = simulateToTarget(pitch, yaw + step, start, target, speedBpt, config, false);
      if (!pitchSample.ok || !yawSample.ok) break;
      const a = (pitchSample.yError - base.yError) / step;
      const b = (yawSample.yError - base.yError) / step;
      const c = (pitchSample.crossError - base.crossError) / step;
      const d = (yawSample.crossError - base.crossError) / step;
      const determinant = a * d - b * c;
      if (Math.abs(determinant) < 1e-9) break;
      const dp = (-base.yError * d + b * base.crossError) / determinant;
      const dy = (-a * base.crossError + base.yError * c) / determinant;
      pitch += Math.max(-2, Math.min(2, dp));
      yaw += Math.max(-2, Math.min(2, dy));
      pitch = Math.max(config.minPitch, Math.min(config.maxPitch, pitch));
    }
    const final = simulateToTarget(pitch, yaw, start, target, speedBpt, config, true);
    return final.ok ? { pitchDeg: pitch, yawDeg: yaw, miss: Math.hypot(final.yError, final.crossError), ...final } : null;
  }

  function solve(start, target, speedBpt, config, preferredArc) {
    const dx = target[0] - start[0]; const dz = target[2] - start[2];
    const range = Math.hypot(dx, dz);
    if (!(range > 0) || !(speedBpt > 0)) return { ok: false };
    const bearing = Math.atan2(dx, dz) * 180 / Math.PI;
    const samples = [];
    for (let pitch = config.minPitch; pitch <= config.maxPitch; pitch += 1) {
      const sim = simulateToTarget(pitch, bearing, start, target, speedBpt, config, false);
      if (sim.ok && Number.isFinite(sim.yError)) samples.push({ pitch, error: sim.yError });
    }
    const roots = [];
    for (let i = 1; i < samples.length; i += 1) {
      const a = samples[i - 1]; const b = samples[i];
      if (a.error === 0 || a.error * b.error <= 0) {
        const fraction = Math.abs(a.error) / Math.max(1e-12, Math.abs(a.error) + Math.abs(b.error));
        roots.push(lerp(a.pitch, b.pitch, fraction));
      }
    }
    if (!roots.length && samples.length) {
      samples.sort((a, b) => Math.abs(a.error) - Math.abs(b.error));
      roots.push(samples[0].pitch);
    }
    const refined = roots.map((pitch) => refineSolution(pitch, bearing, start, target, speedBpt, config))
      .filter(Boolean).sort((a, b) => a.pitchDeg - b.pitchDeg);
    if (!refined.length) return { ok: false };
    const low = refined[0]; const high = refined.length > 1 ? refined[refined.length - 1] : null;
    const selected = preferredArc === "high" && high ? high : low;
    return { ok: selected.miss <= Math.max(1, config.allowedMiss || 1), low, high, selected };
  }

  function simulateRange(pitchDeg, yawDeg, start, speedBpt, config) {
    const pitch = pitchDeg * Math.PI / 180; const yaw = yawDeg * Math.PI / 180;
    const horizontal = Math.cos(pitch) * speedBpt;
    let velocity = [Math.sin(yaw) * horizontal, Math.sin(pitch) * speedBpt, Math.cos(yaw) * horizontal];
    let position = [...start]; let previous = [...start];
    const maxTicks = Math.min(20000, Math.max(1, config.maxTicks || 2000));
    for (let tick = 0; tick < maxTicks; tick += 1) {
      const accel = acceleration(position, velocity, tick, config);
      const next = [position[0] + velocity[0] + accel[0] * 0.5,
        position[1] + velocity[1] + accel[1] * 0.5,
        position[2] + velocity[2] + accel[2] * 0.5];
      if (tick > 0 && next[1] <= start[1]) {
        const fraction = (previous[1] - start[1]) / Math.max(1e-12, previous[1] - next[1]);
        const x = lerp(previous[0], next[0], fraction); const z = lerp(previous[2], next[2], fraction);
        return { range: Math.hypot(x - start[0], z - start[2]), ticks: tick + fraction };
      }
      previous = position; position = next;
      velocity = [velocity[0] + accel[0], velocity[1] + accel[1], velocity[2] + accel[2]];
    }
    return { range: NaN, ticks: -1 };
  }

  function maximumRange(start, speedBpt, config, yawDeg) {
    let best = { range: -Infinity, pitchDeg: null, ticks: -1 };
    for (let pitch = Math.max(0, config.minPitch); pitch <= Math.min(89, config.maxPitch); pitch += 1) {
      const result = simulateRange(pitch, yawDeg, start, speedBpt, config);
      if (result.range > best.range) best = { ...result, pitchDeg: pitch };
    }
    if (best.pitchDeg === null) return null;
    for (let pitch = Math.max(config.minPitch, best.pitchDeg - 1);
         pitch <= Math.min(config.maxPitch, best.pitchDeg + 1); pitch += 0.1) {
      const result = simulateRange(pitch, yawDeg, start, speedBpt, config);
      if (result.range > best.range) best = { ...result, pitchDeg: pitch };
    }
    return best;
  }

  global.CBCRealisticBallistics = {
    CANNONS, PROJECTILES, projectileDefaults, isProjectileCompatible,
    fixedMuzzleVelocity, windAt, solve, maximumRange
  };
})(window);
