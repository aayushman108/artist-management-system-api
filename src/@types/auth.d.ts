export {};

declare global {
  namespace Auth {
    interface IUser {
      id: string;
      first_name: string;
      last_name: string | null;
      created_by: string | null;
      email: string;
      password_hash: string;
      role: string;
      status: string;
      created_at: Date;
      updated_at: Date;
    }
  }
}
