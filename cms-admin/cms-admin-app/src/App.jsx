import "./App.css";
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import PropertiesList from "./pages/Properties/PropertiesList";
import Reviews from "./pages/Reviews/Reviews";
import Services from "./pages/Services/Services";
import Content from "./pages/Content/Content";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Layout from "./components/Layout/Layout";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/properties" element={<PropertiesList />} />
            <Route path="/admin/reviews" element={<Reviews />} />
            <Route path="/admin/services" element={<Services />} />
            <Route path="/admin/content" element={<Content />} />
          </Route>
          <Route path="/" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
