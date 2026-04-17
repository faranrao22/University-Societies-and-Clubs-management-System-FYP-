let express=require("express")
const { requestToJoinSociety,getManagerJoinRequests,updateJoinRequestStatus,getSocietyMembers, getMyApplicationStatus } = require("../controllers/memberShipController");
const verifyToken = require("../middleware/authMiddleware");
let router=express.Router()
// ✅ NEW: Get user's application status for all societies
router.get("/my-applications", verifyToken,getMyApplicationStatus);
router.post('/join/:id',verifyToken, requestToJoinSociety);
router.get('/requests',verifyToken, getManagerJoinRequests);
router.put('/update/:requestId',verifyToken, updateJoinRequestStatus);
router.get('/members/:societyId',verifyToken, getSocietyMembers);

module.exports=router