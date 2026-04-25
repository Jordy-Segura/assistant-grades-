import React, { useMemo, useState } from "react";
import "./App.css";

const NAV_ITEMS = [
  ["dashboard", "Dashboard"],
  ["configuracion", "Configuración"],
  ["estudiantes", "Estudiantes"],
  ["calificaciones", "Calificaciones"],
  ["reporte", "Reporte Final"],
];

const h = React.createElement;

function icon(page) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" };
  if (page === "dashboard") {
    return h(
      "svg",
      common,
      h("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1" }),
      h("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1" }),
      h("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1" }),
      h("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1" })
    );
  }
  if (page === "configuracion") {
    return h(
      "svg",
      common,
      h("circle", { cx: "12", cy: "12", r: "3" }),
      h("path", { d: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" })
    );
  }
  if (page === "estudiantes") {
    return h(
      "svg",
      common,
      h("path", { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }),
      h("circle", { cx: "9", cy: "7", r: "4" }),
      h("path", { d: "M23 21v-2a4 4 0 0 0-3-3.87" }),
      h("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
    );
  }
  return h(
    "svg",
    common,
    h("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
    h("polyline", { points: "14 2 14 8 20 8" }),
    h("line", { x1: "16", y1: "13", x2: "8", y2: "13" }),
    h("line", { x1: "16", y1: "17", x2: "8", y2: "17" }),
    page === "reporte" ? h("line", { x1: "10", y1: "9", x2: "8", y2: "9" }) : null
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const pages = useMemo(
    () => ({
      dashboard: "page-dashboard",
      configuracion: "page-configuracion",
      estudiantes: "page-estudiantes",
      calificaciones: "page-calificaciones",
      reporte: "page-reporte",
    }),
    []
  );

  return h(
    React.Fragment,
    null,
    h(
      "aside",
      { id: "sidebar" },
      h(
        "div",
        { className: "sidebar-brand" },
        h(
          "div",
          { className: "sidebar-brand-row" },
          h(
            "div",
            { className: "brand-logo" },
            h("svg", { viewBox: "0 0 24 24" }, h("path", { d: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" }))
          ),
          h("div", { className: "brand-text" }, h("div", { className: "title" }, "ESPOCH"), h("div", { className: "sub" }, "Auxiliar de Calificaciones"))
        )
      ),
      h("div", { className: "sidebar-course" }, h("div", { className: "course-label" }, "Asignatura"), h("div", { className: "course-name", id: "sb-asignatura" }, "—"), h("div", { className: "course-tags" }, h("span", { className: "tag-pao", id: "sb-pao" }, "—"), h("span", { className: "tag-aporte", id: "sb-aporte" }, "—"))),
      h(
        "nav",
        { className: "sidebar-nav" },
        ...NAV_ITEMS.map(([key, label]) =>
          h(
            "button",
            { key, className: `nav-item ${activePage === key ? "active" : ""}`, onClick: () => setActivePage(key) },
            icon(key),
            label,
            key === "dashboard" ? h("svg", { className: "nav-chevron", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, h("polyline", { points: "9 18 15 12 9 6" })) : null
          )
        )
      ),
      h("div", { className: "sidebar-footer" }, h("div", { className: "footer-avatar" }, h("svg", { viewBox: "0 0 24 24" }, h("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }), h("circle", { cx: "12", cy: "7", r: "4" }))), h("div", null, h("div", { className: "footer-name", id: "sb-docente" }, "—"), h("div", { className: "footer-role" }, "Docente")))
    ),
    h(
      "div",
      { id: "main" },
      ...Object.entries(pages).map(([page, pageId]) =>
        h(
          "div",
          { key: page, className: `page ${activePage === page ? "active" : ""}`, id: pageId },
          h("div", { className: "page-header" }, h("div", { className: "page-title" }, NAV_ITEMS.find((item) => item[0] === page)?.[1] || ""), h("div", { className: "page-sub" }, "Vista migrada a React. Pendiente integrar lógica completa en app.js.")),
          h("div", { className: "card" }, h("div", { className: "card-header" }, h("div", { className: "card-title" }, "Contenido en React")), h("div", { className: "card-body" }, "Se migró la estructura principal de navegación y contenedores desde HTML estático. Cuando compartas el CSS y JS, integro todos los comportamientos y secciones internas exactamente iguales."))
        )
      )
    ),
    h("div", { id: "toast" }, h("svg", { viewBox: "0 0 24 24" }, h("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }), h("polyline", { points: "22 4 12 14.01 9 11.01", fill: "none", stroke: "white", strokeWidth: "2" })), h("span", { id: "toast-text" }, "Guardado correctamente")),
    h("div", { className: "modal-overlay", id: "modal-overlay" }, h("div", { className: "modal" }, h("div", { className: "modal-title", id: "modal-title" }), h("div", { id: "modal-body" }), h("div", { className: "modal-actions", id: "modal-actions" }))),
    h("div", { className: "modal-overlay", id: "success-modal-overlay" }, h("div", { className: "modal", style: { textAlign: "center", maxWidth: "420px" }, id: "success-modal" }, h("div", { id: "success-modal-content" }))),
    h("canvas", { id: "confetti-canvas", style: { position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none", display: "none" } })
  );
}
