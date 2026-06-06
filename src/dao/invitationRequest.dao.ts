import { db } from "src/database/db";
import { InvitationRequestStatus, UserRole } from "src/enums";

interface ICreateInvitationRequest {
  first_name: string;
  last_name: string | null;
  email: string;
  role: string;
}

interface IFindRequestsParams {
  pageLimit: number;
  pageOffset: number;
  status?: InvitationRequestStatus;
  role?: UserRole;
  search?: string;
}

const createRequest = async (data: ICreateInvitationRequest) => {
  const { rows } = await db.raw(
    `INSERT INTO invitation_requests (first_name, last_name, email, role)
     VALUES (?, ?, ?, ?)
     RETURNING *`,
    [data.first_name, data.last_name, data.email, data.role],
  );
  return rows[0];
};

const findRequestById = async (id: string) => {
  const { rows } = await db.raw(
    "SELECT * FROM invitation_requests WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0];
};

const findPendingRequestByEmail = async (email: string) => {
  const { rows } = await db.raw(
    "SELECT * FROM invitation_requests WHERE email = ? AND status = 'pending' LIMIT 1",
    [email],
  );
  return rows[0];
};

const findRequests = async ({
  pageLimit,
  pageOffset,
  status,
  role,
  search,
}: IFindRequestsParams) => {
  const conditions: string[] = [];
  const params: any[] = [];

  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }

  if (role) {
    conditions.push("role = ?");
    params.push(role);
  }

  if (search) {
    conditions.push(
      `(email ILIKE ? OR first_name ILIKE ? OR last_name ILIKE ?)`,
    );
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";

  const { rows: countRows } = await db.raw(
    `SELECT COUNT(*) AS count FROM invitation_requests${where}`,
    params,
  );
  const total = Number(countRows[0].count);

  const { rows: data } = await db.raw(
    `SELECT * FROM invitation_requests${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, pageLimit, pageOffset],
  );

  return { total, data };
};

const updateRequestStatus = async (id: string, status: string) => {
  const { rows } = await db.raw(
    `UPDATE invitation_requests SET status = ?, updated_at = NOW() WHERE id = ? RETURNING *`,
    [status, id],
  );
  return rows[0];
};

const deleteRequest = async (id: string) => {
  const { rows } = await db.raw(
    "DELETE FROM invitation_requests WHERE id = ? RETURNING id",
    [id],
  );
  return rows[0];
};

export const invitationRequestDao = {
  createRequest,
  findRequestById,
  findPendingRequestByEmail,
  findRequests,
  updateRequestStatus,
  deleteRequest,
};
