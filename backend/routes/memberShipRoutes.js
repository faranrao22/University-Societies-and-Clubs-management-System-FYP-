let express=require("express")
const { requestToJoinSociety,getManagerJoinRequests,updateJoinRequestStatus,getSocietyMembers } = require("../controllers/memberShipController");
const verifyToken = require("../middleware/authMiddleware");
let router=express.Router()

router.post('/join/:id',verifyToken, requestToJoinSociety);
router.get('/requests',verifyToken, getManagerJoinRequests);
router.put('/update/:requestId',verifyToken, updateJoinRequestStatus);
router.get('/members/:societyId',verifyToken, getSocietyMembers);

module.exports=router