import type { Request, Response } from "express";
import apiResponse from "../utils/apiResponse";
import prismaClient from "../utils/prisma";

class WishListController {
  async createWishList(req: Request, res: Response) {
    try {
      if (!req.user) throw new Error("User not Authenticated");

      const userId = req.user.id;
      const { name } = req.body;

      if (!name) throw new Error("WishList name is Required");

      const interviewer = await prismaClient.interviewer.findUnique({
        where: { userId }
      });

      if (!interviewer) throw new Error("Interviewer not Found");

      const existing = await prismaClient.interviewWishlist.findFirst({
        where: {
          name,
          createdBy: interviewer.id
        }
      });

      if (existing) throw new Error("WishList already Exists");

      const wishList = await prismaClient.interviewWishlist.create({
        data: {
          name,
          createdBy: interviewer.id
        }
      });

      return res
        .status(201)
        .json(apiResponse(201, "WishList Created Successfully", wishList));
    } catch (error: any) {
      console.error("Create WishList Error:", error);
      return res
        .status(500)
        .json(apiResponse(500, error.message, null));
    }
  }

  async getInterviewerWishLists(req: Request, res: Response) {
    try {
      if (!req.user) throw new Error("User not Authenticated");

      const userId = req.user.id;

      const interviewer = await prismaClient.interviewer.findUnique({
        where: { userId }
      });

      if (!interviewer) throw new Error("Interviewer Not Found");

      const wishLists = await prismaClient.interviewWishlist.findMany({
        where: { createdBy: interviewer.id },
        include: {
          interviewWishlistMembers: {
            include: {
              candidate: true,
              projectPost: true
            }
          }
        }
      });

      return res
        .status(200)
        .json(apiResponse(200, "WishLists fetched Successfully", wishLists));
    } catch (error: any) {
      console.error("Fetch WishList Error:", error);
      return res
        .status(500)
        .json(apiResponse(500, error.message, null));
    }
  }

  async saveProjectToWishList(req: Request, res: Response) {
    try {
      if (!req.user) throw new Error("User not Authenticated");

      const userId = req.user.id;
      const { wishListName, projectPostId, candidateId } = req.body;

      if (!wishListName || !projectPostId || !candidateId)
        throw new Error("All fields are Required");

      const interviewer = await prismaClient.interviewer.findUnique({
        where: { userId }
      });

      if (!interviewer) throw new Error("Interviewer Not Found");

      let wishList = await prismaClient.interviewWishlist.findFirst({
        where: {
          name: wishListName,
          createdBy: interviewer.id
        }
      });

      if (!wishList) {
        wishList = await prismaClient.interviewWishlist.create({
          data: {
            name: wishListName,
            createdBy: interviewer.id
          }
        });
      }

      const alreadySaved =
        await prismaClient.interviewWishlistMembers.findFirst({
          where: {
            interviewWishListId: wishList.id,
            projectPostId
          }
        });

      if (alreadySaved)
        throw new Error("Project already saved in WishList");

      const savedProject =
        await prismaClient.interviewWishlistMembers.create({
          data: {
            interviewWishListId: wishList.id,
            projectPostId,
            candidateId
          }
        });

      return res.status(201).json(
        apiResponse(201, "Project Saved to WishList", {
          wishList,
          savedProject
        })
      );
    } catch (error: any) {
      console.error("Save Project Error:", error);
      return res
        .status(500)
        .json(apiResponse(500, error.message, null));
    }
  }

  async removeProjectFromWishList(req: Request, res: Response) {
    try {
      if (!req.user) throw new Error("User not Authenticated");

      const userId = req.user.id;
      const { wishListMemberId } = req.params;

      if (!wishListMemberId)
        throw new Error("WishList Member ID is Required");

      const interviewer = await prismaClient.interviewer.findUnique({
        where: { userId }
      });

      if (!interviewer) throw new Error("Interviewer Not Found");

      const wishListMember =
        await prismaClient.interviewWishlistMembers.findFirst({
          where: {
            id: wishListMemberId,
            interviewWishList: {
              createdBy: interviewer.id
            }
          }
        });

      if (!wishListMember)
        throw new Error("Project not found in your WishList");

      await prismaClient.interviewWishlistMembers.delete({
        where: { id: wishListMemberId }
      });

      return res
        .status(200)
        .json(apiResponse(200, "Project removed Successfully", null));
    } catch (error: any) {
      console.error("Remove Project Error:", error);
      return res
        .status(500)
        .json(apiResponse(500, error.message, null));
    }
  }

  async deleteWishList(req: Request, res: Response) {
    try {
      if (!req.user) throw new Error("User Not Authenticated");

      const userId = req.user.id;
      const { wishListId } = req.params;

      const interviewer = await prismaClient.interviewer.findUnique({
        where: { userId }
      });

      if (!interviewer) throw new Error("Interviewer not Found");

      const existingWishList =
        await prismaClient.interviewWishlist.findFirst({
          where: {
            id: wishListId,
            createdBy: interviewer.id
          }
        });

      if (!existingWishList) throw new Error("WishList not Found");

      await prismaClient.interviewWishlist.delete({
        where: { id: wishListId }
      });

      return res
        .status(200)
        .json(apiResponse(200, "WishList deleted Successfully", null));
    } catch (error: any) {
      console.error("Delete WishList Error:", error);
      return res
        .status(500)
        .json(apiResponse(500, error.message, null));
    }
  }
}

export default new WishListController();
