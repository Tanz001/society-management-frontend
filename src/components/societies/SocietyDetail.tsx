import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Calendar, 
  MapPin, 
  Star, 
  BookOpen, 
  Award, 
  Heart,
  ArrowLeft,
  MessageSquare,
  Image as ImageIcon,
  Video,
  FileText,
  BarChart3,
  Eye,
  Clock,
  User,
  ThumbsUp,
  Download,
  Loader2,
  Share2,
  Search,
  TrendingUp
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

const SocietyDetail = () => {
  const { id } = useParams();
  const [society, setSociety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [likedPosts, setLikedPosts] = useState({}); // Track liked posts
  const [hasMembershipRequest, setHasMembershipRequest] = useState(false);
  const [checkingMembership, setCheckingMembership] = useState(true);
  // Comment functionality temporarily disabled
  // const [commentingOn, setCommentingOn] = useState(null);
  // const [newComment, setNewComment] = useState("");
  // const [submittingComment, setSubmittingComment] = useState(false);
  const [likingPost, setLikingPost] = useState(null); // Track which post is being liked
  const [activeTab, setActiveTab] = useState("posts"); // Tab state for posts/about/events
  const [postSearchQuery, setPostSearchQuery] = useState(""); // Search filter for posts
  // const [comments, setComments] = useState({});

  // Helper function to safely parse JSON or comma-separated strings
  const parseStringOrArray = (data) => {
    if (!data) return [];
    
    try {
      // If it's already an array, return it
      if (Array.isArray(data)) return data;
      
      // If it's a string that starts with [, try to parse as JSON
      if (typeof data === 'string' && data.startsWith('[')) {
        return JSON.parse(data);
      }
      
      // If it's a string with commas, split it
      if (typeof data === 'string' && data.includes(',')) {
        return data.split(',').map(item => item.trim()).filter(item => item.length > 0);
      }
      
      // If it's a single string, return as array with one item
      if (typeof data === 'string') {
        return [data.trim()];
      }
      
      return [];
    } catch (error) {
      // Fallback: treat as comma-separated string
      if (typeof data === 'string') {
        return data.split(',').map(item => item.trim()).filter(item => item.length > 0);
      }
      return [];
    }
  };

  // Handle poll voting
  const handlePollVote = async (postId, optionId, pollId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/poll/vote`,
        {
          option_id: optionId,
          poll_id: pollId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Refresh the post to get updated vote counts
        if (society?.society_id) {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          const userId = user.id || user.user_id;
          fetchSocietyPosts(society.society_id, userId);
        }
      }
    } catch (error) {
      console.error('Error voting on poll:', error);
    }
  };

  // Fetch poll details for a post
  const fetchPollDetails = async (pollId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return null;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/poll/${pollId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (response.data.success) {
        return response.data.poll;
      }
      return null;
    } catch (error) {
      console.error('Error fetching poll details:', error);
      return null;
    }
  };

  // Handle like/unlike functionality
  const handleLike = async (postId) => {
    if (likingPost === postId) return; // Prevent multiple clicks
    
    try {
      setLikingPost(postId);
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/like/toggle`, {
        post_id: postId
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Update the post's like count and user's like status
        setPosts(prev => prev.map(post => 
          post.post_id === postId 
            ? { 
                ...post, 
                like_count: response.data.like_count,
                is_liked_by_user: response.data.is_liked_by_user 
              }
            : post
        ));

        // Update liked posts state
        setLikedPosts(prev => ({
          ...prev,
          [postId]: response.data.is_liked_by_user
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // You could add a toast notification here
    } finally {
      setLikingPost(null);
    }
  };


  // Comment functionality temporarily disabled
  // const handleComment = async (postId) => {
  //   if (!newComment.trim() || submittingComment) return;
  //   
  //   try {
  //     setSubmittingComment(true);
  //     
  //     const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/comment/add`, {
  //       post_id: postId,
  //       comment_text: newComment.trim()
  //     }, {
  //       headers: {
  //         'Authorization': `Bearer ${localStorage.getItem('token')}`,
  //         'Content-Type': 'application/json'
  //       }
  //     });
  //
  //     if (response.data.success) {
  //       // Update the post's comment count
  //       setPosts(prev => prev.map(post => 
  //         post.post_id === postId 
  //           ? { ...post, comment_count: response.data.comment_count }
  //           : post
  //       ));
  //
  //       // Add the new comment to the comments list
  //       if (response.data.new_comment) {
  //         setComments(prev => ({
  //           ...prev,
  //           [postId]: [response.data.new_comment, ...(prev[postId] || [])]
  //         }));
  //       }
  //
  //       // Clear comment but keep modal open to show the new comment
  //       setNewComment("");
  //     }
  //   } catch (error) {
  //     console.error('Error adding comment:', error);
  //     // You could add a toast notification here
  //   } finally {
  //     setSubmittingComment(false);
  //   }
  // };

  // const handleOpenComments = (postId) => {
  //   setCommentingOn(postId);
  //   // Comments are already loaded from the posts data, no need to fetch
  // };

  // Fetch posts for the society
  const fetchSocietyPosts = async (societyId, userId = null) => {
    try {
      setLoadingPosts(true);
      setPostsError(null);
      
      console.log("SocietyDetail: Fetching posts for society ID:", societyId);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Get user ID from localStorage if not provided
      if (!userId) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        userId = user.id || user.user_id;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/society/posts`,
        { society_id: societyId, user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Posts fetched:", response.data);
      if (response.data.success) {
        const postsData = response.data.posts || response.data.data || [];
        setPosts(postsData);
        
        // Initialize comments state from post data
        // const commentsState = {};
        const likedPostsState = {};
        
        postsData.forEach(post => {
          // if (post.comments && post.comments.length > 0) {
          //   commentsState[post.post_id] = post.comments;
          // }
          if (post.is_liked_by_user !== undefined) {
            likedPostsState[post.post_id] = post.is_liked_by_user;
          }
        });
        
        // setComments(commentsState);
        setLikedPosts(likedPostsState);
      } else {
        setPostsError(response.data.message || "Failed to fetch posts");
        setPosts([]);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setPostsError(err.response?.data?.message || err.message || "Failed to fetch posts");
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Check if user has existing membership request
  const checkMembershipRequest = async (societyId) => {
    try {
      setCheckingMembership(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || user.user_id;
      const rollno = user.RollNO || user.rollno || user.ROLNO;

      if (!userId && !rollno) return;

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/membership/requests`,
        { user_id: userId, rollno: rollno },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && response.data.requests) {
        const hasRequest = response.data.requests.some(
          (req) => req.society_id === parseInt(societyId)
        );
        setHasMembershipRequest(hasRequest);
      }
    } catch (err) {
      console.error("Error checking membership request:", err);
    } finally {
      setCheckingMembership(false);
    }
  };

  // Fetch society data from API
  useEffect(() => {
    const fetchSociety = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("SocietyDetail: Fetching society with ID:", id);
        
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/societies/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Society data fetched:", response.data);
        // Handle the nested data structure from your API
        const societyData = response.data.data || response.data.society || response.data;
        setSociety(societyData);
        
        // Fetch posts after society data is loaded
        if (societyData && societyData.society_id) {
          fetchSocietyPosts(societyData.society_id);
          checkMembershipRequest(societyData.society_id);
        }
      } catch (err) {
        console.error("Error fetching society:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch society details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSociety();
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-university-navy mx-auto mb-4"></div>
          <p className="text-lg">Loading society details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-university-navy mb-4">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button asChild className="bg-university-navy hover:bg-university-navy/90">
            <Link to="/dashboard/student">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // No society found
  if (!society) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-university-navy mb-4">Society Not Found</h2>
          <p className="text-muted-foreground mb-4">The society you're looking for doesn't exist.</p>
          <Button asChild className="bg-university-navy hover:bg-university-navy/90">
            <Link to="/dashboard/student">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const coverPhotoUrl = society.cover_photo 
    ? `${import.meta.env.VITE_API_URL}/${society.cover_photo.replace(/\\/g, '/')}`
    : null;
  const logoUrl = society.society_logo 
    ? `${import.meta.env.VITE_API_URL}/${society.society_logo.replace(/\\/g, '/')}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Cover Photo */}
      <section className="relative">
        {/* Cover Photo */}
        {coverPhotoUrl ? (
          <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden">
            <img 
              src={coverPhotoUrl}
              alt={`${society.name} cover`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          </div>
        ) : (
          <div className="h-64 md:h-80 lg:h-96 w-full bg-gradient-to-br from-university-navy via-university-navy/90 to-university-maroon"></div>
        )}
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto max-w-6xl px-4 pb-8">
            <div className="flex items-center mb-6">
              <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/20 border border-white/30 bg-black/20 backdrop-blur-sm">
                <Link to="/dashboard/student">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Logo */}
              {logoUrl && (
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white flex-shrink-0">
                    <img 
                      src={logoUrl}
                      alt={society.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
              
              {/* Society Info */}
              <div className="flex-1 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm capitalize">
                    {society.category}
                  </Badge>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">
                  {society.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm md:text-base mb-6">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <MapPin className="h-4 w-4" />
                    <span>{society.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <User className="h-4 w-4" />
                    <span>{society.advisor}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(society.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {!checkingMembership && !hasMembershipRequest && (
                    <Button variant="university" size="lg" className="shadow-xl hover:shadow-2xl transition-all" asChild>
                      <Link to={`/membership/register/${id}`}>
                        <Users className="h-5 w-5 mr-2" />
                        Join Society
                      </Link>
                    </Button>
                  )}
                  {hasMembershipRequest && (
                    <div className="inline-flex items-center px-4 py-2 bg-blue-500/90 backdrop-blur-sm border border-blue-300 rounded-lg text-white text-sm shadow-lg">
                      <Clock className="h-4 w-4 mr-2" />
                      Membership request already submitted
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: society.name,
                          text: society.description,
                          url: window.location.href
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        // You could add a toast notification here
                      }
                    }}
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 px-4 bg-gray-50/50">
        <div className="container mx-auto max-w-6xl grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Description Section */}
            <Card className="p-6 md:p-8 shadow-lg border-0 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                <div className="p-2 bg-university-navy/10 rounded-lg">
                  <FileText className="h-6 w-6 text-university-navy" />
                </div>
                <h2 className="text-2xl font-bold ml-3 text-university-navy">About</h2>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed text-base">
                  {society.description || "No description has been provided yet."}
                </p>
              </div>
            </Card>

            {/* Purpose Section */}
            <Card className="p-6 md:p-8 shadow-lg border-0 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                <div className="p-2 bg-university-gold/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-university-gold" />
                </div>
                <h2 className="text-2xl font-bold ml-3 text-university-navy">Our Purpose</h2>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed text-base">
                  {society.purpose || "Purpose details coming soon."}
                </p>
              </div>
            </Card>

            {/* Achievements */}
            {society.achievements && society.achievements.length > 0 && (
            <Card className="p-6 md:p-8 shadow-lg border-0 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold ml-3 text-university-navy">Achievements</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {society.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-university-gold/5 to-transparent rounded-lg border-l-4 border-university-gold hover:shadow-md transition-shadow">
                    <Star className="h-5 w-5 text-university-gold mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 leading-relaxed">{achievement}</span>
                  </div>
                ))}
              </div>
            </Card>
            )}

            {/* Posts Section */}
            <Card className="p-6 md:p-8 shadow-lg border-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4 border-b border-gray-200 gap-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold ml-3 text-university-navy">Recent Posts</h2>
                </div>
                {posts.length > 0 && (
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search posts..."
                      value={postSearchQuery}
                      onChange={(e) => setPostSearchQuery(e.target.value)}
                      className="pl-10 w-full md:w-64"
                    />
                  </div>
                )}
              </div>
              
              {loadingPosts ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading posts...</p>
                </div>
              ) : postsError ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{postsError}</p>
                  <Button 
                    variant="outline" 
                    onClick={() => society?.society_id && fetchSocietyPosts(society.society_id)}
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-university-navy mb-2">No Posts Yet</h3>
                  <p className="text-muted-foreground">
                    This society hasn't posted anything yet. Check back later!
                  </p>
                </div>
              ) : (() => {
                const filteredPosts = posts.filter(post => {
                  if (!postSearchQuery) return true;
                  const query = postSearchQuery.toLowerCase();
                  return (
                    post.title?.toLowerCase().includes(query) ||
                    post.content?.toLowerCase().includes(query) ||
                    post.advisor_name?.toLowerCase().includes(query) ||
                    post.author_name?.toLowerCase().includes(query)
                  );
                });

                if (filteredPosts.length === 0 && postSearchQuery) {
                  return (
                    <div className="text-center py-12">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-university-navy mb-2">No Posts Found</h3>
                      <p className="text-muted-foreground">
                        No posts match your search query "{postSearchQuery}". Try a different search term.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    {filteredPosts.map((post) => (
                    <div key={post.post_id} className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 hover:shadow-lg transition-all duration-300 hover:border-university-navy/30">
                      {/* Post Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-br from-university-navy to-university-maroon text-white rounded-full w-12 h-12 flex items-center justify-center font-semibold text-sm shadow-md">
                            {(post.advisor_name || post.author_name) ? (post.advisor_name || post.author_name).charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-university-navy">
                                {post.advisor_name || post.author_name || 'Anonymous'}
                              </h4>
                              {post.advisor_name && (
                                <Badge variant="secondary" className="text-xs bg-university-gold/20 text-university-gold border-university-gold/30">
                                  Advisor
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(post.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                              <Badge variant="outline" className="text-xs capitalize">
                                {post.post_type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="mb-5">
                        <h3 className="font-bold text-xl mb-3 text-university-navy">{post.title}</h3>
                        
                        {/* Post Type Specific Content */}
                        {post.post_type === 'text' && (
                          <p className="text-muted-foreground leading-relaxed">{post.content}</p>
                        )}

                        {post.post_type === 'photo' && (
                          <div className="space-y-4">
                            {post.content && (
                              <p className="text-gray-700 leading-relaxed">{post.content}</p>
                            )}
                            {post.media_files && post.media_files.length > 0 && (
                              <div className={`grid gap-4 ${post.media_files.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                                {post.media_files.map((file, index) => {
                                  // Handle different URL formats
                                  let imageUrl = file.file_url;
                                  if (file.file_url && !file.file_url.startsWith('http')) {
                                    // Convert Windows path to URL format
                                    imageUrl = `${import.meta.env.VITE_API_URL}/${file.file_url.replace(/\\/g, '/').replace(/^.*?\/assets\//, 'assets/')}`;
                                  }
                                  
                                  return (
                                    <div key={file.media_id} className="relative group overflow-hidden rounded-xl border-2 border-gray-200 hover:border-university-navy/50 transition-all duration-300">
                                      <img 
                                        src={imageUrl}
                                        alt={`Post image ${index + 1}`}
                                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                                        onError={(e) => {
                                          console.error('Image failed to load:', imageUrl);
                                          e.currentTarget.style.display = 'none';
                                        }}
                                        onLoad={() => {
                                          console.log('Image loaded successfully:', imageUrl);
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-xl flex items-center justify-center">
                                        <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {post.post_type === 'video' && (
                          <div className="space-y-3">
                            <p className="text-muted-foreground leading-relaxed">{post.content}</p>
                            {post.media_files && post.media_files.length > 0 && (
                              <div className="space-y-3">
                                {post.media_files.map((file, index) => {
                                  // Handle different URL formats
                                  let videoUrl = file.file_url;
                                  if (file.file_url && !file.file_url.startsWith('http')) {
                                    // Convert Windows path to URL format
                                    videoUrl = `${import.meta.env.VITE_API_URL}/${file.file_url.replace(/\\/g, '/').replace(/^.*?\/assets\//, 'assets/')}`;
                                  }
                                  
                                  return (
                                    <div key={file.media_id} className="relative">
                                      <video 
                                        src={videoUrl}
                                        controls
                                        className="w-full max-w-md rounded-lg border"
                                        onError={(e) => {
                                          console.error('Video failed to load:', videoUrl);
                                        }}
                                        onLoadStart={() => {
                                          console.log('Video loading started:', videoUrl);
                                        }}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {post.post_type === 'document' && (
                          <div className="space-y-3">
                            <p className="text-muted-foreground leading-relaxed">{post.content}</p>
                            {post.media_files && post.media_files.length > 0 && (
                              <div className="space-y-2">
                                {post.media_files.map((file, index) => {
                                  // Handle different URL formats
                                  let fileUrl = file.file_url;
                                  if (file.file_url && !file.file_url.startsWith('http')) {
                                    // Convert Windows path to URL format
                                    fileUrl = `${import.meta.env.VITE_API_URL}/${file.file_url.replace(/\\/g, '/').replace(/^.*?\/assets\//, 'assets/')}`;
                                  }
                                  
                                  return (
                                    <div key={file.media_id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                      <FileText className="h-5 w-5 text-university-navy" />
                                      <span className="flex-1 text-sm text-muted-foreground truncate">
                                        {file.file_url.split('/').pop()}
                                      </span>
                                      <Button size="sm" variant="outline" asChild>
                                        <a 
                                          href={fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <Download className="h-3 w-3 mr-1" />
                                          Download
                                        </a>
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {post.post_type === 'poll' && post.poll_data && (
                          <div className="space-y-3">
                            <p className="text-muted-foreground leading-relaxed font-medium">{post.poll_data.question || post.content}</p>
                            {post.poll_data.options && post.poll_data.options.length > 0 && (() => {
                              const totalVotes = post.poll_data.options.reduce((sum, option) => sum + (option.vote_count || 0), 0);
                              const pollId = post.poll_data.poll_id || post.poll_id;
                              
                              return (
                                <div className="space-y-3">
                                  {post.poll_data.options.map((option) => {
                                    const percentage = totalVotes > 0 ? ((option.vote_count || 0) / totalVotes) * 100 : 0;
                                    const isVoted = option.user_voted || false;
                                    
                                    return (
                                      <div 
                                        key={option.option_id} 
                                        className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all duration-200 hover:bg-gray-50 ${
                                          isVoted ? 'border-university-navy bg-university-navy/5' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => handlePollVote(post.post_id, option.option_id, pollId)}
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <span className={`font-medium ${isVoted ? 'text-university-navy' : 'text-gray-900'}`}>
                                            {option.option_text}
                                          </span>
                                          <div className="flex items-center space-x-2">
                                            <span className="text-sm text-muted-foreground">
                                              {option.vote_count || 0} {option.vote_count === 1 ? 'vote' : 'votes'}
                                            </span>
                                            {isVoted && (
                                              <div className="w-2 h-2 bg-university-navy rounded-full"></div>
                                            )}
                                          </div>
                                        </div>
                                        <div className="relative">
                                          <Progress 
                                            value={percentage} 
                                            className={`h-2 ${isVoted ? '[&>div]:bg-university-navy' : '[&>div]:bg-gray-300'}`} 
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                    <div className="flex items-center space-x-2">
                                      <BarChart3 className="h-3 w-3" />
                                      <span>{totalVotes} {totalVotes === 1 ? 'total vote' : 'total votes'}</span>
                                    </div>
                                    <span>{post.poll_data.options.length} {post.poll_data.options.length === 1 ? 'option' : 'options'}</span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>

                      {/* Post Tags */}
                      {post.tags && (() => {
                        const tagsArray = parseStringOrArray(post.tags);
                        return tagsArray.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {tagsArray.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        );
                      })()}

                      {/* Post Actions */}
                      <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`${post.is_liked_by_user === true || likedPosts[post.post_id] === true
                            ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100' 
                            : 'text-muted-foreground hover:text-university-navy hover:bg-university-navy/5'
                          } rounded-full px-4 transition-all`}
                          onClick={() => handleLike(post.post_id)}
                          disabled={likingPost === post.post_id}
                        >
                          {likingPost === post.post_id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : post.is_liked_by_user === true || likedPosts[post.post_id] === true ? (
                            <Heart className="h-4 w-4 mr-2 fill-current" />
                          ) : (
                            <ThumbsUp className="h-4 w-4 mr-2" />
                          )}
                          <span className="font-medium">{post.like_count || 0}</span>
                        </Button>
                        
                        {/*
                        <Dialog open={commentingOn === post.post_id} onOpenChange={(open) => {
                          if (!open) {
                            setCommentingOn(null);
                            setNewComment("");
                          } else {
                            handleOpenComments(post.post_id);
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-muted-foreground hover:text-university-navy hover:bg-university-navy/5"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Comment ({post.comment_count || 0})
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
                            <DialogHeader>
                              <DialogTitle>Comments ({post.comment_count || 0})</DialogTitle>
                              <DialogDescription>
                                Share your thoughts and see what others are saying.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                              {comments[post.post_id] && comments[post.post_id].length > 0 ? (
                                comments[post.post_id].map((comment) => (
                                  <div key={comment.id || comment.comment_id} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-university-navy text-white text-xs">
                                        {comment.author ? comment.author.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-medium text-sm text-university-navy">
                                          {comment.author || comment.commenter_name || 'Anonymous'}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {comment.created_at ? new Date(comment.created_at).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          }) : ''}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-900 leading-relaxed">
                                        {comment.text || comment.comment_text}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                  <p>No comments yet. Be the first to comment!</p>
                                </div>
                              )}
                            </div>

                            <div className="border-t pt-4">
                              <div className="space-y-3">
                                <Textarea
                                  placeholder="Write your comment..."
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  className="min-h-[80px] resize-none"
                                />
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-muted-foreground">
                                    {newComment.length}/500 characters
                                  </span>
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="outline" 
                                      onClick={() => {
                                        setCommentingOn(null);
                                        setNewComment("");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      onClick={() => handleComment(post.post_id)}
                                      disabled={!newComment.trim() || submittingComment || newComment.length > 500}
                                    >
                                      {submittingComment ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          Posting...
                                        </>
                                      ) : (
                                        <>
                                          <Send className="h-4 w-4 mr-2" />
                                          Post Comment
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        */}
                      </div>
                    </div>
                  ))}
                  </div>
                );
              })()}
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Society Info */}
            <Card className="p-6 shadow-lg border-0 sticky top-6">
              <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                <div className="p-2 bg-university-navy/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-university-navy" />
                </div>
                <h3 className="font-bold ml-3 text-university-navy">Society Information</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-university-gold/10 text-university-gold border-university-gold/30 text-xs">Category</Badge>
                  </div>
                  <span className="font-semibold text-right capitalize">{society.category}</span>
                </div>
                <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Advisor</span>
                  </div>
                  <span className="font-semibold text-right">{society.advisor}</span>
                </div>
                <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">Location</span>
                  </div>
                  <span className="font-semibold text-right">{society.location}</span>
                </div>
                <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Created</span>
                  </div>
                  <span className="font-semibold text-right">{new Date(society.created_at).toLocaleDateString()}</span>
                </div>
                {society.submitted_by && (
                  <div className="flex items-start justify-between py-2">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span className="text-sm">Submitted by</span>
                    </div>
                    <span className="font-semibold text-right">{society.submitted_by}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Events */}
            {society.events && society.events.length > 0 && (
            <Card className="p-6 shadow-lg border-0">
              <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-bold ml-3 text-university-navy">Upcoming Events</h3>
              </div>
              <div className="space-y-4">
                  {society.events.map((event, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-university-gold/5 to-transparent rounded-lg border-l-4 border-university-gold hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-sm mb-2 text-university-navy">{event.title}</h4>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(event.event_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                        {event.description}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SocietyDetail;