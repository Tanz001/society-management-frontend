import * as React from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MobileSidebarProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  className?: string;
}

export function MobileSidebar({ children, trigger, className }: MobileSidebarProps) {
  const [open, setOpen] = React.useState(false);

  const handleNavigate = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-university-navy">Menu</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          <div className={cn("flex-1 overflow-y-auto", className)}>
            {React.Children.map(children, child => 
              React.isValidElement(child) && child.type === MobileNav
                ? React.cloneElement(child, { onNavigate: handleNavigate })
                : child
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface MobileNavProps {
  items: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    variant?: "default" | "active" | "secondary";
    state?: any;
  }>;
  className?: string;
  onNavigate?: () => void;
}

export function MobileNav({ items, className, onNavigate }: MobileNavProps) {
  return (
    <nav className={cn("space-y-1 p-4", className)}>
      {items.map((item, index) => (
        <Button
          key={index}
          variant={item.variant === "active" ? "default" : "ghost"}
          className={cn(
            "w-full justify-start h-auto p-3",
            item.variant === "active" && "bg-university-navy text-white hover:bg-university-navy/90",
            item.variant === "secondary" && "text-muted-foreground"
          )}
          onClick={() => {
            if (item.onClick) {
              item.onClick();
            }
            if (onNavigate) {
              onNavigate();
            }
          }}
          asChild={!!item.href}
        >
          {item.href ? (
            <Link 
              to={item.href} 
              state={item.state}
              className="flex items-center space-x-3 w-full"
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span className="text-left">{item.label}</span>
            </Link>
          ) : (
            <div className="flex items-center space-x-3 w-full">
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span className="text-left">{item.label}</span>
            </div>
          )}
        </Button>
      ))}
    </nav>
  );
}
