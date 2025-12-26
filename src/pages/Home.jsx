import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import { useNavigate } from 'react-router-dom';
import IngredientChips from '../components/IngredientChips';
import RecipeCard from '../components/RecipeCard'; 


const Home = () => {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [recipes, setRecipes] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 1. ADD INGREDIENT
  const addIngredient = (name) => {
    if (!selectedIngredients.includes(name)) {
      setSelectedIngredients([...selectedIngredients, name]);
    }
  };

  // 2. REMOVE INGREDIENT
  const removeIngredient = (name) => {
    setSelectedIngredients(selectedIngredients.filter(item => item !== name));
  };

  // 3. FIND BY INGREDIENTS (Navigates to new page)
  const findIngredientRecipes = () => {
    // A. Check if user is logged in (Adjust 'user' to whatever key you use, e.g., 'token')
    const isLoggedIn = localStorage.getItem('user') || localStorage.getItem('token');

    // B. If NOT logged in, send to login page
    if (!isLoggedIn) {
      // Optional: Pass the current state so you can return here later
      navigate('/login'); 
      return; 
    }

    // C. If logged in, proceed to recipes
    if (selectedIngredients.length > 0) {
      navigate('/recipes', { state: { ingredients: selectedIngredients } });
    }
  };

  // 4. FIND BY TEXT (Fetches on this page)
  // ✅ This is the new function for the text search bar
  const fetchRecipes = async (searchQuery) => {
    if (!searchQuery) return;
    
    setIsLoading(true);
    setRecipes([]); 
    try {
      const response = await fetch(`https://cozy-kitchen-api.onrender.com/api/recipes/search?q=${searchQuery}`);
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-container">
      <header className="hero" style={{ minHeight: recipes.length > 0 ? '40vh' : '100vh', transition: 'min-height 0.5s' }}>
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>Discover Your Next Favorite Recipe</h1>
            
            {/* ✅ FIXED: Passed 'fetchRecipes' to onSearch */}
            <SearchBar 
              onAddIngredient={addIngredient} 
              onSearch={fetchRecipes} 
              onTyping={setIsTyping}
            >
              <IngredientChips 
                ingredients={selectedIngredients} 
                onRemove={removeIngredient} 
              />
            </SearchBar>

            {/* ✅ FIXED: Called 'findIngredientRecipes' here */}
            {selectedIngredients.length > 0 && !isTyping && (
              <button className="find-recipes-btn" onClick={findIngredientRecipes}>
                Find Recipes with Ingredients
              </button>
            )}
          </div>
        </div>
      </header>

      {/* RESULTS SECTION */}
      {(recipes.length > 0 || isLoading) && (
        <section className="search-results-section">
          {isLoading ? (
            <h2 className="loading-text">Searching the kitchen... 🍳</h2>
          ) : (
            <>
              <h2 className="results-title">Top Results</h2>
              <div className="recipes-grid">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default Home;