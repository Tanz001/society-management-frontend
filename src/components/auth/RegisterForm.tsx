import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterForm = () => {
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    rollNo: "",
    university: "",
    major: "",
    degree: "",
    semester: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStudentSubmit = async () => {
    setError("");

    // ✅ Password confirmation check
    if (studentData.password !== studentData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);

      // ✅ Remove confirmPassword before sending
      const payload = { ...studentData };
      delete payload.confirmPassword;

      const response = await axios.post(
        "http://localhost:5000/student/register",
        payload
      );

      console.log("✅ Student registered:", response.data);
      navigate("/auth/login");
    } catch (err) {
      console.error("❌ Registration error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const degreeLevels = ["Intermediate", "UnderGraduate", "Mphil", "PhD"];
  const semLevels = ["1", "2", "3", "4", "5", "6", "7", "8"];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-university-navy mb-2">
            Join Our University
          </h1>
          <p className="text-muted-foreground">
            Create your account to access societies and events
          </p>
        </div>

        <Card className="p-8 shadow-card">
          <form
            onSubmit={(e) => {
              e.preventDefault(); // prevent page reload
              handleStudentSubmit();
            }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <div className="bg-university-navy/10 p-4 rounded-full w-fit mx-auto mb-3">
                <User className="h-8 w-8 text-university-navy" />
              </div>
              <h2 className="text-xl font-semibold text-university-navy">
                Student Account
              </h2>
              <p className="text-sm text-muted-foreground">
                Join societies and participate in events
              </p>
            </div>

            {/* Inputs */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  First Name
                </label>
                <Input
                  placeholder="Enter your first name"
                  value={studentData.firstName}
                  onChange={(e) =>
                    setStudentData({ ...studentData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Last Name
                </label>
                <Input
                  placeholder="Enter your last name"
                  value={studentData.lastName}
                  onChange={(e) =>
                    setStudentData({ ...studentData, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="student@university.edu"
                value={studentData.email}
                onChange={(e) =>
                  setStudentData({ ...studentData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <Input
                  placeholder="+1 (555) 123-4567"
                  value={studentData.phone}
                  onChange={(e) =>
                    setStudentData({ ...studentData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Roll No
                </label>
                <Input
                  placeholder="0000-XX-0000"
                  value={studentData.rollNo}
                  onChange={(e) =>
                    setStudentData({ ...studentData, rollNo: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  University
                </label>
                <Input
                  placeholder="Government College University"
                  value={studentData.university}
                  onChange={(e) =>
                    setStudentData({
                      ...studentData,
                      university: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Major</label>
                <Input
                  placeholder="Computer Science"
                  value={studentData.major}
                  onChange={(e) =>
                    setStudentData({ ...studentData, major: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Degree Level
                </label>
                <select
                  className="w-full p-2 border rounded-md text-sm"
                  value={studentData.degree}
                  onChange={(e) =>
                    setStudentData({ ...studentData, degree: e.target.value })
                  }
                  required
                >
                  <option value="">Select year level</option>
                  {degreeLevels.map((degree) => (
                    <option key={degree} value={degree}>
                      {degree}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Semester
                </label>
                <select
                  className="w-full p-2 border rounded-md text-sm"
                  value={studentData.semester}
                  onChange={(e) =>
                    setStudentData({
                      ...studentData,
                      semester: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select Semester</option>
                  {semLevels.map((semester) => (
                    <option key={semester} value={semester}>
                      {semester}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Create a password"
                  value={studentData.password}
                  onChange={(e) =>
                    setStudentData({
                      ...studentData,
                      password: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={studentData.confirmPassword}
                  onChange={(e) =>
                    setStudentData({
                      ...studentData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            {/* Show error */}
            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              variant="university"
              disabled={loading}
            >
              {loading ? "Creating Account..." : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Create Student Account
                </>
              )}
            </Button>
          </form>

          <div className="text-center mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="text-university-navy hover:text-university-gold font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterForm;
