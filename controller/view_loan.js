const pool = require("../db");



const ViewLoan = async (req, res) => {
  const { loanid } = req.params;

  try {
    const loanDetails = await pool.query(
      "SELECT l.*, c.firstname, c.lastname, c.phonenumber, c.age FROM loans l JOIN customers c ON l.customerid = c.customerid WHERE l.loanid = $1",
      [loanid]
    );

    if (loanDetails.rows.length === 0) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.status(200).json({
      loan_id: loanDetails.rows[0].loanid,
      customer: {
        customer_id: loanDetails.rows[0].customerid,
        first_name: loanDetails.rows[0].firstname,
        last_name: loanDetails.rows[0].lastname,
        phone_no: loanDetails.rows[0].phoneno,
        age: loanDetails.rows[0].age,
      },
      loan_amount: loanDetails.rows[0].loanamount,
      interest_rate: loanDetails.rows[0].interestrate,
      monthly_installment: loanDetails.rows[0].monthlypayment,
      tenure: loanDetails.rows[0].tenure,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {ViewLoan};