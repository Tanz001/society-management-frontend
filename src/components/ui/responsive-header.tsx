import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ResponsiveHeaderProps {
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  rightContent?: React.ReactNode;
  leftContent?: React.ReactNode;
  className?: string;
}

export function ResponsiveHeader({
  title,
  subtitle,
  badge,
  rightContent,
  leftContent,
  className
}: ResponsiveHeaderProps) {
  return (
    <header className={cn("gradient-primary text-white py-4 md:py-6 px-4", className)}>
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
            {leftContent}
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-2xl font-bold truncate">
                {title}
              </h1>
              {subtitle && (
                <div className="hidden md:flex items-center space-x-2 md:space-x-4 mt-1 md:mt-2">
                  {badge && (
                    <Badge 
                      variant={badge.variant || "secondary"} 
                      className="bg-white/20 text-white text-xs"
                    >
                      {badge.text}
                    </Badge>
                  )}
                  <span className="text-white/80 text-sm md:text-base truncate">
                    {subtitle}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
            {rightContent}
          </div>
        </div>
      </div>
    </header>
  );
}
