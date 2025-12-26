import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RecipesPage from './pages/RecipesPage';
import RecipeDetails from './pages/RecipeDetails';
import Login from './pages/Login';   
import Signup from './pages/Signup'; 
import ForgotPassword from './pages/ForgotPassword'; 
import Favorites from './pages/Favorites';
import MyRecipes from './pages/MyRecipes';
import AddRecipe from './pages/AddRecipe';
import { Toaster } from 'react-hot-toast';
import './App.css';


const AppContent = () => {
  const location = useLocation();
  const hideNavbar = ['/login', '/signup'].includes(location.pathname) || location.pathname.startsWith('/recipe/');

  return (
    <div className="app">
      <Toaster position="top-center" reverseOrder={false} />
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/recipe/:id" element={<RecipeDetails />} />
        <Route path="/login" element={<Login />} />  
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<Signup />} /> 
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/my-recipes" element={<MyRecipes />} />
        <Route path="/add-recipe" element={<AddRecipe />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider> 
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;