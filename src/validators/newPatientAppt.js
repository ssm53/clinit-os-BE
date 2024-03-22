export function validateNewPatientAppt(input) {
  const validationErrors = {};

  if (!("name" in input) || input["name"].length === 0) {
    validationErrors["name"] = "Name cannot be blank";
  }

  if (
    !("IC" in input) ||
    input["IC"].length !== 12 ||
    !/^[0-9]{12}$/.test(input["IC"])
  ) {
    validationErrors["IC"] =
      "Invalid IC format. Make sure no '-'. Correct format example: 960916125792";
  }

  if (!("contact" in input) || input["contact"].length === 0) {
    validationErrors["contact"] =
      "Contact number should not be blank. Contact number must be in number format. E.g. 0138920202. If you want to add it to whatsapp, input country code at the front ";
  }

  if (!("reason" in input) || input["reason"].length === 0) {
    validationErrors["reason"] = "Reason should not be blank";
  }

  return validationErrors;
}
