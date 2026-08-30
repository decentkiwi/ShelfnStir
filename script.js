const recipeBlueprints = [
  ["margarita", "Margarita", "Classic Citrus", ["classic", "citrus", "tequila", "shaken"], "5 min", "Bright", "assets/citrus.jpg", "The lime-bright tequila standard, sharpened with orange liqueur and a salt rim.", ["2 oz blanco tequila", "1 oz fresh lime juice", "3/4 oz orange liqueur", "1/2 oz agave syrup", "Salt, optional"], ["blanco tequila", "lime juice", "orange liqueur", "agave syrup"], ["Shake tequila, lime, orange liqueur, and agave with ice.", "Strain into a salted rocks glass over fresh ice.", "Garnish with a lime wheel."]],
  ["negroni", "Negroni", "Bitter Classic", ["classic", "stirred", "gin", "bitter"], "4 min", "Bitter", "assets/citrus.jpg", "Equal parts gin, Campari, and sweet vermouth. Austere, rosy, and endlessly riffable.", ["1 oz gin", "1 oz Campari", "1 oz sweet vermouth", "Orange peel"], ["gin", "campari", "sweet vermouth", "orange"], ["Stir liquid ingredients with ice until chilled.", "Strain over one large cube.", "Express orange peel and garnish."]],
  ["old-fashioned", "Old Fashioned", "Whiskey Classic", ["classic", "stirred", "whiskey"], "5 min", "Spirit-forward", "assets/citrus.jpg", "Whiskey, bitters, sugar, and citrus oil built slowly over ice.", ["2 oz bourbon or rye", "1 tsp simple syrup", "2 dashes Angostura bitters", "Orange twist"], ["whiskey", "simple syrup", "angostura bitters", "orange"], ["Combine syrup and bitters in a rocks glass.", "Add whiskey and ice, then stir until cold.", "Garnish with an orange twist."]],
  ["martini", "Dry Martini", "Stirred Classic", ["classic", "stirred", "gin"], "4 min", "Clean", "assets/citrus.jpg", "Cold gin, dry vermouth, and a lemon twist or olive. Minimalism with consequences.", ["2 1/2 oz gin", "1/2 oz dry vermouth", "Orange bitters, optional", "Lemon twist or olive"], ["gin", "dry vermouth", "lemon"], ["Stir gin and vermouth with plenty of ice.", "Strain into a chilled cocktail glass.", "Garnish with lemon or an olive."]],
  ["daiquiri", "Daiquiri", "Rum Sour", ["classic", "citrus", "rum", "shaken"], "5 min", "Snappy", "assets/citrus.jpg", "Rum, lime, and sugar in perfect tension. The simple drink that rewards precision.", ["2 oz white rum", "3/4 oz fresh lime juice", "3/4 oz simple syrup"], ["white rum", "lime juice", "simple syrup"], ["Shake all ingredients hard with ice.", "Double-strain into a chilled coupe.", "Serve without garnish or add a lime wheel."]],
  ["mojito", "Mojito", "Long Rum Drink", ["classic", "citrus", "rum", "sparkling"], "7 min", "Fresh", "assets/citrus.jpg", "Mint, lime, white rum, sugar, and soda water, built tall and fragrant.", ["2 oz white rum", "3/4 oz lime juice", "3/4 oz simple syrup", "8 mint leaves", "Soda water"], ["white rum", "lime juice", "simple syrup", "mint", "soda water"], ["Gently press mint with syrup and lime in a highball.", "Add rum, ice, and soda.", "Lift with a spoon and garnish with mint."]],
  ["manhattan", "Manhattan", "Stirred Classic", ["classic", "stirred", "whiskey"], "5 min", "Silky", "assets/citrus.jpg", "Rye, sweet vermouth, and aromatic bitters with a cherry finish.", ["2 oz rye whiskey", "1 oz sweet vermouth", "2 dashes Angostura bitters", "Brandied cherry"], ["rye whiskey", "sweet vermouth", "angostura bitters", "cherry"], ["Stir whiskey, vermouth, and bitters with ice.", "Strain into a coupe.", "Garnish with a brandied cherry."]],
  ["whiskey-sour", "Whiskey Sour", "Classic Sour", ["classic", "citrus", "whiskey", "shaken"], "6 min", "Velvety", "assets/citrus.jpg", "Bourbon, lemon, sugar, and optional egg white for a plush foam.", ["2 oz bourbon", "3/4 oz lemon juice", "3/4 oz simple syrup", "1 egg white, optional", "Angostura bitters"], ["bourbon", "lemon juice", "simple syrup"], ["Shake bourbon, lemon, syrup, and egg white without ice if using.", "Shake again with ice.", "Strain and dot the foam with bitters."]],
  ["french-75", "French 75", "Sparkling Classic", ["classic", "sparkling", "gin", "citrus"], "6 min", "Celebratory", "assets/citrus.jpg", "Gin, lemon, sugar, and sparkling wine. A dinner-party accelerant in a flute.", ["1 oz gin", "1/2 oz lemon juice", "1/2 oz simple syrup", "3 oz sparkling wine"], ["gin", "lemon juice", "simple syrup", "sparkling wine"], ["Shake gin, lemon, and syrup with ice.", "Strain into a flute.", "Top with sparkling wine and garnish with lemon peel."]],
  ["espresso-martini", "Espresso Martini", "Modern Classic", ["classic", "vodka", "shaken"], "6 min", "Electric", "assets/citrus.jpg", "Vodka, coffee liqueur, and espresso, shaken hard for a crema-like cap.", ["1 1/2 oz vodka", "3/4 oz coffee liqueur", "1 oz fresh espresso", "1/4 oz simple syrup"], ["vodka", "coffee liqueur", "espresso", "simple syrup"], ["Shake everything hard with ice.", "Fine-strain into a chilled coupe.", "Garnish with coffee beans if you have them."]],
  ["aperol-spritz", "Aperol Spritz", "Low-ABV Spritz", ["classic", "sparkling", "spritz"], "4 min", "Light", "assets/citrus.jpg", "Aperol, prosecco, and soda water over ice with an orange slice.", ["3 oz prosecco", "2 oz Aperol", "1 oz soda water", "Orange slice"], ["prosecco", "aperol", "soda water", "orange"], ["Build in a wine glass over ice.", "Add prosecco, Aperol, and soda.", "Stir gently and garnish with orange."]],
  ["paloma", "Paloma", "Tequila Highball", ["classic", "sparkling", "tequila", "citrus"], "5 min", "Zesty", "assets/citrus.jpg", "Tequila, lime, grapefruit soda, and salt. Brisk, simple, and hard to improve.", ["2 oz blanco tequila", "1/2 oz lime juice", "Grapefruit soda", "Pinch of salt"], ["blanco tequila", "lime juice", "grapefruit soda", "salt"], ["Build tequila, lime, and salt in a highball with ice.", "Top with grapefruit soda.", "Stir and garnish with grapefruit."]],
  ["moscow-mule", "Moscow Mule", "Vodka Highball", ["classic", "sparkling", "vodka", "citrus"], "4 min", "Spicy", "assets/citrus.jpg", "Vodka, lime, and ginger beer, served cold enough to frost the cup.", ["2 oz vodka", "1/2 oz lime juice", "Ginger beer", "Mint or lime wedge"], ["vodka", "lime juice", "ginger beer"], ["Build vodka and lime over ice.", "Top with ginger beer.", "Stir once and garnish."]],
  ["cosmopolitan", "Cosmopolitan", "Vodka Sour", ["classic", "citrus", "vodka", "shaken"], "6 min", "Tart", "assets/citrus.jpg", "Vodka, cranberry, lime, and orange liqueur, served blush-pink and ice-cold.", ["1 1/2 oz citrus vodka", "3/4 oz orange liqueur", "3/4 oz lime juice", "1/2 oz cranberry juice"], ["vodka", "orange liqueur", "lime juice", "cranberry juice"], ["Shake all ingredients with ice.", "Fine-strain into a chilled coupe.", "Garnish with orange peel."]],
  ["pina-colada", "Pina Colada", "Tropical Classic", ["classic", "tiki", "rum", "citrus"], "8 min", "Creamy", "assets/citrus.jpg", "Rum, pineapple, lime, and coconut cream, shaken or blended until lush.", ["2 oz white rum", "1 1/2 oz pineapple juice", "1 oz coconut cream", "1/2 oz lime juice"], ["white rum", "pineapple juice", "coconut cream", "lime juice"], ["Shake with pebble ice or blend briefly.", "Pour into a chilled glass.", "Garnish with pineapple or nutmeg."]],
  ["mai-tai", "Mai Tai", "Tiki Icon", ["classic", "tiki", "rum", "citrus"], "7 min", "Layered", "assets/citrus.jpg", "Aged rum, lime, orange curacao, and orgeat with almond depth.", ["2 oz aged rum", "3/4 oz lime juice", "1/2 oz orange curacao", "1/2 oz orgeat"], ["aged rum", "lime juice", "orange liqueur", "orgeat"], ["Shake with crushed ice.", "Pour unstrained into a rocks glass.", "Garnish with mint and lime."]],
  ["penicillin", "Penicillin", "Modern Sour", ["classic", "citrus", "whiskey", "niche"], "8 min", "Smoky", "assets/citrus.jpg", "Scotch, lemon, honey-ginger syrup, and a float of smoky Scotch.", ["2 oz blended Scotch", "3/4 oz lemon juice", "3/4 oz honey ginger syrup", "1/4 oz smoky Scotch"], ["scotch", "lemon juice", "honey syrup", "ginger"], ["Shake blended Scotch, lemon, and honey ginger syrup.", "Strain over ice.", "Float smoky Scotch on top."]],
  ["paper-plane", "Paper Plane", "Equal Parts Sour", ["classic", "citrus", "whiskey", "amaro"], "5 min", "Bittersweet", "assets/citrus.jpg", "Bourbon, Aperol, amaro, and lemon in a four-way balance.", ["3/4 oz bourbon", "3/4 oz Aperol", "3/4 oz Amaro Nonino", "3/4 oz lemon juice"], ["bourbon", "aperol", "amaro", "lemon juice"], ["Shake all ingredients with ice.", "Strain into a coupe.", "Serve ungarnished."]],
  ["last-word", "Last Word", "Herbal Sour", ["classic", "citrus", "gin", "niche"], "5 min", "Herbal", "assets/citrus.jpg", "Gin, green Chartreuse, maraschino, and lime in equal parts.", ["3/4 oz gin", "3/4 oz green Chartreuse", "3/4 oz maraschino liqueur", "3/4 oz lime juice"], ["gin", "green chartreuse", "maraschino liqueur", "lime juice"], ["Shake everything with ice.", "Fine-strain into a chilled coupe.", "Garnish with a cherry if desired."]],
  ["corpse-reviver-2", "Corpse Reviver No. 2", "Niche Classic", ["classic", "citrus", "gin", "niche"], "6 min", "Bracing", "assets/citrus.jpg", "Gin, Lillet, orange liqueur, lemon, and a whisper of absinthe.", ["3/4 oz gin", "3/4 oz Lillet Blanc", "3/4 oz orange liqueur", "3/4 oz lemon juice", "Absinthe rinse"], ["gin", "lillet blanc", "orange liqueur", "lemon juice", "absinthe"], ["Rinse a chilled coupe with absinthe.", "Shake remaining ingredients with ice.", "Strain into the coupe."]],
  ["aviation", "Aviation", "Floral Sour", ["classic", "citrus", "gin", "niche"], "6 min", "Floral", "assets/citrus.jpg", "Gin, lemon, maraschino, and creme de violette with a pale sky tint.", ["2 oz gin", "3/4 oz lemon juice", "1/2 oz maraschino liqueur", "1/4 oz creme de violette"], ["gin", "lemon juice", "maraschino liqueur", "creme de violette"], ["Shake all ingredients with ice.", "Fine-strain into a chilled coupe.", "Garnish with a cherry."]],
  ["sazerac", "Sazerac", "New Orleans Classic", ["classic", "stirred", "whiskey", "niche"], "7 min", "Potent", "assets/citrus.jpg", "Rye, Peychaud's, sugar, and absinthe, served without ice.", ["2 oz rye whiskey", "1 tsp simple syrup", "3 dashes Peychaud's bitters", "Absinthe rinse", "Lemon peel"], ["rye whiskey", "simple syrup", "peychauds bitters", "absinthe", "lemon"], ["Rinse a chilled rocks glass with absinthe.", "Stir rye, syrup, and bitters with ice.", "Strain and express lemon peel."]],
  ["boulevardier", "Boulevardier", "Whiskey Negroni", ["classic", "stirred", "whiskey", "bitter"], "5 min", "Rich", "assets/citrus.jpg", "Bourbon or rye in place of gin, rounded by Campari and sweet vermouth.", ["1 1/2 oz bourbon", "1 oz Campari", "1 oz sweet vermouth", "Orange peel"], ["bourbon", "campari", "sweet vermouth", "orange"], ["Stir all liquid ingredients with ice.", "Strain over a large cube.", "Garnish with orange peel."]],
  ["jungle-bird", "Jungle Bird", "Bitter Tiki", ["tiki", "citrus", "rum", "niche"], "7 min", "Tropical", "assets/citrus.jpg", "Dark rum and pineapple pulled into focus by Campari's bitter snap.", ["1 1/2 oz dark rum", "1 1/2 oz pineapple juice", "3/4 oz Campari", "1/2 oz lime juice", "1/2 oz simple syrup"], ["dark rum", "pineapple juice", "campari", "lime juice", "simple syrup"], ["Shake with ice.", "Strain over crushed ice.", "Garnish with pineapple leaves if available."]],
  ["painkiller", "Painkiller", "Tropical Rum", ["tiki", "rum", "citrus"], "7 min", "Sunny", "assets/citrus.jpg", "Dark rum, pineapple, orange, coconut, and nutmeg.", ["2 oz dark rum", "4 oz pineapple juice", "1 oz orange juice", "1 oz coconut cream", "Nutmeg"], ["dark rum", "pineapple juice", "orange juice", "coconut cream", "nutmeg"], ["Shake with ice.", "Pour over crushed ice.", "Grate nutmeg over the top."]],
  ["clover-club", "Clover Club", "Raspberry Gin Sour", ["classic", "citrus", "gin"], "8 min", "Silky", "assets/citrus.jpg", "Gin, lemon, raspberry syrup, and egg white with a blush-pink foam.", ["2 oz gin", "3/4 oz lemon juice", "1/2 oz raspberry syrup", "1 egg white"], ["gin", "lemon juice", "raspberry syrup", "egg"], ["Dry shake ingredients without ice.", "Shake again with ice.", "Fine-strain into a coupe."]],
  ["southside", "Southside", "Mint Gin Sour", ["classic", "citrus", "gin"], "6 min", "Cool", "assets/citrus.jpg", "Gin, lime, simple syrup, and mint, shaken briskly and served up.", ["2 oz gin", "3/4 oz lime juice", "3/4 oz simple syrup", "8 mint leaves"], ["gin", "lime juice", "simple syrup", "mint"], ["Shake ingredients with ice.", "Fine-strain into a coupe.", "Garnish with mint."]],
  ["bee-knees", "Bee's Knees", "Honey Gin Sour", ["classic", "citrus", "gin"], "5 min", "Golden", "assets/citrus.jpg", "Gin, lemon, and honey syrup. Floral, clean, and very pantry-friendly.", ["2 oz gin", "3/4 oz lemon juice", "3/4 oz honey syrup"], ["gin", "lemon juice", "honey syrup"], ["Shake all ingredients with ice.", "Strain into a coupe.", "Garnish with lemon."]],
  ["dark-n-stormy", "Dark 'n Stormy", "Rum Highball", ["classic", "sparkling", "rum"], "4 min", "Spicy", "assets/citrus.jpg", "Dark rum over ginger beer with lime. Built fast, drunk slowly.", ["2 oz dark rum", "1/2 oz lime juice", "Ginger beer"], ["dark rum", "lime juice", "ginger beer"], ["Build lime and ginger beer over ice.", "Float dark rum on top.", "Garnish with lime."]],
  ["vesper", "Vesper", "Niche Martini", ["niche", "stirred", "gin", "vodka"], "5 min", "Piercing", "assets/citrus.jpg", "Gin, vodka, and Lillet Blanc served extremely cold with a lemon peel.", ["3 oz gin", "1 oz vodka", "1/2 oz Lillet Blanc", "Lemon peel"], ["gin", "vodka", "lillet blanc", "lemon"], ["Stir ingredients with ice until very cold.", "Strain into a chilled glass.", "Garnish with a lemon peel."]],
  ["naked-and-famous", "Naked and Famous", "Equal Parts Mezcal", ["niche", "citrus", "mezcal"], "5 min", "Smoky", "assets/citrus.jpg", "Mezcal, Aperol, yellow Chartreuse, and lime in equal parts.", ["3/4 oz mezcal", "3/4 oz Aperol", "3/4 oz yellow Chartreuse", "3/4 oz lime juice"], ["mezcal", "aperol", "yellow chartreuse", "lime juice"], ["Shake all ingredients with ice.", "Strain into a coupe.", "Serve ungarnished."]],
  ["oaxaca-old-fashioned", "Oaxaca Old Fashioned", "Agave Stirred", ["niche", "stirred", "mezcal", "tequila"], "5 min", "Smoky", "assets/citrus.jpg", "Reposado tequila and mezcal softened with agave and bitters.", ["1 1/2 oz reposado tequila", "1/2 oz mezcal", "1 tsp agave syrup", "2 dashes Angostura bitters", "Orange peel"], ["reposado tequila", "mezcal", "agave syrup", "angostura bitters", "orange"], ["Stir everything with ice.", "Strain over a large cube.", "Garnish with a flamed orange peel if desired."]],
  ["bijou", "Bijou", "Herbal Stirred", ["niche", "stirred", "gin"], "5 min", "Jewel-toned", "assets/citrus.jpg", "Gin, sweet vermouth, green Chartreuse, and orange bitters.", ["1 oz gin", "1 oz sweet vermouth", "1 oz green Chartreuse", "1 dash orange bitters"], ["gin", "sweet vermouth", "green chartreuse", "orange bitters"], ["Stir with ice until chilled.", "Strain into a coupe.", "Garnish with lemon or cherry."]],
  ["remember-the-maine", "Remember the Maine", "Rye Deep Cut", ["niche", "stirred", "whiskey"], "6 min", "Dark", "assets/citrus.jpg", "Rye, sweet vermouth, cherry liqueur, and absinthe, moody and precise.", ["2 oz rye whiskey", "3/4 oz sweet vermouth", "1/2 oz cherry liqueur", "Absinthe rinse"], ["rye whiskey", "sweet vermouth", "cherry liqueur", "absinthe"], ["Rinse a coupe with absinthe.", "Stir rye, vermouth, and cherry liqueur with ice.", "Strain into the coupe."]],
  ["division-bell", "Division Bell", "Mezcal Sour", ["niche", "citrus", "mezcal"], "5 min", "Bitter-smoky", "assets/citrus.jpg", "Mezcal, Aperol, maraschino, and lime, a smoky sibling of the Last Word.", ["1 oz mezcal", "3/4 oz Aperol", "3/4 oz lime juice", "1/2 oz maraschino liqueur"], ["mezcal", "aperol", "lime juice", "maraschino liqueur"], ["Shake everything with ice.", "Strain into a coupe.", "Garnish with grapefruit peel if available."]],
  ["americano", "Americano", "Low-ABV Highball", ["classic", "sparkling", "stirred", "bitter"], "4 min", "Leisurely", "assets/citrus.jpg", "Campari, sweet vermouth, and soda, brightened with orange.", ["1 1/2 oz Campari", "1 1/2 oz sweet vermouth", "Soda water", "Orange slice"], ["campari", "sweet vermouth", "soda water", "orange"], ["Build Campari and vermouth over ice.", "Top with soda.", "Garnish with orange."]],
  ["garibaldi", "Garibaldi", "Two-Ingredient Aperitivo", ["sparkling", "citrus", "niche", "bitter"], "4 min", "Fluffy", "assets/citrus.jpg", "Campari and fresh orange juice, aerated until soft and sunny.", ["1 1/2 oz Campari", "4 oz orange juice"], ["campari", "orange juice"], ["Whip or shake orange juice to aerate.", "Build over ice with Campari.", "Stir gently."]],
  ["ramos-gin-fizz", "Ramos Gin Fizz", "Niche Fizz", ["niche", "sparkling", "gin", "citrus"], "10 min", "Cloudlike", "assets/citrus.jpg", "Gin, citrus, cream, egg white, orange flower water, and soda.", ["2 oz gin", "1/2 oz lemon juice", "1/2 oz lime juice", "3/4 oz simple syrup", "1 oz cream", "1 egg white", "Orange flower water", "Soda water"], ["gin", "lemon juice", "lime juice", "simple syrup", "cream", "egg", "orange flower water", "soda water"], ["Shake without ice, then with ice, until very frothy.", "Strain into a Collins glass.", "Top slowly with soda."]],
  ["siesta", "Siesta", "Tequila Bitter Sour", ["niche", "citrus", "tequila"], "5 min", "Bittersweet", "assets/citrus.jpg", "Tequila, Campari, grapefruit, lime, and simple syrup.", ["2 oz blanco tequila", "1/2 oz Campari", "1/2 oz grapefruit juice", "1/2 oz lime juice", "1/2 oz simple syrup"], ["blanco tequila", "campari", "grapefruit juice", "lime juice", "simple syrup"], ["Shake all ingredients with ice.", "Strain into a coupe.", "Garnish with grapefruit."]],
  ["eastside", "Eastside", "Cucumber Mint Sour", ["niche", "citrus", "gin"], "7 min", "Garden", "assets/citrus.jpg", "Gin, lime, cucumber, mint, and simple syrup, cool as a linen shirt.", ["2 oz gin", "3/4 oz lime juice", "3/4 oz simple syrup", "3 cucumber slices", "6 mint leaves"], ["gin", "lime juice", "simple syrup", "cucumber", "mint"], ["Muddle cucumber and mint lightly.", "Shake with gin, lime, syrup, and ice.", "Fine-strain into a coupe."]],
  ["garden-spritz", "Garden Spritz", "Zero Proof", ["zero-proof", "sparkling", "citrus"], "4 min", "Fresh", "assets/citrus.jpg", "Cucumber, mint, lime, honey, and sparkling water for a dry, aromatic refresher.", ["3 cucumber slices", "6 mint leaves", "3/4 oz lime juice", "1/2 oz honey syrup", "Sparkling water"], ["cucumber", "mint", "lime juice", "honey syrup", "sparkling water"], ["Gently muddle cucumber and mint with lime and honey.", "Add ice and sparkling water.", "Lift with a spoon and garnish with mint."]],
  ["ginger-tea-collins", "Ginger Tea Collins", "Zero Proof", ["zero-proof", "sparkling", "citrus"], "6 min", "Spicy", "assets/citrus.jpg", "Black tea, ginger, lemon, honey, and bubbles, built like a Collins.", ["3 oz strong black tea", "3/4 oz lemon juice", "1/2 oz honey syrup", "Ginger syrup or fresh ginger", "Soda water"], ["black tea", "lemon juice", "honey syrup", "ginger", "soda water"], ["Shake tea, lemon, honey, and ginger with ice.", "Strain into an iced Collins glass.", "Top with soda."]],
  ["no-groni", "No-Groni Spritz", "Zero Proof", ["zero-proof", "sparkling", "bitter"], "5 min", "Bitter", "assets/citrus.jpg", "Pomegranate, orange, tea, bitters-style notes, and soda for an aperitivo shape.", ["2 oz pomegranate juice", "1 oz orange juice", "2 oz strong black tea", "Soda water", "Orange slice"], ["pomegranate juice", "orange juice", "black tea", "soda water", "orange"], ["Build juices and tea over ice.", "Top with soda.", "Garnish with orange."]],
];

