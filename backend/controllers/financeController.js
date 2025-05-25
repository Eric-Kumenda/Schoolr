const { School, Student, Billing } = require("../models/newSchoolModel");
//const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.billCohort = async (req, res) => {
	try {
		const { cohortId } = req.params;
		const { description, amount, dueDate } = req.body;
		const schoolId = req.user.schoolId; // Assuming schoolId is available in req.user

		if (!description || !amount) {
			return res
				.status(400)
				.json({ message: "Description and amount are required." });
		}

		const students = await Student.find({
			schoolId: schoolId,
			cohort: cohortId,
		});

		if (!students || students.length === 0) {
			return res
				.status(404)
				.json({
					message: `No students found in cohort ${cohortId} for this school.`,
				});
		}

		const billingCode = `BILL-<span class="math-inline">\{Date\.now\(\)\}\-</span>{cohortId}`; // Generate a unique billing code
		const createdBillings = [];

		for (const student of students) {
			const newBilling = new Billing({
				billingCode: `<span class="math-inline">\{billingCode\}\-</span>{student.studentId}`, // Make it unique per student
				description,
				amount,
				dueDate,
				createdBy: req.user._id, // Assuming user info is available in req.user
				schoolId: schoolId,
				studentIds: [student._id], // Link to the individual student
			});

			const savedBilling = await newBilling.save();

			// Optionally, update the student's account balance and add a transaction
			student.accountBalance += amount;
			student.transactions.push(savedBilling._id);
			await student.save();

			createdBillings.push(savedBilling);
		}

		res.status(201).json({
			message: `Billing created for ${students.length} students in cohort ${cohortId}.`,
			billings: createdBillings,
		});
	} catch (error) {
		console.error("Error billing cohort:", error);
		res.status(500).json({
			message: "Failed to bill cohort.",
			error: error.message,
		});
	}
};

exports.billStudent = async (req, res) => {
	try {
		const { studentId } = req.params;
		const { description, amount, dueDate } = req.body;
		const schoolId = req.user.schoolId;

		if (!description || !amount) {
			return res
				.status(400)
				.json({ message: "Description and amount are required." });
		}

		const student = await Student.findOne({
			_id: studentId,
			schoolId: schoolId,
		});

		if (!student) {
			return res
				.status(404)
				.json({ message: `Student not found in this school.` });
		}

		const billingCode = `BILL-<span class="math-inline">\{Date\.now\(\)\}\-</span>{student.studentId}`;
		const newBilling = new Billing({
			billingCode,
			description,
			amount,
			dueDate,
			createdBy: req.user._id,
			schoolId: schoolId,
			studentIds: [student._id],
		});

		const savedBilling = await newBilling.save();

		// Update the student's account balance and add a transaction
		student.accountBalance += amount;
		student.transactions.push(savedBilling._id);
		await student.save();

		res.status(201).json({
			message: `Billing created for student ${student.adm_no}.`,
			billing: savedBilling,
		});
	} catch (error) {
		console.error("Error billing student:", error);
		res.status(500).json({
			message: "Failed to bill student.",
			error: error.message,
		});
	}
};

exports.getStudentBalance = async (req, res) => {
	try {
		const { studentId } = req.params;
		const schoolId = req.user.schoolId; // Assuming schoolId is available

		const student = await Student.findOne({
			_id: studentId,
			schoolId: schoolId,
		}).select("accountBalance adm_no");

		if (!student) {
			return res
				.status(404)
				.json({ message: "Student not found in this school." });
		}

		// Add authorization check here based on user role
		// For example, if the requester is a parent, verify if studentId is in their linked students.
		// If the requester is a teacher, verify if the student is in their class (you'll need to set up this relationship).

		res.status(200).json({
			studentId: student._id,
			admNo: student.adm_no,
			accountBalance: student.accountBalance,
		});
	} catch (error) {
		console.error("Error getting student balance:", error);
		res.status(500).json({
			message: "Failed to get student balance.",
			error: error.message,
		});
	}
};

exports.getStudentTransactions = async (req, res) => {
	try {
		const { studentId } = req.params;
		const schoolId = req.user.schoolId;

		const student = await Student.findOne({
			_id: studentId,
			schoolId: schoolId,
		});

		if (!student) {
			return res
				.status(404)
				.json({ message: "Student not found in this school." });
		}

		// Add authorization check here for parents

		const transactions = await Transaction.find({ studentId: studentId })
			.sort({ transactionDate: -1 }) // Sort by date descending
			.populate("createdBy", "first_name last_name"); // Optionally populate the admin who created the transaction

		res.status(200).json(transactions);
	} catch (error) {
		console.error("Error getting student transactions:", error);
		res.status(500).json({
			message: "Failed to get student transactions.",
			error: error.message,
		});
	}
};

