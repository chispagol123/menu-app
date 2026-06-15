import React, { useState } from "react";

const DAY_NAMES = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MEAL_LABEL = { desayuno: "🌅 Desayuno", almuerzo: "☀️ Almuerzo", cena: "🌙 Cena", postre: "🍮 Postre" };

export default function MenuPlanner({ menu, days, people, allRecipes, onSwap, onGoShop, totalCost, mealTypes }) {
  const activeMealTypes = mealTypes || ["almuerzo", "cena"];
  const [swapModal, setSwapModal] = useState(null); // { day, mealType }
  const [expandedRecipe, setExpandedRecipe] = useState(null);
  const [swapFilter, setSwapFilter] = useState("");

  function openSwap(day, mealType) {
    setSwapModal({ day, mealType });
    setSwapFilter("");
  }

  function closeSwap() {
    setSwapModal(null);
  }

  async function doSwap(recipeId) {
    await onSwap(swapModal.day, swapModal.mealType, recipeId);
    closeSwap();
  }

  const swapCandidates = swapModal
    ? allRecipes.filter((r) => {
        const matchMeal = r.meal_type.includes(swapModal.mealType);
        const matchText =
          swapFilter === "" ||
          r.name.toLowerCase().includes(swapFilter.toLowerCase()) ||
          r.category.some((c) => c.toLowerCase().includes(swapFilter.toLowerCase()));
        return matchMeal && matchText;
      })
    : [];

  return (
    <div>
      {/* Resumen superior */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ color: "#2d6a4f", fontSize: 22, marginBottom: 4 }}>Tu menú de {days} días</h2>
          <p style={{ color: "#666", fontSize: 14 }}>Para {people} personas · Haz clic en ✏️ para cambiar cualquier receta</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ background: "#d1fae5", borderRadius: 10, padding: "10px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#166534" }}>Costo total estimado</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#2d6a4f" }}>Bs. {totalCost}</div>
          </div>
          <button
            onClick={onGoShop}
            style={{ background: "#2d6a4f", color: "#fff", border: "none", borderRadius: 10, padding: "12px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}
          >
            🛒 Ver lista de compras
          </button>
        </div>
      </div>

      {/* Tabla del menú */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {Array.from({ length: days }, (_, i) => i + 1).map((day) => (
          <div key={day} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ background: "#2d6a4f", color: "#fff", padding: "8px 14px", fontWeight: 700, fontSize: 15, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{DAY_NAMES[day] || `Día ${day}`}</span>
              <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.85 }}>
                🔥 {activeMealTypes.reduce((sum, mt) => sum + (menu[day]?.[mt]?.estimated_calories || 0), 0)} kcal
              </span>
            </div>
            {activeMealTypes.map((mealType, mtIdx) => {
              const recipe = menu[day]?.[mealType];
              const expanded = expandedRecipe === `${day}-${mealType}`;
              return (
                <div
                  key={mealType}
                  style={{ padding: "10px 14px", borderBottom: mtIdx < activeMealTypes.length - 1 ? "1px solid #f0f0f0" : "none" }}
                >
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{MEAL_LABEL[mealType]}</div>
                  {recipe ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{recipe.name}</div>
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                            <Tag>⏱ {recipe.time_minutes} min</Tag>
                            <Tag>{recipe.difficulty}</Tag>
                            <Tag>Bs. {recipe.estimated_cost_bob}</Tag>
                            <Tag>🔥 {recipe.estimated_calories} kcal</Tag>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
                          <IconBtn
                            title="Ver receta"
                            onClick={() => setExpandedRecipe(expanded ? null : `${day}-${mealType}`)}
                          >
                            {expanded ? "▲" : "▼"}
                          </IconBtn>
                          <IconBtn title="Cambiar receta" onClick={() => openSwap(day, mealType)}>
                            ✏️
                          </IconBtn>
                        </div>
                      </div>
                      {expanded && (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f0f0f0", fontSize: 13 }}>
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
                    </>
                  ) : (
                    <div style={{ color: "#bbb", fontSize: 13 }}>Sin receta asignada</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Modal de intercambio */}
      {swapModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
          }}
          onClick={closeSwap}
        >
          <div
            style={{ background: "#fff", borderRadius: 14, padding: 20, width: "90%", maxWidth: 500, maxHeight: "80vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ color: "#2d6a4f" }}>
                Cambiar {swapModal.mealType} del {DAY_NAMES[swapModal.day] || `Día ${swapModal.day}`}
              </h3>
              <button onClick={closeSwap} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <input
              type="text"
              placeholder="Buscar receta..."
              value={swapFilter}
              onChange={(e) => setSwapFilter(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", marginBottom: 12, fontSize: 14 }}
              autoFocus
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {swapCandidates.map((r) => (
                <div
                  key={r.id}
                  onClick={() => doSwap(r.id)}
                  style={{
                    padding: "10px 14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    cursor: "pointer",
                    background: "#fafafa",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <Tag>⏱ {r.time_minutes} min</Tag>
                    <Tag>{r.difficulty}</Tag>
                    <Tag>Bs. {r.estimated_cost_bob}</Tag>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Tag({ children }) {
  return (
    <span style={{ background: "#f3f4f6", color: "#555", fontSize: 11, padding: "2px 6px", borderRadius: 4 }}>
      {children}
    </span>
  );
}

function IconBtn({ children, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{ background: "#f3f4f6", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 14 }}
    >
      {children}
    </button>
  );
}
