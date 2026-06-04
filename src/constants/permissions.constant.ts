import { UserRole } from "src/enums";

export const PERMISSIONS = {
  // User Permissions
  CREATE_USER: [UserRole.SUPER_ADMIN, UserRole.ARTIST_MANAGER],
  UPDATE_USER: [UserRole.SUPER_ADMIN, UserRole.ARTIST_MANAGER],
  DELETE_USER: [UserRole.SUPER_ADMIN, UserRole.ARTIST_MANAGER],
  READ_USER: [UserRole.SUPER_ADMIN, UserRole.ARTIST_MANAGER],

  // Music Permissions
  CREATE_MUSIC: [UserRole.SUPER_ADMIN, UserRole.ARTIST],
  UPDATE_MUSIC: [UserRole.SUPER_ADMIN, UserRole.ARTIST],
  DELETE_MUSIC: [UserRole.SUPER_ADMIN, UserRole.ARTIST],
  READ_MUSIC: [UserRole.SUPER_ADMIN, UserRole.ARTIST_MANAGER, UserRole.ARTIST],

  // Album Permissions
  CREATE_ALBUM: [UserRole.SUPER_ADMIN, UserRole.ARTIST],
  UPDATE_ALBUM: [UserRole.SUPER_ADMIN, UserRole.ARTIST],
  DELETE_ALBUM: [UserRole.SUPER_ADMIN, UserRole.ARTIST],
  READ_ALBUM: [UserRole.SUPER_ADMIN, UserRole.ARTIST_MANAGER, UserRole.ARTIST],

  // Invitation Request Permissions
  MANAGE_INVITATION_REQUEST: [UserRole.SUPER_ADMIN],
};

export type IPermission = keyof typeof PERMISSIONS;

export const ALLOWED_USER_CREATIONS = {
  [UserRole.SUPER_ADMIN]: [
    UserRole.SUPER_ADMIN,
    UserRole.ARTIST_MANAGER,
    UserRole.ARTIST,
  ],
  [UserRole.ARTIST_MANAGER]: [UserRole.ARTIST],
  [UserRole.ARTIST]: [],
};
