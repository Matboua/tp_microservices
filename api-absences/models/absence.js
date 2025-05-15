import mongoose from "mongoose";

const absence_schema = new mongoose.Schema({
	studentId: String,
	date: {
		type: Date,
		default: Date.now,
	},
	comment: String,
	status: {
		type: String,
		enum: ["pending", "confirmed", "not confirmed"],
		default: "pending",
	},
});

export default mongoose.model("Absence", absence_schema);