const recipes = recipeBlueprints.map(([id, name, type, tags, time, strength, image, summary, ingredients, required, method]) => ({
  id,
  name,
  type,
  tags,
  time,
  strength,
  summary,
  ingredients,
  required,
  method,
}));

const ingredientGroups = [
  {
    key: "spirits",
    title: "Spirits",
    items: ["gin", "vodka", "bourbon", "rye whiskey", "scotch", "blanco tequila", "reposado tequila", "mezcal", "white rum", "aged rum", "dark rum"],
  },
  {
    key: "liqueurs",
    title: "Liqueurs & Aperitifs",
    items: ["orange liqueur", "campari", "aperol", "sweet vermouth", "dry vermouth", "lillet blanc", "amaro", "green chartreuse", "yellow chartreuse", "maraschino liqueur", "creme de violette", "coffee liqueur", "cherry liqueur", "absinthe"],
  },
  {
    key: "produce",
    title: "Citrus & Produce",
    items: ["lime juice", "lemon juice", "grapefruit juice", "orange juice", "orange", "lemon", "mint", "cucumber", "ginger"],
  },
  {
    key: "mixers",
    title: "Mixers & Bubbles",
    items: ["soda water", "sparkling water", "sparkling wine", "prosecco", "grapefruit soda", "ginger beer", "pineapple juice", "cranberry juice", "pomegranate juice", "black tea", "espresso"],
  },
  {
    key: "pantry",
    title: "Sweeteners, Bitters & Pantry",
    items: ["simple syrup", "agave syrup", "honey syrup", "orgeat", "raspberry syrup", "angostura bitters", "peychauds bitters", "orange bitters", "coconut cream", "cream", "egg", "nutmeg", "salt", "cherry", "orange flower water"],
  },
];

