
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="mb-6 text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl md:text-3xl font-bold">Impress <span className="text-primary">Calendars</span></h1>
          </Link>
        </div>
        
        <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
