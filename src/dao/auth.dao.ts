import { db } from "src/database/db";
import { ISignupInput } from "src/validationSchema";

const findByEmail = async (email: string): Promise<Auth.IUser> => {
  const { rows } = await db.raw("SELECT * FROM users WHERE email = ? LIMIT 1", [
    email,
  ]);
  return rows[0];
};

const createUser = async (
  user: ISignupInput,
): Promise<Exclude<Auth.IUser, "password_hash">> => {
  const { companyName, email, password, role } = user;

  const { rows } = await db.raw(
    `INSERT INTO users (id, company_name, email, password_hash, role, status) 
       VALUES (gen_random_uuid(), ?, ?, ?, ?, 'active') 
       RETURNING to_jsonb(users) - 'password_hash' AS user`,
    [companyName, email, password, role],
  );
  return rows[0].user;
};

export const authDao = { findByEmail, createUser };
