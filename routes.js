const express = require('express');
const router = express.Router();

const {Register} = require("./controller/register");
const {CheckEligibility} = require("./controller/check_eligibility");
const {CreateLoan} = require("./controller/create_loan")
const {ViewLoan} = require("./controller/view_loan");
const {MakePayment} = require("./controller/make_payment");
const {ViewStatement} = require("./controller/view_statement");


// Register
router.post("/register", Register);
// Check loan eligibility
router.post('/check-eligibility',CheckEligibility);
// Create a new loan
router.post('/create-loan', CreateLoan);
// View loan details
router.get('/view-loan/:loanid', ViewLoan);
// Make a payment
router.post('/make-payment/:customer_id/:loan_id', MakePayment);
// View loan statement
router.get('/view-statement/:customer_id/:loan_id', ViewStatement);

module.exports = router;