const starterShelf = ["gin", "bourbon", "blanco tequila", "white rum", "sweet vermouth", "campari", "orange liqueur", "lime juice", "lemon juice", "simple syrup", "angostura bitters", "orange", "soda water", "mint"];
const presets = {
  starter: starterShelf,
  tequila: ["blanco tequila", "reposado tequila", "mezcal", "lime juice", "grapefruit juice", "orange liqueur", "agave syrup", "campari", "soda water", "grapefruit soda", "salt", "orange"],
  vodka: ["vodka", "lime juice", "lemon juice", "cranberry juice", "orange liqueur", "coffee liqueur", "espresso", "simple syrup", "ginger beer", "soda water"],
  zero: ["lime juice", "lemon juice", "orange juice", "pomegranate juice", "black tea", "ginger", "honey syrup", "mint", "cucumber", "soda water", "sparkling water"],
};
const ingredientEquivalents = {
  bourbon: ["whiskey"],
  "rye whiskey": ["whiskey"],
  "soda water": ["sparkling water"],
  "sparkling water": ["soda water"],
  prosecco: ["sparkling wine"],
  "sparkling wine": ["prosecco"],
};
const easyGrabIngredients = new Set(["lime juice", "lemon juice", "grapefruit juice", "orange juice", "orange", "lemon", "mint", "cucumber", "ginger", "soda water", "sparkling water", "grapefruit soda", "ginger beer", "pineapple juice", "cranberry juice", "pomegranate juice", "black tea", "espresso", "simple syrup", "agave syrup", "honey syrup", "cream", "egg", "nutmeg", "salt", "cherry"]);
const pantryStaples = new Set(["simple syrup", "agave syrup", "honey syrup", "angostura bitters", "peychauds bitters", "orange bitters", "salt", "egg", "nutmeg", "cherry"]);
const specialtyIngredients = new Set(["green chartreuse", "yellow chartreuse", "maraschino liqueur", "creme de violette", "lillet blanc", "absinthe", "amaro", "orgeat", "raspberry syrup", "orange flower water", "cherry liqueur"]);
const storageKey = "shelf-and-stir-ingredients";
const favoriteKey = "shelf-and-stir-favorites";
const recentKey = "shelf-and-stir-recent";
const grid = document.querySelector("#recipe-grid");
const count = document.querySelector("#recipe-count");
const search = document.querySelector("#recipe-search");
const searchPanel = document.querySelector(".search-panel");
const clearSearch = document.querySelector("#clear-search");
const filters = [...document.querySelectorAll(".filter")];
const dialog = document.querySelector("#recipe-dialog");
const closeDialog = document.querySelector(".dialog-close");
const ingredientPicker = document.querySelector("#ingredient-picker");
const selectedCount = document.querySelector("#selected-count");
const matchCount = document.querySelector("#match-count");
const matchResults = document.querySelector("#match-results");
const matchTabs = [...document.querySelectorAll(".match-tab")];
const shelfSteps = [...document.querySelectorAll(".shelf-step")];
const presetButtons = [...document.querySelectorAll("[data-preset]")];
const clearPantry = document.querySelector("#clear-pantry");
const resetShelfButton = document.querySelector("#reset-shelf");
const shoppingInsights = document.querySelector("#shopping-insights");
const startSpiritButtons = [...document.querySelectorAll("[data-start-spirit]")];
const collectionButtons = [...document.querySelectorAll("[data-collection-filter]")];
const dialogFavorite = document.querySelector("#dialog-favorite");
const batchButtons = [...document.querySelectorAll("[data-batch]")];
const quickRecipeButtons = [...document.querySelectorAll("[data-quick-recipe]")];

