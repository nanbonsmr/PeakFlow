import { useState, useEffect } from "react";
import { Menu, X, Moon, Sun, LogOut, User, Shield, Home, FileText, Zap, Heart, Cpu, TrendingUp, Info, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

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

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/lifestyle", label: "Lifestyle", icon: Heart },
    { href: "/tech-tips", label: "Tech Tips", icon: Cpu },
    { href: "/growth", label: "Growth", icon: TrendingUp },
    { href: "/about", label: "About", icon: Info },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href.replace("/#", "/"));
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
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-sm font-medium rounded-full px-4 py-2 transition-all ${
                  isActive(item.href)
                    ? "bg-accent/10 text-accent"
                    : "hover:bg-muted/60"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Search Button */}
            <a
              href="/search"
              className="p-2 sm:p-2.5 rounded-full hover:bg-muted/60 transition-all duration-300"
              aria-label="Search"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>

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
                <DropdownMenuContent align="end" className="w-48 rounded-xl bg-popover border border-border shadow-lg z-50">
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
                className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-2 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group"
              >
                <a href="/auth">
                  <span>Join Now</span>
                  <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
                </a>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="md:hidden p-2 rounded-full hover:bg-muted/60 transition-colors"
                  aria-label="Toggle menu"
                >
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-background border-l border-border p-0">
                <SheetHeader className="p-6 border-b border-border">
                  <SheetTitle className="flex items-center gap-2">
                    <img src={logo} alt="PeakFlow" className="w-8 h-8" />
                    <span className="font-serif font-bold text-xl">PeakFlow</span>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col h-[calc(100%-80px)]">
                  {/* Navigation Links */}
                  <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                            isActive(item.href)
                              ? "bg-accent/10 text-accent"
                              : "hover:bg-muted/60"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </a>
                      );
                    })}
                    
                    {user && isAdmin && (
                      <a
                        href="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                          location.pathname === "/admin"
                            ? "bg-accent/10 text-accent"
                            : "hover:bg-muted/60"
                        }`}
                      >
                        <Shield className="h-5 w-5" />
                        Admin Dashboard
                      </a>
                    )}
                  </nav>
                  
                  {/* User Section */}
                  <div className="p-4 border-t border-border space-y-3">
                    {user ? (
                      <>
                        <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 rounded-xl">
                          <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user.email?.split("@")[0]}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            signOut();
                            setIsMenuOpen(false);
                          }}
                          variant="outline"
                          className="w-full rounded-xl h-12 text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign out
                        </Button>
                      </>
                    ) : (
                      <Button
                        asChild
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 text-base font-medium"
                      >
                        <a href="/auth" onClick={() => setIsMenuOpen(false)}>
                          Join Now
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
