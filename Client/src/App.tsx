import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import ListingDetails from "./pages/ListingDetail";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import MyListings from "./pages/owner/MyListings";
import AddListing from "./pages/owner/AddListing";
import NotFound from "./pages/NotFound";
import "./lib/i18n";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/listing/:id" element={<ListingDetails />} />
              <Route path="/contact" element={<Contact />} />

              {/* Auth Routes */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />

              {/* User Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireAdmin>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Owner Routes */}
              <Route
                path="/owner/my-listings"
                element={
                  <ProtectedRoute requireOwner>
                    <MyListings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/add-listing"
                element={
                  <ProtectedRoute requireOwner>
                    <AddListing />
                  </ProtectedRoute>
                }
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
