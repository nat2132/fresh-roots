'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ShoppingCart, Menu, User, LogOut, LayoutDashboard } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { cart } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Market' },
    { href: '/orders', label: 'Orders' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm h-16' 
        : 'bg-transparent h-20'
    }`}>
      <div className="container mx-auto h-full flex items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl transition-transform group-hover:scale-110 duration-300">🌱</span>
          <span className="font-serif text-2xl font-bold tracking-tight text-brand-forest dark:text-brand-green-light">
            Fresh<span className="text-brand-green">Roots</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-brand-green ${
                pathname === link.href 
                  ? 'text-brand-green' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 md:gap-2">
          <ModeToggle />

          <Link href="/cart" className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-brand-green transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {cart?.items?.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-green text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full animate-in zoom-in duration-300">
                {cart.items.length}
              </span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={(props) => (
                    <button {...props} className="relative h-10 w-10 rounded-full overflow-hidden hover:opacity-80 transition-opacity outline-none">
                      <Avatar className="h-10 w-10 border-2 border-brand-green/20">
                        <AvatarFallback className="bg-brand-green/10 text-brand-green font-bold">
                          {user.first_name?.[0] || user.username?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  )}
                />
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.first_name || user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    nativeButton={false}
                    render={(props) => (
                      <Link href="/profile" {...props}>
                        <User className="mr-2 h-4 w-4" />
                        My Profile
                      </Link>
                    )}
                  />
                  {user.role !== 'customer' && (
                    <DropdownMenuItem
                      nativeButton={false}
                      render={(props) => (
                        <Link href="/admin" {...props}>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}
                    />
                  )}
                  <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Button 
                  variant="outline" 
                  className="rounded-full border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
                  nativeButton={false}
                  render={(props) => <Link href="/login" {...props}>Log In</Link>}
                />
                <Button 
                  className="rounded-full bg-brand-green hover:bg-brand-forest text-white"
                  nativeButton={false}
                  render={(props) => <Link href="/signup" {...props}>Sign Up</Link>}
                />
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger
              render={(props) => (
                <button {...props} className="md:hidden ml-1 p-2 hover:bg-muted/50 rounded-full transition-all outline-none">
                  <Menu className="h-6 w-6" />
                </button>
              )}
            />
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 py-10">
                <Link href="/" className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🌱</span>
                  <span className="font-serif text-2xl font-bold text-brand-forest dark:text-brand-green-light">FreshRoots</span>
                </Link>
                
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-lg font-medium transition-colors hover:text-brand-green ${
                        pathname === link.href ? 'text-brand-green' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href="/cart"
                    className={`text-lg font-medium transition-colors hover:text-brand-green ${
                      pathname === '/cart' ? 'text-brand-green' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Cart ({cart?.items?.length || 0})
                  </Link>
                </div>

                <div className="mt-auto flex flex-col gap-3">
                  {user ? (
                    <>
                      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center gap-3 mb-2">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-brand-green text-white">
                            {user.username?.[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold">{user.first_name || user.username}</p>
                          <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                        </div>
                      </div>
                      <Button variant="ghost" className="w-full justify-start mb-1" nativeButton={false} render={(props) => <Link href="/profile" {...props}><User className="mr-2 h-4 w-4" /> My Profile</Link>} />
                      {user.role !== 'customer' && (
                        <Button variant="outline" className="w-full mb-1" nativeButton={false} render={(props) => <Link href="/admin" {...props}>Admin Dashboard</Link>} />
                      )}
                      <Button variant="destructive" onClick={logout} className="w-full">
                        <LogOut className="mr-2 h-4 w-4" /> Log Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full justify-center rounded-full border-brand-green text-brand-green"
                        nativeButton={false}
                        render={(props) => <Link href="/login" {...props}>Log In</Link>}
                      />
                      <Button 
                        className="w-full justify-center rounded-full bg-brand-green"
                        nativeButton={false}
                        render={(props) => <Link href="/signup" {...props}>Sign Up</Link>}
                      />
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
