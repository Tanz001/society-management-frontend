import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Calendar, 
  MapPin, 
  Star, 
  BookOpen, 
  Award, 
  Heart,
  Share2,
  ArrowLeft 
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

const SocietyDetail = () => {
  const { id } = useParams();

  // Mock data - in a real app, this would be fetched based on the ID
  const society = {
    id: "1",
    name: "Computer Science Society",
    description: "A vibrant community for computer science students to learn, collaborate, and innovate together. We organize coding workshops, tech talks, hackathons, and networking events with industry professionals.",
    fullDescription: `The Computer Science Society is the premier organization for students passionate about technology, programming, and innovation. Since our founding in 2015, we have grown to become one of the most active societies on campus with over 245 members.

Our mission is to bridge the gap between academic learning and real-world application of computer science concepts. We provide a supportive environment where students can enhance their technical skills, build professional networks, and work on exciting projects that make a difference.

Whether you're a beginner learning your first programming language or an advanced student working on complex algorithms, there's a place for you in our society. Join us and be part of a community that's shaping the future of technology.`,
    category: "Academic",
    memberCount: 245,
    rating: 4.8,
    location: "Engineering Building - Room 204",
    founded: "2015",
    advisor: "Dr. Sarah Thompson",
    tags: ["Programming", "AI", "Web Development", "Networking", "Hackathons", "Workshops"],
    achievements: [
      "Winner of Inter-University Hackathon 2024",
      "Organized 15+ successful workshops this year",
      "Partnered with 8 tech companies for internships",
      "98% member satisfaction rate"
    ],
    upcomingEvents: [
      {
        title: "JavaScript Workshop Series",
        date: "2024-03-20",
        time: "6:00 PM",
        location: "Engineering Lab 3",
        attendees: 45
      },
      {
        title: "AI & Machine Learning Seminar",
        date: "2024-03-25", 
        time: "5:30 PM",
        location: "Auditorium A",
        attendees: 78
      },
      {
        title: "Spring Hackathon 2024",
        date: "2024-04-10",
        time: "9:00 AM",
        location: "Student Center",
        attendees: 120
      }
    ],
    recentPosts: [
      {
        title: "Welcome New Members!",
        content: "We're excited to welcome 23 new members to our society this semester...",
        author: "Alex Chen",
        timestamp: "2 days ago",
        likes: 34
      },
      {
        title: "Hackathon Registration Open",
        content: "Registration is now open for our Spring Hackathon. Limited spots available...",
        author: "Sarah Kim",
        timestamp: "5 days ago",
        likes: 67
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="gradient-primary text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/20 mr-4">
              <Link to="/dashboard/student">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Badge variant="secondary" className="mb-2 bg-white/20 text-white">
                  {society.category}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4">{society.name}</h1>
              <p className="text-xl text-white/90 leading-relaxed">
                {society.description}
              </p>
              
              <div className="flex items-center space-x-6 mt-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>{society.memberCount} members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 fill-current text-university-gold" />
                  <span>{society.rating}/5.0</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>{society.location}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button variant="university" size="lg" className="w-full">
                <Users className="h-5 w-5 mr-2" />
                Join Society
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1 text-white border-white hover:bg-white/20">
                  <Heart className="h-4 w-4 mr-2" />
                  Follow
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-white border-white hover:bg-white/20">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* About Section */}
            <Card className="p-6 shadow-card">
              <h2 className="text-2xl font-semibold mb-4 text-university-navy flex items-center">
                <BookOpen className="h-6 w-6 mr-2" />
                About Us
              </h2>
              <div className="prose prose-gray max-w-none">
                {society.fullDescription.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              <div className="mt-6 flex flex-wrap gap-2">
                {society.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Achievements */}
            <Card className="p-6 shadow-card">
              <h2 className="text-2xl font-semibold mb-4 text-university-navy flex items-center">
                <Award className="h-6 w-6 mr-2" />
                Achievements
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {society.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-university-gold rounded-full mt-2"></div>
                    <span className="text-muted-foreground">{achievement}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Posts */}
            <Card className="p-6 shadow-card">
              <h2 className="text-2xl font-semibold mb-4 text-university-navy">Recent Posts</h2>
              <div className="space-y-4">
                {society.recentPosts.map((post, index) => (
                  <div key={index} className="border-l-4 border-university-gold pl-4">
                    <h3 className="font-medium text-university-navy">{post.title}</h3>
                    <p className="text-muted-foreground text-sm mb-2">{post.content}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>By {post.author} • {post.timestamp}</span>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{post.likes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Society Info */}
            <Card className="p-6 shadow-card">
              <h3 className="font-semibold mb-4 text-university-navy">Society Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Founded:</span>
                  <span className="font-medium">{society.founded}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Advisor:</span>
                  <span className="font-medium">{society.advisor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Members:</span>
                  <span className="font-medium">{society.memberCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{society.location}</span>
                </div>
              </div>
            </Card>

            {/* Upcoming Events */}
            <Card className="p-6 shadow-card">
              <h3 className="font-semibold mb-4 text-university-navy flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Events
              </h3>
              <div className="space-y-4">
                {society.upcomingEvents.map((event, index) => (
                  <div key={index} className="border-b border-border last:border-0 pb-3 last:pb-0">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <p className="text-xs text-muted-foreground mb-1">
                      {event.date} • {event.time}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      📍 {event.location}
                    </p>
                    <p className="text-xs text-university-gold">
                      {event.attendees} attending
                    </p>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                View All Events
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SocietyDetail;