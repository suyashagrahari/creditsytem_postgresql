const pool = require("../db");

const { calculateCreditScore, determineLoanApproval,generateUniqueRandomNumbers } = require("../helper");

const CreateLoan = async (req, res) => {
    const { customer_id, loan_amount, interest_rate, tenure } = req.body;
 
    const uniqueNumbers = generateUniqueRandomNumbers(1);
   
    try {
      const customerData = await pool.query('SELECT * FROM customers WHERE customerid = $1', [customer_id]);
    
  
      const loanHistory = await pool.query('SELECT * FROM loans WHERE customerid = $1', [customer_id]);
      const creditScore = calculateCreditScore(loanHistory.rows,customerData.rows[0]);
      const approvalDetail = determineLoanApproval(loanHistory.rows,creditScore, loan_amount, interest_rate, customerData.rows[0],tenure);
  
      
      const approvalDetails = await pool.query(
        'INSERT INTO loans (customerid, loanid, loanamount, interestrate, tenure) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [customer_id, uniqueNumbers[0], loan_amount, interest_rate, tenure]
      );
  
      res.status(200).json({
        "message" : approvalDetail.message,
        "loan_id" : approvalDetails.rows[0].loanid,
        "customer_id" : approvalDetail.customer_id,
        "loan_approved" : approvalDetail.approval,
        "monthly_installment" : approvalDetail.monthly_installment,
      })
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {CreateLoan};