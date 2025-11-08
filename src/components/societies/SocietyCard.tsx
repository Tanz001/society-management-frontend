import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, MapPin, Star, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

interface SocietyCardProps {
  society: {
    society_id?: number;
    id?: string;
    name: string;
    description: string;
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
  return (
    <Card className="overflow-hidden shadow-card hover:shadow-elegant transition-spring group cursor-pointer">
      <div className="aspect-video bg-gradient-secondary flex items-center justify-center text-university-navy font-bold text-2xl">
        {society.society_logo ? (
          <img 
            src={`http://localhost:5000/${society.society_logo.replace(/\\/g, '/')}`} 
            alt={society.name} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              // If image fails to load, show default icon
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`w-full h-full flex items-center justify-center ${society.society_logo ? 'hidden' : 'flex'}`}
          style={{ display: society.society_logo ? 'none' : 'flex' }}
        >
          <Building2 className="h-16 w-16 text-university-navy/60" />
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-university-navy group-hover:text-university-maroon transition-smooth">
              {society.name}
            </h3>
            <Badge variant="secondary" className="mt-1 text-xs capitalize">
              {society.category}
            </Badge>
          </div>
          <div className="flex items-center space-x-1 text-sm text-university-gold">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{society.events?.length || 0} events</span>
          </div>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
          {society.description}
        </p>

        {society.achievements && society.achievements.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {society.achievements.slice(0, 3).map((achievement, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {achievement}
              </Badge>
            ))}
            {society.achievements.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{society.achievements.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>Advisor: {society.advisor}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{society.events?.length || 0} events</span>
            </div>
          </div>
          {society.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span className="text-xs">{society.location}</span>
            </div>
          )}
        </div>

        <div className="flex space-x-2 pt-2">
          <Button 
            variant="university" 
            size="sm" 
            asChild 
            className="flex-1"
            onClick={() => {
              const societyId = society.society_id || society.id;
              console.log("Navigating to society detail page with ID:", societyId);
              console.log("Society data:", society);
            }}
          >
            <Link to={`/society/${society.society_id || society.id}`}>View Details</Link>
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Join Society
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SocietyCard;