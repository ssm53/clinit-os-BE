export function validateUser(input) {
  const validationErrors = {};

  if (!("name" in input) || input["name"].length == 0) {
    validationErrors["name"] = "cannot be blank";
  }

  if (!("email" in input) || input["email"].length == 0) {
    validationErrors["email"] = "cannot be blank";
  } else if (
    "email" in input &&
    !input["email"].match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
  ) {
    validationErrors["email"] = "is invalid";
  }

  if (!("password" in input) || input["password"].length == 0) {
    validationErrors["password"] = "cannot be blank";
  } else if ("password" in input && input["password"].length < 8) {
    validationErrors["password"] = "should be at least 8 characters";
  }

  return validationErrors;
}