let activeFilter = "all";
let activeMatchTab = "ready";
let activeIngredientStep = "all";
let currentRecipeId = "";
let currentBatchSize = 1;
const selectedIngredients = new Set();
const favoriteRecipes = new Set();
const recentRecipes = [];

function hydrateRecipeMeta() {
  recipes.forEach((recipe) => {
    recipe.flavorTags = recipeFlavorTags(recipe);
    recipe.effortTags = recipeEffortTags(recipe);
    recipe.substitutions = recipeSubstitutions(recipe);
  });
}

function loadSavedShelf() {
  selectedIngredients.clear();
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    saved.forEach((ingredient) => selectedIngredients.add(ingredient));
  } catch {
    // The matcher still works when browser storage is unavailable.
  }
}

function saveShelf() {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...selectedIngredients]));
  } catch {
    // The matcher still works when browser storage is unavailable.
  }
}

function clearSavedShelf() {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // The matcher still works when browser storage is unavailable.
  }
}

function loadFavorites() {
  try {
    favoriteRecipes.clear();
    JSON.parse(localStorage.getItem(favoriteKey) || "[]").forEach((id) => favoriteRecipes.add(id));
  } catch {
    favoriteRecipes.clear();
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(favoriteKey, JSON.stringify([...favoriteRecipes]));
  } catch {
    // Favorites are a local enhancement, not a hard dependency.
  }
}

