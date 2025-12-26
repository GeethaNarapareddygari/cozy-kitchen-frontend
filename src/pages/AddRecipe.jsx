import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast'; 
import './AddRecipe.css';

const AddRecipe = () => {
  const { user } = useContext(AuthContext); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    image: '', 
    youtubeUrl: '', 
    servings: '',
    cuisines: '', 
    dishTypes: '', 
    ingredients: '', 
    instructions: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- 🛡️ HELPER: URL VALIDATOR ---
  const isValidUrl = (string) => {
    try {
      // 1. If it doesn't start with http, temporarily add it to check validity
      let urlToCheck = string;
      if (!string.startsWith('http://') && !string.startsWith('https://')) {
          urlToCheck = 'https://' + string;
      }
      
      // 2. Try to create a URL object
      const urlObj = new URL(urlToCheck);
      
      // 3. Extra check: Must have a dot (e.g., "google.com") to avoid "localhost" or plain text "ds"
      return urlObj.hostname.includes('.'); 
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
        toast.error("Please log in to share a recipe! 🔒");
        setLoading(false);
        return;
    }

    // --- 🚨 VALIDATION CHECKS ---
    
    // 1. Validate Image URL
    if (!isValidUrl(formData.image)) {
        toast.error("Please enter a valid Image URL 🖼️");
        setLoading(false);
        return; // 🛑 STOP HERE
    }

    // 2. Validate YouTube URL (Only if user typed something)
    if (formData.youtubeUrl.trim() !== '' && !isValidUrl(formData.youtubeUrl)) {
        toast.error("Please enter a valid YouTube Link 🎥");
        setLoading(false);
        return; // 🛑 STOP HERE
    }

    // --- 🛠️ DATA PREPARATION ---
    
    // Auto-fix URL prefixes for saving (add https:// if missing)
    const fixUrl = (url) => {
        if (!url) return '';
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return `https://${url}`;
        }
        return url;
    };

    const newRecipe = {
      userId: user.id, 
      title: formData.title,
      image: fixUrl(formData.image), // Clean the image URL
      servings: parseInt(formData.servings) || 1, 
      readyInMinutes: 30, 
      sourceUrl: fixUrl(formData.youtubeUrl), // Clean the video URL
      
      cuisines: formData.cuisines ? formData.cuisines.split(',').map(s => s.trim()) : [],
      dishTypes: formData.dishTypes ? formData.dishTypes.split(',').map(s => s.trim()) : [],
      extendedIngredients: formData.ingredients.split('\n').map(line => ({ original: line })),
      analyzedInstructions: [{ 
        steps: formData.instructions.split('\n').map((step, i) => ({ 
            number: i + 1, 
            step: step.trim() 
        })) 
      }]
    };

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('https://cozy-kitchen-api.onrender.com/api/user-recipes/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'auth-token': token 
        },
        body: JSON.stringify(newRecipe)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Recipe Published Successfully! 🍳");
        navigate('/my-recipes'); 
      } else {
        toast.error(data.message || "Failed to create recipe.");
      }
    } catch (err) {
      console.error("Error adding recipe:", err);
      toast.error("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-recipe-container">
      <div className="back-btn-wrapper">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      </div>
      
      <div className="recipe-form-card fade-in-up">
        <h1 className="form-title">Share Your Recipe 🍳</h1>
        
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
              <label>Recipe Title</label>
              <div className="input-with-icon">
                  <span className="icon">🍽️</span>
                  <input type="text" name="title" required placeholder="e.g., Mom's Lasagna" onChange={handleChange} />
              </div>
          </div>

          <div className="form-group">
              <label>Image URL</label>
              <div className="input-with-icon">
                  <span className="icon">🖼️</span>
                  <input type="text" name="image" required placeholder="https://example.com/food.jpg" onChange={handleChange} />
              </div>
          </div>

          <div className="form-group">
              <label>YouTube Video Link (Optional)</label>
              <div className="input-with-icon">
                  <span className="icon">🎥</span>
                  <input type="text" name="youtubeUrl" placeholder="youtube.com/watch?v=..." onChange={handleChange} />
              </div>
          </div>

          <div className="form-row">
              <div className="form-group half">
                  <label>Servings</label>
                  <div className="input-with-icon">
                      <span className="icon">👥</span>
                      <input type="number" name="servings" required placeholder="4" onChange={handleChange} />
                  </div>
              </div>
              <div className="form-group half">
                  <label>Cuisine</label>
                  <div className="input-with-icon">
                      <span className="icon">🌍</span>
                      <input type="text" name="cuisines" placeholder="Italian, Mexican" onChange={handleChange} />
                  </div>
              </div>
          </div>

          <div className="form-group">
              <label>Dish Type</label>
              <div className="input-with-icon">
                  <span className="icon">🍲</span>
                  <input type="text" name="dishTypes" placeholder="Dinner, Main Course" onChange={handleChange} />
              </div>
          </div>

          <div className="form-group">
              <label>Ingredients (One per line)</label>
              <textarea name="ingredients" rows="5" required placeholder="2 eggs&#10;1 cup flour&#10;1/2 cup milk" onChange={handleChange}></textarea>
          </div>

          <div className="form-group">
              <label>Instructions (One step per line)</label>
              <textarea name="instructions" rows="5" required placeholder="Mix wet ingredients...&#10;Add dry ingredients...&#10;Bake at 350F." onChange={handleChange}></textarea>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Publishing..." : "Publish Recipe ✨"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddRecipe;