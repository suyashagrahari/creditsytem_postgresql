const pool = require("../db");
const { calculateCreditScore,determineLoanApproval } = require("../helper");


const CheckEligibility = async (req, res) => {
  const { customer_id, loan_amount, interest_rate, tenure } = req.body;
  console.log(req.body);
  try {
    // Fetch customer data and loan history
    const customerData = await pool.query(
      "SELECT * FROM customers WHERE customerid = $1",
      [customer_id]
    );
    const loanHistory = await pool.query(
      "SELECT * FROM loans WHERE customerid = $1",
      [customer_id]
    );

    console.log(customerData.rows);
    console.log(loanHistory.rows);

    // Calculate credit score
    console.log("hello dosto");
    const creditScore = calculateCreditScore(
      loanHistory.rows,
      customerData.rows[0]
    );

    console.log(creditScore);
    console.log("hello dosto credit score agya");

    // Determine loan approval and interest rate based on credit score
    const approvalDetails = determineLoanApproval(
      loanHistory.rows,
      creditScore,
      loan_amount,
      interest_rate,
      customerData.rows[0],
      tenure
    );

    res.json(approvalDetails);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {CheckEligibility};