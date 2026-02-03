let express=require("express")
let router=express.Router()
let {signup,login,logout,getUser,getAllUsers,deleteUser,updateUser}=require("../controllers/authController")

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", getUser);
router.get("/users",getAllUsers)
router.put("/update/:id",  updateUser); // update user by id
router.delete("/delete/:id",  deleteUser); // delete user by id

module.exports = router;  