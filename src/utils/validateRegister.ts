import { UsernamePasswordInput } from "../resolvers/_inputTypes";

export const validateRegister = (authinfo: UsernamePasswordInput) => {
  /* E-Mail Validation */
  if (!authinfo.email.includes("@")) {
    return [
      {
        field: "email",
        message: "Invalid e-mail address.",
      },
    ];
  }

  /*  Username  =/= E-mail structure */
  if (authinfo.username.includes("@")) {
    return [
      {
        field: "username",
        message: "Username can't contain @ symbol. ",
      },
    ];
  }
  /*  Username length validation */
  if (authinfo.username.length <= 2) {
    return [
      {
        field: "username",
        message: "username too short, must be 3 or more letters",
      },
    ];
  }

  /* Password length validation */
  if (authinfo.password.length <= 4) {
    return [
      {
        field: "password",
        message: "password too short, must be 5 or more letters",
      },
    ];
  }

  return null;
};
