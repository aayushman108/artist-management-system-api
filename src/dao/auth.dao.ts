import { db } from "src/database/db";
import { UserRole, UserStatus } from "src/enums";
import { ISignupInput } from "src/validationSchema";

const findByEmail = async (email: string): Promise<Auth.IUser> => {
  const { rows } = await db.raw("SELECT * FROM users WHERE email = ? LIMIT 1", [
    email,
  ]);
  return rows[0];
};

const findUserById = async (userId: string): Promise<Auth.IUser> => {
  const { rows } = await db.raw("SELECT * FROM users WHERE id = ? LIMIT 1", [
    userId,
  ]);
  return rows[0];
};

const createUser = async (
  user: ISignupInput,
): Promise<Exclude<Auth.IUser, "password_hash">> => {
  const { firstName, lastName, email, password, role } = user;

  const { rows } = await db.raw(
    `INSERT INTO users (id, first_name, last_name, email, password_hash, role, status) 
       VALUES (gen_random_uuid(), ?, ?, ?, ?, ?, ?) 
       RETURNING to_jsonb(users) - 'password_hash' AS user`,
    [firstName, lastName, email, password, role, UserStatus.ACTIVE],
  );
  return rows[0].user;
};

const hasAnySuperAdmin = async (): Promise<boolean> => {
  const { rows } = await db.raw(
    `SELECT EXISTS (SELECT 1 FROM users WHERE role = ?) AS has_super_admin`,
    [UserRole.SUPER_ADMIN],
  );
  return rows[0].has_super_admin;
};

export const authDao = { findByEmail, createUser, findUserById, hasAnySuperAdmin };
