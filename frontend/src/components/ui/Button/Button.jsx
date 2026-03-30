import React from 'react';
import './Button.css';

const Button = ({ label, onClick, variant = 'primary', type = 'button', disabled = false }) => {
  return (
    <button 
      type={type} 
      className={`btn btn-${variant}`} 
      onClick={onClick} 
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;