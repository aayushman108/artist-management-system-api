import { appEmitter, EVENTS, sendMail } from "src/utils";
import { ENV } from "src/constants";

// Signup verification email listener
appEmitter.on(
  EVENTS.EMAIL.SIGNUP,
  async (data: { email: string; name: string; activationCode: string }) => {
    try {
      await sendMail({
        email: data.email,
        subject: "Verify your email",
        template: "emailActivation.ejs",
        data: {
          username: data.name,
          activationCode: data.activationCode,
        },
      });
    } catch (error) {
      console.error("Error sending signup email:", error);
    }
  },
);

// Invite email listener
appEmitter.on(
  EVENTS.EMAIL.INVITE,
  async (data: {
    email: string;
    role: string;
    token: string;
    inviterName: string;
    expiresInDays: number;
  }) => {
    try {
      const inviteUrl = `${ENV.FRONTEND_URL}/accept-invite?token=${data.token}`;
      await sendMail({
        email: data.email,
        subject: `Invitation: ${data.role} access at Artist Management System`,
        template: "invitation.ejs",
        data: {
          role: data.role,
          inviteUrl: inviteUrl,
          inviterName: data.inviterName,
          expiresInDays: data.expiresInDays,
        },
      });
    } catch (error) {
      console.error("Error sending invitation email:", error);
    }
  },
);

// Forgot password email listener
appEmitter.on(
  EVENTS.EMAIL.FORGOT_PASSWORD,
  async (data: { email: string; fullName: string; resetToken: string }) => {
    try {
      const resetUrl = `${ENV.FRONTEND_URL}/reset-password?token=${data.resetToken}`;
      await sendMail({
        email: data.email,
        subject: "Reset your password - Artist Management System",
        template: "forgotPassword.ejs",
        data: {
          fullName: data.fullName,
          resetUrl,
        },
      });
    } catch (error) {
      console.error("Error sending forgot password email:", error);
    }
  },
);

export const initEmailListeners = () => {
  console.log("Email listeners initialized");
};
