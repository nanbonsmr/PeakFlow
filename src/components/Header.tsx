import { useState, useEffect } from "react";
import { Menu, X, Moon, Sun, LogOut, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className="sticky top-0 z-50 py-2 sm:py-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 pill-nav px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center min-w-0">
            <a href="/" className="flex items-center gap-1.5 sm:gap-2">
              <img src={logo} alt="PeakFlow" className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
              <span className="text-base sm:text-xl font-bold font-serif truncate">PeakFlow</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <a href="/" className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all">
              Home
            </a>
            <a href="/#articles" className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all">
              Articles
            </a>
            <a href="/wellness" className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all">
              Wellness
            </a>
            <a href="/travel" className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all">
              Travel
            </a>
            <a href="/about" className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all">
              About
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <button
              onClick={toggleTheme}
              className="relative p-2 sm:p-2.5 rounded-full hover:bg-muted/60 transition-all duration-300 group overflow-hidden"
              aria-label="Toggle theme"
            >
              <div className="relative transition-transform duration-500 ease-out group-hover:rotate-12">
                {isDark ? (
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300" />
                ) : (
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300" />
                )}
              </div>
              <span className="absolute inset-0 rounded-full bg-accent/10 scale-0 group-hover:scale-100 transition-transform duration-300" />
            </button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden md:flex items-center gap-2 rounded-full px-4 py-2 hover:bg-muted/60"
                  >
                    <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {user.email?.split("@")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <a href="/admin" className="flex items-center gap-2 cursor-pointer">
                          <Shield className="h-4 w-4" />
                          Admin Dashboard
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-2 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group"
              >
                <a href="/auth">
                  <span>Join Now</span>
                  <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
                </a>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-1.5 sm:p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-4">
              <a href="/" className="text-sm font-medium hover:text-accent transition-colors">
                Home
              </a>
              <a href="/#articles" className="text-sm font-medium hover:text-accent transition-colors">
                Articles
              </a>
              <a href="/wellness" className="text-sm font-medium hover:text-accent transition-colors">
                Wellness
              </a>
              <a href="/travel" className="text-sm font-medium hover:text-accent transition-colors">
                Travel
              </a>
              <a href="/about" className="text-sm font-medium hover:text-accent transition-colors">
                About
              </a>
              {user ? (
                <>
                  {isAdmin && (
                    <a
                      href="/admin"
                      className="text-sm font-medium hover:text-accent transition-colors flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Admin Dashboard
                    </a>
                  )}
                  <Button
                    onClick={() => signOut()}
                    variant="outline"
                    className="rounded-full w-full"
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-full">
                  <a href="/auth">Join Now</a>
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
