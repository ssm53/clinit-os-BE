export function validateExistingPatientAppt(input) {
  const validationErrors = {};
  if (
    !("IC" in input) ||
    input["IC"].length !== 12 ||
    !/^[0-9]{12}$/.test(input["IC"])
  ) {
    validationErrors["IC"] =
      "Invalid IC format. Make sure no '-'. Correct format example: 960916125792";
  }

  if (!("reason" in input) || input["reason"].length === 0) {
    validationErrors["reason"] = "Reason should not be blank.";
  }

  return validationErrors;
}
