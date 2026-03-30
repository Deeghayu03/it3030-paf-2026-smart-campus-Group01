import React from 'react';
import './Card.css';

const Card = ({ icon, title, description, onClick }) => {
  return (
    <div className={`card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      {icon && <div className="card-icon">{icon}</div>}
      <h3 className="card-title">{title}</h3>
      {description && <p className="card-description">{description}</p>}
    </div>
  );
};

export default Card;