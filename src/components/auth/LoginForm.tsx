import { useState, useEffect } from "react";
import { User, Lock } from "lucide-react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [click, setClick] = useState(true);
  const [shake, setShake] = useState(false);
  const d = new Date();
  let year = d.getFullYear();

  // Simple navigation function (replace with your actual router)
  const navigate = (path) => {
    console.log("Navigating to:", path);
    // In your actual app, uncomment this:
    // window.location.href = path;
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setShake(newValue.includes("@"));
  };

  const inputStyle = {
    borderColor: shake ? "red" : "",
  };

  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    console.log("LoginForm - Checking authentication state:");
    console.log("Token exists:", !!token);
    console.log("User exists:", !!user);
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        console.log("User admin status:", userData.admin);
        console.log("User society owner status:", userData.society_owner);
        
        // Check role_name for routing
        if (userData.admin === 1) {
          const roleName = userData.role_name ? String(userData.role_name).trim().toLowerCase() : null;
          const roleId = userData.role_id;
          console.log("User is admin with role_id:", roleId, "role_name:", roleName);
          
          // Redirect based on role_name
          if (roleName === 'board_secretary') {
            console.log("Redirecting to Board Secretary dashboard");
            navigate("/dashboard/admin/board-secretary");
          } else if (roleName === 'board_president') {
            console.log("Redirecting to Board President dashboard");
            navigate("/dashboard/admin/board-president");
          } else if (roleName === 'registrar') {
            console.log("Redirecting to Registrar dashboard");
            navigate("/dashboard/admin/registrar");
          } else if (roleName === 'vc' || roleName === 'vice_chancellor') {
            console.log("Redirecting to VC dashboard");
            navigate("/dashboard/admin/vc");
          } else if (roleName === 'transport_office') {
            console.log("Redirecting to Transport Office dashboard");
            navigate("/dashboard/admin/transport-office");
          } else if (roleName === 'protocol_office') {
            console.log("Redirecting to Protocol Office dashboard");
            navigate("/dashboard/admin/protocol-office");
          } else if (roleName === 'admin') {
            console.log("Redirecting to Admin dashboard");
            navigate("/dashboard/admin");
          } else {
            console.warn("⚠️ Unknown admin role. Role ID:", roleId, "Role name:", roleName);
            navigate("/dashboard/admin");
          }
        } else if (userData.society_owner === 1) {
          console.log("User is society owner, redirecting to society dashboard");
          navigate("/dashboard/society");
        } else if (userData.role_name === 'advisor') {
          console.log("User is advisor, redirecting to advisor dashboard");
          navigate("/dashboard/student");
        } else {
          console.log("User is student, redirecting to student dashboard");
          navigate("/dashboard/student");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/dashboard/student");
      }
    }
  }, [navigate]);

  const log_in_verify = () => {
    if (username === "" || password === "") {
      console.error("Empty Roll No Or CNIC Field");
    } else if (shake) {
      console.error("Remove @ from Roll No");
    } else {
      log_in();
    }
  };

  async function log_in() {
    setClick(false);
    
    try {
      console.log("Making login request to: https://lms.gcu.edu.pk/api/fc/login");
      console.log("Request payload:", { usnm: username, pwd: password });
      
      // Call backend login API using fetch
      const response = await fetch("https://lms.gcu.edu.pk/api/fc/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usnm: username,
          pwd: password,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      const data = await response.json();
      console.log("Response data:", data);

      const { user, error, warning, token } = data;

      if (error || warning) {
        console.error(error || warning);
        setClick(true);
        return;
      }

      if (token) {
        // Save JWT token
        localStorage.setItem("token", token);

        // Save student/user data
        localStorage.setItem("user", JSON.stringify(user));

        console.log("Login successful:", data);
        console.log("Token saved:", token);
        console.log("User data saved:", user);
        console.log("Available fields in user data:", Object.keys(user));
        
        // Verify localStorage storage
        console.log("Token in localStorage:", localStorage.getItem("token"));
        console.log("User in localStorage:", localStorage.getItem("user"));

        // Check user role and redirect accordingly
        const userData = user;
        console.log("=== LOGIN DEBUG INFO ===");
        console.log("Full userData object:", JSON.stringify(userData, null, 2));
        console.log("User admin status:", userData.admin);
        console.log("User role:", userData.role);
        console.log("User society owner status:", userData.society_owner);
        console.log("All userData keys:", Object.keys(userData));
        
        // Check role_name for routing
        if (userData.admin === 1) {
          const roleName = userData.role_name ? String(userData.role_name).trim().toLowerCase() : null;
          const roleId = userData.role_id;
          console.log("User is admin with role_id:", roleId, "role_name:", roleName);
          
          // Redirect based on role_name
          if (roleName === 'board_secretary') {
            console.log("Redirecting to Board Secretary dashboard");
            navigate("/dashboard/admin/board-secretary");
          } else if (roleName === 'board_president') {
            console.log("Redirecting to Board President dashboard");
            navigate("/dashboard/admin/board-president");
          } else if (roleName === 'registrar') {
            console.log("Redirecting to Registrar dashboard");
            navigate("/dashboard/admin/registrar");
          } else if (roleName === 'vc' || roleName === 'vice_chancellor') {
            console.log("Redirecting to VC dashboard");
            navigate("/dashboard/admin/vc");
          } else if (roleName === 'transport_office') {
            console.log("Redirecting to Transport Office dashboard");
            navigate("/dashboard/admin/transport-office");
          } else if (roleName === 'protocol_office') {
            console.log("Redirecting to Protocol Office dashboard");
            navigate("/dashboard/admin/protocol-office");
          } else if (roleName === 'admin') {
            console.log("Redirecting to Admin dashboard");
            navigate("/dashboard/admin");
          } else {
            console.warn("⚠️ Unknown admin role. Role ID:", roleId, "Role name:", roleName);
            navigate("/dashboard/admin");
          }
        } else if (userData.society_owner === 1) {
          console.log("User is society owner, redirecting to society dashboard");
          navigate("/dashboard/society");
        } else if (userData.role_name === 'advisor') {
          console.log("User is advisor, redirecting to advisor dashboard");
          navigate("/dashboard/student");
        } else {
          console.log("User is student, redirecting to student dashboard");
          navigate("/dashboard/student");
        }
      }
    } catch (err) {
      console.error("Login failed:", err.message);
      console.error("Full error object:", err);
      
      // Clear any existing auth data on login failure
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      setClick(true);
    }
  }



  return (
    <>
      <div style={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.3)",
          zIndex: 0
        }}></div>

        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          color: "white",
          zIndex: 1
        }}>
          <div style={{
            width: "200px",
            height: "200px",
            background: "white",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "30px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
          }}>
            <div style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#1e3a8a"
            }}>GCU</div>
          </div>
          <h1 style={{
            fontSize: "2.5rem",
            marginBottom: "20px",
            textAlign: "center",
            fontWeight: "bold",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
          }}>Government College University Lahore</h1>
          <p style={{
            fontSize: "1.2rem",
            textAlign: "center",
            maxWidth: "500px",
            lineHeight: "1.6"
          }}>
            Welcome to the Student Facilitation Center. Use your LMS credentials
            to log in and access services.
          </p>
        </div>

        <div style={{
          width: "500px",
          background: "white",
          padding: "60px 50px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          zIndex: 1,
          boxShadow: "-10px 0 30px rgba(0,0,0,0.3)"
        }}>
          <h1 style={{
            fontSize: "1.8rem",
            fontWeight: "bold",
            color: "#12004a",
            marginBottom: "10px",
            textAlign: "center"
          }}>
            GCU Student Facilitation Center
          </h1>
          <div style={{
            height: "3px",
            background: "linear-gradient(90deg, #1e3a8a, #3b82f6)",
            margin: "20px 0",
            borderRadius: "2px"
          }} />
          <p style={{
            fontSize: "20px",
            color: "#12004a",
            fontWeight: "bold",
            textAlign: "left",
            marginBottom: "30px"
          }}>
            Sign in to continue
          </p>
          <form
            style={{ width: "100%" }}
            onSubmit={(e) => {
              e.preventDefault();
              log_in_verify();
            }}
          >
            <div style={{
              position: "relative",
              marginBottom: "20px"
            }}>
              <User style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#666",
                width: "20px",
                height: "20px",
                zIndex: 1
              }} />
              <input
                type="text"
                placeholder="Complete Roll No"
                style={{
                  width: "100%",
                  padding: "14px 14px 14px 45px",
                  fontSize: "16px",
                  border: shake ? "2px solid red" : "2px solid #ddd",
                  borderRadius: "8px",
                  outline: "none",
                  transition: "border-color 0.3s",
                  boxSizing: "border-box"
                }}
                onChange={(event) => {
                  setUsername(event.target.value);
                  handleInputChange(event);
                }}
              />
            </div>
            <div style={{
              position: "relative",
              marginBottom: "20px"
            }}>
              <Lock style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#666",
                width: "20px",
                height: "20px",
                zIndex: 1
              }} />
              <input
                type="password"
                placeholder="CNIC"
                style={{
                  width: "100%",
                  padding: "14px 14px 14px 45px",
                  fontSize: "16px",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  outline: "none",
                  transition: "border-color 0.3s",
                  boxSizing: "border-box"
                }}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <button 
              type="submit"
              disabled={!click}
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "16px",
                fontWeight: "bold",
                color: "white",
                background: !click ? "#999" : "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                border: "none",
                borderRadius: "8px",
                cursor: !click ? "not-allowed" : "pointer",
                transition: "all 0.3s",
                boxShadow: "0 4px 15px rgba(30, 58, 138, 0.4)"
              }}
            >
              {click ? "Login" : "Loading..."}
            </button>
          </form>
          <div style={{ marginTop: "30px" }}>
            <p style={{ textAlign: "center", marginBottom: "15px", fontSize: "14px" }}>
              <span style={{
                color: "#570009",
                fontSize: "1.1rem",
                fontWeight: "bold",
              }}>
                Note:
              </span>
              <span style={{ color: "black" }}>
                {" "}If login does not work, contact{" "}
              </span>
              <a
                href="https://gcu.edu.pk/directorate-IT.php"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: "none",
                  fontWeight: "bold",
                  color: "#570009",
                }}
              >
                DIT
              </a>
            </p>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: "black",
              fontSize: "16px"
            }}>
              <p style={{ margin: 0 }}>Need help?</p>
              <p
                style={{
                  margin: 0,
                  color: "#570009",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontWeight: "bold"
                }}
                onClick={() => {
                  alert("Login Guide:\n\nFor inter student: XXXX-1-21\nFor university student: XXXX-BS-Dept-21\n\nExamples:\nComputer Science: 0000-BSCS-21\nChemistry: 0000-BS-CHEM-21");
                }}
              >
                Login Guide
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;