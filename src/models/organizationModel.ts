import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    unique: false,
  },
  industry: {
    type: String,
    required: true,
    enum: [
      "Retail/E-Commerce",
      "Technology",
      "Service Provider",
      "Healthcare(Doctors/Clinics/Physicians/Hospital)",
      "Logistics",
      "Financial Consultants",
      "Trading",
      "Education",
      "Manufacturing",
      "Real Estate/Construction/Interior/Architects",
      "Other",
    ], // Updated industry options
  },
  teamSize: {
    type: String,
    required: true,
    enum: ["1-10", "11-20", "21-30", "31-50", "51+"], // Updated team size ranges
  },
  description: {
    type: String,
    required: true,
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
    },
  ],
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  isPro: {
    type: Boolean,
    default: false,
  },
  subscriptionExpires: {
    type: Date,
  },
  trialExpires: {
    type: Date,
    required: true,
  },
  leavesTrialExpires: {
    type: Date,
  },
  country: {
    type: String,
    required: true,
  },
  attendanceTrialExpires: {
    type: Date,
  },
}, { timestamps: true });

// Model for organizations
const Organization =
  mongoose.models.organizations ||
  mongoose.model("organizations", organizationSchema);

export default Organization;
