import { UserRole } from "src/enums";

export const PERMISSIONS = {
  // User Permissions
  CREATE_USER: [UserRole.SUPER_ADMIN, UserRole.ARTIST_MANAGER],
  UPDATE_USER: [UserRole.SUPER_ADMIN, UserRole.ARTIST_MANAGER],
  DELETE_USER: [UserRole.SUPER_ADMIN, UserRole.ARTIST_MANAGER],
  READ_USER: [UserRole.SUPER_ADMIN, UserRole.ARTIST_MANAGER],

  // Music Permissions
  CREATE_MUSIC: [
    UserRole.SUPER_ADMIN,
    UserRole.ARTIST_MANAGER,
    UserRole.ARTIST,
  ],
  UPDATE_MUSIC: [
    UserRole.SUPER_ADMIN,
    UserRole.ARTIST_MANAGER,
    UserRole.ARTIST,
  ],
  DELETE_MUSIC: [
    UserRole.SUPER_ADMIN,
    UserRole.ARTIST_MANAGER,
    UserRole.ARTIST,
  ],
  READ_MUSIC: [UserRole.SUPER_ADMIN, UserRole.ARTIST_MANAGER, UserRole.ARTIST],
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
