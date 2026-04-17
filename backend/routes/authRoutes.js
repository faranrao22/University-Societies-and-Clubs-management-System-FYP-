let express = require("express")
let router = express.Router()
let { signup, login, logout, getUser, getAllUsers, deleteUser, updateUser } = require("../controllers/authController")
let upload = require("../middleware/uploadMiddleware"); // Multer middleware for file uploads
const verifyToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

router.post(
    "/signup",
    upload.fields([
        { name: "profileImage", maxCount: 1 },
        { name: "studentCardFront", maxCount: 1 },
        { name: "studentCardBack", maxCount: 1 }
    ]),
    signup)
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", getUser);
router.get("/users", verifyToken, requireAdmin, getAllUsers)
router.put("/update/:id", verifyToken, requireAdmin, updateUser); // update user by id
router.delete("/delete/:id", verifyToken, requireAdmin, deleteUser); // delete user by id

module.exports = router;  