function loadRecentRecipes() {
  try {
    recentRecipes.length = 0;
    const saved = JSON.parse(localStorage.getItem(recentKey) || "[]");
    saved.forEach((id) => {
      if (id && !recentRecipes.includes(id)) recentRecipes.push(id);
    });
  } catch {
    recentRecipes.length = 0;
  }
}

function saveRecentRecipes() {
  try {
    localStorage.setItem(recentKey, JSON.stringify(recentRecipes.slice(0, 6)));
  } catch {
    // Recent picks are a local enhancement, not a hard dependency.
  }
}

function renderRecipePreview(containerSelector, ids, emptyText) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const uniqueIds = [...new Set(ids)].slice(0, 4);
  const items = uniqueIds
    .map((id) => recipes.find((recipe) => recipe.id === id))
    .filter(Boolean);

  if (!items.length) {
    container.innerHTML = `<p class="mini-empty">${escapeHtml(emptyText)}</p>`;
    return;
  }

  container.innerHTML = items
    .map(
      (recipe) => `
        <button type="button" class="mini-item" data-recipe="${recipe.id}">
          <strong>${escapeHtml(recipe.name)}</strong>
          <span>${escapeHtml(recipe.type)} · ${escapeHtml(recipe.time)}</span>
        </button>
      `,
    )
    .join("");
}

function renderSmartLists() {
  renderRecipePreview("#favorite-preview", [...favoriteRecipes], "Save a few favorites to build your regular rotation.");
  renderRecipePreview("#recent-recipes", recentRecipes, "Open a recipe and it will show up here.");
}

function recordRecentRecipe(id) {
  if (!id) return;
  const nextRecent = [id, ...recentRecipes.filter((entry) => entry !== id)].slice(0, 6);
  recentRecipes.splice(0, recentRecipes.length, ...nextRecent);
  saveRecentRecipes();
  renderSmartLists();
}

