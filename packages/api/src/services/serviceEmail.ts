import nodemailer from "nodemailer";
import { AppScopes } from "@culturemap/core";

import { logger } from "./serviceLogging";
import { getApiConfig } from "../config";

// TODO: maybe use https://www.npmjs.com/package/email-templates

const apiConfigOnBoot = getApiConfig();

const transport = nodemailer.createTransport({
  host: apiConfigOnBoot.smtp.host,
  port: apiConfigOnBoot.smtp.port,
  secure: apiConfigOnBoot.smtp.secure, // true for 465, false for other ports
  auth: {
    user: apiConfigOnBoot.smtp.user, // generated ethereal user
    pass: apiConfigOnBoot.smtp.password, // generated ethereal password
  },
});

/* istanbul ignore next */
if (process.env.NODE_ENV !== "test") {
  transport
    .verify()
    .then(() => logger.info("Connected to email server"))
    .catch(() =>
      logger.warn(
        "Unable to connect to email server. Make sure you have configured the SMTP options in .env"
      )
    );
}

export const sendEmail = (to: string, subject: string, text: string) => {
  const apiConfig = getApiConfig();

  const msg = { from: apiConfig.email.from, to, subject, text };

  logger.info(`[service.email.sendMail]: ${subject}`);

  return transport.sendMail(msg).catch((error) => {
    logger.error(error);
  });
};

export const sendResetPasswordEmail = async (
  scope: AppScopes,
  to: string,
  token: string
) => {
  const apiConfig = getApiConfig();

  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `${apiConfig.baseUrl[scope]}/reset-password/?token=${token}`;

  let subject = "";
  let body = "";

  if (apiConfig.defaultLanguage === "en") {
    subject = `${apiConfig.email.subjectPrefix} Password reset requested`;
    body = `Dear user,

To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.

Thank you your, 
${apiConfig.appName} team`;
  }

  if (apiConfig.defaultLanguage === "de") {
    subject = `${apiConfig.email.subjectPrefix} Passwort zurück setzen`;
    body = `Liebe NutzerIn,

Folgen Sie bitte diesem Link um Ihr Passwort zu durch ein neues zu ersetzen: ${resetPasswordUrl}

Vielen Dank, 
Ihr ${apiConfig.appName} Team`;
  }

  await sendEmail(to, subject, body);
};

export const sendEmailConfirmationEmail = async (
  scope: AppScopes,
  to: string,
  token: string
) => {
  const apiConfig = getApiConfig();

  let subject = "";
  let body = "";

  const verificationEmailUrl = `${apiConfig.baseUrl[scope]}/email-confirmation/?token=${token}`;

  if (apiConfig.defaultLanguage === "en") {
    subject = `${apiConfig.email.subjectPrefix} Please verify your email`;
    body = `Dear user,

To verify your email, click on this link: ${verificationEmailUrl}
If you did not create a new account with us or just changed your email address, then please ignore this email.

Thank you your, 
${apiConfig.appName} team`;
  }

  if (apiConfig.defaultLanguage === "de") {
    subject = `${apiConfig.email.subjectPrefix} Bitte bestätigen Sie Ihre Email Adresse`;
    body = `Liebe NutzerIn,

Um die Registrierung abzuschließen bitten wir Sie Ihre Email Adresse durch Klicken auf den folgenden Link zu bestätigen: ${verificationEmailUrl}

Vielen Dank, 
Ihr ${apiConfig.appName} Team`;
  }

  await sendEmail(to, subject, body);
};

const defaults = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendEmailConfirmationEmail,
};
export default defaults;
