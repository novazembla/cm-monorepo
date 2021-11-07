import { string, object, ref, boolean } from "yup";

import { passwordMinimumLength } from "~/config";

export const ModuleUsersUpdateSchema = object().shape({
  firstName: string().required(),
  lastName: string().required(),
  email: string().required().email(),
  role: string().required(),
  ownsEventImports: boolean(),
  ownsContentOnDelete: boolean(),
});

export const ModuleUsersCreateSchema = ModuleUsersUpdateSchema.concat(
  object().shape({
    password: string().required().min(passwordMinimumLength),
    confirmPassword: string()
      .required()
      // t("module.users.forms.create.field.confirmPasswordNoMatch", "The passwords do not match")
      .oneOf(
        [ref("password"), null],
        "module.users.forms.create.field.confirmPasswordNoMatch"
      ),
  })
);
