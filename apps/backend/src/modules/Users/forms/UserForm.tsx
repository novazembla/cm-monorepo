import { useTranslation } from "react-i18next";
import {
  FieldInput,
  FieldSwitch,
  FieldSelect,
  FieldRow,
  TwoColFieldRow,
} from "~/components/forms";
import { useFormContext } from "react-hook-form";

import { yupIsFieldRequired } from "~/validation";

export const UserForm = ({ data, errors, action, validationSchema }: { data?: any; errors?: any; validationSchema: any; action: "create" | "update" }) => {
  const { t } = useTranslation();
  const { watch } = useFormContext();

  const userBanned = watch("userBanned");

  return (
    <>
      <TwoColFieldRow>
        <FieldRow>
          <FieldInput
            name="firstName"
            id="firstName"
            type="text"
            label={t(
              "module.users.forms.update.field.label.firstName",
              "First Name"
            )}
            isRequired={yupIsFieldRequired(
              "firstName",
              validationSchema
            )}
            settings={{
              // defaultValue: data.abc.key
              placeholder: t(
                "module.users.forms.update.field.placeholder.firstName",
                "The user's first name"
              ),
            }}
          />
        </FieldRow>
        <FieldRow>
          <FieldInput
            name="lastName"
            id="lastName"
            type="text"
            label={t(
              "module.users.forms.update.field.label.lastName",
              "Last Name"
            )}
            isRequired={yupIsFieldRequired("lastName", validationSchema)}
            settings={{
              placeholder: t(
                "module.users.forms.update.field.placeholder.lastName",
                "The user's last name"
              ),
            }}
          />
        </FieldRow>
      </TwoColFieldRow>
      <FieldRow>
        <FieldInput
          name="email"
          id="email"
          type="email"
          label={t(
            "module.users.forms.update.field.label.email",
            "Email Address"
          )}
          isRequired={yupIsFieldRequired("email", validationSchema)}
          settings={{
            placeholder: t(
              "module.users.forms.update.field.placeholder.email",
              "The user's email address"
            ),
          }}
        />
      </FieldRow>
      <FieldRow>
        <FieldSelect
          name="role"
          id="role"
          label={t("module.users.forms.update.field.label.role", "User role")}
          isRequired={yupIsFieldRequired("role", validationSchema)}
          options={[
            {
              value: "user",
              label: t("role.user", "User"),
            },
            {
              value: "contributor",
              label: t("role.contributor", "Contributor"),
            },
            {
              value: "editor",
              label: t("role.editor", "Editor"),
            },
            {
              value: "administrator",
              label: t("role.administrator", "Administrator"),
            },
          ]}
          settings={{
            placeholder: t(
              "module.users.forms.update.field.placeholder.role",
              "Please choose the user's role"
            ),
          }}
        />
      </FieldRow>
      {action === "create" && <>
        <FieldRow>
          <FieldInput
            name="password"
            id="password"
            type="password"
            label={t(
              "module.users.forms.create.field.label.password",
              "Password"
            )}
            isRequired={yupIsFieldRequired("password",validationSchema)}
            settings={{
              autoComplete: "new-password",
              placeholder: t(
                "module.users.forms.create.field.placeholder.password",
                "Please enter the user's initial password"
              ),
            }}
          />
        </FieldRow>

        <FieldRow>
          <FieldInput
            name="confirmPassword"
            id="confirmPassword"
            type="password"
            label={t(
              "module.users.forms.create.field.label.passwordConfirmation",
              "Password confirmation"
            )}
            isRequired={yupIsFieldRequired("confirmPassword", validationSchema)}
            settings={{
              autoComplete: "new-password",
              placeholder: t(
                "module.users.forms.create.field.placeholder.passwordConfirmation",
                "Please confirm the user's initial password"
              ),
            }}
          />
        </FieldRow>
      
      
      </>}
      {action === "update" && <FieldRow isDangerZone={userBanned? t("module.users.forms.messageUserBanned", "The user is/will be banned on the platform"):undefined}>
        <FieldSwitch
          name="userBanned"
          label={
            <span>
              {t(
                "module.users.forms.update.field.label.userBanned",
                "Ban user on the platform"
              )}
            </span>
          }
          colorScheme="red"
          isRequired={yupIsFieldRequired("userBanned", validationSchema)}
        />
      </FieldRow>}
    </>
  );
};
export default UserForm;
