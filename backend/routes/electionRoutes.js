const express = require("express")
const router = express.Router()
const { createElection, getSocietyElections, getElections, assignSocietyRolesFromElection, getElectionById, openApplications,getUserElections, scheduleElection } = require("../controllers/electionController")
const verifyToken = require("../middleware/authMiddleware")
const upload = require("../middleware/uploadMiddleware");
const { getElectionCandidatesForVoting, getElectionCandidates, applyCandidate, getCandidateDetails, getUserElectionApplications, finalizeCandidates, applicationStatus } = require("../controllers/candidateController");
const { getElectionResult, castVote } = require("../controllers/voteController");

router.post('/create', createElection)
router.patch('/ScheduleElection/:electionId',scheduleElection)
router.patch('/openApplications/:electionId',openApplications)
router.get('/my-drafts',verifyToken,getUserElections)
router.patch('/finalized-candidates/:electionId',finalizeCandidates)
router.post('/apply/:electionId', verifyToken, upload.single("image"), applyCandidate)
router.patch('/update-application/:electionId/:candidateId', applicationStatus)
router.post('/castVote/:electionId', verifyToken, castVote)
router.get('/result/:electionId', getElectionResult)
router.get("/my-election-applications", verifyToken, getUserElectionApplications);
router.get("/reviewCandidate/:candidateId", getCandidateDetails)
router.get('/societyElection/:societyId', getSocietyElections)
router.get('/allElections', getElections)
router.get("/Singleelection/:electionId", getElectionById);
router.get("/:electionId/candidates-for-voting", getElectionCandidatesForVoting);
router.put('/updateRole/:electionId', assignSocietyRolesFromElection)
module.exports = router