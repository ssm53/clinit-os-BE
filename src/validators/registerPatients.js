// price one maybe not the best yet

export function validatePatientRegistration(input) {
  const validationErrors = {};

  if (!("name" in input) || input["name"].length == 0) {
    validationErrors["name"] = "cannot be blank";
  }

  if (!("IC" in input) || input["IC"].length == 0) {
    validationErrors["IC"] = "cannot be blank";
  } else if ("IC" in input && input["IC"].length != 12) {
    validationErrors["IC"] = "wrong IC number!";
  }

  if (!("age" in input) || input["age"].length == 0) {
    validationErrors["age"] = "cannot be blank";
  }

  if (!("gender" in input) || input["gender"].length == 0) {
    validationErrors["gender"] = "cannot be blank";
  }

  if (!("email" in input) || input["email"].length == 0) {
    validationErrors["email"] = "cannot be blank";
  }

  if (!("contact" in input) || input["contact"].length == 0) {
    validationErrors["contact"] = "cannot be blank";
  }

  if (!("race" in input) || input["race"].length == 0) {
    validationErrors["race"] = "cannot be blank";
  }

  return validationErrors;
}