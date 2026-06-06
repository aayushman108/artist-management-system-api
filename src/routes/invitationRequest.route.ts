import express from "express";
import { invitationRequestController } from "src/controllers";
import { authorize, validateRequest, verifyJWT } from "src/middlewares";
import { InvitationRequestValidation } from "src/validationSchema";

export const invitationRequestRouter = express.Router();

invitationRequestRouter.post(
  "/",
  validateRequest(InvitationRequestValidation.createSchema),
  invitationRequestController.createRequest,
);

invitationRequestRouter.get(
  "/",
  [verifyJWT, authorize("MANAGE_INVITATION_REQUEST")],
  invitationRequestController.getRequests,
);

invitationRequestRouter.patch(
  "/:id/invite",
  [
    verifyJWT,
    authorize("MANAGE_INVITATION_REQUEST"),
    validateRequest(InvitationRequestValidation.sendInvitationSchema),
  ],
  invitationRequestController.sendInvitation,
);

invitationRequestRouter.patch(
  "/:id/status",
  [
    verifyJWT,
    authorize("MANAGE_INVITATION_REQUEST"),
    validateRequest(InvitationRequestValidation.updateStatusSchema),
  ],
  invitationRequestController.updateRequestStatus,
);

invitationRequestRouter.delete(
  "/:id",
  [
    verifyJWT,
    authorize("MANAGE_INVITATION_REQUEST"),
    validateRequest(InvitationRequestValidation.deleteSchema),
  ],
  invitationRequestController.deleteRequest,
);
