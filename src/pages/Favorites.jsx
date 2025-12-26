import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';
import './Favorites.css';

const Favorites = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [allFavorites, setAllFavorites] = useState([]);
  const [visibleFavorites, setVisibleFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTopBtn, setShowTopBtn] = useState(false);

  const RECIPES_PER_PAGE = 8;

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        // 1. Get the Token 🎫
        const token = localStorage.getItem('token');

        // 2. Send Token in Headers 👮‍♂️
        const response = await fetch(`https://cozy-kitchen-api.onrender.com/api/favorites/${user.id}`, {
            headers: {
                'auth-token': token 
            }
        });

        if (!response.ok) throw new Error("Failed to fetch");
        
        const data = await response.json();
        setAllFavorites(data);
        setVisibleFavorites(data.slice(0, RECIPES_PER_PAGE));
      } catch (err) {
        console.error("Error fetching favorites:", err);
        setError("Could not load favorites.");
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = async (idToRemove) => {
    try {
        const token = localStorage.getItem('token'); // Get Token

        // 1. Call Backend to Delete 🗑️
        const response = await fetch('https://cozy-kitchen-api.onrender.com/api/favorites/remove', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'auth-token': token // Send Token
            },
            body: JSON.stringify({ 
                userId: user.id, 
                recipeId: idToRemove 
            })
        });

        if (response.ok) {
            // 2. ONLY update UI if backend success
            const updatedAll = allFavorites.filter(fav => fav.recipeId !== idToRemove);
            setAllFavorites(updatedAll);
            const updatedVisible = visibleFavorites.filter(fav => fav.recipeId !== idToRemove);
            setVisibleFavorites(updatedVisible);
        } else {
            console.error("Failed to remove favorite");
        }
    } catch (err) {
        console.error("Error removing favorite:", err);
    }
  };

  const handleShowMore = () => {
    const currentLength = visibleFavorites.length;
    const nextBatch = allFavorites.slice(currentLength, currentLength + RECIPES_PER_PAGE);
    setVisibleFavorites([...visibleFavorites, ...nextBatch]);
  };

  const handleShowLess = () => {
    const nextCount = visibleFavorites.length - RECIPES_PER_PAGE;
    const safeCount = Math.max(nextCount, RECIPES_PER_PAGE);
    setVisibleFavorites(allFavorites.slice(0, safeCount));
    window.scrollBy({ top: -400, behavior: 'smooth' });
  };

  if (!user) {
    return (
      <div className="favorites-container">
        <div className="empty-state">
          <h2>Please log in to view your cookbook. 📖</h2>
          <Link to="/login" className="browse-btn">Go to Login</Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading-text" style={{ padding: '50px', textAlign: 'center', color: 'white' }}>Loading your kitchen... 🍳</div>;
  if (error) return <div className="error-text" style={{ padding: '50px', textAlign: 'center', color: 'white' }}>{error}</div>;

  return (
      <div className="favorites-container">

        {/* 1. Back Button Container (Separate for correct alignment) */}
        <div className="back-btn-container">
           <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>

        {/* 2. Header (Title + Stats) */}
        <div className="fav-header">
          <h1 className="cookbook-title">My Cookbook❤️</h1>
          {/* Fixed the variable name here: allFavorites.length */}
          <div className="stats-pill">
             {allFavorites.length} {allFavorites.length === 1 ? 'recipe' : 'recipes'} saved
          </div>
        </div>

      {allFavorites.length === 0 ? (
        <div className="empty-state">
          <p>You haven't saved any recipes yet.</p>
          <Link to="/" className="browse-btn">Find Recipes</Link>
        </div>
      ) : (
        <>
          <div className="favorites-grid">
            {visibleFavorites.map((fav) => (
              <RecipeCard
                key={fav.recipeId}
                onRemove={() => handleRemove(fav.recipeId)}
                recipe={{
                  ...fav,
                  id: fav.recipeId,
                  dishTypes: fav.dishTypes || [],
                }}
              />
            ))}
          </div>

          <div className="pagination-container">
            {visibleFavorites.length > RECIPES_PER_PAGE && (
              <button className="pagination-btn show-less" onClick={handleShowLess}>
                ⬆ Show Less
              </button>
            )}
            {visibleFavorites.length < allFavorites.length && (
              <button className="pagination-btn show-more" onClick={handleShowMore}>
                Show More ({allFavorites.length - visibleFavorites.length} left) 👇
              </button>
            )}
          </div>

          {visibleFavorites.length === allFavorites.length && visibleFavorites.length > RECIPES_PER_PAGE && (
            <p className="end-msg">🎉 You've seen all your favorites!</p>
          )}

          {showTopBtn && (
            <button className="scroll-top-btn" onClick={scrollToTop}>
              ⬆
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Favorites;