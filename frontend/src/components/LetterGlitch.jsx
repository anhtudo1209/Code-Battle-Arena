import React, { useEffect, useRef } from 'react';
import './LetterGlitch.css';

const LetterGlitch = ({ text, className = '', style = {} }) => {
  const textRef = useRef(null);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const letters = element.querySelectorAll('.letter-glitch__letter');
    letters.forEach((letter, index) => {
      letter.style.animationDelay = `${index * 0.1}s`;
    });
  }, [text]);

  return (
    <span
      ref={textRef}
      className={`letter-glitch ${className}`}
      style={style}
    >
      {text.split('').map((char, index) => (
        <span key={index} className="letter-glitch__letter">
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

export default LetterGlitch;
