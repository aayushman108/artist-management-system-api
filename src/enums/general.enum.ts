export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ARTIST_MANAGER = "artist_manager",
  ARTIST = "artist",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  MIGRATED = "migrated",
}

export enum InvitationRole {
  ARTIST_MANAGER = "artist_manager",
  ARTIST = "artist",
}

export enum InvitationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  EXPIRED = "expired",
}

export enum InvitationRequestStatus {
  PENDING = "pending",
  INVITED = "invited",
  REJECTED = "rejected",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export enum DeleteType {
  HARD = "hard",
  SOFT = "soft",
}

export enum JobType {
  ARTIST_IMPORT = "artist_import",
}

export enum JobStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}