function toggleFavorite(id) {
  if (favoriteRecipes.has(id)) {
    favoriteRecipes.delete(id);
  } else {
    favoriteRecipes.add(id);
  }
  saveFavorites();
  renderRecipes();
  renderSmartLists();
  updateDialogFavorite();
}

function expandedIngredients() {
  const expanded = new Set(selectedIngredients);
  selectedIngredients.forEach((ingredient) => {
    (ingredientEquivalents[ingredient] || []).forEach((equivalent) => expanded.add(equivalent));
  });
  return expanded;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function recipeMatches(recipe, query) {
  const haystack = [recipe.name, recipe.type, recipe.summary, ...recipe.tags, ...recipe.flavorTags, ...recipe.effortTags, ...recipe.ingredients, ...recipe.required]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

function visibleRecipes() {
  return recipes.filter((recipe) => {
    const matchesFilter =
      activeFilter === "all" ||
      recipe.tags.includes(activeFilter) ||
      recipe.flavorTags.includes(activeFilter) ||
      recipe.effortTags.includes(activeFilter) ||
      (activeFilter === "favorites" && favoriteRecipes.has(recipe.id));
    return matchesFilter && recipeMatches(recipe, search ? search.value : "");
  });
}

function renderRecipes() {
  if (!grid || !count) return;
  const matches = visibleRecipes();
  count.textContent = `${matches.length} recipe${matches.length === 1 ? "" : "s"}`;

  if (!matches.length) {
    grid.innerHTML = `<p class="empty-state">No recipes match that search.</p>`;
    return;
  }

  grid.innerHTML = matches
    .map(
      (recipe) => `
      <article class="recipe-card">
        <div class="recipe-card-content">
          <div class="tag-row">
            ${displayRecipeTags(recipe)
              .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
              .join("")}
          </div>
          <h3>${escapeHtml(recipe.name)}</h3>
          <p>${escapeHtml(recipe.summary)}</p>
          <div class="spec">
            <span>${escapeHtml(recipe.type)}</span>
            <span>${escapeHtml(recipe.time)}</span>
            <span>${escapeHtml(recipe.strength)}</span>
          </div>
          <div class="card-actions">
            <button type="button" data-recipe="${recipe.id}">View recipe</button>
            <button class="favorite-button ${favoriteRecipes.has(recipe.id) ? "saved" : ""}" type="button" data-favorite="${recipe.id}">
              ${favoriteRecipes.has(recipe.id) ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </article>
    `,
    )
    .join("");
}

function displayRecipeTags(recipe) {
  const spiritTags = ["gin", "vodka", "whiskey", "tequila", "mezcal", "rum", "amaro"];
  const formatTags = ["zero-proof", "tiki", "spritz", "sparkling", "stirred", "shaken"];
  const flavorTags = ["citrus", "bitter", "smoky", "herbal", "creamy", "refreshing", "boozy"];
  const tags = [
    recipe.tags.find((tag) => spiritTags.includes(tag)),
    recipe.tags.find((tag) => formatTags.includes(tag)),
    recipe.flavorTags.find((tag) => flavorTags.includes(tag)) || recipe.tags.find((tag) => flavorTags.includes(tag)),
  ];
  return [...new Set(tags.filter(Boolean))]
    .slice(0, 2)
    .map(formatDisplayTag);
}

function formatDisplayTag(tag) {
  const labels = {
    "zero-proof": "Zero proof",
    spritz: "Spritz",
    sparkling: "Bubbly",
    stirred: "Stirred",
    shaken: "Shaken",
    citrus: "Bright",
    refreshing: "Fresh",
    boozy: "Spirit-forward",
    tiki: "Tiki",
    amaro: "Amaro",
  };
  return labels[tag] || tag.charAt(0).toUpperCase() + tag.slice(1);
}

function recipeMatch(recipe) {
  const availableIngredients = expandedIngredients();
  const missing = recipe.required.filter((ingredient) => !availableIngredients.has(ingredient));
  const shoppingPain = missing.reduce((total, ingredient) => total + ingredientCost(ingredient), 0);
  return {
    ...recipe,
    missing,
    shoppingPain,
    score: recipe.required.length ? (recipe.required.length - missing.length) / recipe.required.length : 0,
  };
}

function pantryMatches() {
  return recipes
    .map(recipeMatch)
    .filter((recipe) => recipe.missing.length <= 2)
    .sort((a, b) => a.missing.length - b.missing.length || a.shoppingPain - b.shoppingPain || b.score - a.score || a.name.localeCompare(b.name));
}

function ingredientCost(ingredient) {
  if (specialtyIngredients.has(ingredient)) return 4;
  if (pantryStaples.has(ingredient)) return 2;
  if (easyGrabIngredients.has(ingredient)) return 1;
  return 3;
}

function ingredientLabel(ingredient) {
  if (specialtyIngredients.has(ingredient)) return "Specialty bottle";
  if (pantryStaples.has(ingredient)) return "Pantry staple";
  if (easyGrabIngredients.has(ingredient)) return "Easy grab";
  return "Bottle";
}

function matchLabel(recipe) {
  if (!recipe.missing.length) return "Ready now";
  if (recipe.missing.every((ingredient) => easyGrabIngredients.has(ingredient))) return "Easy errand";
  if (recipe.missing.some((ingredient) => specialtyIngredients.has(ingredient))) return "Specialty run";
  return "Worth a run";
}

function recipeFlavorTags(recipe) {
  const flavors = new Set();
  const text = [recipe.type, recipe.strength, recipe.summary, ...recipe.tags, ...recipe.required].join(" ").toLowerCase();
  if (/citrus|lime|lemon|grapefruit|fresh|bright|snappy|zesty|cool|garden/.test(text)) flavors.add("refreshing");
  if (/bitter|campari|aperol|amaro|negroni|americano/.test(text)) flavors.add("bitter");
  if (/spirit-forward|potent|boozy|martini|old fashioned|sazerac|manhattan|vesper/.test(text)) flavors.add("boozy");
  if (/smoky|mezcal|scotch/.test(text)) flavors.add("smoky");
  if (/herbal|mint|chartreuse|vermouth/.test(text)) flavors.add("herbal");
  if (/creamy|coconut|cream|velvety|silky|cloudlike/.test(text)) flavors.add("creamy");
  if (/sparkling|spritz|soda|highball|bubbles/.test(text)) flavors.add("sparkling");
  return [...flavors];
}

function recipeEffortTags(recipe) {
  const tags = new Set();
  const requiredCount = recipe.required.length;
  const minutes = Number.parseInt(recipe.time, 10);
  if (requiredCount <= 4 && minutes <= 6) tags.add("easy");
  if (!recipe.tags.includes("shaken") && !recipe.summary.toLowerCase().includes("shake")) tags.add("no-shaker");
  if (requiredCount >= 6 || minutes >= 8) tags.add("project");
  if (recipe.ingredients.length <= 3) tags.add("three-ingredient");
  return [...tags];
}

function recipeSubstitutions(recipe) {
  const rules = {
    "simple syrup": "Use honey syrup or agave syrup, but start slightly lighter because they read sweeter.",
    "agave syrup": "Use simple syrup in the same amount if the drink does not need extra agave flavor.",
    "honey syrup": "Use simple syrup for a cleaner drink or agave syrup for a softer roundness.",
    bourbon: "Rye whiskey works when you want a drier and spicier version.",
    "rye whiskey": "Bourbon works when you want a rounder and sweeter version.",
    "soda water": "Sparkling water works as a direct swap.",
    "sparkling water": "Soda water works as a direct swap.",
    prosecco: "Any dry sparkling wine works.",
    "sparkling wine": "Prosecco works if it is dry and cold.",
    "orange liqueur": "Orange curacao works in tiki drinks. Triple sec works in most citrus sours.",
    "lime juice": "Use lemon only in flexible sours. Keep lime for Margaritas, Daiquiris, Mojitos, and tiki drinks.",
    "lemon juice": "Use lime for a sharper version in many sours, but expect the drink to taste brighter.",
    "white rum": "Lightly aged rum works if it is not too sweet or dark.",
    "dark rum": "Aged rum works when you want a lighter version.",
  };
  return recipe.required.filter((ingredient) => rules[ingredient]).map((ingredient) => ({
    ingredient,
    note: rules[ingredient],
  }));
}

function amountToNumber(amount) {
  return amount.split(" ").reduce((total, part) => {
    if (part.includes("/")) {
      const [top, bottom] = part.split("/").map(Number);
      return total + top / bottom;
    }
    return total + Number(part);
  }, 0);
}

function formatAmount(value) {
  const rounded = Math.round(value * 4) / 4;
  const whole = Math.floor(rounded);
  const fraction = rounded - whole;
  const fractionText = {
    0.25: "1/4",
    0.5: "1/2",
    0.75: "3/4",
  }[fraction];
  if (!fractionText) return String(rounded);
  return whole ? `${whole} ${fractionText}` : fractionText;
}

function scaleIngredient(ingredient, batchSize) {
  if (batchSize === 1) return ingredient;
  return ingredient.replace(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)(\s+)/, (match, amount, space) => {
    return `${formatAmount(amountToNumber(amount) * batchSize)}${space}`;
  });
}

function renderIngredientPicker() {
  if (!ingredientPicker) return;
  const visibleGroups = ingredientGroups.filter((group) => activeIngredientStep === "all" || group.key === activeIngredientStep);
  ingredientPicker.innerHTML = visibleGroups
    .map(
      (group) => `
      <fieldset class="ingredient-group">
        <legend>${escapeHtml(group.title)}</legend>
        <div class="ingredient-options">
          ${group.items
            .map(
              (item) => `
              <label class="ingredient-option">
                <input type="checkbox" value="${escapeHtml(item)}" ${selectedIngredients.has(item) ? "checked" : ""}>
                <span>${escapeHtml(item)}</span>
              </label>
            `,
            )
            .join("")}
        </div>
      </fieldset>
    `,
    )
    .join("");
}

function renderMatches() {
  if (!matchResults || !selectedCount || !matchCount) return;
  const matches = pantryMatches();
  const ready = matches.filter((recipe) => recipe.missing.length === 0);
  const near = matches.filter((recipe) => recipe.missing.length > 0);
  const activeMatches = activeMatchTab === "ready" ? ready : near;

  selectedCount.textContent = `${selectedIngredients.size} selected`;
  matchCount.textContent = `${ready.length} ready / ${near.length} close`;
  matchTabs.forEach((tab) => {
    const isActive = tab.dataset.matchTab === activeMatchTab;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  if (!selectedIngredients.size) {
    matchResults.innerHTML = `<p class="empty-state compact">Choose a few bottles and ingredients to see your cocktail options.</p>`;
    if (shoppingInsights) {
      shoppingInsights.innerHTML = `<p>Use a preset or start with one spirit to see high-leverage next buys.</p>`;
    }
    return;
  }

  if (!activeMatches.length) {
    renderShoppingInsights(matches);
    matchResults.innerHTML = `<p class="empty-state compact">${activeMatchTab === "ready" ? "Nothing is fully ready yet. Check the missing 1-2 tab for close calls." : "No near matches yet. Add a spirit, citrus, or sweetener to widen the list."}</p>`;
    return;
  }

  matchResults.innerHTML = activeMatches
    .map(
      (recipe) => `
      <article class="match-card">
        <div>
          <p class="match-kicker">${matchLabel(recipe)}</p>
          <h3>${escapeHtml(recipe.name)}</h3>
          <div class="scan-row">
            <span>${escapeHtml(recipe.type)}</span>
            <span>${escapeHtml(recipe.time)}</span>
            <span>${escapeHtml(recipe.strength)}</span>
          </div>
          <p>${escapeHtml(recipe.summary)}</p>
          ${
            recipe.missing.length
              ? `<div class="missing-chips">${recipe.missing
                  .map((ingredient) => `<span>${escapeHtml(ingredient)} <em>${ingredientLabel(ingredient)}</em></span>`)
                  .join("")}</div>`
              : `<p class="missing-list ready"><strong>You have it all.</strong></p>`
          }
        </div>
        <button type="button" data-recipe="${recipe.id}">Recipe</button>
      </article>
    `,
    )
    .join("");
  renderShoppingInsights(matches);
}

function renderShoppingInsights(matches = pantryMatches()) {
  if (!shoppingInsights) return;
  if (!selectedIngredients.size) return;
  const unlocks = new Map();
  matches
    .filter((recipe) => recipe.missing.length === 1)
    .forEach((recipe) => {
      const ingredient = recipe.missing[0];
      if (selectedIngredients.has(ingredient)) return;
      if (!unlocks.has(ingredient)) unlocks.set(ingredient, []);
      unlocks.get(ingredient).push(recipe.name);
    });

  const ranked = [...unlocks.entries()]
    .map(([ingredient, names]) => ({ ingredient, names, cost: ingredientCost(ingredient) }))
    .sort((a, b) => b.names.length - a.names.length || a.cost - b.cost || a.ingredient.localeCompare(b.ingredient))
    .slice(0, 3);

  if (!ranked.length) {
    shoppingInsights.innerHTML = `<p>Your current shelf has no single-ingredient unlocks. Add one versatile spirit, citrus, or sweetener to widen the map.</p>`;
    return;
  }

  shoppingInsights.innerHTML = ranked
    .map(
      (item) => `
      <button type="button" data-add-ingredient="${escapeHtml(item.ingredient)}">
        <strong>${escapeHtml(item.ingredient)}</strong>
        <span>${ingredientLabel(item.ingredient)} - unlocks ${item.names.length}</span>
      </button>
    `,
    )
    .join("");
}

function renderPantry() {
  renderIngredientPicker();
  renderMatches();
  shelfSteps.forEach((step) => {
    const isActive = step.dataset.step === activeIngredientStep;
    step.classList.toggle("active", isActive);
    step.setAttribute("aria-selected", String(isActive));
  });
}

function openRecipe(id) {
  const recipe = recipes.find((item) => item.id === id);
  if (!recipe || !dialog) return;
  currentRecipeId = id;
  currentBatchSize = 1;
  recordRecentRecipe(id);
  const match = recipeMatch(recipe);
  document.querySelector("#dialog-type").textContent = recipe.type;
  document.querySelector("#dialog-title").textContent = recipe.name;
  document.querySelector("#dialog-summary").textContent = recipe.summary;
  document.querySelector("#dialog-method").innerHTML = recipe.method.map((step) => `<li>${escapeHtml(step)}</li>`).join("");
  renderDialogIngredients(recipe);
  renderDialogSubstitutions(recipe);
  updateDialogFavorite();
  updateBatchButtons();

  const note = document.querySelector("#dialog-match-note");
  if (!selectedIngredients.size) {
    note.innerHTML = "";
  } else if (!match.missing.length) {
    note.innerHTML = `<strong>Pantry match:</strong> You have every required ingredient selected.`;
  } else {
    note.innerHTML = `<strong>Pantry match:</strong> Missing ${match.missing.length}: ${match.missing.map(escapeHtml).join(", ")}.`;
  }

  if (dialog.showModal) {
    dialog.showModal();
  }
}

function renderDialogIngredients(recipe) {
  const ingredientList = document.querySelector("#dialog-ingredients");
  if (!ingredientList) return;
  ingredientList.innerHTML = recipe.ingredients
    .map((ingredient) => `<li>${escapeHtml(scaleIngredient(ingredient, currentBatchSize))}</li>`)
    .join("");
}

function renderDialogSubstitutions(recipe) {
  const substitutionBox = document.querySelector("#dialog-substitutions");
  if (!substitutionBox) return;
  if (!recipe.substitutions.length) {
    substitutionBox.innerHTML = "";
    return;
  }
  substitutionBox.innerHTML = `
    <h4>Smart swaps</h4>
    ${recipe.substitutions
      .map((swap) => `<p><strong>${escapeHtml(swap.ingredient)}:</strong> ${escapeHtml(swap.note)}</p>`)
      .join("")}
  `;
}

function updateDialogFavorite() {
  if (!dialogFavorite || !currentRecipeId) return;
  const saved = favoriteRecipes.has(currentRecipeId);
  dialogFavorite.textContent = saved ? "Saved favorite" : "Save favorite";
  dialogFavorite.classList.toggle("saved", saved);
}

function updateBatchButtons() {
  batchButtons.forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.batch) === currentBatchSize);
  });
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filters.forEach((filter) => filter.classList.toggle("active", filter === button));
    renderRecipes();
  });
});

