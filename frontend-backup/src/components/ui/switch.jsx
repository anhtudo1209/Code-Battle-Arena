import React, { useEffect, useState } from "react";

const THEME_KEY = "cba-theme";

const applyTheme = (isLight) => {
  const root = document.documentElement;
  if (isLight) {
    root.setAttribute("data-theme", "light");
  } else {
    root.removeAttribute("data-theme");
  }
};

const Switch = ({
  id,
  size = "default",
  checked = false,
  onCheckedChange,
  className = "",
  ...props
}) => {
  const handleChange = (e) => {
    const newChecked = e.target.checked;

    applyTheme(newChecked);
    localStorage.setItem(THEME_KEY, newChecked ? "light" : "dark");

    if (onCheckedChange) {
      onCheckedChange(newChecked);
    }
  };

  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={handleChange}
      className={`peer sr-only ${className}`}
      {...props}
    />
  );
};

const SwitchWrapper = ({
  children,
  permanent = false,
  className = "",
  ...props
}) => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const isLight = savedTheme === "light";
    setChecked(isLight);
    applyTheme(isLight);
  }, []);

  const handleToggle = (e) => {
    const isChecked = e.target.checked;
    setChecked(isChecked);
    applyTheme(isChecked);
    localStorage.setItem(THEME_KEY, isChecked ? "light" : "dark");
  };

  return (
    <label
      className={`relative inline-block h-8 w-16 cursor-pointer ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={handleToggle}
        className="peer sr-only"
        {...props}
      />

      <div
        className="h-8 w-16 rounded-full bg-gray-200 transition-colors duration-200
        after:absolute after:left-[2px] after:top-0 after:h-8 after:w-8 after:rounded-full
        after:border after:border-gray-300 after:bg-white after:transition-transform after:duration-200 after:content-['']
        peer-checked:[background:linear-gradient(120deg,#34d399,#06b6d4)]
        peer-checked:after:translate-x-[30px] peer-checked:after:border-white
        dark:bg-gray-700"
      ></div>

      {children}
    </label>
  );
};

const SwitchIndicator = ({ state, children, className = "", ...props }) => {
  return (
    <div
      className={`absolute flex items-center justify-center transition-all duration-300 pointer-events-none ${className}`}
      style={{
        left: state === "on" ? "32px" : "2px",
        top: "0",
        width: "32px",
        height: "32px",
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export { Switch, SwitchWrapper, SwitchIndicator };
