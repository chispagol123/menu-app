/*
  Algoritmo de optimización anti-desperdicio

  Idea central: cuando el usuario ya eligió algunas recetas manualmente,
  extraemos todos los ingredientes que esas recetas usan. Luego, para
  completar el resto del menú, buscamos recetas que compartan la mayor
  cantidad de esos ingredientes → menos cosas que comprar → menos desperdicio.
*/

const recipes = require("../data/recipes.json");
const { toPurchaseUnit } = require("./purchaseUnits");

// Filtra recetas según las preferencias del usuario
function filterByPreferences(recipeList, preferences = {}) {
  return recipeList.filter((r) => {
    if (preferences.vegetariano && !r.category.includes("vegetariano") && !r.category.includes("vegano")) return false;
    if (preferences.vegano && !r.category.includes("vegano")) return false;
    if (preferences.sinGluten && !r.category.includes("sin gluten")) return false;
    if (preferences.sinPicante && r.category.includes("picante")) return false;
    if (preferences.rapido && r.time_minutes > 45) return false;
    return true;
  });
}

// Dado un menú parcial (recetas ya elegidas), devuelve qué ingredientes ya tenemos
function extractIngredients(selectedRecipes) {
  const ingredients = new Set();
  selectedRecipes.forEach((recipe) => {
    recipe.ingredients.forEach((ing) => {
      ingredients.add(ing.name.toLowerCase());
    });
  });
  return ingredients;
}

// Calcula cuántos ingredientes de una receta ya están en nuestra lista
function reuseScore(recipe, availableIngredients) {
  const total = recipe.ingredients.length;
  const reused = recipe.ingredients.filter((ing) =>
    availableIngredients.has(ing.name.toLowerCase())
  ).length;
  // Porcentaje de reutilización (0 a 1)
  return total > 0 ? reused / total : 0;
}

/*
  Función principal del algoritmo

  Parámetros:
  - days: 3, 5 o 7
  - people: cuántas personas comen
  - manualSelections: array de { day, mealType, recipeId }
    Ejemplo: [{ day: 1, mealType: "almuerzo", recipeId: 1 }]

  Devuelve:
  - menu: objeto con todos los días y comidas
  - shoppingList: lista de ingredientes con cantidades y costos
  - totalCost: costo total estimado en Bs.
*/
function generateMenu(days, people, manualSelections = [], preferences = {}) {
  const availableRecipes = filterByPreferences(recipes, preferences);
  const totalMeals = days * 2; // almuerzo + cena por día
  const menu = {};

  // Inicializar estructura del menú
  for (let d = 1; d <= days; d++) {
    menu[d] = { almuerzo: null, cena: null };
  }

  // Colocar las selecciones manuales del usuario
  const usedRecipeIds = new Set();
  manualSelections.forEach(({ day, mealType, recipeId }) => {
    const recipe = availableRecipes.find((r) => r.id === recipeId);
    if (recipe && day >= 1 && day <= days) {
      menu[day][mealType] = recipe;
      usedRecipeIds.add(recipeId);
    }
  });

  // Extraer ingredientes ya presentes en las recetas manuales
  const manualRecipes = manualSelections
    .map(({ recipeId }) => recipes.find((r) => r.id === recipeId))
    .filter(Boolean);
  let availableIngredients = extractIngredients(manualRecipes);

  // Completar los espacios vacíos del menú con el algoritmo
  for (let d = 1; d <= days; d++) {
    for (const mealType of ["almuerzo", "cena"]) {
      if (menu[d][mealType] !== null) continue; // ya está elegido

      // Filtrar recetas válidas para este tipo de comida
      const candidates = availableRecipes.filter(
        (r) =>
          r.meal_type.includes(mealType) && !usedRecipeIds.has(r.id)
      );

      if (candidates.length === 0) continue;

      // Calcular puntaje de reutilización para cada candidata
      const scored = candidates.map((r) => ({
        recipe: r,
        score: reuseScore(r, availableIngredients),
      }));

      // Ordenar: primero las de mayor reutilización, luego por costo (menor)
      scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.recipe.estimated_cost_bob - b.recipe.estimated_cost_bob;
      });

      const chosen = scored[0].recipe;
      menu[d][mealType] = chosen;
      usedRecipeIds.add(chosen.id);

      // Actualizar ingredientes disponibles con la nueva receta elegida
      chosen.ingredients.forEach((ing) =>
        availableIngredients.add(ing.name.toLowerCase())
      );
    }
  }

  // Generar lista de compras
  const shoppingMap = {};
  for (let d = 1; d <= days; d++) {
    for (const mealType of ["almuerzo", "cena"]) {
      const recipe = menu[d][mealType];
      if (!recipe) continue;

      const factor = people / recipe.servings_base;

      recipe.ingredients.forEach((ing) => {
        const key = ing.name.toLowerCase();
        const qty = ing.quantity * factor;
        const cost = qty * ing.cost_per_unit;

        if (shoppingMap[key]) {
          shoppingMap[key].quantity += qty;
          shoppingMap[key].totalCost += cost;
        } else {
          shoppingMap[key] = {
            name: ing.name,
            quantity: qty,
            unit: ing.unit,
            totalCost: cost,
          };
        }
      });
    }
  }

  const shoppingList = Object.values(shoppingMap)
    .map((item) => {
      const purchase = toPurchaseUnit(item.name, item.quantity, item.unit);
      return {
        ...item,
        quantity: Math.round(item.quantity * 10) / 10,
        totalCost: Math.round(item.totalCost * 10) / 10,
        purchaseQty: purchase.qty,
        purchaseUnit: purchase.unit,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const totalCost = Math.round(
    shoppingList.reduce((sum, item) => sum + item.totalCost, 0)
  );

  return { menu, shoppingList, totalCost };
}

module.exports = { generateMenu, filterByPreferences, recipes };
