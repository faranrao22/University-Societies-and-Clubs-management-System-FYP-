let express = require("express");
let {createSociety,getAllSocieties, getMySocieties, getSocietiesByid, updateSociety,getMemberSocieties, deleteSociety, getSocietyWithMembership}=require("../controllers/societyController")
const societyPostController = require("../controllers/societyPostController");
let verifyToken=require("../middleware/authMiddleware")
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/create",verifyToken,upload.single("image"), createSociety);
router.get("/Allsocieties",getAllSocieties)
router.get("/Mysocieties/:id",verifyToken,getMySocieties)
router.get("/member-societies", verifyToken,getMemberSocieties);  // ✅ NEW: societies user is member of
// Society posts (must be registered before "/:id" so "posts" is not captured as an id)
router.get("/posts/all", societyPostController.listAllPostsPublic);
router.get("/posts/society/:societyId", societyPostController.listPostsBySociety);
router.get("/posts/my-feed", verifyToken, societyPostController.listPostsForMemberSocieties);
router.get("/posts/managed", verifyToken, societyPostController.listManagedPosts);
router.put("/posts/:postId", verifyToken, upload.single("image"), societyPostController.updateSocietyPost);
router.delete("/posts/:postId", verifyToken, societyPostController.deleteSocietyPostManager);
router.post("/posts", verifyToken, upload.single("image"), societyPostController.createSocietyPost);
router.get("/:id/membership", verifyToken, getSocietyWithMembership);
router.get("/:id",getSocietiesByid )

router.put("/update/:id",verifyToken,upload.single("image"),updateSociety)
router.delete("/delete/:id",verifyToken,deleteSociety)

module.exports = router;  
