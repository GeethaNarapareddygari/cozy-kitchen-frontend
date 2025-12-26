import React, { useEffect, useState, useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import './RecipesPage.css';

const RecipesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialIngredients = location.state?.ingredients || JSON.parse(sessionStorage.getItem('currentIngredients')) || [];

  const [allRecipes, setAllRecipes] = useState([]);
  const [visibleRecipes, setVisibleRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  const RECIPES_PER_PAGE = 8;

  // --- 2. DATA LOADING & RESTORATION ---
  useEffect(() => {
    const savedAllRecipes = sessionStorage.getItem('allRecipes');
    const savedIngredients = sessionStorage.getItem('currentIngredients');

    const newIngredientsJSON = JSON.stringify(initialIngredients);
    const isSameSearch = savedIngredients === newIngredientsJSON;

    if (isSameSearch && savedAllRecipes) {
      const parsedAll = JSON.parse(savedAllRecipes);
      if (parsedAll.length > 0) {
        console.log("⚡️ Loading saved results from Session Storage");
        setAllRecipes(parsedAll);

        // ✅ FIX 1: Restore the "Show More" count
        // If we were showing 24 recipes before, show 24 now. If new, show 8.
        const savedCount = parseInt(sessionStorage.getItem('visibleCount')) || RECIPES_PER_PAGE;
        setVisibleRecipes(parsedAll.slice(0, savedCount));
        return;
      }
    }

    console.log("🔄 Fetching fresh recipes...");
    // Clear old cache for new searches
    sessionStorage.removeItem('allRecipes');
    sessionStorage.removeItem('visibleCount'); // Reset count
    sessionStorage.removeItem('recipesScrollY'); // Reset scroll
    sessionStorage.setItem('currentIngredients', newIngredientsJSON);

    fetchRecipes();
  }, [initialIngredients]); // Dependency on ingredients changing

  const fetchRecipes = async () => {
    if (!initialIngredients.length) return;
    setLoading(true);

    try {
      const ingredientString = initialIngredients.join(',');
      const response = await fetch(
        `https://cozy-kitchen-api.onrender.com/api/recipes/search?ingredients=${ingredientString}`
      );

      const data = await response.json();
      const fullList = data.results || [];

      setAllRecipes(fullList);

      // Initial Load: Show 8
      setVisibleRecipes(fullList.slice(0, RECIPES_PER_PAGE));

      sessionStorage.setItem('allRecipes', JSON.stringify(fullList));
      sessionStorage.setItem('visibleCount', RECIPES_PER_PAGE); // Initialize count

    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. SCROLL RESTORATION ---
  // Save scroll position whenever user scrolls
  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 300);
      sessionStorage.setItem('recipesScrollY', window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Restore scroll position after recipes render
  useLayoutEffect(() => {
    const savedScroll = sessionStorage.getItem('recipesScrollY');
    if (savedScroll && visibleRecipes.length > 0) {
      window.scrollTo({ top: parseInt(savedScroll), behavior: 'auto' });
    }
  }, [visibleRecipes]); // Run this every time the list updates

  // --- 4. HANDLERS ---
  const handleShowMore = () => {
    const currentLength = visibleRecipes.length;
    const nextBatch = allRecipes.slice(currentLength, currentLength + RECIPES_PER_PAGE);

    const newVisible = [...visibleRecipes, ...nextBatch];
    setVisibleRecipes(newVisible);

    // ✅ Save new count
    sessionStorage.setItem('visibleCount', newVisible.length);
  };

  const handleShowLess = () => {
    const newCount = Math.max(visibleRecipes.length - RECIPES_PER_PAGE, RECIPES_PER_PAGE);
    setVisibleRecipes(allRecipes.slice(0, newCount));

    sessionStorage.setItem('visibleCount', newCount);

    window.scrollBy({ top: -500, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="recipes-page">
      <div className="back-btn-container">
        <button className="back-btn" onClick={() => {
          sessionStorage.clear();
          navigate('/');
        }}>
          ← Back
        </button>
      </div>
      <div className="recipes-grid">
        {visibleRecipes.length > 0 ? (
          visibleRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))
        ) : (
          !loading && <p className="no-results">No recipes found.</p>
        )}
      </div>

      {loading && <div className="loading-text">Loading delicious recipes... 🍳</div>}

      <div className="pagination-buttons">

        {/* BUTTON 1: SHOW LESS */}
        {visibleRecipes.length > RECIPES_PER_PAGE && (
          <button
            className="show-less-btn"
            onClick={handleShowLess}
          >
            ⬆ Show Less
          </button>
        )}

        {/* BUTTON 2: SHOW MORE */}
        {visibleRecipes.length < allRecipes.length && (
          <button className="show-more-btn" onClick={handleShowMore}>
            Show More ({allRecipes.length - visibleRecipes.length} left) 👇
          </button>
        )}

      </div>

      {/* End of list message */}
      {visibleRecipes.length === allRecipes.length && visibleRecipes.length > RECIPES_PER_PAGE && (
        <p className="end-msg" style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>
          🎉 You've seen all {allRecipes.length} recipes!
        </p>
      )}

      {showTopBtn && (
        <button className="scroll-top-btn" onClick={scrollToTop}>
          ⬆
        </button>
      )}
    </div>
  );
};

export default RecipesPage;
