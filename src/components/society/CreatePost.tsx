import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation, useNavigate } from "react-router-dom";
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
import axios from "axios";
import toast from "react-hot-toast";

const CreatePost = () => {
  const [postType, setPostType] = useState("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  console.log("userrr: ",userData)
  const societyId = location.state?.society_id;
  const societyName = location.state?.society_name;

  console.log("society id",societyId)
  const token = localStorage.getItem("token");

  const postTypes = [
    { id: "text", label: "Text Post", icon: Type },
    { id: "photo", label: "Photo Post", icon: Image },
    { id: "poll", label: "Poll", icon: BarChart },
    { id: "video", label: "Video Post", icon: Video },
    { id: "document", label: "Document", icon: FileText }
  ];

  const addPollOption = () => setPollOptions([...pollOptions, ""]);
  const updatePollOption = (index: number, value: string) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };
  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };
  const removeTag = (tagToRemove: string) => setTags(tags.filter(tag => tag !== tagToRemove));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please enter a post title");
      return;
    }
  
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("society_id", societyId);
      formData.append("society_name", societyName);
      formData.append("user_id", userData?.id);
      formData.append("title", title);
      formData.append("content", content);
      formData.append("post_type", postType);
      formData.append("tags", JSON.stringify(tags));
      formData.append("poll_options", JSON.stringify(pollOptions));
      formData.append("allow_multiple", allowMultiple ? "1" : "0");
      formData.append("is_anonymous", isAnonymous ? "1" : "0");
  
      if (files && files.length > 0) {
        Array.from(files).forEach((file) => formData.append("media", file));
      }
  
      const response = await axios.post(
        `http://localhost:5000/society/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      console.log("📦 Server Response:", response.data);
  
      // ✅ Check backend success flag
      if (response.data.success) {
        toast.success("✅ Post created successfully!");
        setTimeout(() => {
          navigate("/dashboard/society");  
        }, 1200);
      } else {
        toast.error(response.data.message || "Failed to create post");
      }
  
      // Reset form
      setTitle("");
      setContent("");
      setFiles(null);
      setTags([]);
      setPollOptions(["", ""]);
    } catch (error) {
      console.error("❌ Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setLoading(false);
    }
  };
  const renderPostTypeContent = () => {
    switch (postType) {
      case "text":
        return (
          <Textarea
            placeholder="Write your post..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-32"
          />
        );

      case "photo":
      case "video":
      case "document":
        return (
          <div className="space-y-4">
            <Card className="p-6 border-dashed border-2 border-muted-foreground/25 hover:border-university-gold transition-colors">
              <div className="text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">
                  Upload {postType === "photo" ? "Photos" : postType === "video" ? "Video" : "Documents"}
                </h3>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept={postType === "photo" ? "image/*" : postType === "video" ? "video/*" : ".pdf,.doc,.docx,.txt,.ppt,.pptx"}
                  className="block w-full text-sm text-gray-500 border border-gray-200 rounded-lg cursor-pointer focus:outline-none"
                />
              </div>
            </Card>
            <Textarea
              placeholder={`Add a ${postType === "video" ? "description" : "caption"}...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-24"
            />
          </div>
        );

      case "poll":
        return (
          <div className="space-y-4">
            <Input
              placeholder="Poll Question"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
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
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="multiple" checked={allowMultiple} onCheckedChange={(val) => setAllowMultiple(!!val)} />
                <label htmlFor="multiple" className="text-sm">Allow multiple selections</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="anonymous" checked={isAnonymous} onCheckedChange={(val) => setIsAnonymous(!!val)} />
                <label htmlFor="anonymous" className="text-sm">Anonymous voting</label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary text-white py-4 md:py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4">
              <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/20">
                <Link to="/dashboard/society">
                  <ArrowLeft className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Back</span>
                </Link>
              </Button>
              <div>
                <h1 className="text-lg md:text-2xl font-bold">Create New Post</h1>
                <p className="text-white/80 text-sm md:text-base hidden md:block">Share updates with your society members</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Post Type Sidebar */}
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
                            ? "border-university-navy bg-university-navy/5"
                            : "border-border hover:border-university-gold"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-5 w-5 ${
                            postType === type.id ? "text-university-navy" : "text-muted-foreground"
                          }`} />
                          <span className={`font-medium text-sm ${
                            postType === type.id ? "text-university-navy" : "text-foreground"
                          }`}>
                            {type.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Post Form */}
            <div className="lg:col-span-2">
              <Card className="p-6 shadow-card space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input placeholder="Enter a title..." value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                {renderPostTypeContent()}

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button variant="university" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Publishing..." : "Publish Post"}
                  </Button>
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
