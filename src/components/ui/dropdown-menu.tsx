"use client";

import React, { useState, useRef, useEffect } from 'react';

interface DropdownMenuProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          // Only pass props to our custom components, not to DOM elements
          if (child.type === DropdownMenuTrigger || child.type === DropdownMenuContent) {
            return React.cloneElement(child as React.ReactElement<{ isOpen?: boolean; setIsOpen?: (open: boolean) => void }>, { isOpen, setIsOpen });
          }
        }
        return child;
      })}
    </div>
  );
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  className?: string;
}

export function DropdownMenuTrigger({ children, isOpen, setIsOpen, className = "" }: DropdownMenuTriggerProps) {
  const handleClick = () => setIsOpen?.(!isOpen);
  
  // If children is a single React element, clone it with onClick
  if (React.isValidElement(children) && React.Children.count(children) === 1) {
    const childProps = children.props as { className?: string; onClick?: () => void };
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void; className?: string }>, {
      onClick: handleClick,
      className: `${childProps.className || ''} ${className}`.trim()
    });
  }
  
  // Otherwise wrap in button
  return (
    <button
      onClick={handleClick}
      className={`focus:outline-none ${className}`}
    >
      {children}
    </button>
  );
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export function DropdownMenuContent({ children, className = "", isOpen, setIsOpen }: DropdownMenuContentProps) {
  if (!isOpen) return null;

  return (
    <div className={`absolute right-0 mt-2 w-48 rounded-md border border-zinc-200 bg-white py-1 shadow-lg z-50 ${className}`}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          // Only pass setIsOpen to DropdownMenuItem components
          if (child.type === DropdownMenuItem) {
            return React.cloneElement(child as React.ReactElement<{ setIsOpen?: (open: boolean) => void }>, { setIsOpen });
          }
          // For other elements (like divs), don't pass our custom props
          return child;
        }
        return child;
      })}
    </div>
  );
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  setIsOpen?: (open: boolean) => void;
}

export function DropdownMenuItem({ children, onClick, className = "", setIsOpen }: DropdownMenuItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
    setIsOpen?.(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`block w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none ${className}`}
    >
      {children}
    </button>
  );
}