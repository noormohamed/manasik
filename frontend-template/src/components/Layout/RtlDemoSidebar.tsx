"use client";

import React, { useState, useEffect } from "react";

const RtlDemoSidebar: React.FC = () => {
  const [dirAttribute, setDirAttribute] = useState<string>('ltr');

  // Use effect to read the user preference from local storage on component mount
  useEffect(() => {
    const storedDirAttribute = localStorage.getItem('dirAttribute');
    if (storedDirAttribute) {
      setDirAttribute(storedDirAttribute);
      document.documentElement.setAttribute('dir', storedDirAttribute);
    }
  }, []);

  // Function to handle button click and update state and local storage
  const handleButtonClick = () => {
    const newDirAttribute = dirAttribute === 'ltr' ? 'rtl' : 'ltr';
    setDirAttribute(newDirAttribute);
    localStorage.setItem('dirAttribute', newDirAttribute);
    document.documentElement.setAttribute('dir', newDirAttribute);
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className="rtl-switch"
      >
        Switch to RTL/LTR
      </button>
    </>
  );
};

export default RtlDemoSidebar;
