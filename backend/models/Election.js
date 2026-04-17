const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    required: true, // Role name e.g., President
  },
  status: {
    type: String,
    enum: ["pending", "approved", "inDispute","rejected"], // possible statuses
    default: "pending", // default status
    required: true,
  },
  cnic: {
    type: String,
    required: true, // CNIC of the candidate
  },
  image: {
    type: String,
    required: true, // store the picture filename or URL
  },
  // 🔥 ADD THIS
  reason: {
    type: String,
    default: "",
  },
});


const voteSchema = new mongoose.Schema({
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
const winnerSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
const electionSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
    winners: [winnerSchema],

    title: {
      type: String,
      required: true,
    },

    roles: {
      type: [String], // fetched from society.roles
      required: true,
    },
    applicationEligibility: {
      type: String,
      enum: ["MEMBERS_ONLY", "ANYONE"],
      required: true,
    },

    votingEligibility: {
      type: String,
      enum: ["MEMBERS_ONLY", "ANYONE"],
      required: true,
    },

    status: {
      type: String,
      enum: ["DRAFT", "APPLICATIONS_OPEN", "APPLICATIONS_CLOSED", "CANDIDATES_FINALIZED", "VOTING_SCHEDULED", "VOTING_LIVE", "COMPLETED"],
      default: "DRAFT", // when first created
    },
    rolesAssigned: {
      type: Boolean,
      
    },

    applyDeadline: {
      type: Date,
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    
    },

    candidates: [candidateSchema],
    votes: [voteSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Election", electionSchema);
