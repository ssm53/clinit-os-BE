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
    validationErrors["IC"] = "Invalid IC format";
  }

  if (!("age" in input) || isNaN(input["age"]) || input["age"] <= 0) {
    validationErrors["age"] = "Invalid age";
  }

  if (!("gender" in input) || input["gender"].length === 0) {
    validationErrors["gender"] = "Gender cannot be blank";
  }

  if (!("email" in input) || input["email"].length === 0) {
    validationErrors["email"] = "Email cannot be blank";
  }

  if (!("contact" in input) || input["contact"].length === 0) {
    validationErrors["contact"] = "Contact number cannot be blank";
  }

  if (!("race" in input) || input["race"].length === 0) {
    validationErrors["race"] = "Race cannot be blank";
  }

  if (!("reason" in input) || input["reason"].length === 0) {
    validationErrors["reason"] = "Reason cannot be blank";
  }

  if (!("doctor" in input) || input["doctor"].length === 0) {
    validationErrors["doctor"] = "Doctor cannot be blank";
  }

  return validationErrors;
}
