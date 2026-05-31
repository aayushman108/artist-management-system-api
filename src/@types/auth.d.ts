export {};

declare global {
  namespace Auth {
    interface IUser {
      id: string;
      company_name: string;
      email: string;
      password_hash: string;
      role: string;
      status: string;
      created_at: Date;
      updated_at: Date;
    }
  }
}
