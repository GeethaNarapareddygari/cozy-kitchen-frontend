import React from 'react';
import './IngredientChips.css';

const IngredientChips = ({ ingredients, onRemove }) => {
  return (
    <div className="ingredients-chips">
      {ingredients.map((ing, index) => (
        <span key={index} className="chip">
          {ing} 
          <button 
            onClick={() => onRemove(ing)} 
            className="remove-btn"
            aria-label={`Remove ${ing}`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
};

export default IngredientChips;