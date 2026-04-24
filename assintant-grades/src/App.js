import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Configuracion from "./components/Configuracion";
import Estudiantes from "./components/Estudiantes";
import Calificaciones from "./components/Calificaciones";
import Reporte from "./components/Reporte";

export default function App() {
  return React.createElement(
    BrowserRouter,
    null,
    React.createElement(
      "div",
      { style: { display: "flex", height: "100vh" } },

      React.createElement(Sidebar),

      React.createElement(
        "div",
        { style: { flex: 1, padding: "20px", overflow: "auto" } },

        React.createElement(
          Routes,
          null,

          React.createElement(Route, {
            path: "/",
            element: React.createElement(Dashboard),
          }),

          React.createElement(Route, {
            path: "/configuracion",
            element: React.createElement(Configuracion),
          }),

          React.createElement(Route, {
            path: "/estudiantes",
            element: React.createElement(Estudiantes),
          }),

          React.createElement(Route, {
            path: "/calificaciones",
            element: React.createElement(Calificaciones),
          }),

          React.createElement(Route, {
            path: "/reporte",
            element: React.createElement(Reporte),
          })
        )
      )
    )
  );
}