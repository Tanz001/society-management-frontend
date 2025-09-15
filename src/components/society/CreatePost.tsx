import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  Type, 
  Image, 
  BarChart, 
  Video, 
  FileText, 
  Upload,
  Plus,
  X,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";

const CreatePost = () => {
  const [postType, setPostType] = useState("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const postTypes = [
    { id: "text", label: "Text Post", icon: Type, description: "Share thoughts and announcements" },
    { id: "photo", label: "Photo Post", icon: Image, description: "Share images with captions" },
    { id: "poll", label: "Poll", icon: BarChart, description: "Create polls for member voting" },
    { id: "video", label: "Video Post", icon: Video, description: "Share video content" },
    { id: "document", label: "Document", icon: FileText, description: "Share files and documents" }
  ];

  const addPollOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const updatePollOption = (index: number, value: string) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    // Handle post creation
    console.log({ postType, title, content, pollOptions, tags });
  };

  const renderPostTypeContent = () => {
    switch (postType) {
      case "text":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Post Content</label>
              <Textarea
                placeholder="What would you like to share with your members?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-32"
              />
            </div>
          </div>
        );

      case "photo":
        return (
          <div className="space-y-4">
            <Card className="p-6 border-dashed border-2 border-muted-foreground/25 hover:border-university-gold transition-colors">
              <div className="text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Upload Photos</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop images or click to browse
                </p>
                <Button variant="outline" size="sm">
                  Choose Files
                </Button>
              </div>
            </Card>
            <div>
              <label className="block text-sm font-medium mb-2">Caption</label>
              <Textarea
                placeholder="Add a caption to your photos..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-24"
              />
            </div>
          </div>
        );

      case "poll":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Poll Question</label>
              <Input
                placeholder="What would you like to ask your members?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Poll Options</label>
              <div className="space-y-2">
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updatePollOption(index, e.target.value)}
                    />
                    {pollOptions.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePollOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addPollOption}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="multiple" />
                <label htmlFor="multiple" className="text-sm">Allow multiple selections</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="anonymous" />
                <label htmlFor="anonymous" className="text-sm">Anonymous voting</label>
              </div>
            </div>
          </div>
        );

      case "video":
        return (
          <div className="space-y-4">
            <Card className="p-6 border-dashed border-2 border-muted-foreground/25 hover:border-university-gold transition-colors">
              <div className="text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Upload Video</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Support formats: MP4, AVI, MOV (Max 100MB)
                </p>
                <Button variant="outline" size="sm">
                  Choose Video
                </Button>
              </div>
            </Card>
            <div>
              <label className="block text-sm font-medium mb-2">Video Description</label>
              <Textarea
                placeholder="Describe your video..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-24"
              />
            </div>
          </div>
        );

      case "document":
        return (
          <div className="space-y-4">
            <Card className="p-6 border-dashed border-2 border-muted-foreground/25 hover:border-university-gold transition-colors">
              <div className="text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Upload Documents</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Support formats: PDF, DOC, DOCX, TXT, PPT, PPTX
                </p>
                <Button variant="outline" size="sm">
                  Choose Files
                </Button>
              </div>
            </Card>
            <div>
              <label className="block text-sm font-medium mb-2">Document Description</label>
              <Textarea
                placeholder="Provide context about the documents..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-24"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-white py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/20">
                <Link to="/dashboard/society">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Create New Post</h1>
                <p className="text-white/80">Share updates with your society members</p>
              </div>
            </div>
            <Button variant="hero" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>
      </header>

      {/* Create Post Content */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Post Type Selection */}
            <div className="lg:col-span-1">
              <Card className="p-6 shadow-card">
                <h3 className="font-semibold mb-4 text-university-navy">Post Type</h3>
                <div className="space-y-2">
                  {postTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setPostType(type.id)}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                          postType === type.id
                            ? 'border-university-navy bg-university-navy/5'
                            : 'border-border hover:border-university-gold'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-5 w-5 ${
                            postType === type.id ? 'text-university-navy' : 'text-muted-foreground'
                          }`} />
                          <div>
                            <div className={`font-medium text-sm ${
                              postType === type.id ? 'text-university-navy' : 'text-foreground'
                            }`}>
                              {type.label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {type.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Post Creation Form */}
            <div className="lg:col-span-2">
              <Card className="p-6 shadow-card">
                <div className="space-y-6">
                  {/* Post Title */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Post Title</label>
                    <Input
                      placeholder="Enter a compelling title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  {/* Dynamic Content Based on Post Type */}
                  {renderPostTypeContent()}

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="Add tags..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Post Settings */}
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-medium text-sm">Post Settings</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="comments" defaultChecked />
                        <label htmlFor="comments" className="text-sm">Allow comments</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="notifications" defaultChecked />
                        <label htmlFor="notifications" className="text-sm">Send notifications to members</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="featured" />
                        <label htmlFor="featured" className="text-sm">Pin this post</label>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between pt-4">
                    <Button variant="outline">Save Draft</Button>
                    <div className="space-x-2">
                      <Button variant="outline">Schedule Post</Button>
                      <Button variant="university" onClick={handleSubmit}>
                        Publish Post
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreatePost;