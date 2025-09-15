import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface SocietyCardProps {
  society: {
    id: string;
    name: string;
    description: string;
    category: string;
    memberCount: number;
    rating: number;
    location?: string;
    image?: string;
    upcomingEvents: number;
    tags: string[];
  };
}

const SocietyCard = ({ society }: SocietyCardProps) => {
  return (
    <Card className="overflow-hidden shadow-card hover:shadow-elegant transition-spring group cursor-pointer">
      <div className="aspect-video bg-gradient-secondary flex items-center justify-center text-university-navy font-bold text-2xl">
        {society.image ? (
          <img src={society.image} alt={society.name} className="w-full h-full object-cover" />
        ) : (
          society.name.charAt(0).toUpperCase()
        )}
      </div>
      
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-university-navy group-hover:text-university-maroon transition-smooth">
              {society.name}
            </h3>
            <Badge variant="secondary" className="mt-1 text-xs">
              {society.category}
            </Badge>
          </div>
          <div className="flex items-center space-x-1 text-sm text-university-gold">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-medium">{society.rating}</span>
          </div>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
          {society.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {society.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {society.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{society.tags.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{society.memberCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{society.upcomingEvents} events</span>
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
          <Button variant="university" size="sm" asChild className="flex-1">
            <Link to={`/society/${society.id}`}>View Details</Link>
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