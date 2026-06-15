import React, { useState, useEffect } from "react";
import Setup from "./components/Setup";
import MenuPlanner from "./components/MenuPlanner";
import ShoppingList from "./components/ShoppingList";

const STATE_VERSION = 2;

function loadState() {
  try {
    const saved = localStorage.getItem("menuapp_state");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Si es una versión vieja sin version o mealTypes, descartarla
      if (!parsed.version || parsed.version < STATE_VERSION) {
        localStorage.removeItem("menuapp_state");
        return null;
      }
      return parsed;
    }
  } catch {}
  return null;
}

function saveState(step, config, menuData) {
  try {
    localStorage.setItem("menuapp_state", JSON.stringify({ version: STATE_VERSION, step, config, menuData }));
  } catch {}
}


export default function App() {
  const saved = loadState();
  const [step, setStep] = useState(saved?.step || "setup");
  const [config, setConfig] = useState(saved?.config || { days: 7, people: 4, preferences: {}, mealTypes: ["almuerzo", "cena"] });
  const [menuData, setMenuData] = useState(saved?.menuData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Guardar en localStorage cada vez que cambia el estado importante
  useEffect(() => {
    saveState(step, config, menuData);
  }, [step, config, menuData]);

  async function handleGenerate(days, people, preferences, manualSelections, mealTypes) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days, people, manualSelections, preferences, mealTypes }),
      });
      const data = await res.json();
      setConfig({ days, people, preferences, mealTypes: mealTypes || ["almuerzo", "cena"] });
      setMenuData(data);
      setStep("menu");
    } catch {
      setError("Error al generar el menú. ¿Está el servidor corriendo?");
    } finally {
      setLoading(false);
    }
  }

  async function handleSwap(day, mealType, newRecipeId) {
    setLoading(true);
    try {
      const res = await fetch("/api/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days: config.days,
          people: config.people,
          preferences: config.preferences,
          mealTypes: config.mealTypes,
          currentMenu: menuData.menu,
          day,
          mealType,
          newRecipeId,
        }),
      });
      const data = await res.json();
      setMenuData(data);
    } catch {
      setError("Error al intercambiar la receta.");
    } finally {
      setLoading(false);
    }
  }

  function handleNewPlan() {
    localStorage.removeItem("menuapp_state");
    setStep("setup");
    setMenuData(null);
    setConfig({ days: 7, people: 4, preferences: {}, mealTypes: ["almuerzo", "cena"] });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0" }}>
      <div style={{ background: "#2d6a4f", color: "#fff", padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 28 }}>🥘</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>¿Qué cocinamos hoy?</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>Planificador de menú semanal · Bolivia</div>
        </div>
        {step !== "setup" && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <NavBtn active={step === "menu"} onClick={() => setStep("menu")}>📋 Menú</NavBtn>
            <NavBtn active={step === "shop"} onClick={() => setStep("shop")}>🛒 Lista de compras</NavBtn>
            <NavBtn onClick={handleNewPlan}>⚙️ Nuevo plan</NavBtn>
          </div>
        )}
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px 24px", fontSize: 14 }}>
          ⚠️ {error}
        </div>
      )}
      {loading && (
        <div style={{ background: "#d1fae5", color: "#065f46", padding: "12px 24px", fontSize: 14 }}>
          ⏳ Un momento...
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {step === "setup" && (
          <Setup onGenerate={handleGenerate} loading={loading} />
        )}
        {step === "menu" && menuData && (
          <MenuPlanner
            menu={menuData.menu}
            days={config.days}
            people={config.people}
            preferences={config.preferences}
            mealTypes={config.mealTypes}
            onSwap={handleSwap}
            onGoShop={() => setStep("shop")}
            totalCost={menuData.totalCost}
          />
        )}
        {step === "shop" && menuData && (
          <ShoppingList
            shoppingList={menuData.shoppingList}
            totalCost={menuData.totalCost}
            people={config.people}
            days={config.days}
          />
        )}
      </div>
    </div>
  );
}

function NavBtn({ children, onClick, active }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "#fff" : "rgba(255,255,255,0.15)",
      color: active ? "#2d6a4f" : "#fff",
      border: "none", borderRadius: 8, padding: "6px 14px",
      cursor: "pointer", fontWeight: active ? 700 : 400, fontSize: 13,
    }}>
      {children}
    </button>
  );
}
