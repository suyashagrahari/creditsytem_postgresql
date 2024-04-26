const pool = require("../db");

const ViewStatement = async (req, res) => {
  const { customer_id, loan_id } = req.params;
  console.log(customer_id, loan_id);
  try {
    // Get the loan details

    const loanResult = await pool.query(
      `
    SELECT l.customerid, l.loanid, l.loanamount AS principal, l.interestrate, 
           (l.monthlypayment * l.tenure) - (l.monthlypayment * l.emispaidontime) AS amountpaid,
           l.monthlypayment AS monthlyinstallment,
           l.tenure - l.emispaidontime AS repaymentsleft
    FROM loans l
    WHERE l.customerid = $1 AND l.loanid = $2
  `,
      [customer_id, loan_id]
    );

    if (loanResult.rows.length === 0) {
      return res.status(404).json({ error: "Loan not found" });
    }

    res.status(200).json(loanResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { ViewStatement };
