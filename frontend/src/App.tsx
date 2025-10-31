import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "././pages/Home";
import VetDirectory from "././pages/VetDirectory";
import DistrictDashboard from "./pages/DistrictDashboard";
import SectorDashboard from "././pages/SectorDashboard";
import BasicDashboard from "././pages/BasicDashboard";
import Login from "././pages/Login";
import Register from "././pages/Register";
import NotFound from "././pages/NotFound";
import ForgotPassword from './pages/ForgotPassword';
import PharmacyDashboard from "./pages/PharmacyDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from 'react';
import { installGlobalAuthInterceptor } from './lib/session';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {(() => { installGlobalAuthInterceptor(); return null; })()}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vets" element={<VetDirectory />} />
          <Route path="/district-dashboard" element={<ProtectedRoute><DistrictDashboard /></ProtectedRoute>} />
          <Route path="/sector-dashboard" element={<ProtectedRoute><SectorDashboard /></ProtectedRoute>} />
          <Route path="/basic-dashboard" element={<ProtectedRoute><BasicDashboard /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/pharmacy-dashboard" element={<ProtectedRoute><PharmacyDashboard /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
