(function (root, factory) {
  const data = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = data;
  } else {
    root.ShelfStirGlassware = data;
  }
})(typeof self !== "undefined" ? self : this, function () {
  // Hand-authored, like pantry-config.js: this describes the glasses
  // themselves. Which glass each recipe uses is recipe content, so it lives
  // in Postgres (recipes.glass); `recipeGlass` below is only the seed that
  // db/migrate.js writes there. Keep it consistent with each recipe's own
  // method text (e.g. "strain into a coupe").

  // Icons are 64x64 line drawings; callers wrap them in an <svg viewBox="0 0 64 64">.
  const glassTypes = [
    {
      key: "coupe",
      name: "Coupe",
      size: "4.5 to 6 oz",
      shape: "Shallow, rounded bowl on a stem",
      serves: "Shaken sours and stirred drinks served up, with no ice in the glass",
      why: "The stem keeps your hand from warming the drink, and the wide bowl lets aroma open up as you sip. Unlike a V-shaped martini glass it doesn't spill when you carry it.",
      tip: "A Nick & Nora is a fine swap. Chill it in the freezer for 15 minutes before pouring.",
      icon: '<path d="M10 14c0 14 10 20 22 20s22-6 22-20Z"/><path d="M32 34v18M20 54h24"/>',
    },
    {
      key: "martini",
      name: "Martini glass",
      size: "5 to 7 oz",
      shape: "Wide V-shaped cone on a stem",
      serves: "Spirit-forward drinks served up, like the Martini and Vesper",
      why: "The wide surface lifts the aroma of a lemon twist or olive and keeps a very cold drink looking sharp. It warms fast, so pour smaller drinks and finish them quickly.",
      tip: "Fill to a few millimeters below the rim. The cone shape makes a full pour easy to spill.",
      icon: '<path d="M8 12h48L32 36Z"/><path d="M32 36v16M21 54h22"/>',
    },
    {
      key: "flute",
      name: "Flute",
      size: "6 oz",
      shape: "Tall, narrow bowl on a stem",
      serves: "Sparkling cocktails like the French 75",
      why: "A narrow opening exposes less surface, so bubbles last longer and the aroma funnels toward your nose. Tilt the glass when you top with sparkling wine to keep the fizz.",
      tip: "Pour the base first and top with the bubbles last, slowly down the side.",
      icon: '<path d="M24 6h16l-2 28c-1 4-3 6-6 6s-5-2-6-6Z"/><path d="M32 40v12M22 54h20"/><circle cx="31" cy="18" r="1.2"/><circle cx="34" cy="26" r="1.2"/>',
    },
    {
      key: "rocks",
      name: "Rocks glass",
      size: "8 to 12 oz",
      shape: "Short, wide, heavy-bottomed tumbler",
      serves: "Stirred whiskey drinks, Negronis, and sours poured over ice",
      why: "The wide mouth leaves room for one large cube. Big ice melts slowly, so the drink stays cold without watering down, and you can express a citrus peel right over the surface.",
      tip: "Make clear large cubes in a silicone mold. One big cube beats a handful of small ones.",
      icon: '<path d="M13 14h38l-3 38c0 2-1 4-4 4H20c-3 0-4-2-4-4Z"/><path d="M26 28h12v12H26Z"/>',
    },
    {
      key: "highball",
      name: "Highball",
      size: "10 to 12 oz",
      shape: "Tall, straight-sided tumbler",
      serves: "Drinks topped with soda, ginger beer, or grapefruit soda",
      why: "Tall and narrow keeps carbonation from escaping and packs the ice tight, so the drink stays cold and fizzy to the last sip.",
      tip: "Fill with ice to the top first. More ice melts slower than less ice.",
      icon: '<path d="M19 6h26l-3 48c0 2-1 4-3 4H25c-2 0-3-2-3-4Z"/><path d="M26 22h8v8h-8ZM32 38h8v8h-8Z"/>',
    },
    {
      key: "collins",
      name: "Collins glass",
      size: "12 to 14 oz",
      shape: "Taller and slimmer than a highball",
      serves: "Long fizzes and Collins-style drinks with lots of soda",
      why: "The extra height gives a frothy fizz room to rise into a proper head, and carries more soda without going flat.",
      tip: "For egg-white or cream fizzes, top with soda slowly so the foam lifts above the rim.",
      icon: '<path d="M22 6h20l-2 50H24Z"/><path d="M37 14L46 2"/><path d="M28 22h8"/>',
    },
    {
      key: "wine",
      name: "Wine glass",
      size: "12 to 20 oz",
      shape: "Large stemmed bowl",
      serves: "Spritzes and other lightly sparkling, ice-filled drinks",
      why: "The big bowl holds plenty of ice and lets the citrus and herbal aromas gather above the drink, while the stem keeps your hand off the cold bowl.",
      tip: "A stemless wine glass works nearly as well, and is harder to knock over.",
      icon: '<path d="M16 6h32c0 18-6 30-16 30S16 24 16 6Z"/><path d="M32 36v16M21 54h22"/><path d="M24 14h8v8h-8Z"/>',
    },
    {
      key: "copper-mug",
      name: "Copper mug",
      size: "12 to 16 oz",
      shape: "Handled mug, traditionally copper",
      serves: "Moscow Mules and other ginger beer drinks",
      why: "Copper conducts cold quickly, so the mug frosts over and keeps the drink icy. The handle also keeps your hand off the cold metal.",
      tip: "Choose a mug lined with nickel or stainless steel. Acidic drinks like lime juice shouldn't sit in bare copper.",
      icon: '<path d="M12 10h32l-3 42c0 2-1 4-4 4H19c-3 0-4-2-4-4Z"/><path d="M44 18h6c5 0 5 22 0 22h-6"/><path d="M14 18h29"/>',
    },
    {
      key: "tiki",
      name: "Tiki mug or hurricane glass",
      size: "12 to 20 oz",
      shape: "Large, bulbous mug or curvy tall glass",
      serves: "Tropical drinks poured over crushed or pebble ice",
      why: "Thick walls insulate against melting crushed ice, and the big volume leaves room for juice-heavy drinks and a generous garnish canopy of mint, pineapple, and nutmeg.",
      tip: "Any tall glass can stand in. Fill with crushed ice and let the garnish do the showing off.",
      icon: '<path d="M16 12h32c4 0 4 6 2 10 2 10 0 22-4 28-1 3-3 5-6 5H24c-3 0-5-2-6-5-4-6-6-18-4-28-2-4-2-10 2-10Z"/><circle cx="26" cy="28" r="2"/><circle cx="38" cy="28" r="2"/><path d="M25 40h14"/>',
    },
  ];

  const recipeGlass = {
    americano: "highball",
    "aperol-spritz": "wine",
    aviation: "coupe",
    "bee-knees": "coupe",
    bijou: "coupe",
    boulevardier: "rocks",
    "clover-club": "coupe",
    "corpse-reviver-2": "coupe",
    cosmopolitan: "coupe",
    daiquiri: "coupe",
    "dark-n-stormy": "highball",
    "division-bell": "coupe",
    eastside: "coupe",
    "espresso-martini": "coupe",
    "french-75": "flute",
    "garden-spritz": "wine",
    garibaldi: "highball",
    "ginger-tea-collins": "collins",
    "jungle-bird": "tiki",
    "last-word": "coupe",
    "mai-tai": "rocks",
    manhattan: "coupe",
    margarita: "rocks",
    martini: "martini",
    mojito: "highball",
    "moscow-mule": "copper-mug",
    "naked-and-famous": "coupe",
    negroni: "rocks",
    "no-groni": "highball",
    "oaxaca-old-fashioned": "rocks",
    "old-fashioned": "rocks",
    painkiller: "tiki",
    paloma: "highball",
    "paper-plane": "coupe",
    penicillin: "rocks",
    "pina-colada": "tiki",
    "ramos-gin-fizz": "collins",
    "remember-the-maine": "coupe",
    sazerac: "rocks",
    siesta: "coupe",
    southside: "coupe",
    vesper: "martini",
    "whiskey-sour": "rocks",
  };

  const glassByKey = Object.fromEntries(glassTypes.map((glass) => [glass.key, glass]));

  return { glassTypes, recipeGlass, glassByKey };
});
