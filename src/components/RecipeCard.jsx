import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './RecipeCard.css';

const RecipeCard = ({ recipe, onRemove }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); 
  
  const [isFav, setIsFav] = useState(false);

  // --- 1. FAVORITES CHECK LOGIC (Fixed Headers) ---
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      // Only check if we have a user AND a recipe ID
      if (user && recipe?.id) {
        try {
          const token = localStorage.getItem('token'); // 🔑 Get Token
          
          const response = await fetch(`https://cozy-kitchen-api.onrender.com/api/favorites/${user.id}`, {
             headers: {
                'auth-token': token // 👮‍♂️ Send Token to Backend
             }
          });

          if (response.ok) {
            const favorites = await response.json();
            // Check if THIS recipe ID exists in the user's favorites list
            const found = favorites.find(f => String(f.recipeId) === String(recipe.id));
            if (found) setIsFav(true);
          }
        } catch (err) {
          console.error("Failed to check favorite status", err);
        }
      }
    };
    checkFavoriteStatus();
  }, [user, recipe.id]);

  // --- 2. TOGGLE LOGIC (Fixed Headers) ---
  const toggleFavorite = async (e) => {
    e.stopPropagation(); 
    
    if (!user) {
        alert("Please log in to save recipes!");
        return;
    }

    const newStatus = !isFav;
    setIsFav(newStatus); // Optimistic UI update

    const favItem = {
      ...recipe,           
      userId: user.id,     
      recipeId: recipe.id  
    };
    
    try {
      const token = localStorage.getItem('token'); // 🔑 Get Token
      const endpoint = newStatus ? 'add' : 'remove';

      const response = await fetch(`https://cozy-kitchen-api.onrender.com/api/favorites/${endpoint}`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'auth-token': token // 👮‍♂️ CRITICAL FIX: Send Token
        },
        body: JSON.stringify(favItem)
      });
      
      if (!response.ok) {
          throw new Error("Backend rejected request");
      }

      // If we just removed it and are on the Favorites page, remove from view immediately
      if (!newStatus && onRemove) {
        onRemove(recipe.id);
      }

    } catch (err) {
      console.error("Error updating favorite:", err);
      setIsFav(!newStatus); // Revert UI if backend fails
      alert("Something went wrong. Please try again.");
    }
  };

  // Get Data safely
  const cuisine = recipe.cuisines && recipe.cuisines.length > 0 ? recipe.cuisines[0] : "International";
  const category = recipe.dishTypes && recipe.dishTypes.length > 0 ? recipe.dishTypes[0] : "Recipe";

  return (
    <div className="recipe-card" onClick={() => navigate(`/recipe/${recipe.id}`)}>
        
      <div className="card-image-wrapper">
        <img 
            src={recipe.image} 
            alt={recipe.title} 
            loading="lazy" 
            decoding="async" 
        />
        
        {/* ❤️ Heart Button */}
        <button 
          className={`heart-btn ${isFav ? 'active' : ''}`} 
          onClick={toggleFavorite}
          title={isFav ? "Remove from Favorites" : "Add to Favorites"}
        >
          <svg viewBox="0 0 24 24" width="24px" height="24px">
            <path 
              className="heart-icon"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </button>
      </div>

      <div className="card-content">
        <h3 className="card-title">{recipe.title}</h3>
        
        <div className="card-footer-tags">
            <div className="meta-tag cuisine">
                <span className="icon">🌍</span> {cuisine}
            </div>
            <div className="meta-tag category">
                <span className="icon">🍽</span> {category}
            </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;