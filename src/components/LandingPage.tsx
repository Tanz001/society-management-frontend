import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Users, Settings, BookOpen, Calendar, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const userRoles = [
    {
      title: "Student",
      description: "Discover and join societies that match your interests",
      icon: GraduationCap,
      features: ["Explore Societies", "Join Communities", "Attend Events", "Engage with Posts"],
      path: "/auth/student",
      variant: "university" as const,
    },
    {
      title: "Society Owner", 
      description: "Manage your society and build a thriving community",
      icon: Users,
      features: ["Manage Portfolio", "Create Events", "Post Updates", "Track Analytics"],
      path: "/auth/society",
      variant: "gold" as const,
    },
    {
      title: "Administrator",
      description: "Oversee the platform and ensure quality standards",
      icon: Settings,
      features: ["Approve Societies", "Manage Users", "Moderate Content", "View Reports"],
      path: "/auth/admin", 
      variant: "maroon" as const,
    }
  ];

  const stats = [
    { number: "150+", label: "Active Societies", icon: Users },
    { number: "5,000+", label: "Student Members", icon: GraduationCap },
    { number: "300+", label: "Monthly Events", icon: Calendar },
    { number: "95%", label: "Satisfaction Rate", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="gradient-hero py-24 px-4 text-center text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center mb-8">
            <BookOpen className="h-16 w-16 mr-4" />
            <h1 className="text-5xl font-bold">University Societies</h1>
          </div>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Connect, engage, and thrive in your university community. 
            Discover societies, attend events, and build lasting relationships.
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/explore">Explore Societies</Link>
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-university-gold" />
                <div className="text-3xl font-bold text-university-navy mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-university-navy">Choose Your Journey</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select your role to access features tailored to your university experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {userRoles.map((role, index) => (
              <Card key={index} className="p-8 shadow-card hover:shadow-elegant transition-spring cursor-pointer group">
                <div className="text-center">
                  <div className="mb-6">
                    <role.icon className="h-16 w-16 mx-auto text-university-navy group-hover:text-university-gold transition-smooth" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-university-navy">{role.title}</h3>
                  <p className="text-muted-foreground mb-6">{role.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {role.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center justify-center text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-university-gold rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button variant={role.variant} size="lg" asChild className="w-full">
                    <Link to={role.path}>Get Started</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-university-navy text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 mr-3" />
            <span className="text-xl font-semibold">University Societies Platform</span>
          </div>
          <p className="text-white/70">
            Empowering student communities since 2024
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;