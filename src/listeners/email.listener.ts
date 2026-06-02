import { appEmitter, EVENTS, sendMail } from "src/utils";
import { ENV } from "src/constants";

// Signup verification email listener
appEmitter.on(
  EVENTS.EMAIL.SIGNUP,
  async (data: {
    email: string;
    companyName: string;
    activationCode: string;
  }) => {
    try {
      await sendMail({
        email: data.email,
        subject: "Verify your email",
        template: "emailActivation.ejs",
        data: {
          username: data.companyName,
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
    companyName: string;
    expiresInDays: number;
  }) => {
    try {
      const inviteUrl = `${ENV.FRONTEND_URL}/accept-invite?token=${data.token}`;
      await sendMail({
        email: data.email,
        subject: `You have been invited to join ${data.companyName}`,
        template: "invitation.ejs",
        data: {
          role: data.role,
          inviteUrl: inviteUrl,
          companyName: data.companyName,
          expiresInDays: data.expiresInDays,
        },
      });
    } catch (error) {
      console.error("Error sending invitation email:", error);
    }
  },
);

export const initEmailListeners = () => {
  console.log("Email listeners initialized");
};
