"use client";

import React, { useState, useEffect } from "react";

const DarkAndLightMode: React.FC = () => {
  // Light/Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // Retrieve the user's preference from local storage
    const storedPreference = localStorage.getItem("theme");
    if (storedPreference === "dark") {
      setIsDarkMode(true);
    }
  }, []);

  const handleToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    // Update the user's preference in local storage
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    // Update the class on the <html> element to apply the selected mode
    const htmlElement = document.querySelector("html");
    if (htmlElement) {
      if (isDarkMode) {
        htmlElement.classList.add("dark");
      } else {
        htmlElement.classList.remove("dark");
      }
    }
  }, [isDarkMode]);

  return (
    <div className="dark-switcher-btn" onClick={handleToggle}>
      <i className="ri-sun-line sun"></i>
      <i className="ri-moon-fill moon"></i>
    </div>
  );
};

export default DarkAndLightMode;