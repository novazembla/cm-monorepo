import nodemailer from "nodemailer";
import { AppScopes } from "@culturemap/core";

import { logger } from "./serviceLogging";
import { getApiConfig } from "../config";

// TODO: maybe use https://www.npmjs.com/package/email-templates

const apiConfig = getApiConfig();

const transport = nodemailer.createTransport({
  host: apiConfig.smtp.host,
  port: apiConfig.smtp.port,
  secure: apiConfig.smtp.secure, // true for 465, false for other ports
  auth: {
    user: apiConfig.smtp.user, // generated ethereal user
    pass: apiConfig.smtp.password, // generated ethereal password
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
  // TODO: multilang?
  const subject = `${apiConfig.email.subjectPrefix} Password reset requested`;

  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `${apiConfig.baseUrl[scope]}/reset-password/?token=${token}`;

  // multilang, how? Multilang TODO: Multilang
  const text = `Dear user,

To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.

Thank you your, 
${apiConfig.appName} team`;

  await sendEmail(to, subject, text);
};

export const sendEmailConfirmationEmail = async (
  scope: AppScopes,
  to: string,
  token: string
) => {
  // TODO: multilang?
  const subject = `${apiConfig.email.subjectPrefix} Please verify your email`;

  // replace this url with the link to the reset password page of your front-end app
  const verificationEmailUrl = `${apiConfig.baseUrl[scope]}/email-confirmation/?token=${token}`;

  // multilang, how? Multilang TODO: Multilang
  const text = `Dear user,

To verify your email, click on this link: ${verificationEmailUrl}
If you did not create a new account with us or just changed your email address, then please ignore this email.

Thank you your, 
${apiConfig.appName} team`;

  await sendEmail(to, subject, text);
};

export default {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendEmailConfirmationEmail,
};
