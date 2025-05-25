const express = require("express");
const router = express.Router();

const {
	billCohort,
	billStudent,
	getStudentBalance,
	getStudentTransactions,
	recordPayment,
} = require("../controllers/financeController");
const requireAdmin = require("../middleware/requireAdmin");

router.post("/cohorts/:cohortId/bill", requireAdmin, billCohort);
router.post("/students/:studentId/bill", requireAdmin, billStudent);
router.get("/students/:studentId/balance", requireAdmin, getStudentBalance);
router.get(
	"students/:studentId/transactions",
	requireAdmin,
	getStudentTransactions
);
router.post("/record-payment", recordPayment);
// router.post("/students/:studentId/pay/mpesa", requireAdmin, initiateMpesaPayment);
// router.post("/mpesa/callback", requireAdmin, mpesaCallback);
// router.post("/students/:studentId/pay/stripe", requireAdmin, createStripePaymentIntent);
// router.post("/stripe/payment/success", requireAdmin, finalizeStripePayment);

module.exports = router;
