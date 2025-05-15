import amqp from "amqplib";
import Student from "../models/student.js";
import { publishToQueue } from "./producer.js";

export async function consumeCreateAbsenceQueue() {
	try {
		console.log("starting of consumeCreateAbsenceQueue...");

		// connect to RabbitMQ
		const connection = await amqp.connect("amqp://guest:guest@rabbitmq");
		const channel = await connection.createChannel();
		console.log("connection to RabbitMQ established");

		// create a queue
		const queue = "absenceCreated";
		await channel.assertQueue(queue, { durable: true });

		// consume messages from the queue
		channel.consume(queue, async (msg) => {
			const data = JSON.parse(msg.content.toString());
			console.log("message received from createAbsenceQueue", data);

			const { studentId, absenceId } = data;

			// update total absence count for the student
			await updateTotalAbsenceCount(studentId, absenceId);
		});
	} catch (error) {
		console.error("Erreur lors de la consummation des message");
	}
}

async function updateTotalAbsenceCount(studentId, absenceId) {
	try {
		console.log("updating total absence count for student with id", studentId);

		const student = await Student.findByPk(studentId);
		if (!student) return res.status(404).json({ message: "Student not found" });
		console.log("updating total absence count for student with id", studentId);
		// increment the total absence count
		student.total_absences += 1;
		await student.save();
		console.log("total absence count updated for student with id", studentId);
		// publish to the stock queue
		await publishToQueue("total_absence_update_success", {
			studentId,
			absenceId,
		});

		console.log(
			"Successfully published total absence update for student with id",
			studentId
		);
	} catch (error) {
		console.error(error);
		await publishToQueue("total_absence_update_failed", {
			studentId,
			absenceId,
			reason: "Failed to update total absence count",
		});
	}
}
