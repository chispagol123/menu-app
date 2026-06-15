/*
  Convierte cantidades de cocina (cucharadas, tazas, etc.)
  a unidades de compra reales (kg, litro, paquete, etc.)
*/

// Gramos por taza según ingrediente
const TAZA_TO_G = {
  "arroz": 200, "quinua": 185, "lentejas": 200,
  "arveja": 150, "mote": 200, "maní tostado": 140,
};

// Definición de unidad de compra: { unit, size en g o ml }
const PURCHASE_DEFS = {
  "aceite":          { unit: "litro",         size: 1000, measure: "ml" },
  "sal":             { unit: "paquete 1kg",   size: 1000, measure: "g" },
  "azúcar":          { unit: "paquete 1kg",   size: 1000, measure: "g" },
  "harina":          { unit: "bolsa 1kg",     size: 1000, measure: "g" },
  "arroz":           { unit: "bolsa 1kg",     size: 1000, measure: "g" },
  "quinua":          { unit: "bolsa 500g",    size: 500,  measure: "g" },
  "fideos":          { unit: "paquete 500g",  size: 500,  measure: "g" },
  "fideos finos":    { unit: "paquete 250g",  size: 250,  measure: "g" },
  "pan molido":      { unit: "bolsa 500g",    size: 500,  measure: "g" },
  "leche":           { unit: "litro",         size: 1000, measure: "ml" },
  "crema de leche":  { unit: "caja 200ml",    size: 200,  measure: "ml" },
  "orégano":         { unit: "sobrecito 10g", size: 10,   measure: "g" },
  "comino":          { unit: "sobrecito 10g", size: 10,   measure: "g" },
  "pimienta":        { unit: "sobrecito 10g", size: 10,   measure: "g" },
  "maní tostado":    { unit: "bolsa 200g",    size: 200,  measure: "g" },
  "salsa de soja":   { unit: "botella 200ml", size: 200,  measure: "ml" },
  "lentejas":        { unit: "bolsa 500g",    size: 500,  measure: "g" },
  "mote":            { unit: "bolsa 500g",    size: 500,  measure: "g" },
  "charque (carne seca)": { unit: "bolsa 250g", size: 250, measure: "g" },
};

const LIQUIDS = new Set(["aceite", "salsa de soja", "leche", "crema de leche"]);

function toPurchaseUnit(name, totalQty, cookingUnit) {
  const key = name.toLowerCase();
  const def = PURCHASE_DEFS[key];

  // Ya está en peso
  if (cookingUnit === "g") {
    if (totalQty >= 1000) return fmt(totalQty / 1000, "kg");
    return fmt(totalQty, "g");
  }
  if (cookingUnit === "kg") return fmt(totalQty, "kg");

  // Ya está en volumen
  if (cookingUnit === "ml") {
    if (totalQty >= 1000) return fmt(totalQty / 1000, "litro");
    return fmt(totalQty, "ml");
  }
  if (cookingUnit === "litro") return fmt(totalQty, "litro");

  // Unidades contables
  if (["unidad", "rebanada", "ramita", "diente"].includes(cookingUnit)) {
    return fmt(Math.ceil(totalQty), cookingUnit);
  }

  // Taza → convertir a g o ml, luego a unidad de compra
  if (cookingUnit === "taza") {
    if (LIQUIDS.has(key)) {
      const totalMl = totalQty * 240;
      if (def) return fmt(Math.ceil(totalMl / def.size), def.unit);
      return fmt(Math.ceil(totalMl / 1000), "litro");
    } else {
      const gPerTaza = TAZA_TO_G[key] || 200;
      const totalG = totalQty * gPerTaza;
      if (def) return fmt(Math.ceil(totalG / def.size), def.unit);
      return fmt(Math.ceil(totalG / 1000), "kg");
    }
  }

  // Cucharada (cda) → ~15ml líquido, ~12g seco
  if (cookingUnit === "cda") {
    if (LIQUIDS.has(key)) {
      const totalMl = totalQty * 15;
      if (def) return fmt(Math.ceil(totalMl / def.size), def.unit);
      return fmt(Math.ceil(totalMl / 1000), "litro");
    } else {
      const totalG = totalQty * 12;
      if (def) return fmt(Math.ceil(totalG / def.size), def.unit);
      return fmt(Math.ceil(totalG), "g");
    }
  }

  // Cucharadita (cdita) → ~5g o 5ml
  if (cookingUnit === "cdita") {
    const totalG = totalQty * 5;
    if (def) return fmt(Math.ceil(totalG / def.size), def.unit);
    return fmt(Math.ceil(totalG), "g");
  }

  // Fallback: mostrar tal cual
  return fmt(Math.ceil(totalQty), cookingUnit);
}

function fmt(qty, unit) {
  const rounded = Math.round(qty * 10) / 10;
  return { qty: rounded, unit };
}

module.exports = { toPurchaseUnit };
