let express = require("express");
let {createSociety,getAllSocieties, getMySocieties, getSocietiesByid, updateSociety, deleteSociety}=require("../controllers/societyController")
let verifyToken=require("../middleware/authMiddleware")
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/create",verifyToken,upload.single("image"), createSociety,createSociety);
router.get("/Allsocieties",getAllSocieties)
router.get("/Mysocieties/:id",verifyToken,getMySocieties)
router.get("/:id",getSocietiesByid )
router.put("/update/:id",verifyToken,upload.single("image"),updateSociety)
router.delete("/delete/:id",verifyToken,deleteSociety)

module.exports = router;  
