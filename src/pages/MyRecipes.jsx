import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './MyRecipes.css';

const MyRecipes = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [myRecipes, setMyRecipes] = useState([]);
    const [visibleRecipes, setVisibleRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTopBtn, setShowTopBtn] = useState(false);

    // --- MODAL STATE ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [recipeToDelete, setRecipeToDelete] = useState(null);

    const RECIPES_PER_PAGE = 8;

    // 1. Fetch User's Created Recipes (FIXED HERE ⬇️)
    useEffect(() => {
        const fetchMyRecipes = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const userId = user.id || user._id;
                
                // 1. Get the Token 🔑
                const token = localStorage.getItem('token'); 

                // 2. Send Token in Headers 👮‍♂️
                const response = await fetch(`https://cozy-kitchen-api.onrender.com/api/user-recipes/my-recipes/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': token // <--- THIS WAS MISSING
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setMyRecipes(data);
                    setVisibleRecipes(data.slice(0, RECIPES_PER_PAGE));
                } else {
                    console.error("Failed to fetch recipes");
                    setMyRecipes([]);
                }
            } catch (err) {
                console.error("Error connecting to server:", err);
                setMyRecipes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMyRecipes();
    }, [user]);

    // 2. Delete Logic
    const performDelete = async (recipeId) => {
        try {
            const token = localStorage.getItem('token'); // Get Token

            const response = await fetch(`https://cozy-kitchen-api.onrender.com/api/user-recipes/delete/${recipeId}`, {
                method: 'DELETE',
                headers: {
                    'auth-token': token, // Token is correctly here
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Update local state immediately (Optimistic UI)
                const updatedAll = myRecipes.filter(r => r._id !== recipeId);
                const updatedVisible = visibleRecipes.filter(r => r._id !== recipeId);

                setMyRecipes(updatedAll);
                setVisibleRecipes(updatedVisible);

                toast.success("Recipe deleted successfully! 🗑️");
            } else {
                const errorData = await response.json();
                toast.error(`Error: ${errorData.message}`);
            }
        } catch (err) {
            console.error("Delete request failed:", err);
            toast.error("Failed to connect to server.");
        }
    };

    const handleDeleteClick = (e, recipeId) => {
        e.stopPropagation();
        setRecipeToDelete(recipeId);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (recipeToDelete) performDelete(recipeToDelete);
        setShowDeleteModal(false);
        setRecipeToDelete(null);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setRecipeToDelete(null);
    };

    // 3. Scroll & Pagination
    useEffect(() => {
        const handleScroll = () => setShowTopBtn(window.scrollY > 300);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const handleShowMore = () => {
        const currentLength = visibleRecipes.length;
        const nextBatch = myRecipes.slice(currentLength, currentLength + RECIPES_PER_PAGE);
        setVisibleRecipes([...visibleRecipes, ...nextBatch]);
    };

    const handleShowLess = () => {
        setVisibleRecipes(myRecipes.slice(0, RECIPES_PER_PAGE));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- RENDER ---

    if (!user) {
        return (
            <div className="my-recipes-container empty-container">
                <h2>Please log in to manage your recipes. 👨‍🍳</h2>
                <Link to="/login" className="browse-btn">Go to Login</Link>
            </div>
        );
    }

    if (loading) return <div className="loading-text" style={{textAlign:'center', padding:'40px', color:'white'}}>Checking your kitchen... 🍳</div>;

    return (
        <div className="my-recipes-container">
            {/* Header */}
            <div className="my-recipes-header">
                <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
                <h1 className="page-title">My Creations👨‍🍳</h1>
                <button className="create-btn" onClick={() => navigate('/add-recipe')}>+ Create New</button>
            </div>

            <div className="stats-pill">
                {myRecipes.length} {myRecipes.length === 1 ? 'recipe' : 'recipes'} created
            </div>

            {/* Content */}
            {myRecipes.length === 0 ? (
                <div className="empty-state">
                    <h3>You haven't created any recipes yet.</h3>
                    <p className="sub-text">Share your culinary secrets with the world!</p>
                    <Link to="/add-recipe" className="start-cooking-btn">Start Cooking</Link>
                </div>
            ) : (
                <>
                    <div className="recipes-grid">
                        {visibleRecipes.map((recipe) => (
                            <div
                                key={recipe._id}
                                className="custom-recipe-card"
                                onClick={() => navigate(`/recipe/${recipe._id}`)}
                            >
                                <div className="card-image-wrapper">
                                    <img
                                        src={recipe.image || 'https://placehold.co/600x400?text=No+Image'}
                                        alt={recipe.title}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://placehold.co/600x400?text=No+Image';
                                        }}
                                    />
                                </div>

                                <div className="card-details">
                                    <h3>{recipe.title}</h3>

                                    <div className="card-tags">
                                        {recipe.cuisines?.[0] && <span className="tag cuisine">🌍 {recipe.cuisines[0]}</span>}
                                        {recipe.dishTypes?.[0] && <span className="tag type">🍴 {recipe.dishTypes[0]}</span>}
                                    </div>

                                    <div className="card-actions">
                                        <button
                                            className="view-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/recipe/${recipe._id}`);
                                            }}
                                        >
                                            View Recipe
                                        </button>

                                        <button
                                            className="delete-btn"
                                            onClick={(e) => handleDeleteClick(e, recipe._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="pagination-container">
                        {visibleRecipes.length < myRecipes.length && (
                            <button className="pagination-btn show-more" onClick={handleShowMore}>
                                Show More ({myRecipes.length - visibleRecipes.length} left) 👇
                            </button>
                        )}
                        {visibleRecipes.length > RECIPES_PER_PAGE && (
                            <button className="pagination-btn show-less" onClick={handleShowLess}>
                                Show Less ⬆
                            </button>
                        )}
                    </div>

                    {showTopBtn && (
                        <button className="scroll-top-btn" onClick={scrollToTop}>⬆</button>
                    )}

                    {/* --- DELETE CONFIRMATION MODAL --- */}
                    {showDeleteModal && (
                        <div className="modal-overlay">
                            <div className="delete-modal-content">
                                <h3>Delete this recipe? ⚠️</h3>
                                <p>This action cannot be undone.</p>

                                <div className="confirm-buttons">
                                    <button className="confirm-btn-yes" onClick={confirmDelete}>
                                        Yes, Delete
                                    </button>
                                    <button className="confirm-btn-no" onClick={cancelDelete}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MyRecipes;