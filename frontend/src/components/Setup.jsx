import React, { useState, useEffect } from "react";

const DAYS_OPTIONS = [3, 5, 7];
const PEOPLE_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10];

const MEAL_TYPE_OPTIONS = [
  { key: "desayuno", label: "🌅 Desayuno" },
  { key: "almuerzo", label: "☀️ Almuerzo" },
  { key: "cena", label: "🌙 Cena" },
  { key: "postre", label: "🍮 Postre" },
];

const PREFERENCES_OPTIONS = [
  { key: "vegetariano", label: "🥦 Vegetariano", desc: "Sin carne ni pescado" },
  { key: "vegano", label: "🌱 Vegano", desc: "Sin ningún producto animal" },
  { key: "sinGluten", label: "🌾 Sin gluten", desc: "Apto para celíacos" },
  { key: "sinPicante", label: "🧊 Sin picante", desc: "Sin ají ni locoto" },
  { key: "rapido", label: "⚡ Rápido", desc: "Solo recetas de menos de 45 min" },
  { key: "keto", label: "🥑 Keto", desc: "Bajo en carbohidratos, alto en grasas saludables" },
  { key: "sinSopa", label: "🚫🍲 Sin sopas", desc: "No incluir sopas ni caldos en el menú" },
];

const CATEGORY_FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "desayuno", label: "🌅 Desayuno" },
  { key: "pollo", label: "🍗 Pollo" },
  { key: "carne", label: "🥩 Carne" },
  { key: "sopa", label: "🍲 Sopas" },
  { key: "pasta", label: "🍝 Pastas" },
  { key: "vegetariano", label: "🥦 Vegetariano" },
  { key: "saludable", label: "💚 Saludable" },
  { key: "pescado", label: "🐟 Pescado" },
  { key: "tradicional", label: "🇧🇴 Boliviano" },
  { key: "internacional", label: "🌍 Internacional" },
  { key: "rápido", label: "⚡ Rápido" },
];

const PROTEIN_OPTIONS = [
  { key: "pollo", label: "🍗 Pollo" },
  { key: "carne", label: "🥩 Carne de res" },
  { key: "pescado", label: "🐟 Pescado" },
  { key: "vegetariano", label: "🥦 Vegetariano" },
  { key: "huevo", label: "🥚 Huevo" },
];

export default function Setup({ onGenerate, loading }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [days, setDays] = useState(7);
  const [people, setPeople] = useState(4);
  const [mealTypes, setMealTypes] = useState(["almuerzo", "cena"]);
  const [preferences, setPreferences] = useState({});
  const [proteinLimits, setProteinLimits] = useState({ pollo: 3, carne: 2, pescado: 1, vegetariano: 2, huevo: 1 });
  const [allRecipes, setAllRecipes] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [selectedIds, setSelectedIds] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const totalMeals = days * mealTypes.length;

  function toggleMealType(key) {
    setMealTypes((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev; // al menos uno debe estar activo
        return prev.filter((x) => x !== key);
      }
      return [...prev, key].sort((a, b) => {
        const order = ["desayuno", "almuerzo", "cena"];
        return order.indexOf(a) - order.indexOf(b);
      });
    });
  }

  // Cargar todas las recetas una sola vez
  useEffect(() => {
    if (currentStep === 3 && allRecipes.length === 0) {
      fetch("/api/recipes")
        .then((r) => r.json())
        .then(setAllRecipes);
    }
  }, [currentStep]);

  // Resetear selección si cambian las preferencias
  useEffect(() => {
    setSelectedIds([]);
  }, [preferences]);

  function togglePref(key) {
    setPreferences((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Si vegano, también vegetariano
      if (key === "vegano" && next.vegano) next.vegetariano = true;
      if (key === "vegetariano" && !next.vegetariano) next.vegano = false;
      return next;
    });
  }

  function toggleRecipe(id) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= totalMeals) return prev; // no agregar más de lo necesario
      return [...prev, id];
    });
  }

  async function handleSurprise() {
    try {
      const res = await fetch("/api/surprise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days, people, preferences, mealTypes, proteinLimits }),
      });
      if (!res.ok) {
        alert("Error del servidor: " + res.status);
        return;
      }
      const data = await res.json();
      const ids = [];
      for (let d = 1; d <= days; d++) {
        for (const mt of mealTypes) {
          if (data.menu[d]?.[mt]) ids.push(data.menu[d][mt].id);
        }
      }
      setSelectedIds(ids);
    } catch (e) {
      alert("Error: " + e.message);
    }
  }

  function handleGenerate() {
    const manualSelections = [];
    let idx = 0;
    for (let d = 1; d <= days; d++) {
      for (const mt of mealTypes) {
        if (idx < selectedIds.length) {
          manualSelections.push({ day: d, mealType: mt, recipeId: selectedIds[idx] });
          idx++;
        }
      }
    }
    onGenerate(days, people, preferences, manualSelections, mealTypes, proteinLimits);
  }

  const preferenceFiltered = allRecipes.filter((r) => {
    if (!r.meal_type.some((mt) => mealTypes.includes(mt))) return false;
    if (preferences.vegetariano && !r.category.includes("vegetariano") && !r.category.includes("vegano")) return false;
    if (preferences.vegano && !r.category.includes("vegano")) return false;
    if (preferences.sinGluten && !r.category.includes("sin gluten")) return false;
    if (preferences.sinPicante && r.category.includes("picante")) return false;
    if (preferences.rapido && r.time_minutes > 45) return false;
    if (preferences.keto && !r.category.includes("keto")) return false;
    return true;
  });

  const visibleRecipes = preferenceFiltered.filter((r) =>
    categoryFilter === "todos" ? true : r.category.includes(categoryFilter)
  );

  const selectedRecipes = allRecipes.filter((r) => selectedIds.includes(r.id));

  return (
    <div>
      {/* Indicador de pasos */}
      <div style={{ display: "flex", gap: 0, marginBottom: 28, alignItems: "center" }}>
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center",
              justifyContent: "center", fontWeight: 700, fontSize: 14,
              background: currentStep >= s ? "#2d6a4f" : "#e5e7eb",
              color: currentStep >= s ? "#fff" : "#9ca3af",
              cursor: currentStep > s ? "pointer" : "default",
            }} onClick={() => currentStep > s && setCurrentStep(s)}>
              {s}
            </div>
            <div style={{ fontSize: 13, marginLeft: 8, color: currentStep >= s ? "#2d6a4f" : "#9ca3af", fontWeight: currentStep === s ? 700 : 400 }}>
              {s === 1 ? "Configurar" : s === 2 ? "Preferencias" : "Elegir recetas"}
            </div>
            {s < 3 && <div style={{ flex: 1, height: 2, background: currentStep > s ? "#2d6a4f" : "#e5e7eb", margin: "0 12px" }} />}
          </React.Fragment>
        ))}
      </div>

      {/* PASO 1: Días, comidas y personas */}
      {currentStep === 1 && (
        <div>
          <h2 style={{ color: "#2d6a4f", marginBottom: 6 }}>¿Cuántos días y personas?</h2>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>
            Esto determina cuántas comidas planificaremos y las porciones de cada receta.
          </p>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 32 }}>
            <Card title="¿Cuántos días quieres planificar?">
              <div style={{ display: "flex", gap: 10 }}>
                {DAYS_OPTIONS.map((d) => (
                  <ToggleBtn key={d} active={days === d} onClick={() => setDays(d)}>
                    {d} días
                    <div style={{ fontSize: 11, opacity: 0.7 }}>{d * mealTypes.length} comidas</div>
                  </ToggleBtn>
                ))}
              </div>
            </Card>
            <Card title="¿Qué comidas quieres planificar?">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {MEAL_TYPE_OPTIONS.map((mt) => (
                  <ToggleBtn key={mt.key} active={mealTypes.includes(mt.key)} onClick={() => toggleMealType(mt.key)}>
                    {mt.label}
                  </ToggleBtn>
                ))}
              </div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
                {totalMeals} comidas por semana
              </div>
            </Card>
            <Card title="¿Cuántas personas comen?">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PEOPLE_OPTIONS.map((p) => (
                  <ToggleBtn key={p} active={people === p} onClick={() => setPeople(p)}>
                    {p}
                  </ToggleBtn>
                ))}
              </div>
            </Card>
          </div>
          <button onClick={() => setCurrentStep(2)} style={btnStyle("#2d6a4f")}>
            Siguiente → Mis preferencias
          </button>
        </div>
      )}

      {/* PASO 2: Preferencias */}
      {currentStep === 2 && (
        <div>
          <h2 style={{ color: "#2d6a4f", marginBottom: 6 }}>Preferencias y frecuencia</h2>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 20 }}>
            Indica cuántas veces por semana quieres cada proteína, y si tienes restricciones alimenticias.
          </p>

          {/* Frecuencia de proteínas */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#2d6a4f", marginBottom: 14 }}>
              ¿Cuántas veces por semana quieres comer...?
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PROTEIN_OPTIONS.map((opt) => (
                <div key={opt.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 15 }}>{opt.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button
                      onClick={() => setProteinLimits((p) => ({ ...p, [opt.key]: Math.max(0, (p[opt.key] ?? 0) - 1) }))}
                      style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #d1d5db", background: "#f9fafb", fontSize: 18, cursor: "pointer", fontWeight: 700 }}
                    >−</button>
                    <span style={{ fontWeight: 700, fontSize: 18, minWidth: 24, textAlign: "center" }}>
                      {proteinLimits[opt.key] ?? 0}
                    </span>
                    <button
                      onClick={() => setProteinLimits((p) => ({ ...p, [opt.key]: Math.min(days, (p[opt.key] ?? 0) + 1) }))}
                      style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #d1d5db", background: "#f9fafb", fontSize: 18, cursor: "pointer", fontWeight: 700 }}
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 12 }}>
              El botón Sorpréndeme respetará estas cantidades al armar el menú.
            </div>
          </div>

          {/* Restricciones */}
          <div style={{ fontWeight: 700, fontSize: 15, color: "#444", marginBottom: 12 }}>Restricciones alimenticias</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginBottom: 28 }}>
            {PREFERENCES_OPTIONS.map((opt) => {
              const active = preferences[opt.key];
              return (
                <div
                  key={opt.key}
                  onClick={() => togglePref(opt.key)}
                  style={{
                    border: active ? "2px solid #2d6a4f" : "1px solid #e5e7eb",
                    background: active ? "#d1fae5" : "#fff",
                    borderRadius: 10, padding: "14px 16px", cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                    {active ? "✓ " : ""}{opt.label}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>{opt.desc}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setCurrentStep(1)} style={btnStyle("#6b7280")}>← Volver</button>
            <button onClick={() => setCurrentStep(3)} style={btnStyle("#2d6a4f")}>
              Siguiente → Elegir recetas
            </button>
          </div>
        </div>
      )}

      {/* PASO 3: Elegir recetas */}
      {currentStep === 3 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <div>
              <h2 style={{ color: "#2d6a4f", marginBottom: 4 }}>Elige tus recetas</h2>
              <p style={{ color: "#666", fontSize: 14 }}>
                Necesitas elegir <strong>{totalMeals} recetas</strong> ({days} días × 2 comidas).{" "}
                <span style={{ color: "#2d6a4f", fontWeight: 600 }}>{preferenceFiltered.length} recetas disponibles</span> en el catálogo.
              </p>
            </div>
            {/* Contador y botón sorpréndeme */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{
                background: selectedIds.length === totalMeals ? "#d1fae5" : "#fff",
                border: `2px solid ${selectedIds.length === totalMeals ? "#2d6a4f" : "#e5e7eb"}`,
                borderRadius: 10, padding: "8px 16px", textAlign: "center", minWidth: 110,
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#2d6a4f" }}>
                  {selectedIds.length} / {totalMeals}
                </div>
                <div style={{ fontSize: 11, color: "#666" }}>seleccionadas</div>
              </div>
              <button onClick={handleSurprise} style={btnStyle("#7c3aed")}>
                ✨ Sorpréndeme
              </button>
              {selectedIds.length > 0 && (
                <button onClick={() => setSelectedIds([])} style={btnStyle("#6b7280", true)}>Limpiar</button>
              )}
              <button
                onClick={handleGenerate}
                disabled={selectedIds.length < totalMeals || loading}
                style={{
                  ...btnStyle("#2d6a4f"),
                  opacity: selectedIds.length < totalMeals || loading ? 0.4 : 1,
                  cursor: selectedIds.length < totalMeals ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Generando..." : `✅ Generar menú`}
              </button>
            </div>
          </div>

          {/* Recetas seleccionadas (vista previa) */}
          {selectedIds.length > 0 && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#166534", marginBottom: 8 }}>
                Recetas seleccionadas (en este orden: almuerzo y cena de cada día):
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {selectedIds.map((id, i) => {
                  const r = allRecipes.find((x) => x.id === id);
                  if (!r) return null;
                  const mtIcons = { desayuno: "🌅", almuerzo: "☀️", cena: "🌙", postre: "🍮" };
                  const mtKey = mealTypes[i % mealTypes.length];
                  const mealTypeIcon = mtIcons[mtKey] || "🍽️";
                  const dayNum = Math.floor(i / mealTypes.length) + 1;
                  return (
                    <div
                      key={id}
                      onClick={() => toggleRecipe(id)}
                      title="Clic para quitar"
                      style={{
                        background: "#fff", border: "1px solid #86efac", borderRadius: 6,
                        padding: "4px 10px", fontSize: 12, cursor: "pointer", display: "flex", gap: 4, alignItems: "center",
                      }}
                    >
                      <span style={{ color: "#888" }}>D{dayNum}{mealTypeIcon}</span>
                      <span style={{ fontWeight: 600 }}>{r.name}</span>
                      <span style={{ color: "#ef4444" }}>✕</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filtros por categoría */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {CATEGORY_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setCategoryFilter(f.key)}
                style={{
                  background: categoryFilter === f.key ? "#2d6a4f" : "#fff",
                  color: categoryFilter === f.key ? "#fff" : "#444",
                  border: `1px solid ${categoryFilter === f.key ? "#2d6a4f" : "#e5e7eb"}`,
                  borderRadius: 20, padding: "5px 14px", cursor: "pointer", fontSize: 13,
                  fontWeight: categoryFilter === f.key ? 700 : 400,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Grid de recetas */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10, marginBottom: 20 }}>
            {visibleRecipes.map((recipe) => {
              const selected = selectedIds.includes(recipe.id);
              const selectionOrder = selectedIds.indexOf(recipe.id);
              const expanded = expandedId === recipe.id;
              const canSelect = !selected && selectedIds.length >= totalMeals;

              return (
                <div key={recipe.id} style={{
                  background: selected ? "#d1fae5" : canSelect ? "#fafafa" : "#fff",
                  border: selected ? "2px solid #2d6a4f" : "1px solid #e5e7eb",
                  borderRadius: 10, padding: 12,
                  cursor: canSelect ? "not-allowed" : "pointer",
                  opacity: canSelect ? 0.5 : 1,
                  transition: "all 0.15s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div onClick={() => !canSelect && toggleRecipe(recipe.id)} style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                        {selected && (
                          <span style={{ background: "#2d6a4f", color: "#fff", borderRadius: 4, padding: "1px 6px", fontSize: 11 }}>
                            #{selectionOrder + 1}
                          </span>
                        )}
                        {recipe.name}
                      </div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 4 }}>
                        <Tag>⏱ {recipe.time_minutes} min</Tag>
                        <Tag>{recipe.difficulty}</Tag>
                        <Tag>💰 Bs. {recipe.estimated_cost_bob}</Tag>
                        <Tag>🔥 {recipe.estimated_calories} kcal</Tag>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {recipe.category.map((c) => (
                          <span key={c} style={{ background: "#f0fdf4", color: "#166534", fontSize: 11, padding: "1px 6px", borderRadius: 4 }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedId(expanded ? null : recipe.id); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 18, padding: "0 0 0 8px" }}
                    >
                      {expanded ? "▲" : "▼"}
                    </button>
                  </div>
                  {expanded && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #e5e7eb", fontSize: 13 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>Ingredientes:</div>
                      <ul style={{ paddingLeft: 16, color: "#555", marginBottom: 8 }}>
                        {recipe.ingredients.map((ing) => (
                          <li key={ing.name}>{ing.name} — {ing.quantity} {ing.unit}</li>
                        ))}
                      </ul>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>Preparación:</div>
                      <ol style={{ paddingLeft: 16, color: "#555" }}>
                        {recipe.steps.map((s, i) => <li key={i} style={{ marginBottom: 3 }}>{s}</li>)}
                      </ol>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Botones finales */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => setCurrentStep(2)} style={btnStyle("#6b7280")}>← Volver</button>
            {selectedIds.length < totalMeals && (
              <span style={{ color: "#888", fontSize: 13 }}>
                Te faltan {totalMeals - selectedIds.length} receta{totalMeals - selectedIds.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: 16, border: "1px solid #e5e7eb", minWidth: 220 }}>
      <div style={{ fontWeight: 600, marginBottom: 12, color: "#444", fontSize: 14 }}>{title}</div>
      {children}
    </div>
  );
}

function ToggleBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "#2d6a4f" : "#f3f4f6",
      color: active ? "#fff" : "#444",
      border: "none", borderRadius: 8, padding: "8px 16px",
      cursor: "pointer", fontWeight: active ? 700 : 400, fontSize: 14, textAlign: "center",
    }}>
      {children}
    </button>
  );
}

function Tag({ children }) {
  return (
    <span style={{ background: "#f3f4f6", color: "#555", fontSize: 11, padding: "2px 6px", borderRadius: 4 }}>
      {children}
    </span>
  );
}

function btnStyle(color, outline = false) {
  return {
    background: outline ? "#fff" : color,
    color: outline ? color : "#fff",
    border: outline ? `1px solid ${color}` : "none",
    borderRadius: 10, padding: "12px 24px",
    fontSize: 15, fontWeight: 700, cursor: "pointer",
  };
}
