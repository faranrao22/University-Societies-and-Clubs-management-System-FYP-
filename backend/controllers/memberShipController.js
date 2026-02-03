let SocietyModel = require("../models/societyModel")

const requestToJoinSociety = async (req, res) => {
    try {
        // 🔹 Check if user is logged in and has 'user' role
        if (!req.user || req.user.role !== "user") {
            return res.status(403).json({
                success: false,
                message: "Only students with 'user' role can join societies",
            });
        }

        // 🔹 Find society
        const society = await SocietyModel.findById(req.params.id);
        if (!society) {
            return res.status(404).json({ success: false, message: "Society not found" });
        }

        // 🔒 Apply creator-defined policy
        switch (society.joinPolicy) {
            case "DEPARTMENT_ONLY":
                if (society.department !== req.user.department) {
                    return res.status(403).json({
                        success: false,
                        message: "This society is restricted to its department only",
                    });
                }
                break;

            case "OPEN":
                // anyone can join
                break;

            case "INVITE_ONLY":
                return res.status(403).json({
                    success: false,
                    message: "This society is invite-only",
                });

            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid join policy",
                });
        }

        // 🔹 Prevent duplicate membership
        if (society.members.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: "Already a member" });
        }

        // 🔹 Prevent duplicate requests
        const alreadyRequested = society.joinRequests.find(
            (r) => r.user.toString() === req.user.id
        );
        if (alreadyRequested) {
            return res.status(400).json({ success: false, message: "Request already sent" });
        }

        // 🔹 Push request
        society.joinRequests.push({ user: req.user.id });
        await society.save();

        res.status(200).json({
            success: true,
            message: "Join request sent successfully",
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// Get all join requests for societies managed by the logged-in manager
const getManagerJoinRequests = async (req, res) => {
    try {
        // Find all societies created by this manager
        const societies = await SocietyModel.find({ Creator: req.user.id })
            .populate("joinRequests.user", "name email fullname Department semester"); // populate user info

        // Collect join requests with society info
        const allRequests = societies.flatMap(society =>
            society.joinRequests.map(request => ({
                requestId: request._id, // <-- add this
                societyId: society._id,
                societyName: society.name,
                user: request.user,
                status: request.status,
                requestedAt: request.requestedAt,
            }))
        );

        res.status(200).json({
            success: true,
            data: allRequests,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update the status of a join request (Approve / Reject)
const updateJoinRequestStatus = async (req, res) => {
    try {
        const { requestId } = req.params; // ID of the join request
        const { status } = req.body; // "Approved" or "Rejected"

        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }
        console.log("requestId:", requestId);
        // Find the society that contains this join request and belongs to the logged-in manager
        const society = await SocietyModel.findOne({
            Creator: req.user.id,
            "joinRequests._id": requestId,
        });

        if (!society) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        // Find the specific request
        const request = society.joinRequests.id(requestId);
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        // Update status
        request.status = status;

        // If approved, also add user to members array (optional)
        if (status === "Approved" && !society.members.includes(request.user)) {
            society.members.push(request.user) ;
        }

        await society.save();

        res.status(200).json({
            success: true,
            message: `Request ${status.toLowerCase()} successfully`,
            data: request,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// Get all members of a society (manager only)
const getSocietyMembers = async (req, res) => {
   try{
    const  {societyId} = req.params;

    const society=await SocietyModel.findOne({
        _id:societyId,
        Creator:req.user.id
    }).populate("members"," email fullname Department semester");
     if(!society){
        return res.status(404).json({ 
            success: false,
            message: "Society not found or unauthorized" });
     }
    res.status(200).json({
        success:true,
        data:society.members
    })
    console.log(society.members);
   }catch(err){

    res.status(500).json({ 
        success: false,
        message: err.message });

   }
};

module.exports = {
    requestToJoinSociety,
    getManagerJoinRequests,
    updateJoinRequestStatus,
    getSocietyMembers
};