document.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) {
    toggleFavorite(favoriteButton.dataset.favorite);
    return;
  }

  const recipeButton = event.target.closest("[data-recipe]");
  if (recipeButton) {
    openRecipe(recipeButton.dataset.recipe);
  }
});

if (ingredientPicker) {
  ingredientPicker.addEventListener("change", (event) => {
    if (!event.target.matches('input[type="checkbox"]')) return;
    if (event.target.checked) {
      selectedIngredients.add(event.target.value);
    } else {
      selectedIngredients.delete(event.target.value);
    }
    saveShelf();
    renderMatches();
  });
}

matchTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeMatchTab = tab.dataset.matchTab;
    renderMatches();
  });
});

shelfSteps.forEach((step) => {
  step.addEventListener("click", () => {
    activeIngredientStep = step.dataset.step;
    renderPantry();
  });
});

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedIngredients.clear();
    presets[button.dataset.preset].forEach((ingredient) => selectedIngredients.add(ingredient));
    activeMatchTab = "ready";
    saveShelf();
    renderPantry();
  });
});

startSpiritButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedIngredients.add(button.dataset.startSpirit);
    activeIngredientStep = "produce";
    activeMatchTab = "near";
    saveShelf();
    renderPantry();
  });
});

collectionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.collectionFilter;
    filters.forEach((filter) => filter.classList.toggle("active", filter.dataset.filter === activeFilter));
    renderRecipes();
    document.querySelector("#recipe-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

if (dialogFavorite) {
  dialogFavorite.addEventListener("click", () => {
    if (currentRecipeId) toggleFavorite(currentRecipeId);
  });
}

batchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentBatchSize = Number(button.dataset.batch);
    const recipe = recipes.find((item) => item.id === currentRecipeId);
    if (recipe) renderDialogIngredients(recipe);
    updateBatchButtons();
  });
});

if (shoppingInsights) {
  shoppingInsights.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-ingredient]");
    if (!button) return;
    selectedIngredients.add(button.dataset.addIngredient);
    saveShelf();
    renderPantry();
  });
}

if (search) search.addEventListener("input", renderRecipes);
if (searchPanel) searchPanel.addEventListener("submit", (event) => event.preventDefault());
if (clearSearch) clearSearch.addEventListener("click", () => window.setTimeout(renderRecipes, 0));
if (closeDialog && dialog) closeDialog.addEventListener("click", () => dialog.close());
if (dialog) {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}
const clearSelectedShelf = () => {
  selectedIngredients.clear();
  saveShelf();
  renderPantry();
};

if (clearPantry) {
  clearPantry.addEventListener("click", clearSelectedShelf);
}

if (resetShelfButton) {
  resetShelfButton.addEventListener("click", clearSelectedShelf);
}

quickRecipeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const recipe = recipes.find((item) => item.id === button.dataset.quickRecipe);
    if (recipe) openRecipe(recipe.id);
  });
});

loadSavedShelf();
loadFavorites();
loadRecentRecipes();
hydrateRecipeMeta();
renderRecipes();
renderSmartLists();
renderPantry();
