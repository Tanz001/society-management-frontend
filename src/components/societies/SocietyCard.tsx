import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";

interface SocietyCardProps {
  society: {
    society_id?: number;
    id?: string;
    name: string;
    description?: string;
    category: string;
    location?: string;
    society_logo?: string;
    cover_photo?: string;
    advisor?: string;
    created_at?: string;
    submitted_by?: string;
    achievements?: string[];
    events?: Array<{
      id: number;
      title: string;
      event_date: string;
      description: string;
    }>;
  };
}

const SocietyCard = ({ society }: SocietyCardProps) => {
  const societyId = society.society_id || society.id;
  const logoUrl = society.society_logo 
    ? `${import.meta.env.VITE_API_URL}/${society.society_logo.replace(/\\/g, '/')}`
    : null;

  return (
    <Card className="overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 group cursor-pointer border border-gray-200 hover:border-university-navy">
      <div className="p-4 flex flex-col items-center text-center space-y-2">
        {/* Circular Logo */}
        <div className="relative w-16 h-16 rounded-full bg-gradient-secondary flex items-center justify-center overflow-hidden border-2 border-university-navy/10 group-hover:border-university-navy/30 transition-all">
          {logoUrl ? (
            <img 
              src={logoUrl}
              alt={society.name} 
              className="w-full h-full object-cover rounded-full" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`w-full h-full flex items-center justify-center rounded-full ${logoUrl ? 'hidden' : 'flex'}`}
            style={{ display: logoUrl ? 'none' : 'flex' }}
          >
            <Building2 className="h-8 w-8 text-university-navy/60" />
          </div>
        </div>
        
        {/* Society Name */}
        <div className="space-y-1 w-full">
          <h3 className="text-sm font-semibold text-university-navy group-hover:text-university-maroon transition-colors line-clamp-2">
            {society.name}
          </h3>
          
          {/* Category Badge */}
          <Badge variant="secondary" className="text-xs capitalize bg-university-gold/10 text-university-gold border-university-gold/20">
            {society.category}
          </Badge>
        </div>

        {/* View Details Button */}
        <Button 
          variant="university" 
          size="sm" 
          asChild 
          className="w-full mt-1 text-xs h-8"
        >
          <Link to={`/society/${societyId}`}>
            View Details
          </Link>
        </Button>
      </div>
    </Card>
  );
};

export default SocietyCard;