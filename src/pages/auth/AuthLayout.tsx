
import React from "react";
import { Link } from "react-router-dom";

type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
};

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-darkBg">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="mb-6 text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Impress <span className="text-goldAccent">Calendars</span></h1>
          </Link>
        </div>
        
        <div className="w-full max-w-md bg-darkSecondary rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-gray-400 mt-2">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
