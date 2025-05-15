import amqp from "amqplib";
import Absence from "../models/absence.js";

// connect to RabbitMQ and consume messages from the queue
export async function consumeCreateAbsenceQueue() {
	try {
		// connect to RabbitMQ
		const connection = await amqp.connect("amqp://guest:guest@rabbitmq");
		const channel = await connection.createChannel();

		//  assurate that queues 'absenceCreated' and 'total_absence_update_failed' exist
		await channel.assertQueue("total_absence_update_failed", { durable: true });
		await channel.assertQueue("total_absence_update_success", {
			durable: true,
		});
		console.log(
			"starting of consume of messages from absenceCreatedQueue and total_absence_update_failedQueue..."
		);

		// consume messages from the queue total_absence_update_failed
		channel.consume("total_absence_update_failed", async (msg) => {
			const data = JSON.parse(msg.content.toString());
			console.log(
				"message received from total_absence_update_failed Queue",
				data
			);

			// destructure the data
			const { studentId, absenceId, reason } = data;

			// manage the error
			await handleAbsenceUpdateFailure(absenceId, studentId, reason);

			channel.ack(msg);
		});

		// consume messages from the queue total_absence_update_success
		channel.consume("total_absence_update_success", async (msg) => {
			const data = JSON.parse(msg.content.toString());
			console.log(
				"message received from total_absence_update_success Queue",
				data
			);

			// destructure the data
			const { studentId, absenceId } = data;

			// update total absence count for the student
			await handleAbsenceUpdateSuccess(absenceId, studentId);

			channel.ack(msg);
		});
	} catch (error) {
		console.error("Error while consumation messages RabbitMq", error);
	}
}

async function handleAbsenceUpdateFailure(absenceId, studentId, reason) {
	try {
		// update the absence record to mark it as failed
		const absence = await Absence.findById(absenceId);
		if (!absence) {
			console.log("absence not found", absenceId);
			return;
		}

		absence.status = "not confirmed";
		await absence.save();

		console.log(
			`Absence ${absence._id} for student ${studentId} is marked as not confirmed due to: ${reason}`
		);
	} catch (err) {
		console.error("Error while processing absence update failure:", err);
	}
}

// Function to handle successful total absence update
async function handleAbsenceUpdateSuccess(absenceId, studentId) {
	try {
		// Update the absence record to mark it as confirmed
		const absence = await Absence.findById(absenceId);
		if (!absence) {
			console.log("Absence not found:", absenceId);
			return;
		}

		absence.status = "confirmed";
		await absence.save();

		console.log(
			`Absence ${absence._id} for student ${studentId} is marked as confirmed`
		);
	} catch (err) {
		console.error("Error while processing absence update success:", err);
	}
}
