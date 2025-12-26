import React, { useState, useEffect, useRef } from 'react';
import './SearchBar.css';

// 🚀 1. HYBRID APPROACH: Common ingredients for instant results
const COMMON_INGREDIENTS = [
    { name: "Chicken" }, { name: "Salmon" }, { name: "Beef" }, { name: "Pork" },
    { name: "Avocado" }, { name: "Apple" }, { name: "Asparagus" }, { name: "Aubergine" },
    { name: "Bacon" }, { name: "Basil" }, { name: "Beans" }, { name: "Broccoli" },
    { name: "Butter" }, { name: "Cabbage" }, { name: "Carrots" }, { name: "Cheese" },
    { name: "Chili" }, { name: "Chocolate" }, { name: "Corn" }, { name: "Cream" },
    { name: "Cucumber" }, { name: "Egg" }, { name: "Flour" }, { name: "Garlic" },
    { name: "Ginger" }, { name: "Honey" }, { name: "Lemon" }, { name: "Lettuce" },
    { name: "Lime" }, { name: "Milk" }, { name: "Mushrooms" }, { name: "Mustard" },
    { name: "Noodles" }, { name: "Oats" }, { name: "Olive Oil" }, { name: "Onion" },
    { name: "Orange" }, { name: "Pasta" }, { name: "Parsley" }, { name: "Peas" },
    { name: "Pepper" }, { name: "Potato" }, { name: "Prawns" }, { name: "Rice" },
    { name: "Salt" }, { name: "Spinach" }, { name: "Strawberry" }, { name: "Sugar" },
    { name: "Tomato" }, { name: "Turkey" }, { name: "Vanilla" }, { name: "Water" },
    { name: "Yogurt" }
];

const SearchBar = ({ onAddIngredient, onSearch, onTyping, children }) => {
    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    
    // 🚀 2. Initialize state with FAST local data (User sees this instantly)
    const [allIngredients, setAllIngredients] = useState(COMMON_INGREDIENTS);
    
    // We don't need a loading state anymore because we have initial data
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

    const listRef = useRef(null);
    const lastMousePos = useRef({ x: 0, y: 0 });

    // ---------------------------------------------------------
    // 3. SILENT BACKGROUND FETCH (Does not block UI)
    // ---------------------------------------------------------
    useEffect(() => {
        const fetchFullList = async () => {
            try {
                // This request runs in the background. 
                // The user can already search for "Chicken" or "Egg" while this loads.
                const response = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?i=list');
                const data = await response.json();
                
                if (data.meals) {
                    const fullList = data.meals
                        .map(item => ({ name: item.strIngredient }))
                        .filter(item => item.name); // Remove nulls
                    
                    // Once loaded, we silently swap the small list for the HUGE list
                    setAllIngredients(fullList);
                }
            } catch (error) {
                console.warn("Background fetch failed, keeping local common list.", error);
            }
        };

        fetchFullList();
    }, []); 

    // ---------------------------------------------------------
    // 4. INSTANT FILTERING
    // ---------------------------------------------------------
    useEffect(() => {
        if (input.length < 2) {
            setSuggestions([]);
            return;
        }

        const lowerInput = input.toLowerCase();
        const matches = allIngredients
            .filter(item => item.name.toLowerCase().includes(lowerInput))
            .slice(0, 8); 

        setSuggestions(matches);
        
    }, [input, allIngredients]);

    // 5. Reset selection when input changes
    useEffect(() => {
        setActiveSuggestionIndex(-1);
    }, [input]);

    // 6. Scroll to active item
    useEffect(() => {
        if (activeSuggestionIndex >= 0 && listRef.current) {
            const activeItem = listRef.current.children[activeSuggestionIndex];
            if (activeItem) {
                activeItem.scrollIntoView({ block: 'nearest', behavior: 'auto' });
            }
        }
    }, [activeSuggestionIndex]);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInput(newValue);
        if (onTyping) onTyping(newValue.length > 0);
    };

    const handleSelect = (name) => {
        onAddIngredient(name);
        setInput("");
        setSuggestions([]);
        setActiveSuggestionIndex(-1);
        if (onTyping) onTyping(false);
    };

    const handleKeyDown = (e) => {
        if (suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestionIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (activeSuggestionIndex >= 0) {
                    handleSelect(suggestions[activeSuggestionIndex].name);
                } else {
                    handleSelect(suggestions[0].name); 
                }
            } else if (e.key === 'Escape') {
                setSuggestions([]);
                setActiveSuggestionIndex(-1);
            }
        } else {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (input.trim().length > 0) {
                    onAddIngredient(input.trim());
                    setInput("");
                } else {
                    onSearch(); 
                }
            }
        }
    };

    const handleMouseMove = (e, index) => {
        if (e.clientX !== lastMousePos.current.x || e.clientY !== lastMousePos.current.y) {
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            setActiveSuggestionIndex(index);
        }
    };

    return (
        <div className="search-container">
            <div className="search-input-wrapper">
                {children}
                <input
                    type="text"
                    id="ingredient-search"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={children && children.length > 0 ? "" : "Search ingredients (e.g. Chicken)..."}
                    autoComplete="off"
                />
            </div>

            {/* Dropdown Logic */}
            {suggestions.length > 0 && (
                <ul className="suggestions-list" ref={listRef}>
                    {suggestions.map((item, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(item.name)}
                            onMouseMove={(e) => handleMouseMove(e, index)}
                            className={index === activeSuggestionIndex ? "active-suggestion" : ""}
                        >
                            <span className="plus-icon">+</span>
                            <span className="ingredient-name">{item.name}</span>
                            <span className="add-text">add</span>
                        </li>
                    ))}
                </ul>
            )}

            {/* No Results Logic (Removed Loading Indicator) */}
            {input.length > 2 && suggestions.length === 0 && (
                <div className="suggestions-list no-results">
                    <p style={{ margin: 0 }}>No ingredients found for "<strong>{input}</strong>"</p>
                </div>
            )}
        </div>
    );
};

export default SearchBar;