import "./App.css";
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import PropertiesList from "./pages/Properties/PropertiesList";
import PropertiesCreate from "./pages/Properties/PropertiesCreate";
import PropertyEdit from "./pages/Properties/PropertyEdit";
import Reviews from "./pages/Reviews/Reviews";
import ReviewsCreate from "./pages/Reviews/ReviewsCreate";
import ReviewEdit from "./pages/Reviews/ReviewEdit";
import Services from "./pages/Services/Services";
import ServicesCreate from "./pages/Services/ServicesCreate";
import ServiceEdit from "./pages/Services/ServiceEdit";
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
            <Route
              path="/admin/properties/create"
              element={<PropertiesCreate />}
            />
            <Route
              path="/admin/properties/:id/edit"
              element={<PropertyEdit />}
            />
            <Route path="/admin/reviews" element={<Reviews />} />
            <Route path="/admin/reviews/create" element={<ReviewsCreate />} />
            <Route path="/admin/reviews/:id/edit" element={<ReviewEdit />} />
            <Route path="/admin/services" element={<Services />} />
            <Route path="/admin/services/create" element={<ServicesCreate />} />
            <Route path="/admin/services/:id/edit" element={<ServiceEdit />} />
            <Route path="/admin/content" element={<Content />} />
          </Route>
          <Route path="/" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
