
let bcrypt = require("bcrypt")
let jwt = require("jsonwebtoken");
const users = require("../models/users");

const signup = async (req, res) => {
  const { fullname, email, password, rollNo, Department, semester, role } = req.body;

  // Check if all required fields are provided
  if (!fullname || !email || !password || !Department) {
    return res.status(400).json({
      success: false,
      message: "Please fill in all required fields",
    });
  }

  // Optional: Only admin can create manager
  // if (role === "manager" && req.user.role !== "admin") {
  //   return res.status(403).json({
  //     success: false,
  //     message: "Only admin can create managers",
  //   });
  // }

  // Check if user already exists
  const existingUser = await users.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const newUser = await users.create({
    fullname,
    email,
    password: hashedPassword,
    rollNo: role === "user" ? rollNo : undefined, // only for users
    semester: role === "user" ? semester : undefined, // only for users
    Department,
    role: role || "user", // important! use the role from request
  });

  return res.status(200).json({
    success: true,
    message: "User created successfully",
    user: newUser,
  });
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
  secure: false,       // must be false on localhost
  sameSite: "lax",     // BEST for localhost
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
  secure: false,
  sameSite: "lax",
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

module.exports = { signup, login, logout, getUser,getAllUsers,deleteUser,updateUser };


