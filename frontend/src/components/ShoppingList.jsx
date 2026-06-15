import React, { useState } from "react";

export default function ShoppingList({ shoppingList, totalCost, people, days }) {
  const [haveAtHome, setHaveAtHome] = useState({});

  function handlePrint(itemsToPrint, cost) {
    const rows = itemsToPrint.map((item) => `
      <tr>
        <td style="padding:8px 6px; border-bottom:1px solid #e5e7eb;">
          <span style="display:inline-block;width:14px;height:14px;border:2px solid #2d6a4f;border-radius:3px;margin-right:8px;vertical-align:middle;"></span>
          ${item.name}
        </td>
        <td style="padding:8px 6px; border-bottom:1px solid #e5e7eb; text-align:center; color:#2d6a4f; font-weight:700;">
          ${item.purchaseQty} ${item.purchaseUnit}
        </td>
        <td style="padding:8px 6px; border-bottom:1px solid #e5e7eb; text-align:right; color:#555;">
          Bs. ${item.totalCost}
        </td>
      </tr>
    `).join("");

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8"/>
        <title>Lista de compras</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; padding: 32px 40px; color: #222; }
          h1 { color: #2d6a4f; font-size: 24px; margin: 0 0 4px 0; }
          .subtitle { color: #666; font-size: 13px; margin: 0 0 20px 0; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #2d6a4f; color: white; padding: 10px 6px; text-align: left; font-size: 12px; }
          th:nth-child(2) { text-align: center; }
          th:nth-child(3) { text-align: right; }
          td { font-size: 13px; }
          .total-row td { font-weight: 800; font-size: 15px; color: #2d6a4f; padding-top: 12px; }
          .note { margin-top: 20px; font-size: 11px; color: #aaa; }
        </style>
      </head>
      <body>
        <h1>🥘 Lista de compras</h1>
        <p class="subtitle">${days} días · ${people} personas · ${itemsToPrint.length} ingredientes · Total: Bs. ${cost}</p>
        <table>
          <thead>
            <tr>
              <th>Ingrediente</th>
              <th>¿Cuánto comprar?</th>
              <th>Costo (Bs.)</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr class="total-row">
              <td colspan="2">TOTAL ESTIMADO</td>
              <td style="text-align:right">Bs. ${cost}</td>
            </tr>
          </tbody>
        </table>
        <p class="note">* Precios estimados de referencia. Generado con ¿Qué cocinamos hoy?</p>
      </body>
      </html>
    `;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  }

  function toggleHome(name) {
    setHaveAtHome((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  const itemsToBy = shoppingList.filter((i) => !haveAtHome[i.name]);
  const adjustedCost = Math.round(
    itemsToBy.reduce((sum, i) => sum + i.totalCost, 0)
  );
  const savedCost = totalCost - adjustedCost;
  const homeCount = Object.values(haveAtHome).filter(Boolean).length;

  return (
    <div>

      {/* Encabezado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ color: "#2d6a4f", fontSize: 22, marginBottom: 4 }}>Lista de compras</h2>
          <p style={{ color: "#666", fontSize: 14 }}>
            Para {people} personas · {days} días · {shoppingList.length} ingredientes
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {savedCost > 0 && (
            <div style={{ background: "#fef9c3", borderRadius: 10, padding: "10px 16px", textAlign: "center", border: "1px solid #fde047" }}>
              <div style={{ fontSize: 11, color: "#854d0e" }}>Ya tienes en casa</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#854d0e" }}>- Bs. {savedCost}</div>
            </div>
          )}
          <div style={{ background: "#d1fae5", borderRadius: 10, padding: "10px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#166534" }}>Total a comprar</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#2d6a4f" }}>Bs. {adjustedCost}</div>
            <div style={{ fontSize: 11, color: "#166534" }}>≈ Bs. {Math.round(adjustedCost / people)} por persona</div>
          </div>
          <button
            onClick={() => handlePrint(itemsToBy, adjustedCost)}
            style={{
              background: "#1e40af", color: "#fff", border: "none",
              borderRadius: 10, padding: "12px 18px", cursor: "pointer",
              fontWeight: 700, fontSize: 14,
            }}
          >
            🖨️ Imprimir / PDF
          </button>
        </div>
      </div>

      <div id="printable">
      {/* Instrucción */}
      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#1e40af" }}>
        💡 Marca con <strong>"Ya lo tengo"</strong> los ingredientes que ya tienes en casa. Se descontarán del total automáticamente.
      </div>

      {/* Tabla */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        {/* Cabecera */}
        <div style={{
          padding: "10px 16px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb",
          display: "grid", gridTemplateColumns: "28px 1fr 140px 90px 80px",
          gap: 8, fontSize: 11, fontWeight: 700, color: "#888",
        }}>
          <span></span>
          <span>INGREDIENTE</span>
          <span style={{ textAlign: "center" }}>¿CUÁNTO COMPRAR?</span>
          <span style={{ textAlign: "right" }}>COSTO (Bs.)</span>
          <span style={{ textAlign: "center" }}>YA LO TENGO</span>
        </div>

        {shoppingList.map((item) => {
          const atHome = haveAtHome[item.name];
          return (
            <div
              key={item.name}
              style={{
                padding: "11px 16px",
                borderBottom: "1px solid #f0f0f0",
                display: "grid",
                gridTemplateColumns: "28px 1fr 140px 90px 80px",
                gap: 8,
                alignItems: "center",
                background: atHome ? "#fafaf0" : "#fff",
                opacity: atHome ? 0.55 : 1,
                transition: "all 0.15s",
              }}
            >
              {/* Ícono de categoría */}
              <span style={{ fontSize: 16, textAlign: "center" }}>
                {ingredientIcon(item.name)}
              </span>

              {/* Nombre */}
              <span style={{
                fontSize: 14,
                textDecoration: atHome ? "line-through" : "none",
                color: atHome ? "#9ca3af" : "#222",
              }}>
                {item.name}
              </span>

              {/* Cantidad a comprar */}
              <div style={{ textAlign: "center" }}>
                <span style={{
                  background: atHome ? "#f3f4f6" : "#d1fae5",
                  color: atHome ? "#9ca3af" : "#166534",
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}>
                  {item.purchaseQty} {item.purchaseUnit}
                </span>
              </div>

              {/* Costo */}
              <span style={{
                textAlign: "right",
                fontSize: 13,
                fontWeight: 600,
                color: atHome ? "#9ca3af" : "#2d6a4f",
              }}>
                {item.totalCost}
              </span>

              {/* Toggle "ya lo tengo" */}
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => toggleHome(item.name)}
                  style={{
                    background: atHome ? "#fef08a" : "#f3f4f6",
                    border: atHome ? "1px solid #eab308" : "1px solid #e5e7eb",
                    borderRadius: 6,
                    padding: "4px 10px",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    color: atHome ? "#854d0e" : "#6b7280",
                    whiteSpace: "nowrap",
                  }}
                >
                  {atHome ? "✓ Tengo" : "Marcar"}
                </button>
              </div>
            </div>
          );
        })}

        {/* Total */}
        <div style={{
          padding: "12px 16px",
          background: "#d1fae5",
          display: "grid",
          gridTemplateColumns: "28px 1fr 140px 90px 80px",
          gap: 8,
          alignItems: "center",
        }}>
          <span></span>
          <span style={{ fontWeight: 700, color: "#166534", fontSize: 14 }}>
            TOTAL A COMPRAR
            {homeCount > 0 && (
              <span style={{ fontWeight: 400, fontSize: 12, marginLeft: 8 }}>
                ({homeCount} ingrediente{homeCount > 1 ? "s" : ""} ya tengo)
              </span>
            )}
          </span>
          <span></span>
          <span style={{ textAlign: "right", fontWeight: 700, color: "#166534", fontSize: 16 }}>
            {adjustedCost}
          </span>
          <span></span>
        </div>
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: "#9ca3af" }}>
        * Cantidades y precios son estimados de referencia para Bolivia. Los valores reales pueden variar según mercado o supermercado.
      </p>
      </div>
    </div>
  );
}

function ingredientIcon(name) {
  const n = name.toLowerCase();
  if (n.includes("pollo") || n.includes("charque") || n.includes("lomo") || n.includes("carne") || n.includes("cerdo") || n.includes("costilla") || n.includes("salchicha") || n.includes("trucha")) return "🥩";
  if (n.includes("papa") || n.includes("chuño")) return "🥔";
  if (n.includes("arroz")) return "🍚";
  if (n.includes("tomate")) return "🍅";
  if (n.includes("cebolla")) return "🧅";
  if (n.includes("ajo")) return "🧄";
  if (n.includes("zanahoria")) return "🥕";
  if (n.includes("huevo")) return "🥚";
  if (n.includes("leche") || n.includes("crema")) return "🥛";
  if (n.includes("queso")) return "🧀";
  if (n.includes("limón")) return "🍋";
  if (n.includes("plátano")) return "🍌";
  if (n.includes("fideos") || n.includes("pasta")) return "🍝";
  if (n.includes("aceite")) return "🫙";
  if (n.includes("pan")) return "🍞";
  if (n.includes("quinua") || n.includes("maní") || n.includes("lenteja")) return "🌾";
  if (n.includes("ají") || n.includes("locoto")) return "🌶️";
  if (n.includes("arveja") || n.includes("mote")) return "🫛";
  return "🛒";
}
