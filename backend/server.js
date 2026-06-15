const express = require("express");
const cors = require("cors");
const path = require("path");
const { generateMenu, filterByPreferences, recipes } = require("./algorithms/optimizer");

const app = express();
app.use(cors());
app.use(express.json());

// Servir el frontend en producción
const frontendBuild = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendBuild));

// Devuelve todas las recetas filtradas por preferencias (para el catálogo)
app.post("/api/recipes", (req, res) => {
  const { preferences } = req.body;
  const filtered = filterByPreferences(recipes, preferences || {});
  res.json(filtered);
});

// Mantener GET para compatibilidad
app.get("/api/recipes", (req, res) => {
  res.json(recipes);
});

// Genera el menú con selecciones manuales
app.post("/api/menu", (req, res) => {
  const { days, people, manualSelections, preferences } = req.body;
  if (!days || !people) {
    return res.status(400).json({ error: "Faltan parámetros: days y people son requeridos." });
  }
  const result = generateMenu(
    Number(days),
    Number(people),
    manualSelections || [],
    preferences || {}
  );
  res.json(result);
});

// Sorpréndeme: genera un menú completamente automático basado en preferencias
app.post("/api/surprise", (req, res) => {
  const { days, people, preferences } = req.body;
  if (!days || !people) {
    return res.status(400).json({ error: "Faltan parámetros." });
  }
  const result = generateMenu(Number(days), Number(people), [], preferences || {});
  res.json(result);
});

// Intercambiar una receta del menú
app.post("/api/swap", (req, res) => {
  const { days, people, currentMenu, day, mealType, newRecipeId, preferences } = req.body;
  const manualSelections = [];
  for (let d = 1; d <= days; d++) {
    for (const mt of ["almuerzo", "cena"]) {
      if (d === day && mt === mealType) {
        manualSelections.push({ day: d, mealType: mt, recipeId: newRecipeId });
      } else if (currentMenu[d] && currentMenu[d][mt]) {
        manualSelections.push({ day: d, mealType: mt, recipeId: currentMenu[d][mt].id });
      }
    }
  }
  const result = generateMenu(Number(days), Number(people), manualSelections, preferences || {});
  res.json(result);
});

// Cualquier otra ruta devuelve el frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendBuild, "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
