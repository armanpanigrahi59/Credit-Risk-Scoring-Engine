export const initialApplicant = {
  loan_amount_inr: 2800000,
  annual_income_inr: 1200000,
  property_value_inr: 4200000,
  term_months: 240,
  cibil_score: 760,
  dti_ratio: 32,
  age_band: "35-44",
  gender: "Joint",
  region: "North",
  loan_product: "Home Loan",
  loan_purpose: "Home Purchase",
  employment_type: "Salaried",
  bureau_type: "CIBIL",
  co_applicant: true,
  pre_approved: false
};

export const applicantPresets = {
  "Prime Home": initialApplicant,
  "Thin Margin": {
    ...initialApplicant,
    loan_amount_inr: 3600000,
    annual_income_inr: 780000,
    property_value_inr: 4100000,
    cibil_score: 672,
    dti_ratio: 54,
    age_band: "25-34",
    region: "south",
    co_applicant: false
  },
  "Vehicle Buyer": {
    ...initialApplicant,
    loan_amount_inr: 850000,
    annual_income_inr: 900000,
    property_value_inr: 1100000,
    term_months: 60,
    cibil_score: 720,
    dti_ratio: 28,
    loan_product: "Vehicle Loan",
    loan_purpose: "Vehicle Purchase"
  },
  "Business Need": {
    ...initialApplicant,
    loan_amount_inr: 1800000,
    annual_income_inr: 1050000,
    property_value_inr: 2500000,
    term_months: 96,
    cibil_score: 690,
    dti_ratio: 46,
    loan_product: "Business Loan",
    loan_purpose: "Business Expansion",
    employment_type: "Self-employed"
  }
};

export const initialCreditCardApplicant = {
  limit_bal: 120000,
  sex: 2, // Female
  education: 2, // University
  marriage: 2, // Single
  age: 29,
  pay_0: 0,
  pay_2: 0,
  pay_3: 0,
  pay_4: 0,
  pay_5: 0,
  pay_6: 0,
  bill_amt1: 25000,
  bill_amt2: 24000,
  bill_amt3: 22000,
  bill_amt4: 18000,
  bill_amt5: 15000,
  bill_amt6: 12000,
  pay_amt1: 2000,
  pay_amt2: 2000,
  pay_amt3: 1500,
  pay_amt4: 1500,
  pay_amt5: 1000,
  pay_amt6: 1000
};

export const ccPresets = {
  "Prime Profile": {
    limit_bal: 300000,
    sex: 2,
    education: 1, // Graduate school
    marriage: 2,
    age: 32,
    pay_0: -1, pay_2: -1, pay_3: -1, pay_4: -1, pay_5: -1, pay_6: -1,
    bill_amt1: 15000, bill_amt2: 12000, bill_amt3: 18000, bill_amt4: 14000, bill_amt5: 9000, bill_amt6: 11000,
    pay_amt1: 15000, pay_amt2: 12000, pay_amt3: 18000, pay_amt4: 14000, pay_amt5: 9000, pay_amt6: 11000
  },
  "Revolving Debt": {
    limit_bal: 80000,
    sex: 1,
    education: 2, // University
    marriage: 1,
    age: 40,
    pay_0: 0, pay_2: 0, pay_3: 0, pay_4: 0, pay_5: 0, pay_6: 0,
    bill_amt1: 72000, bill_amt2: 70000, bill_amt3: 68000, bill_amt4: 65000, bill_amt5: 62000, bill_amt6: 58000,
    pay_amt1: 3000, pay_amt2: 3000, pay_amt3: 2500, pay_amt4: 2500, pay_amt5: 2000, pay_amt6: 2000
  },
  "Payment Delay": {
    limit_bal: 100000,
    sex: 1,
    education: 3, // High school
    marriage: 2,
    age: 26,
    pay_0: 2, pay_2: 2, pay_3: 2, pay_4: 2, pay_5: 2, pay_6: 2,
    bill_amt1: 85000, bill_amt2: 83000, bill_amt3: 82000, bill_amt4: 80000, bill_amt5: 75000, bill_amt6: 72000,
    pay_amt1: 0, pay_amt2: 0, pay_amt3: 0, pay_amt4: 0, pay_amt5: 0, pay_amt6: 0
  }
};

export const payStatusOptions = [
  { value: -2, label: "No consumption" },
  { value: -1, label: "Paid in full" },
  { value: 0, label: "Revolving credit" },
  { value: 1, label: "1 month delay" },
  { value: 2, label: "2 months delay" },
  { value: 3, label: "3 months delay" },
  { value: 4, label: "4 months delay" },
  { value: 5, label: "5 months delay" },
  { value: 6, label: "6 months delay" },
  { value: 7, label: "7 months delay" },
  { value: 8, label: "8+ months delay" }
];

export const filterOptions = ["All", "Low", "Medium", "High", "Critical"];
