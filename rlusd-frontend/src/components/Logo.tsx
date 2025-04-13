import React from "react";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", width = 250, height = 65 }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={`${process.env.PUBLIC_URL}/logo.png`}
        alt="netiShield Logo"
        width={width}
        height={height}
        className="object-contain"
      />
    </div>
  );
};

export default Logo;
