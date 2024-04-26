const pool = require('../db');
const {generateUniqueRandomNumbers}  = require("../helper")


const Register = async (req, res) => {
  const uniqueNumbers = generateUniqueRandomNumbers(1); // Generate 5 unique random numbers
  console.log(uniqueNumbers);

  const { first_name, last_name, age, monthly_income, phone_number } = req.body;
  console.log(req.body);
  console.log(monthly_income);
  const approved_limit = Math.round((monthly_income * 36) / 100000) * 100000;

  console.log(approved_limit);

  pool.query(
    "insert into customers (customerid, firstname, lastname,age, phonenumber, monthlysalary, approvedlimit, currentdebt) values ($1,$2,$3,$4,$5,$6,$7,$8) returning *",
    [
      uniqueNumbers[0],
      first_name,
      last_name,
      age,
      phone_number,
      monthly_income,
      approved_limit,
      0,
    ],
    (err, result) => {
      console.log(result);
      if (err) {
        console.log(err);
      }
      res.status(200).json({
        message: "Data created successfully",
        data: result.rows[0],
      });
      console.log("bdjkand");
    }
  );
};

module.exports = {Register}