// In your transactions controller
exports.recordPayment = async (req, res) => {
	try {
		const {
			studentAdmNo,
			amount,
			transactionDate,
			paymentMethod,
			reference,
			description,
			schoolId,
			userId,
			role,
		} = req.body;

		if (role !== "finance") {
			return res
				.status(400)
				.json({
					message: "School ID not found for authenticated user.",
				});
		}
		const school = await School.findOne({ schoolId: schoolId });
		const schoolObjectId = school._id;
		const createdBy = userId;

		if (!schoolObjectId) {
			return res
				.status(400)
				.json({
					message: "School ID not found for authenticated user.",
				});
		}

		// 1. Find the student by adm_no and schoolId
		const student = await Student.findOne({
			adm_no: studentAdmNo,
			schoolId: schoolObjectId,
		});

		if (!student) {
			return res
				.status(404)
				.json({
					message: `Student with admission number ${studentAdmNo} not found in this school.`,
				});
		}

		// 2. Create a new Transaction document
		const newTransaction = new Transaction({
			studentId: student._id,
			transactionType: "PAYMENT", // Always 'PAYMENT' for manual recording of incoming funds
			description: description || `Payment for fees - ${paymentMethod}`,
			amount: -Math.abs(amount), // Ensure amount is neg for payments
			transactionDate: transactionDate || Date.now(),
			paymentMethod: paymentMethod,
			reference: reference, // M-Pesa transaction ID or bank reference
			createdBy: createdBy,
		});

		await newTransaction.save();

		// 3. Update student's account balance
		student.accountBalance += newTransaction.amount; // newTransaction.amount is already negative
		student.transactions.push(newTransaction._id); // Link transaction to student
		await student.save();

		res.status(201).json({
			message:
				"Payment recorded successfully and student balance updated.",
			transaction: newTransaction,
			studentBalance: student.accountBalance,
		});
	} catch (error) {
		console.error("Error recording payment:", error);
		res.status(500).json({
			message: "Failed to record payment.",
			error: error.message,
		});
	}
};

/*
exports.initiateMpesaPayment = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { phoneNumber, amount } = req.body;
        const userId = req.user.id; // Assuming parent's user ID
        const schoolId = req.user.schoolId;

        // 1. Find the student and verify they are linked to the parent
        const parent = await Parent.findOne({ userId: userId, studentIds: studentId });
        const student = await Student.findOne({ _id: studentId, schoolId: schoolId });

        if (!parent || !student) {
            return res.status(404).json({ message: 'Student or parent link not found.' });
        }

        if (!phoneNumber || !amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: 'Invalid phone number or amount.' });
        }

        // 2. Construct the MPesa API request payload
        const mpesaRequestPayload = {
            BusinessShortCode: process.env.MPESA_BUSINESS_SHORTCODE,
            Password: generateMpesaPassword(), // Implement password generation
            Timestamp: generateMpesaTimestamp(), // Implement timestamp generation
            TransactionType: 'CustomerPayBillOnline', // Or similar
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: process.env.MPESA_BUSINESS_SHORTCODE,
            PhoneNumber: phoneNumber,
            CallBackURL: `${process.env.BACKEND_URL}/api/finance/mpesa/callback`, // Your callback URL
            AccountReference: student.studentId, // Unique identifier
            TransactionDesc: `School Fees Payment for ${student.firstName} ${student.surname}`,
        };

        // 3. Make the API call to the MPesa gateway
        const mpesaResponse = await axios.post(
            process.env.MPESA_API_URL,
            mpesaRequestPayload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await getMpesaAccessToken()}`, // Implement token retrieval
                },
            }
        );

        // 4. Handle the MPesa API response
        if (mpesaResponse.data.ResponseCode === '0') {
            // Request successful, MPesa will send a callback
            res.status(200).json({ message: 'MPesa payment initiated successfully.', mpesaResponse: mpesaResponse.data });
            // You might want to store some pending transaction details in your database
        } else {
            console.error('MPesa API Error:', mpesaResponse.data);
            res.status(500).json({ message: 'Failed to initiate MPesa payment.', mpesaError: mpesaResponse.data });
        }

    } catch (error) {
        console.error('Error initiating MPesa payment:', error);
        res.status(500).json({ message: 'Failed to initiate MPesa payment.', error: error.message });
    }
};*/
// Implement helper functions: generateMpesaPassword, generateMpesaTimestamp, getMpesaAccessToken

