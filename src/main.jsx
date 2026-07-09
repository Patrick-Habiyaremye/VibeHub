// import React from "react";
// import ReactDOM from "react-dom/client";

// import App from "./App";
// import "./index.css";

// import { AuthProvider } from "./context/AuthContext";
// import { BrowserRouter } from "react-router-dom";

// ReactDOM.createRoot(
//   document.getElementById("root")
// ).render(
//   <BrowserRouter>
//     <AuthProvider>
//       <App />
//     </AuthProvider>
//   </BrowserRouter>
// );


import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient"; // adjust path

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);