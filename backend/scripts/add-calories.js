const fs = require("fs");
const path = require("path");

const recipesPath = path.join(__dirname, "../data/recipes.json");
const recipes = JSON.parse(fs.readFileSync(recipesPath, "utf-8"));

// Calorías estimadas por porción (kcal) para cada receta por id
const calories = {
  1: 650,   // Silpancho
  2: 420,   // Sopa de maní (original)
  3: 380,   // Fricasé
  4: 480,   // Pique macho
  5: 520,   // Chicharrón
  6: 350,   // Sopa de maní 2
  7: 440,   // Sajta de pollo
  8: 560,   // Thimpu
  9: 310,   // Sopa de verduras
  10: 490,  // Charque
  11: 420,  // Chuño phuti
  12: 380,  // Ají de fideo
  13: 460,  // Pollo al horno
  14: 390,  // Lagua
  15: 340,  // Sopa de arveja
  16: 510,  // Sopa de pollo
  17: 290,  // Ensalada mixta
  18: 320,  // Arroz con leche postre
  19: 480,  // Estofado de pollo
  20: 550,  // Mondongo
  21: 430,  // Sopa de res
  22: 370,  // Papa rellena
  23: 460,  // Pollo frito
  24: 390,  // Arroz graneado con pollo
  25: 520,  // Ribs / costilla
  26: 410,  // Tallarín rojo
  27: 350,  // Caldo de pollo
  28: 440,  // Sopa de tomate
  29: 480,  // Bistec
  30: 320,  // Ensalada de palmito
  31: 550,  // Pastel de carne
  32: 390,  // Sopa de trigo
  33: 470,  // Hígado encebollado
  34: 430,  // Pollo a la plancha
  35: 360,  // Locro
  36: 510,  // Asado de res
  37: 390,  // Budín de pan
  38: 340,  // Sopa de arroz
  39: 480,  // Chuleta al horno
  40: 420,  // Relleno de papa
  41: 370,  // Puré de papa
  42: 530,  // Lomo fino
  43: 310,  // Ensalada de tomate
  44: 450,  // Pollo guisado
  45: 400,  // Sopa de fideos
  46: 360,  // Arroz con leche sal
  47: 490,  // Picante de pollo
  48: 420,  // Sopa de zanahoria
  49: 540,  // Carne a la olla
  50: 380,  // Fideos con queso
  51: 460,  // Pollo con arroz
  52: 350,  // Crema de verduras
  53: 510,  // Cerdo con papas
  54: 390,  // Sopa de cebolla
  55: 430,  // Albóndigas
  56: 370,  // Arroz con verduras
  57: 480,  // Pollo asado
  58: 420,  // Sopa de arvejas
  59: 550,  // Res guisada
  60: 310,  // Ensalada verde
  61: 470,  // Tallarines
  62: 400,  // Sopa de pollo con fideos
  63: 360,  // Vegetales al vapor
  64: 520,  // Estofado de res
  65: 440,  // Pollo en salsa
  66: 380,  // Sopa de papa
  67: 500,  // Cerdo asado
  68: 430,  // Arroz con frijol
  69: 350,  // Ensalada de pepino
  70: 390,  // Sopa de fideos con res
  // Desayunos 71-85
  71: 280,  // Api con pastel
  72: 210,  // Huevo revuelto con verduras
  73: 260,  // Tostadas con queso y tomate
  74: 310,  // Avena con leche y fruta
  75: 290,  // Pancakes
  76: 240,  // Huevo frito con pan
  77: 320,  // Empanadas de queso
  78: 280,  // Yogur con granola
  79: 350,  // Sándwich de jamón y queso
  80: 220,  // Batido de plátano
  81: 230,  // Tortilla de huevo con jamón
  82: 270,  // Marraqueta con mantequilla
  83: 390,  // Huevos benedictinos
  84: 420,  // Salteñas de pollo
  85: 150,  // Tazón de frutas
  // Nuevas 86-155
  86: 680,  // Silpancho cochabambino
  87: 620,  // Pique macho
  88: 590,  // Chicharrón con mote
  89: 540,  // Fricasé de cerdo
  90: 500,  // Thimpu de cordero
  91: 470,  // Charque de llama
  92: 480,  // Sajta de pollo
  93: 420,  // Ají de fideo
  94: 510,  // Pollo al horno con papas
  95: 380,  // Sopa de maní
  96: 290,  // Lagua de maíz
  97: 400,  // Arroz con frijoles
  98: 350,  // Curry de verduras
  99: 480,  // Tallarines al pesto
  100: 620, // Lasaña de carne
  101: 310, // Trucha a la plancha
  102: 220, // Ceviche de pescado
  103: 450, // Pollo teriyaki
  104: 560, // Hamburguesa casera
  105: 320, // Arroz con leche
  106: 380, // Buñuelos con miel
  107: 180, // Sopa de verduras
  108: 380, // Stir fry de pollo
  109: 300, // Sopa de lentejas
  110: 290, // Tostadas francesas
  111: 150, // Smoothie verde
  112: 310, // Muffins de naranja
  113: 250, // Ensalada de quinua
  114: 280, // Sopa de quinua
  115: 480, // Empanadas de carne
  116: 420, // Tacos de pollo
  117: 440, // Fideos chinos chow mein
  118: 220, // Crema de espinaca
  119: 490, // Pollo con curry y coco
  120: 310, // Papas al horno con queso
  121: 370, // Tortilla española
  122: 460, // Arroz con pollo
  123: 390, // Chuleta de cerdo
  124: 430, // Pasta con atún
  125: 250, // Revuelto de champiñones
  126: 160, // Sopa de tomate
  127: 420, // Milanesa de pollo
  128: 280, // Sopa de arveja
  129: 240, // Guacamole con totopos
  130: 460, // Risotto de champiñones
  131: 310, // Sopa de cebolla gratinada
  132: 500, // Pollo en salsa de maní
  133: 280, // Shakshuka
  134: 330, // Humintas en chala
  135: 520, // Conejo al ajillo
  136: 190, // Crema de calabaza
  137: 350, // Wrap de pollo
  138: 300, // Falafel con ensalada
  139: 490, // Sopa chairo
  140: 340, // Chupe de sémola
  141: 290, // Flan de caramelo
  142: 540, // Pastel de papa
  143: 310, // Garbanzos al tomate
  144: 380, // Caldo de pollo
  145: 380, // Arroz frito chino
  146: 220, // Ensalada de papa
  147: 460, // Pollo a la mostaza
  148: 270, // Leche asada
  149: 580, // Lomo saltado
  150: 310, // Crêpes con mermelada
  151: 260, // Panqueque de avena
  152: 520, // Sajta de res
  153: 240, // Mazamorra de durazno
  154: 650, // Pollo relleno al horno
  155: 510, // Fideos bolognesa
};

let updated = 0;
const result = recipes.map((r) => {
  if (calories[r.id] !== undefined) {
    updated++;
    return { ...r, estimated_calories: calories[r.id] };
  }
  // Si no tiene calorías definidas, poner un estimado genérico de 400
  return { ...r, estimated_calories: 400 };
});

fs.writeFileSync(recipesPath, JSON.stringify(result, null, 2), "utf-8");
console.log(`✅ Calorías agregadas a ${updated} recetas.`);