/*
exports.mpesaCallback = async (req, res) => {
    try {
        const callbackData = req.body;
        console.log('MPesa Callback Data:', callbackData);

        if (callbackData.Body.stkCallback.ResultCode === 0) {
            // Payment successful
            const merchantRequestID = callbackData.Body.stkCallback.MerchantRequestID;
            const checkoutRequestID = callbackData.Body.stkCallback.CheckoutRequestID;
            const mpesaTransactionID = callbackData.Body.stkCallback.CallbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber').Value;
            const amountPaid = parseFloat(callbackData.Body.stkCallback.CallbackMetadata.Item.find(item => item.Name === 'Amount').Value);
            const phoneNumber = callbackData.Body.stkCallback.CallbackMetadata.Item.find(item => item.Name === 'PhoneNumber').Value;
            const accountReference = callbackData.Body.stkCallback.CallbackMetadata.Item.find(item => item.Name === 'AccountReference').Value; // This should be the studentId

            // 1. Find the student by accountReference (studentId)
            const student = await Student.findOne({ studentId: accountReference });
            if (student) {
                // 2. Update the student's account balance
                student.accountBalance -= amountPaid;
                student.transactions.push({
                    transactionType: 'PAYMENT',
                    description: 'MPesa Payment',
                    amount: -amountPaid,
                    paymentMethod: 'MPesa',
                    reference: mpesaTransactionID,
                });
                await student.save();
                console.log(`MPesa payment of ${amountPaid} recorded for student ${accountReference}`);
            } else {
                console.error(`Student with ID ${accountReference} not found for MPesa payment.`);
            }

            // Respond to MPesa to acknowledge receipt
            res.json({ ResultCode: 0, ResultDesc: 'Success' });

        } else {
            // Payment failed
            console.error('MPesa Payment Failed:', callbackData.Body.stkCallback);
            // Optionally, update any pending transaction status in your database
            res.json({ ResultCode: callbackData.Body.stkCallback.ResultCode, ResultDesc: callbackData.Body.stkCallback.ResultDesc });
        }

    } catch (error) {
        console.error('Error handling MPesa callback:', error);
        res.status(500).json({ message: 'Error processing MPesa callback.' });
    }
};*/

/*
exports.createStripePaymentIntent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { amount, currency } = req.body;
        const userId = req.user.id;
        const schoolId = req.user.schoolId;

        const parent = await Parent.findOne({ userId: userId, studentIds: studentId });
        const student = await Student.findOne({ _id: studentId, schoolId: schoolId });

        if (!parent || !student) {
            return res.status(404).json({ message: 'Student or parent link not found.' });
        }

        if (!amount || isNaN(amount) || amount <= 0 || !currency) {
            return res.status(400).json({ message: 'Invalid amount or currency.' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            description: `School Fees Payment for ${student.firstName} <span class="math-inline">\{student\.surname\} \(</span>{student.studentId})`,
            metadata: { studentId: studentId }, // Useful for tracking
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });

    } catch (error) {
        console.error('Error creating Stripe Payment Intent:', error);
        res.status(500).json({ message: 'Failed to create Stripe Payment Intent.', error: error.message });
    }
};*/

/*
exports.finalizeStripePayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            const studentId = paymentIntent.metadata.studentId;
            const amountPaid = paymentIntent.amount / 100; // Convert back to your currency's base unit

            const student = await Student.findById(studentId);
            if (student) {
                student.accountBalance -= amountPaid;
                student.transactions.push({
                    transactionType: 'PAYMENT',
                    description: 'Stripe Payment',
                    amount: -amountPaid,
                    paymentMethod: 'Stripe',
                    reference: paymentIntent.id,
                });
                await student.save();
                res.status(200).json({ message: 'Stripe payment recorded successfully.' });
            } else {
                res.status(404).json({ message: 'Student not found for Stripe payment.' });
            }
        } else {
            res.status(400).json({ message: `Stripe payment not successful. Status: ${paymentIntent.status}` });
        }

    } catch (error) {
        console.error('Error finalizing Stripe payment:', error);
        res.status(500).json({ message: 'Failed to finalize Stripe payment.', error: error.message });
    }
};*/
