import { Outlet } from "react-router";

export function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground">
      {/* Left Side: Branding / Marketing (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between bg-muted p-10 border-r">
        <div className="flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
          Scripture Journal
        </div>
        <div className="mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Thy word is a lamp unto my feet, and a light unto my path."
            </p>
            <footer className="text-sm text-muted-foreground">
              Psalm 119:105
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side: Authentication Form Outlet */}
      <div className="flex items-center justify-center p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {/* 
            The Outlet will inject the specific feature page here 
            (e.g., src/features/auth/pages/LoginPage.tsx) 
          */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
