import React from "react";

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
    if (onCheckedChange) {
      onCheckedChange(newChecked);
    }
  };

  const sizeClasses = {
    default: "h-6 w-11",
    sm: "h-5 w-9",
    lg: "h-7 w-12",
    xl: "h-8 w-14",
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
  return (
    <label className="relative inline-block h-8 w-16 cursor-pointer">
      <input type="checkbox" className="peer sr-only" />
      <div
        className="h-8 w-16 rounded-full bg-gray-200 transition-colors duration-150
  after:absolute after:left-[2px] after:top-0 after:h-8 after:w-8 after:rounded-full
  after:border after:border-gray-300 after:bg-white after:transition-transform after:duration-150 after:content-['']
  peer-checked:[background:linear-gradient(120deg,#34d399,#06b6d4)]
  peer-checked:after:translate-x-[30px] peer-checked:after:border-white
  dark:bg-gray-700 dark:peer-checked:[background:linear-gradient(120deg,#34d399,#06b6d4)]"
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export { Switch, SwitchWrapper, SwitchIndicator };
