import { appEmitter, EVENTS, sendMail } from "src/utils";

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

export const initEmailListeners = () => {
  console.log("Email listeners initialized");
};
