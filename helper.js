const fs = require("fs");

function calculateCreditScore(loanHistory, customerData) {
  let creditScore = 100;
  console.log(customerData);
  // i. Past Loans paid on time
  const loansPaidOnTime = loanHistory.filter(
    (loan) => loan.emispaidontime === loan.tenure
  );

  creditScore = creditScore - (100 - loansPaidOnTime.length * 10);

  // ii. No of loans taken in past
  const numberOfLoans = loanHistory.length;

  creditScore = creditScore - numberOfLoans * 5;

  // iii. Loan activity in current year
  const currentYear = new Date().getFullYear();

  const loansInCurrentYear = loanHistory.filter(
    (loan) => new Date(loan.dateofapproval).getFullYear() === currentYear
  );

  creditScore = creditScore - loansInCurrentYear.length * 10;

  // iv. Loan approved volume
  const totalLoanAmount = loanHistory.reduce(
    (sum, loan) => sum + parseInt(loan.loanamount),
    0
  );

  creditScore = creditScore - Math.floor(totalLoanAmount / 100000);

  // v. If sum of current loans > approved limit
  const currentLoans = loanHistory.filter(
    (loan) => new Date(loan.enddate) > new Date()
  );

  const currentLoanAmount = currentLoans.reduce(
    (sum, loan) => sum + loan.loanamount,
    0
  );

  if (currentLoanAmount > customerData.approvedlimit) {
    creditScore = 0;
  }

  return Math.max(creditScore, 0);
}

function determineLoanApproval(
  loanHistory,
  creditScore,
  loan_amount,
  interest_rate,
  customerData,
  tenure
) {
  const { monthlysalary, approvedlimit } = customerData;

  const monthly_installment = calculateMonthlyInstallment(
    loan_amount,
    interest_rate,
    tenure
  );
  const currentLoans = loanHistory.filter(
    (loan) => new Date(loan.enddate) > new Date()
  );

  const currentMonthlyInstallments = currentLoans.reduce(
    (sum, loan) => sum + loan.monthlypayment,
    0
  );

  let approvalDetails = {
    customer_id: customerData.customerid,
    approval: false,
    interest_rate,
    corrected_interest_rate: interest_rate,
    tenure,
    monthly_installment,
  };

  if (currentMonthlyInstallments + monthly_installment > 0.5 * monthlysalary) {
    approvalDetails.message =
      "Loan not approved: Total EMIs exceed 50% of monthly income";
    return approvalDetails;
  }

  if (creditScore > 50) {
    approvalDetails.approval = true;
  } else if (creditScore > 30) {
    approvalDetails.approval = true;
    approvalDetails.corrected_interest_rate = Math.max(interest_rate, 12);
  } else if (creditScore > 10) {
    approvalDetails.approval = true;
    approvalDetails.corrected_interest_rate = Math.max(interest_rate, 16);
  } else {
    approvalDetails.message = "Loan not approved: Credit score too low";
  }

  return approvalDetails;
}

function calculateMonthlyInstallment(principal, interest_rate, tenure) {
  const r = interest_rate / (12 * 100); // Convert interest rate to monthly rate
  const n = tenure * 12; // Convert tenure to months
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return emi;
}

// Function to generate a unique random number
function generateUniqueRandomNumber(existingNumbers) {
  let randomNum;
  do {
    randomNum = Math.floor(Math.random() * 90000) + 10000; // Generate a random number between 10000 and 99999
  } while (existingNumbers.has(randomNum)); // Continue generating until a unique number is found
  return randomNum;
}

// Function to generate 5 unique random numbers
function generateUniqueRandomNumbers(count) {
  const existingNumbers = new Set(); // Set to store generated numbers
  const uniqueNumbers = [];
  for (let i = 0; i < count; i++) {
    const randomNumber = generateUniqueRandomNumber(existingNumbers);
    existingNumbers.add(randomNumber); // Add generated number to the set
    uniqueNumbers.push(randomNumber); // Add generated number to the array
  }
  return uniqueNumbers;
}

function parseDate(dateString) {
  try {
    const dateParts = dateString.split("/"); // Assuming the date format is 'DD/MM/YY'
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Months are zero-based (0-11)
    const year = 2000 + parseInt(dateParts[2], 10); // Assuming years are in the range 2000-2099
    const parsedDate = new Date(year, month, day);
    return parsedDate.toISOString().slice(0, 10);
  } catch (error) {
    console.error("Error parsing date:", error);
    return null;
  }
}

module.exports = {
  calculateCreditScore,
  calculateMonthlyInstallment,
  determineLoanApproval,
  generateUniqueRandomNumbers,
  parseDate,
};
