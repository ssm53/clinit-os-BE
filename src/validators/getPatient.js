export function validateGetPatientAppt(input) {
  const validationErrors = {};
  if (input.length !== 12 || !/^[0-9]{12}$/.test(input)) {
    validationErrors["IC"] =
      "Invalid IC format. Make sure no '-'. Correct format example: 960916125792";
  }

  return validationErrors;
}
