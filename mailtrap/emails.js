const {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} = require("./emailTemplates");
const transport = require("./mailtrap.config");

const sendVerificationEmail = async (email, verificationToken) => {
  await transport.sendMail({
    from: "mailtrap@demomailtrap.com",
    to: email,
    subject: "Verify you're email ✔",
    html: VERIFICATION_EMAIL_TEMPLATE.replace(
      "{verificationCode}",
      verificationToken
    ),
  });
};

const sendWelcomeEmail = async (email, name) => {
  try {
    const response = await transport.sendMail({
      from: "mailtrap@demomailtrap.com",
      to: email,
      subject: `Welcome ${name}!!`,
      text: "Welcome, you are verified now!",
    });
    console.log("Welcome email sent successfully", response);
  } catch (error) {
    console.error(`Error sending welcome email`, error);
    throw new Error(`Error sending welcome email: ${error}`);
  }
};

const sendPasswordResetEmail = async (email, resetURL) => {
  try {
    await transport.sendMail({
      from: "mailtrap@demomailtrap.com",
      to: email,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
    });
  } catch (error) {
    console.error(`Error sending welcome email`, error);
    throw new Error(`Error sending welcome email: ${error}`);
  }
};

const sendResetSuccessEmail = async (email) => {
  try {
    await transport.sendMail({
      from: "mailtrap@demomailtrap.com",
      to: email,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });
  } catch (error) {
    console.error(`Error sending password reset success email`, error);
    throw new Error(`Error sending password reset success email: ${error}`);
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
};
