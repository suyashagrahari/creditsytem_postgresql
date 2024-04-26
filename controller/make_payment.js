const pool = require("../db");
const { calculateMonthlyInstallment, parseDate } = require("../helper");

const MakePayment = async (req, res) => {
  const { customer_id, loan_id } = req.params;
  const { amount } = req.body;

  try {
    // Get the loan details
  
    const loanResult = await pool.query( `
    SELECT loanamount, tenure, interestrate, monthlypayment, emispaidontime, enddate
    FROM loans
    WHERE customerid = $1 AND loanid = $2
  `, [customer_id, loan_id]);

    if (loanResult.rows.length === 0) {
      return res.status(404).json({ error: "Loan not found" });
    }

    const {
      loanamount,
      tenure,
      interestrate,
      monthlypayment,
      emispaidontime,
      enddate,
    } = loanResult.rows[0];

    // Calculate the new monthly payment and remaining EMIs
    let newMonthlyPayment, remainingEmis;
    if (amount < monthlypayment) {
      // If the amount paid is less than the due installment, recalculate monthly payment
      const remainingAmount =
        loanamount - emispaidontime * monthlypayment - amount;
      console.log(remainingAmount);

      const remainingTenure = tenure - emispaidontime;
      console.log(remainingTenure);

      newMonthlyPayment = calculateMonthlyInstallment(
        remainingAmount,
        remainingTenure,
        interestrate
      );
      console.log(newMonthlyPayment);

      remainingEmis = remainingTenure;
      console.log(remainingEmis);
    } else {
      // If the amount paid is more than or equal to the due installment, keep the same monthly payment
      newMonthlyPayment = monthlypayment;
      console.log("else", newMonthlyPayment);

      remainingEmis = tenure - emispaidontime - 1;
      console.log("else", remainingEmis);
    }

    // Update the loan details
    const updateQuery = `
      UPDATE loans
      SET monthlypayment = $1, emispaidontime = emispaidontime + 1
      WHERE customerid = $2 AND loanid = $3
    `;
    await pool.query(updateQuery, [newMonthlyPayment, customer_id, loan_id]);

    res.status(200).json({
      message: "Payment successful",
      newMonthlyPayment,
      remainingEmis,
      endDate:
        remainingEmis === 0
          ? new Date().toISOString().slice(0, 10)
          : enddate
          ? parseDate(enddate)
          : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { MakePayment };
