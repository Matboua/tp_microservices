import axios from "axios";
import Absence from "../models/absence.js";

// export const createAbsence = (req, res) => {
// 	const { studentId, comment, date, status } = req.body;
// 	const absence = new Absence({
// 		studentId,
// 		date,
// 		status,
// 		comment,
// 	});

// 	absence
// 		.save()
// 		.then((abs) => {
// 			res.status(201).json({
// 				message: "Absence created successfully!",
// 			});
// 		})
// 		.catch((error) =>
// 			res
// 				.status(500)
// 				.json({ message: "Error : can not add this absence " + error.message })
// 		);
// };

export const getAbsences = (req, res) => {
	Absence.find()
		.then((absences) => {
			if (absences.length === 0) {
				return res.status(404).json({ message: "No absences found" });
			}
			res.status(200).json(absences);
		})
		.catch((error) =>
			res
				.status(500)
				.json({ message: "Error : can not get absences " + error.message })
		);
};

export const getAbsenceById = (req, res) => {
	const absenceId = req.params.id;
	Absence.findById(absenceId)
		.then((absence) => {
			if (!absence) {
				return res.status(404).json({ message: "Absence not found" });
			}
			res.status(200).json(absence);
		})
		.catch((error) =>
			res
				.status(500)
				.json({ message: "Error : can not get this absence " + error.message })
		);
};

export const updateAbsence = (req, res) => {
	const absenceId = req.params.id;
	const { studentId, date, comment, status } = req.body;

	Absence.findByIdAndUpdate(
		absenceId,
		{ studentId, date, comment, status },
		{ new: true }
	)
		.then((absence) => {
			if (!absence) {
				return res.status(404).json({ message: "Absence not found" });
			}
			res.status(200).json({ message: "Absence updated successfully!" });
		})
		.catch((error) =>
			res.status(500).json({
				message: "Error : can not update this absence " + error.message,
			})
		);
};

export const deleteAbsence = (req, res) => {
	const absenceId = req.params.id;

	Absence.findByIdAndDelete(absenceId)
		.then((absence) => {
			if (!absence) {
				return res.status(404).json({ message: "Absence not found" });
			}
			res.status(200).json({ message: "Absence deleted successfully!" });
		})
		.catch((error) =>
			res.status(500).json({
				message: "Error : can not delete this absence " + error.message,
			})
		);
};

export const getAbsencesByStudentId = (req, res) => {
	const studentId = req.params.studentId;

	Absence.find({ studentId })
		.then((absences) => {
			if (absences.length === 0) {
				return res.status(404).json({ message: "No absences found" });
			}
			res.status(200).json(absences);
		})
		.catch((error) =>
			res.status(500).json({
				message:
					"Error : can not get absences for this student " + error.message,
			})
		);
};

export async function createAbsence(req, res) {
	const { studentId, comment, date, status } = req.body;
	const absence = new Absence({ studentId, date, status, comment });
	try {
		await absence.save();

		const response = await axios.put(
			`http://api-students:9000/students/${studentId}/increment-absence`
		);
		if (response.status !== 200) {
			return res.status(500).json({
				message:
					"Absence créée avec succès, mais avec un échec de la mise à jour du nombre d'absences de l'étudiant",
			});
		}

		res.status(201).json({ message: "Absence created successfully!" });
	} catch (err) {
		res
			.status(500)
			.json({ message: "peu pas ajouter ses absences " + err.message });
	}
}
