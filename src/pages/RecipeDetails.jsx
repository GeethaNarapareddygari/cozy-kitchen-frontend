import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import './RecipeDetails.css'; 

const RecipeDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

useEffect(() => {
    const fetchRecipeDetails = async () => {
      setLoading(true);
      try {
        const isUserRecipe = id.length > 15; 

        if (isUserRecipe) {
          // =================================================
          // 🟢 OPTION A: FETCH CUSTOM RECIPE
          // =================================================
          const response = await fetch(`https://cozy-kitchen-api.onrender.com/api/user-recipes/recipe/${id}`);
          if (!response.ok) throw new Error("Custom recipe not found");
          const data = await response.json();

          if (data) {
            let finalIngredients = [];
            if (data.extendedIngredients && data.extendedIngredients.length > 0) {
                finalIngredients = data.extendedIngredients.map(ing => ing.original || ing.name);
            } else if (data.ingredients && Array.isArray(data.ingredients)) {
                finalIngredients = data.ingredients;
            } else if (typeof data.ingredients === 'string') {
                finalIngredients = data.ingredients.split('\n');
            }

            let finalSteps = [];
            if (data.analyzedInstructions && data.analyzedInstructions.length > 0) {
                finalSteps = data.analyzedInstructions[0].steps.map(s => s.step);
            } else if (typeof data.instructions === 'string') {
                finalSteps = data.instructions.split('\n');
            }

            setRecipe({
              id: data._id,
              strMeal: data.title,       
              strMealThumb: data.image || "https://via.placeholder.com/600x400?text=No+Image",
              strYoutube: data.sourceUrl || "", 
              strArea: "My Kitchen",
              strCategory: "Custom Creation",
              ingredientsList: finalIngredients,
              stepsList: finalSteps
            });
          }

        } else {
          // =================================================
          // 🟠 OPTION B: FETCH FROM THEMEALDB (Updated Filter)
          // =================================================
          const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
          );
          const data = await response.json();
          const meal = data.meals ? data.meals[0] : null;

          if (meal) {
            const formattedIngredients = [];
            for (let i = 1; i <= 20; i++) {
              const ingredient = meal[`strIngredient${i}`];
              const measure = meal[`strMeasure${i}`];
              if (ingredient && ingredient.trim() !== "") {
                formattedIngredients.push(`${measure ? measure : ''} ${ingredient}`);
              }
            }

            const rawSteps = meal.strInstructions ? meal.strInstructions.split(/\r\n|\n/) : [];
            
            // 👇 UPDATED FILTER LOGIC HERE 👇
            const steps = rawSteps
              .map(s => s.trim())   
              .filter(s => s.length > 5)                     // 1. Clean whitespace
              .filter(s => !/^step\s*\d+[:.]?$/i.test(s)); // 3. Regex to catch "Step 1" or "Step 1:"

            setRecipe({
              ...meal,
              id: meal.idMeal, 
              ingredientsList: formattedIngredients,
              stepsList: steps
            });
          }
        }
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [id]);
  // 2. Check Favorites Status
  useEffect(() => {
    if (user && recipe) {
      const cachedFavs = sessionStorage.getItem(`favs_${user.id}`);
      if (cachedFavs) {
        const favs = JSON.parse(cachedFavs);
        const found = favs.find(f => String(f.recipeId) === String(id));
        if (found) setIsFav(true);
      }
    }
  }, [user, recipe, id]);

  // 3. Toggle Favorite
  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Please login to save recipes! 🔒");
      return;
    }

    const newStatus = !isFav;
    setIsFav(newStatus); 

    const favItem = {
      userId: user.id,
      recipeId: id,
      title: recipe.strMeal,
      image: recipe.strMealThumb,
    };

    try {
      const endpoint = newStatus ? 'add' : 'remove';
      await fetch(`https://cozy-kitchen-api.onrender.com/api/favorites/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(favItem)
      });

      const currentCache = JSON.parse(sessionStorage.getItem(`favs_${user.id}`) || '[]');
      if (newStatus) {
        currentCache.push({ recipeId: id, title: recipe.strMeal, image: recipe.strMealThumb });
      } else {
        const filtered = currentCache.filter(f => String(f.recipeId) !== String(id));
        sessionStorage.setItem(`favs_${user.id}`, JSON.stringify(filtered));
        return;
      }
      sessionStorage.setItem(`favs_${user.id}`, JSON.stringify(currentCache));

    } catch (err) {
      console.error("Error updating favorite:", err);
      setIsFav(!newStatus);
      toast.error("Could not update favorites.");
    }
  };

  if (loading) return <div className="loading-text">Loading delicious details... 🍳</div>;
  if (!recipe) return <div className="loading-text">Recipe not found 😕</div>;

  return (
    <div className="details-page">
      
      <div className="hero-banner" style={{ backgroundImage: `url(${recipe.strMealThumb})` }}>
        <div className="hero-overlay"></div>
        <button className="back-to-results-btn" onClick={() => navigate(-1)}>
            ← Back
        </button>
      </div>

      <div className="content-container">
        
        <div className="title-card">
          <h1>{recipe.strMeal}</h1>
          
          <div className="meta-badges">
            {recipe.strArea && <span className="badge cuisine">🌍 {recipe.strArea}</span>}
            {recipe.strCategory && <span className="badge category">🍽 {recipe.strCategory}</span>}
          </div>

          <div className="action-buttons">
            {recipe.strYoutube && (
              <a href={recipe.strYoutube} target="_blank" rel="noreferrer" className="youtube-btn-hero">
                <span className="play-icon">▶</span> Watch Video
              </a>
            )}

            <button 
              className={`favorite-btn ${isFav ? 'active' : ''}`} 
              onClick={toggleFavorite}
            >
              {isFav ? "★ Saved" : "☆ Save Recipe"}
            </button>
          </div>
        </div>

        <div className="details-grid">
          <div className="ingredients-card">
            <h2>Ingredients</h2>
            <ul className="ingredients-list">
              {recipe.ingredientsList && recipe.ingredientsList.length > 0 ? (
                recipe.ingredientsList.map((ing, index) => (
                  <li key={index}> 
                    <span className="check-icon">✓</span> 
                    {ing}
                  </li>
                ))
              ) : (
                <li>No ingredients listed.</li>
              )}
            </ul>
          </div>

          <div className="instructions-card">
            <h2>Instructions</h2>
            <div className="steps-list">
              {recipe.stepsList && recipe.stepsList.length > 0 ? (
                recipe.stepsList.map((step, index) => (
                  <div key={index} className="step-item">
                    <div className="step-number">{index + 1}</div>
                    <p>{step}</p>
                  </div>
                ))
              ) : (
                <p>No detailed instructions available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;