// Seed content for recipes.about and recipes.variations. Like the glass
// assignments in data/glassware.js, this is only the seed that db/migrate.js
// writes into Postgres; the database stays the source of truth for the site.
//
// Origin stories for cocktails are often disputed. Where they are, the text
// says so rather than picking a side.

module.exports = {
  americano: {
    about:
      "The Americano grew out of the Milano-Torino, a mix of Campari from Milan and sweet vermouth from Turin, lengthened with soda water in nineteenth-century Italy. It is low in alcohol and gently bitter, which makes it a classic drink before dinner. It is also the drink the Negroni was built from.",
    variations: [
      "Negroni: replace the soda water with 1 oz gin and serve over a large cube.",
      "Sbagliato: top with prosecco instead of soda for a rounder, slightly stronger spritz.",
    ],
  },
  "aperol-spritz": {
    about:
      "Aperol was created in Padua in 1919, and the spritz built on it became the signature aperitivo of the Veneto before spreading worldwide. The usual formula is three parts prosecco, two parts Aperol, and one part soda. It should taste lightly bitter, orange-led, and very cold.",
    variations: [
      "Bitter spritz: use Campari in place of Aperol for a drier, more bitter drink.",
      "Hugo: swap the Aperol for elderflower liqueur and add mint and a lime wedge.",
    ],
  },
  aviation: {
    about:
      "The Aviation first appeared in print in Hugo Ensslin's Recipes for Mixed Drinks in 1916. Later books dropped the creme de violette, so for decades it was made without the ingredient that gives it a pale sky color. Use the violette sparingly, because too much makes the drink taste soapy.",
    variations: [
      "No violette: leave it out for the sharper version printed in the 1930 Savoy Cocktail Book.",
      "Drier: cut the maraschino to 1/4 oz if you find the drink too sweet.",
    ],
  },
  "bee-knees": {
    about:
      "The Bee's Knees dates to the Prohibition era, when \"the bee's knees\" was slang for the best of something. Honey and lemon were a good way to soften rough gin. With modern gin it is simply a bright, floral sour that needs only three ingredients.",
    variations: [
      "Gold Rush: use bourbon instead of gin for a richer, rounder drink.",
      "Herbal: shake with a few basil leaves or use a lavender honey syrup.",
    ],
  },
  bijou: {
    about:
      "The Bijou is usually credited to Harry Johnson, who printed it in his Bartenders' Manual around 1900. Bijou is French for jewel, and the three ingredients are said to stand for diamond (gin), ruby (sweet vermouth), and emerald (green Chartreuse). The equal-parts original is rich and intensely herbal.",
    variations: [
      "Modern spec: use 1 1/2 oz gin, 1 oz sweet vermouth, and 3/4 oz green Chartreuse for a drier drink.",
      "Tipperary: swap the gin for Irish whiskey.",
    ],
  },
  boulevardier: {
    about:
      "The Boulevardier appears in Harry McElhone's 1927 book Barflies and Cocktails, credited to Erskine Gwynne, an American who published a Paris magazine of the same name. It is a Negroni with whiskey in place of gin, which makes it warmer and rounder. It suits cold weather especially well.",
    variations: [
      "Old Pal: use rye whiskey and dry vermouth instead of bourbon and sweet vermouth.",
      "Equal parts: use 1 oz of each ingredient for a more bitter drink closer to a Negroni.",
    ],
  },
  "clover-club": {
    about:
      "The Clover Club is named after a Philadelphia gentlemen's club that met at the Bellevue-Stratford Hotel before Prohibition. It fell out of fashion for most of the twentieth century and returned with the modern cocktail revival. Egg white gives it a silky texture and a pale pink foam.",
    variations: [
      "With vermouth: add 1/2 oz dry vermouth, as some early recipes do, for a drier and more complex drink.",
      "No syrup on hand: use a spoonful of raspberry jam, or 1/2 oz grenadine, and fine-strain well.",
    ],
  },
  "corpse-reviver-2": {
    about:
      "Corpse revivers were a family of drinks meant as a morning-after cure. This one comes from Harry Craddock's Savoy Cocktail Book of 1930, which warns that four taken in quick succession will \"unrevive the corpse again.\" It is equal parts, bright, and only lightly scented with absinthe.",
    variations: [
      "Cocchi Americano: use it in place of Lillet Blanc for a more bitter edge, closer to the original Kina Lillet.",
      "No absinthe: rinse the glass with pastis or another anise liqueur.",
    ],
  },
  cosmopolitan: {
    about:
      "The Cosmopolitan is a modern classic from the late 1980s. The version most bars make is commonly credited to Toby Cecchini at the Odeon in New York, building on earlier recipes, and the television series Sex and the City made it famous. A good one is tart and only faintly pink, not sweet.",
    variations: [
      "Plain vodka: use unflavored vodka and express a wide orange peel over the top.",
      "Lighter color: use white cranberry juice for a nearly clear drink.",
    ],
  },
  daiquiri: {
    about:
      "The Daiquiri is named after a beach and mining town near Santiago de Cuba, and is usually credited to Jennings Cox, an American engineer working there around 1900. It is the template for most rum sours. With only three ingredients, balance and fresh lime matter more than anything else.",
    variations: [
      "Hemingway Daiquiri: add grapefruit juice and maraschino liqueur, and cut the simple syrup.",
      "Aged rum: use a lightly aged rum for a richer drink with more vanilla and oak.",
    ],
  },
  "dark-n-stormy": {
    about:
      "The Dark 'n' Stormy comes from Bermuda, where dark rum met the ginger beer brewed on the island. Gosling's holds a trademark on the name and specifies its Black Seal rum. Floating the rum on top gives the drink its storm-cloud look.",
    variations: [
      "Moscow Mule: use vodka instead of dark rum.",
      "Spicier: add two dashes of Angostura bitters and use a fiery ginger beer.",
    ],
  },
  "division-bell": {
    about:
      "Phil Ward created the Division Bell in 2009 for the opening menu of Mayahuel, his agave bar in New York, and named it after the Pink Floyd album. It is a riff on the Last Word, with mezcal and Aperol in place of gin and Chartreuse. Smoke, bitter orange, and lime come through in equal measure.",
    variations: [
      "Less smoke: use blanco tequila for half or all of the mezcal.",
      "More bitter: swap the Aperol for Campari.",
    ],
  },
  eastside: {
    about:
      "The Eastside is a modern New York riff on the Southside, adding muddled cucumber to the gin, lime, and mint. Cucumber makes it especially cool and fresh. Muddle gently, because crushed mint turns bitter.",
    variations: [
      "Eastside Rickey: strain over ice in a tall glass and top with soda water.",
      "Southside: leave out the cucumber for the original.",
    ],
  },
  "espresso-martini": {
    about:
      "London bartender Dick Bradsell created this drink in the 1980s. The story goes that a customer asked for something to wake her up, and he reached for the espresso machine next to his station. It was first called the Vodka Espresso. Fresh, hot espresso shaken hard gives the best foam.",
    variations: [
      "No espresso machine: use 1 oz cold brew concentrate.",
      "Different base: use aged rum or reposado tequila in place of vodka.",
    ],
  },
  "french-75": {
    about:
      "The French 75 is named after a French 75-millimeter field gun from the First World War, a nod to its kick. Versions were served in Paris in the 1910s and 1920s, and the gin recipe was fixed in print in the 1930 Savoy Cocktail Book. It is a gin sour topped with sparkling wine.",
    variations: [
      "Cognac: use cognac instead of gin, the way it is often made in New Orleans.",
      "Any bubbles: prosecco or cava work as long as they are dry and very cold.",
    ],
  },
  "garden-spritz": {
    about:
      "The Garden Spritz is a Shelf&Stir house recipe for nights without alcohol. Cucumber, mint, lime, and honey give it the structure of a cocktail, with sparkling water for length. It is dry and aromatic, not sweet.",
    variations: [
      "More bitter: top with tonic water instead of sparkling water.",
      "Herb swap: use basil in place of mint.",
    ],
  },
  garibaldi: {
    about:
      "The Garibaldi is named after Giuseppe Garibaldi, a leader of Italian unification. Campari from the north and oranges from the south stand for the two halves of the country. The modern version depends on freshly juiced orange aerated until it is light and frothy.",
    variations: [
      "Blood orange: use blood orange juice when it is in season for a deeper color and flavor.",
      "Longer: add a splash of soda water for a lighter drink.",
    ],
  },
  "ginger-tea-collins": {
    about:
      "The Ginger Tea Collins is a Shelf&Stir house recipe built like a Tom Collins, with strong black tea standing in for the spirit. Tannin from the tea gives it the grip that many alcohol-free drinks lack. Ginger and lemon keep it bright.",
    variations: [
      "Green tea: use strong green tea for a lighter, grassier drink.",
      "With spirit: add 1 1/2 oz gin for a tea Collins.",
    ],
  },
  "jungle-bird": {
    about:
      "The Jungle Bird was created in the 1970s at the Aviary Bar of the Kuala Lumpur Hilton, where it was served as a welcome drink. It is one of the few tiki drinks that uses Campari, which balances the sweet pineapple. Modern versions use less juice than the original.",
    variations: [
      "Blackstrap rum: use it for a darker, more molasses-heavy drink.",
      "Up: strain into a coupe without ice for a more concentrated version.",
    ],
  },
  "last-word": {
    about:
      "The Last Word comes from the Detroit Athletic Club, where it was on the menu shortly before Prohibition, and was printed in Ted Saucier's Bottoms Up in 1951. It was nearly forgotten until bartender Murray Stenson revived it at the Zig Zag Cafe in Seattle in the early 2000s. Four strong flavors in equal parts somehow balance each other.",
    variations: [
      "Final Ward: use rye whiskey and lemon juice in place of gin and lime.",
      "Mezcal: swap the gin for mezcal for a smoky version.",
    ],
  },
  "mai-tai": {
    about:
      "Victor Bergeron, known as Trader Vic, said he created the Mai Tai in Oakland in 1944, although Don the Beachcomber disputed the claim. The name comes from the Tahitian word for good. The original is a rum sour with orgeat and curacao and contains no pineapple juice.",
    variations: [
      "Split base: use half aged Jamaican rum and half rhum agricole for more depth.",
      "Float: add 1/2 oz dark rum on top.",
    ],
  },
  manhattan: {
    about:
      "The Manhattan appeared in New York in the 1870s or 1880s. A popular story ties it to the Manhattan Club, but that has never been confirmed. It is the model for most stirred whiskey drinks: spirit, sweet vermouth, and bitters.",
    variations: [
      "Perfect Manhattan: split the vermouth between sweet and dry.",
      "Rob Roy: use Scotch in place of rye.",
    ],
  },
  margarita: {
    about:
      "The Margarita's origin is disputed, with many competing claims from Mexico and the United States in the 1930s and 1940s. It most likely descends from the Daisy, an older family of drinks made with spirit, citrus, and orange liqueur. Margarita is Spanish for daisy.",
    variations: [
      "Tommy's Margarita: leave out the orange liqueur and sweeten with agave syrup only.",
      "Smoky: replace 1/2 oz of the tequila with mezcal.",
    ],
  },
  martini: {
    about:
      "The Martini evolved in the late nineteenth century from sweeter drinks made with gin and vermouth, and became steadily drier through the twentieth century. This spec is five parts gin to one part vermouth. Keep the vermouth fresh and refrigerated, because it is wine and it spoils.",
    variations: [
      "Fifty-Fifty: use equal parts gin and dry vermouth for a softer, more aromatic drink.",
      "Dirty: add a bar spoon of olive brine and garnish with olives.",
    ],
  },
  mojito: {
    about:
      "The Mojito comes from Havana and is often traced to much older Cuban drinks made with rum, lime, sugar, and mint. It is built in the glass, not shaken. Press the mint gently to release its oils without shredding the leaves.",
    variations: [
      "Aged rum: use a lightly aged rum for a richer drink.",
      "Sparkling: top with sparkling wine instead of soda and add a dash of Angostura bitters, in the spirit of the Old Cuban.",
    ],
  },
  "moscow-mule": {
    about:
      "The Moscow Mule was created in 1941 at the Cock 'n' Bull in Los Angeles, as a way to sell both Smirnoff vodka and the bar's own ginger beer. The copper mug was part of the marketing from the start. It helped make vodka popular in the United States.",
    variations: [
      "Kentucky Mule: use bourbon instead of vodka.",
      "Mezcal Mule: use mezcal and add a slice of cucumber.",
    ],
  },
  "naked-and-famous": {
    about:
      "Joaquin Simo created the Naked and Famous at Death & Co in New York in 2011. He has described it as a cross between a Last Word and a Paper Plane with its roots in Oaxaca. It is equal parts smoky, bitter, herbal, and sour.",
    variations: [
      "Gentler smoke: choose a mild espadin mezcal.",
      "More bitter: use Campari in place of Aperol.",
    ],
  },
  negroni: {
    about:
      "The usual story places the Negroni in Florence around 1919, when Count Camillo Negroni asked for his Americano to be strengthened with gin instead of soda. It is equal parts gin, Campari, and sweet vermouth. The formula is so sturdy that swapping any one ingredient gives a new drink.",
    variations: [
      "Boulevardier: use bourbon in place of gin.",
      "Sbagliato: replace the gin with prosecco for a lighter, sparkling drink.",
    ],
  },
  "no-groni": {
    about:
      "The No-Groni Spritz is a Shelf&Stir house recipe that borrows the shape of an aperitivo without the alcohol. Pomegranate and strong black tea supply the bitterness and tannin that Campari usually brings. Soda keeps it light.",
    variations: [
      "More bitter: use grapefruit juice in place of the orange juice.",
      "Alcohol-free aperitif: add 1 oz of a non-alcoholic bitter aperitif if you have one.",
    ],
  },
  "oaxaca-old-fashioned": {
    about:
      "Phil Ward created the Oaxaca Old Fashioned at Death & Co in New York in 2007. It introduced many drinkers to mezcal by using a small amount alongside reposado tequila. Agave syrup stands in for sugar, keeping every part of the drink from the same plant.",
    variations: [
      "Chocolate bitters: use mole bitters instead of Angostura.",
      "All mezcal: use 2 oz mezcal for a much smokier drink.",
    ],
  },
  "old-fashioned": {
    about:
      "The Old Fashioned follows the earliest printed definition of a cocktail, from 1806: spirit, sugar, water, and bitters. The name arose later in the nineteenth century, when drinkers asked for a whiskey cocktail made the old-fashioned way. Stirring over ice supplies the water.",
    variations: [
      "Rye: use rye whiskey for a drier, spicier drink.",
      "Other spirits: aged rum or reposado tequila both work with the same method.",
    ],
  },
  painkiller: {
    about:
      "The Painkiller comes from the Soggy Dollar Bar on Jost Van Dyke in the British Virgin Islands, where it was created in the 1970s. Pusser's Rum later trademarked the name. It is a richer relative of the Piña Colada, finished with fresh nutmeg.",
    variations: [
      "Stronger: bars traditionally offer it with 2, 3, or 4 oz of rum.",
      "Blended: blend with a cup of ice for a frozen version.",
    ],
  },
  paloma: {
    about:
      "The Paloma is one of the most popular tequila drinks in Mexico, although nobody knows for certain who first made it. Paloma is Spanish for dove. It is simply tequila, lime, and grapefruit soda with a pinch of salt.",
    variations: [
      "Fresh grapefruit: use 2 oz grapefruit juice, 1/2 oz agave syrup, and top with soda water instead of grapefruit soda.",
      "Smoky: use mezcal for part or all of the tequila.",
    ],
  },
  "paper-plane": {
    about:
      "Sam Ross created the Paper Plane in 2008 for The Violet Hour in Chicago, and named it after the M.I.A. song he was listening to at the time. It is an equal-parts sour in the style of the Last Word. An early version used Campari before he settled on Aperol.",
    variations: [
      "No Amaro Nonino: Amaro Montenegro is the closest common substitute.",
      "Rye: use rye whiskey for a drier, spicier drink.",
    ],
  },
  penicillin: {
    about:
      "Sam Ross created the Penicillin at Milk & Honey in New York in 2005. It is a whiskey sour sweetened with honey and ginger, with a float of smoky Islay Scotch on top. The smoke reaches your nose before the drink reaches your mouth.",
    variations: [
      "Mezcal float: use mezcal in place of the smoky Scotch.",
      "Hot: build it with hot water in a mug as a toddy.",
    ],
  },
  "pina-colada": {
    about:
      "The Piña Colada comes from Puerto Rico, where the Caribe Hilton in San Juan says its bartender Ramon Marrero created it in 1954. It was named the island's official drink in 1978. Lime juice is not traditional, but it keeps the drink from being too sweet.",
    variations: [
      "Frozen: blend with frozen pineapple chunks instead of ice for a thicker drink.",
      "Aged rum float: add 1/2 oz aged or dark rum on top.",
    ],
  },
  "ramos-gin-fizz": {
    about:
      "Henry C. Ramos created this drink in New Orleans in 1888. It was so popular, and took so long to shake, that his bar reportedly employed a line of shaker boys to pass each one along. Cream, egg white, and soda produce a foam that rises above the rim of the glass.",
    variations: [
      "Reverse dry shake: shake with ice first, strain out the ice, then shake again for a firmer foam.",
      "No orange flower water: the drink still works, though it loses its floral note.",
    ],
  },
  "remember-the-maine": {
    about:
      "Charles H. Baker Jr. published Remember the Maine in The Gentleman's Companion in 1939. It is named after the USS Maine, the American ship that sank in Havana harbor in 1898. It drinks like a Manhattan with cherry and a trace of absinthe.",
    variations: [
      "Cherry Heering: the traditional choice for the cherry liqueur.",
      "Bourbon: use bourbon for a softer, sweeter drink.",
    ],
  },
  sazerac: {
    about:
      "The Sazerac comes from mid-nineteenth-century New Orleans. It was first made with cognac and the bitters of local apothecary Antoine Peychaud, and later with rye whiskey. It is served cold with no ice in a glass rinsed with absinthe. Louisiana lawmakers named it the official cocktail of New Orleans in 2008.",
    variations: [
      "Cognac: use cognac, or half cognac and half rye, as in the earliest versions.",
      "Herbsaint: rinse the glass with this New Orleans anise liqueur instead of absinthe.",
    ],
  },
  siesta: {
    about:
      "Katie Stipe created the Siesta at Flatiron Lounge in New York in 2006. It takes the grapefruit and lime of a Hemingway Daiquiri and pairs them with tequila and Campari. The result is bittersweet and pink.",
    variations: [
      "Softer: use Aperol in place of Campari.",
      "Smoky: replace 1/2 oz of the tequila with mezcal.",
    ],
  },
  southside: {
    about:
      "The Southside is a Prohibition-era gin sour with mint. Its origin is disputed. One story ties it to the 21 Club in New York and another to the South Side of Chicago. It is easiest to think of it as a Mojito made with gin and served without ice.",
    variations: [
      "Southside Fizz: serve it tall over ice and top with soda water.",
      "Eastside: muddle in a few slices of cucumber.",
    ],
  },
  vesper: {
    about:
      "Ian Fleming invented the Vesper for James Bond in the 1953 novel Casino Royale, where Bond names it after Vesper Lynd. The original calls for Kina Lillet, which is no longer made. Lillet Blanc is the usual replacement, though it is less bitter.",
    variations: [
      "Cocchi Americano: use it in place of Lillet Blanc for a bitterness closer to the original.",
      "Shaken: Bond asks for it shaken, which makes it colder and more diluted.",
    ],
  },
  "whiskey-sour": {
    about:
      "The Whiskey Sour has been in print since at least 1862, when Jerry Thomas included it in his Bar-Tender's Guide. Spirit, citrus, and sugar is one of the oldest drink formulas there is. Egg white is optional and adds a soft foam without changing the flavor much.",
    variations: [
      "New York Sour: float 1/2 oz of dry red wine on top.",
      "Gold Rush: sweeten with honey syrup instead of simple syrup and skip the egg white.",
    ],
  },
};
