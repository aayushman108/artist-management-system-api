import {
  appEmitter,
  ConflictError,
  EVENTS,
  UnAuthorizedError,
} from "src/utils";
import { ISignupInput } from "src/validationSchema";
import jwt, { Secret } from "jsonwebtoken";
import { ENV } from "src/constants";
import { authDao } from "src/dao";
import bcrypt from "bcrypt";
import { UserStatus } from "src/enums";

interface ITokenVerificationBody {
  token: string;
  activationCode: string;
}

async function createEmailVerificationCode(user: ISignupInput) {
  const activationCode = Math.floor(100000 + Math.random() * 900000).toString();

  const token = jwt.sign(
    { user, activationCode },
    ENV.EMAIL_VERIFICATION_SECRET as Secret,
    {
      expiresIn: (ENV.EMAIL_VERIFICATION_TOKEN_EXPIRY ||
        "5m") as jwt.SignOptions["expiresIn"],
    },
  );

  return { token, activationCode };
}

async function signup(user: ISignupInput) {
  const isExistingUser = await authDao.findByEmail(user.email);
  if (!!isExistingUser) {
    throw new ConflictError("User Already Exists!!");
  }

  const { token, activationCode } = await createEmailVerificationCode(user);

  appEmitter.emit(EVENTS.EMAIL.SIGNUP, {
    email: user.email,
    companyName: user.companyName,
    activationCode,
  });

  return { token };
}

async function verifyEmailVerificationToken(data: ITokenVerificationBody) {
  try {
    const decoded = jwt.verify(
      data.token,
      ENV.EMAIL_VERIFICATION_SECRET as Secret,
    ) as { user: ISignupInput; activationCode: string };

    if (!decoded.user || !decoded.activationCode) {
      throw new UnAuthorizedError("Unauthorized: Invalid token");
    }

    if (decoded.activationCode === data.activationCode) {
      return { user: decoded.user };
    } else {
      throw new UnAuthorizedError("Unauthorized: Unmatched activation code");
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnAuthorizedError("Unauthorized: Token expired");
    }
    throw new UnAuthorizedError("Unauthorized: Invalid token");
  }
}

async function createUser(user: ISignupInput & { status?: UserStatus }) {
  const isExistingUser = await authDao.findByEmail(user.email);
  if (isExistingUser) {
    throw new ConflictError("User Already Exists!!");
  }

  const { password } = user;
  const salt = await bcrypt.genSalt(10);

  const passwordHash = await bcrypt.hash(password, salt);

  const secureUser = {
    ...user,
    password: passwordHash,
    status: user.status || UserStatus.ACTIVE,
  };

  const newUser = await authDao.createUser(secureUser);
  return newUser;
}

export const authService = { signup, verifyEmailVerificationToken, createUser };
