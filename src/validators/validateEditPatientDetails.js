export function validateEditPatientDetails(input) {
  const validationErrors = {};

  if (
    !("IC" in input) ||
    input["IC"].length !== 12 ||
    !/^[0-9]{12}$/.test(input["IC"])
  ) {
    validationErrors["IC"] = "Invalid IC format";
  }

  return validationErrors;
}
