import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Calendar, 
  MapPin, 
  Star, 
  BookOpen, 
  Award, 
  Heart,
  Share2,
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
  MessageCircle,
  Download,
  Send,
  Loader2
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
  const [pollVotes, setPollVotes] = useState({}); // Track poll votes
  const [likedPosts, setLikedPosts] = useState({}); // Track liked posts
  const [commentingOn, setCommentingOn] = useState(null); // Track which post is being commented on
  const [newComment, setNewComment] = useState(""); // New comment text
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likingPost, setLikingPost] = useState(null); // Track which post is being liked
  const [comments, setComments] = useState({}); // Store comments for each post

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
  const handlePollVote = (postId, optionIndex) => {
    setPollVotes(prev => ({
      ...prev,
      [postId]: optionIndex
    }));
    // Here you would typically send the vote to the backend
    console.log(`Voted for option ${optionIndex} in post ${postId}`);
  };

  // Handle like/unlike functionality
  const handleLike = async (postId) => {
    if (likingPost === postId) return; // Prevent multiple clicks
    
    try {
      setLikingPost(postId);
      
      const response = await axios.post('http://localhost:5000/user/like/toggle', {
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


  // Handle comment submission
  const handleComment = async (postId) => {
    if (!newComment.trim() || submittingComment) return;
    
    try {
      setSubmittingComment(true);
      
      const response = await axios.post('http://localhost:5000/user/comment/add', {
        post_id: postId,
        comment_text: newComment.trim()
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Update the post's comment count
        setPosts(prev => prev.map(post => 
          post.post_id === postId 
            ? { ...post, comment_count: response.data.comment_count }
            : post
        ));

        // Add the new comment to the comments list
        if (response.data.new_comment) {
          setComments(prev => ({
            ...prev,
            [postId]: [response.data.new_comment, ...(prev[postId] || [])]
          }));
        }

        // Clear comment but keep modal open to show the new comment
        setNewComment("");
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      // You could add a toast notification here
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle opening comment modal
  const handleOpenComments = (postId) => {
    setCommentingOn(postId);
    // Comments are already loaded from the posts data, no need to fetch
  };

  // Fetch posts for the society
  const fetchSocietyPosts = async (societyId) => {
    try {
      setLoadingPosts(true);
      setPostsError(null);
      
      console.log("SocietyDetail: Fetching posts for society ID:", societyId);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `http://localhost:5000/society/posts`,
        { society_id: societyId },
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
        const commentsState = {};
        const likedPostsState = {};
        
        postsData.forEach(post => {
          if (post.comments && post.comments.length > 0) {
            commentsState[post.post_id] = post.comments;
          }
          if (post.is_liked_by_user !== undefined) {
            likedPostsState[post.post_id] = post.is_liked_by_user;
          }
        });
        
        setComments(commentsState);
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

        const response = await axios.get(`http://localhost:5000/user/societies/${id}`, {
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
          <Button asChild>
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
          <Button asChild>
            <Link to="/dashboard/student">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

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
              <div className="flex items-center mb-2">
                <Badge variant="secondary" className="bg-white/20 text-white capitalize">
                  {society.category}
                </Badge>
              </div>
              
              {/* Society Name and Logo in Row */}
              <div className="flex items-center gap-4 mb-4">
                {society.society_logo && (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0">
                    <img 
                      src={`http://localhost:5000/${society.society_logo.replace(/\\/g, '/')}`} 
                      alt={society.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <h1 className="text-4xl font-bold">{society.name}</h1>
              </div>
              <p className="text-xl text-white/90 leading-relaxed">
                {society.description}
              </p>
              
              <div className="flex items-center space-x-6 mt-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>{society.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Advisor: {society.advisor}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Created: {new Date(society.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button variant="university" size="lg" className="w-full" asChild>
                <Link to={`/membership/register/${id}`}>
                <Users className="h-5 w-5 mr-2" />
                Join Society
                </Link>
              </Button>
              <div className="flex space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 text-white hover:bg-white/10 border border-white/20 rounded-lg px-4 py-2 transition-all duration-200 hover:border-white/40"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Follow
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 text-white hover:bg-white/10 border border-white/20 rounded-lg px-4 py-2 transition-all duration-200 hover:border-white/40"
                >
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
            {/* Purpose Section */}
            <Card className="p-6 shadow-card">
              <h2 className="text-2xl font-semibold mb-4 text-university-navy flex items-center">
                <BookOpen className="h-6 w-6 mr-2" />
                Society Purpose
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {society.purpose}
                </p>
              </div>
            </Card>

            {/* Achievements */}
            {society.achievements && society.achievements.length > 0 && (
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
            )}

            {/* Posts Section */}
            <Card className="p-6 shadow-card">
              <h2 className="text-2xl font-semibold mb-6 text-university-navy flex items-center">
                <MessageSquare className="h-6 w-6 mr-2" />
                Society Posts
              </h2>
              
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
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <div key={post.post_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      {/* Post Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-br from-university-navy to-university-navy/80 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold text-sm">
                            {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <h4 className="font-semibold text-university-navy">
                              {post.author_name || 'Anonymous'}
                            </h4>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(post.created_at).toLocaleDateString()}</span>
                              <Badge variant="outline" className="text-xs">
                                {post.post_type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="mb-4">
                        <h3 className="font-semibold text-lg mb-2 text-university-navy">{post.title}</h3>
                        
                        {/* Post Type Specific Content */}
                        {post.post_type === 'text' && (
                          <p className="text-muted-foreground leading-relaxed">{post.content}</p>
                        )}

                        {post.post_type === 'photo' && (
                          <div className="space-y-3">
                            <p className="text-muted-foreground leading-relaxed">{post.content}</p>
                            {post.media_files && post.media_files.length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {post.media_files.map((file, index) => {
                                  // Handle different URL formats
                                  let imageUrl = file.file_url;
                                  if (file.file_url && !file.file_url.startsWith('http')) {
                                    // Convert Windows path to URL format
                                    imageUrl = `http://localhost:5000/${file.file_url.replace(/\\/g, '/').replace(/^.*?\/assets\//, 'assets/')}`;
                                  }
                                  
                                  return (
                                    <div key={file.media_id} className="relative group">
                                      <img 
                                        src={imageUrl}
                                        alt={`Post image ${index + 1}`}
                                        className="w-full h-48 object-cover rounded-lg border"
                                        onError={(e) => {
                                          console.error('Image failed to load:', imageUrl);
                                          e.currentTarget.style.display = 'none';
                                        }}
                                        onLoad={() => {
                                          console.log('Image loaded successfully:', imageUrl);
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                        <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
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
                                    videoUrl = `http://localhost:5000/${file.file_url.replace(/\\/g, '/').replace(/^.*?\/assets\//, 'assets/')}`;
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
                                    fileUrl = `http://localhost:5000/${file.file_url.replace(/\\/g, '/').replace(/^.*?\/assets\//, 'assets/')}`;
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
                            <p className="text-muted-foreground leading-relaxed">{post.content}</p>
                            {post.poll_data.options && post.poll_data.options.length > 0 && (() => {
                              const userVote = pollVotes[post.post_id];
                              const totalVotes = post.poll_data.options.reduce((sum, option) => sum + option.vote_count, 0);
                              
                              return (
                                <div className="space-y-3">
                                  {post.poll_data.options.map((option, index) => {
                                    const percentage = totalVotes > 0 ? (option.vote_count / totalVotes) * 100 : 0;
                                    const isVoted = userVote === index;
                                    
                                    return (
                                      <div 
                                        key={option.option_id} 
                                        className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all duration-200 hover:bg-gray-50 ${
                                          isVoted ? 'border-university-navy bg-university-navy/5' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => handlePollVote(post.post_id, index)}
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <span className={`font-medium ${isVoted ? 'text-university-navy' : 'text-gray-900'}`}>
                                            {option.option_text}
                                          </span>
                                          <div className="flex items-center space-x-2">
                                            <span className="text-sm text-muted-foreground">
                                              {option.vote_count} votes
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
                                      <span>{totalVotes} total votes</span>
                                    </div>
                                    <span>{post.poll_data.options.length} options</span>
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
                      <div className="flex items-center space-x-6 pt-3 border-t border-gray-100">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`${post.is_liked_by_user === true || likedPosts[post.post_id] === true
                            ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100' 
                            : 'text-muted-foreground hover:text-university-navy hover:bg-university-navy/5'
                          }`}
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
                          Like ({post.like_count || 0})
                        </Button>
                        
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
                            
                            {/* Comments List */}
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

                            {/* Add Comment Section */}
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Society Info */}
            <Card className="p-6 shadow-card">
              <h3 className="font-semibold mb-4 text-university-navy">Society Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium capitalize">{society.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Advisor:</span>
                  <span className="font-medium">{society.advisor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{society.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{new Date(society.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted by:</span>
                  <span className="font-medium">{society.submitted_by}</span>
                </div>
              </div>
            </Card>

            {/* Events */}
            {society.events && society.events.length > 0 && (
            <Card className="p-6 shadow-card">
              <h3 className="font-semibold mb-4 text-university-navy flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                  Events
              </h3>
              <div className="space-y-4">
                  {society.events.map((event, index) => (
                  <div key={index} className="border-b border-border last:border-0 pb-3 last:pb-0">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <p className="text-xs text-muted-foreground mb-1">
                        📅 {new Date(event.event_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
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