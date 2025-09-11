"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  label: string;
  value: string;
  sublabel?: string;
}

interface SearchableSelectorProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  sublabel?: string;
  className?: string;
}

export default function SearchableSelector({
  options,
  value,
  onChange,
  placeholder,
  label,
  sublabel,
  className = ""
}: SearchableSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  useEffect(() => {
    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (option.sublabel && option.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredOptions(filtered);
    setHighlightedIndex(-1);
  }, [searchTerm, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex].value);
          setIsOpen(false);
          setSearchTerm("");
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        inputRef.current?.blur();
        break;
    }
  };

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth"
        });
      }
    }
  }, [highlightedIndex]);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = isOpen ? searchTerm : (selectedOption?.label || "");

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <label className="block text-xs font-mono uppercase text-white mb-2">
        [{label}]
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm("");
          }}
          onKeyDown={handleKeyDown}
          placeholder={isOpen ? "Type to search..." : placeholder}
          className="w-full px-3 py-2 bg-black text-white border-2 border-white focus:outline-none focus:bg-white focus:text-black transition-colors font-mono text-sm cursor-pointer"
        />
        
        {/* Dropdown arrow */}
        <div 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white pointer-events-none font-mono text-xs"
        >
          {isOpen ? "▲" : "▼"}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div 
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-black border-2 border-white max-h-60 overflow-y-auto"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-400 font-mono text-xs">
                No matches found
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`px-3 py-2 cursor-pointer font-mono text-xs transition-colors ${
                    index === highlightedIndex
                      ? "bg-white text-black"
                      : "text-white hover:bg-white hover:text-black"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{option.label}</span>
                    {option.sublabel && (
                      <span className="text-gray-400 text-[10px]">
                        {option.sublabel}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Display sublabel below input */}
      {sublabel && (
        <div className="text-[10px] font-mono text-gray-400 mt-1">
          {sublabel}
        </div>
      )}
    </div>
  );
}