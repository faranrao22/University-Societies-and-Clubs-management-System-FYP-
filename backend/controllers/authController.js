
let bcrypt = require("bcrypt")
let jwt = require("jsonwebtoken");
const users = require("../models/users");
const { notifyAllAdmins } = require("../utils/notifyUser");
const isProd = process.env.NODE_ENV === "production";

const signup = async (req, res) => {
  try {
    // 1. Text fields are parsed by Multer and put into req.body
    const {
      fullname,
      email,
      password,
      rollNo,
      cnicLast4,
      Department, // Must match frontend key 'Department'
      semester,
      sessionStart,
      sessionEnd,
      role
    } = req.body;

    // 🔹 Validation check
    if (!fullname || !email || !password || !Department) {
      return res.status(400).json({
        success: false,
        message: "Fullname, email, password and department are required",
      });
    }
    if (String(password).length < 8 || String(password).length > 64) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 64 characters",
      });
    }

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userRole = role?.trim().toLowerCase() || "user";

    // 🔹 Files are in req.files because we used upload.fields()
    const profileImage = req.files?.profileImage?.[0]?.filename || null;
    const studentCardFront = req.files?.studentCardFront?.[0]?.filename || null;
    const studentCardBack = req.files?.studentCardBack?.[0]?.filename || null;

    const userData = {
      fullname,
      email,
      password: hashedPassword,
      Department,
      role: userRole,
      profileImage,
    };

    if (userRole === "user") {
      const start = (sessionStart || "").trim();
      const end = (sessionEnd || "").trim();
      if (!rollNo || !semester || !start || !end || !cnicLast4) {
        return res.status(400).json({
          success: false,
          message: "Roll number, CNIC last 4 digits, semester, session start and session end are required for students",
        });
      }
      const normalizedCnicLast4 = String(cnicLast4).trim();
      if (!/^\d{4}$/.test(normalizedCnicLast4)) {
        return res.status(400).json({
          success: false,
          message: "CNIC last 4 digits must be exactly 4 numbers",
        });
      }
      if (end < start) {
        return res.status(400).json({
          success: false,
          message: "Session end date must be on or after the session start date",
        });
      }

      if (!studentCardFront || !studentCardBack) {
        return res.status(400).json({
          success: false,
          message: "Both front and back images of student card are required",
        });
      }

      userData.rollNo = rollNo;
      userData.cnicLast4 = normalizedCnicLast4;
      userData.semester = semester;
      userData.sessionStart = start;
      userData.sessionEnd = end;
      userData.session = `${start} — ${end}`;
      userData.studentCardFront = studentCardFront;
      userData.studentCardBack = studentCardBack;
    }

    const newUser = await users.create(userData);

    if (userRole === "user") {
      notifyAllAdmins(req, {
        type: "ADMIN_NEW_STUDENT_REGISTERED",
        title: "New student registration",
        message: `${fullname} (${email}) registered from ${Department || "—"}.`,
        meta: { userId: newUser._id.toString() },
      }).catch(() => {});
    }

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: newUser,
    });

  } catch (error) {
    console.error("SIGNUP_ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email, rollNo, cnicLast4, newPassword } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedRollNo = String(rollNo || "").trim();
    const normalizedCnicLast4 = String(cnicLast4 || "").trim();
    const normalizedNewPassword = String(newPassword || "");

    if (!normalizedEmail || !normalizedRollNo || !normalizedCnicLast4 || !normalizedNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, roll number, CNIC last 4 digits and new password are required",
      });
    }

    if (!/^\d{4}$/.test(normalizedCnicLast4)) {
      return res.status(400).json({
        success: false,
        message: "CNIC last 4 digits must be exactly 4 numbers",
      });
    }

    if (normalizedNewPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    const user = await users.findOne({
      email: normalizedEmail,
      rollNo: normalizedRollNo,
      role: "user",
    });

    if (!user || !user.cnicLast4 || user.cnicLast4 !== normalizedCnicLast4) {
      return res.status(400).json({
        success: false,
        message: "Provided details do not match our records",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(normalizedNewPassword, salt);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful. Please login with your new password.",
    });
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


const login = async (req, res) => {
  let { email, password } = req.body;

  const user = await users.findOne({ email });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User not found",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Generate JWT token including role
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role || "user",
      department: user.Department, // default to "user" if role not set
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" } // optional expiration
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",           // ensure all routes get it
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: "Login successful",
    user,
  });
};
const logout = (req, res) => {
  // Clear the cookie containing the token
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });


  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// **New: Get current user function**

const getUser = async (req, res) => {
  try {
    // Check if cookie exists
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await users.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await users.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const {
      fullname,
      Department,
      rollNo,
      semester,
      sessionStart,
      sessionEnd,
    } = req.body;

    if (fullname !== undefined) {
      const nextFullname = String(fullname || "").trim();
      if (!nextFullname) {
        return res.status(400).json({ success: false, message: "Full name cannot be empty" });
      }
      user.fullname = nextFullname;
    }

    if (Department !== undefined) {
      user.Department = String(Department || "").trim();
    }

    if (rollNo !== undefined) {
      user.rollNo = String(rollNo || "").trim();
    }

    if (semester !== undefined) {
      user.semester = String(semester || "").trim();
    }

    if (sessionStart !== undefined) {
      user.sessionStart = String(sessionStart || "").trim();
    }

    if (sessionEnd !== undefined) {
      user.sessionEnd = String(sessionEnd || "").trim();
    }

    if (user.sessionStart && user.sessionEnd) {
      if (user.sessionEnd < user.sessionStart) {
        return res.status(400).json({
          success: false,
          message: "Session end date must be on or after session start date",
        });
      }
      user.session = `${user.sessionStart} — ${user.sessionEnd}`;
    } else if (!user.sessionStart || !user.sessionEnd) {
      user.session = "";
    }

    await user.save();
    const safeUser = await users.findById(userId).select("-password");
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: safeUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const usersList = await users.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, users: usersList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
// Update user by ID
const updateUser = async (req, res) => {
  try {
    const { id } = req.params; // user id from URL
    const { fullname, email, password, rollNo, Department, semester, role } = req.body;

    // Check if user exists
    const user = await users.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update fields
    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (Department) user.Department = Department;
    if (role) user.role = role;

    // Only update rollNo and semester if user role is "user"
    if (role === "user" || user.role === "user") {
      if (rollNo) user.rollNo = rollNo;
      if (semester) user.semester = semester;
    }

    // Hash new password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({ success: true, message: "User updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete user by ID
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user?.id && id === req.user.id) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account" });
    }

    const user = await users.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await users.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { signup, login, logout, forgotPassword, getUser, updateMyProfile, getAllUsers, deleteUser, updateUser };


