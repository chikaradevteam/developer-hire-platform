import type { Request, Response } from "express";
import apiResponse from "../utils/apiResponse";
import prismaClient from "../utils/prisma";

class InPlatformMessageController {

  async sendMessageToCandidate(req: Request, res: Response) {
    try {
      if (!req.user) throw new Error("User not authenticated");

      const interviewerUserId = req.user.id;
      const { candidateId, message } = req.body;

      if (!candidateId || !message)
        throw new Error("Candidate ID and message are required");

      const interviewer = await prismaClient.interviewer.findUnique({
        where: { userId: interviewerUserId }
      });

      if (!interviewer) throw new Error("Interviewer not found");

      const candidate = await prismaClient.candidate.findUnique({
        where: { id: candidateId }
      });

      if (!candidate) throw new Error("Candidate not found");

      const createdMessage = await prismaClient.inPlatformMessage.create({
        data: {
          message,
          sentBy: interviewer.id,
          receivedBy: candidate.id
        }
      });

      return res
        .status(201)
        .json(apiResponse(201, "Message sent successfully", createdMessage));

    } catch (error: any) {
      console.error("Send Message Error:", error);
      return res
        .status(200)
        .json(apiResponse(500, error.message, null));
    }
  }

  async getMyMessages(req: Request, res: Response) {
    try {
      if (!req.user) throw new Error("User not authenticated");

      const userId = req.user.id;

      const candidate = await prismaClient.candidate.findUnique({
        where: { userId }
      });

      if (!candidate) throw new Error("Candidate not found");

      const messages = await prismaClient.inPlatformMessage.findMany({
        where: { receivedBy: candidate.id },
        orderBy: { createdAt: "desc" },
        include: { sender: true }
      });

      return res
        .status(200)
        .json(apiResponse(200, "Messages fetched successfully", messages));

    } catch (error: any) {
      console.error("Fetch Messages Error:", error);
      return res
        .status(200)
        .json(apiResponse(500, error.message, null));
    }
  }

  async markMessageAsSeen(req: Request, res: Response) {
    try {
      if (!req.user) throw new Error("User not authenticated");

      const userId = req.user.id;
      const { messageId } = req.params;

      if (!messageId) throw new Error("Message ID is required");

      const candidate = await prismaClient.candidate.findUnique({
        where: { userId }
      });

      if (!candidate) throw new Error("Candidate not found");

      const message = await prismaClient.inPlatformMessage.findFirst({
        where: {
          id: messageId,
          receivedBy: candidate.id
        }
      });

      if (!message) throw new Error("Message not found");

      await prismaClient.inPlatformMessage.update({
        where: { id: messageId },
        data: { readRecipt: "SEEN" }
      });

      return res
        .status(200)
        .json(apiResponse(200, "Message marked as seen", null));

    } catch (error: any) {
      console.error("Mark Message Seen Error:", error);
      return res
        .status(200)
        .json(apiResponse(500, error.message, null));
    }
  }

  async deleteMessage(req: Request, res: Response) {
    try {
      if (!req.user) throw new Error("User not authenticated");

      const userId = req.user.id;
      const { messageId } = req.params;

      if (!messageId) throw new Error("Message ID is required");

      const candidate = await prismaClient.candidate.findUnique({
        where: { userId }
      });

      if (!candidate) throw new Error("Candidate not found");

      const message = await prismaClient.inPlatformMessage.findFirst({
        where: {
          id: messageId,
          receivedBy: candidate.id
        }
      });

      if (!message) throw new Error("Message not found");

      await prismaClient.inPlatformMessage.delete({
        where: { id: messageId }
      });

      return res
        .status(200)
        .json(apiResponse(200, "Message deleted successfully", null));

    } catch (error: any) {
      console.error("Delete Message Error:", error);
      return res
        .status(200)
        .json(apiResponse(500, error.message, null));
    }
  }

  async getUnreadCount(req: Request, res: Response) {
    try {
      if (!req.user) throw new Error("User not authenticated");

      const userId = req.user.id;

      const candidate = await prismaClient.candidate.findUnique({
        where: { userId }
      });

      if (!candidate) throw new Error("Candidate not found");

      const count = await prismaClient.inPlatformMessage.count({
        where: {
          receivedBy: candidate.id,
          readRecipt: "UNSEEN"
        }
      });

      return res
        .status(200)
        .json(
          apiResponse(200, "Unread messages count fetched successfully", {
            count
          })
        );

    } catch (error: any) {
      console.error("Unread Count Error:", error);
      return res
        .status(200)
        .json(apiResponse(500, error.message, null));
    }
  }
}

export default new InPlatformMessageController();
