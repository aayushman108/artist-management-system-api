export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ARTIST_MANAGER = "artist_manager",
  ARTIST = "artist",
}

export enum UserStatus {
  INVITED = "invited",
  ACTIVE = "active",
  INACTIVE = "inactive",
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

export enum DeleteType {
  HARD = "hard",
  SOFT = "soft",
}
