import type { Request,Response } from "express";
import apiResponse from "../utils/apiResponse";
import prismaClient from "../utils/prisma";

class SkillController {
    async addSkills(req:Request,res:Response){
        try {
            if(!req.user) throw new Error("User Not Authenticated");
            const userId = req.user.id;
            const {skillName} = req.body;

            if(!skillName) throw new Error("Skill Name is Required");

            const existingSkill = await prismaClient.skill.findFirst({
                where:{
                    name:skillName,
                    userId,
                },
            });

            if(existingSkill) throw new Error("Skill already Added");

            const createdSkill = await prismaClient.skill.create({
                data:{
                    name : skillName,
                    userId,
                },
            });

            return res
            .status(201)
            .json(apiResponse(201,"Skill Added SuccessFully",createdSkill));
        } catch (error:any) {
            console.log("Error in Adding Skill : ",error);
            return res
            .status(200)
            .json(apiResponse(500,error.message,null));
        }
    }

    async updateSkill(req : Request,res : Response){
        try {
            if(!req.user) throw new Error("User not Authenticated");

            const userId = req.user.id;
            const { skillId,name } = req.body;

            if(!skillId || !name){
                throw new Error("Skill ID and New Value are Required");
            }

            const existingSkill = await prismaClient.skill.findFirst({
                where:{
                    id : skillId,
                    userId,
                },
            });

            if(!existingSkill) throw new Error("Skill not Found or Unauthorized Access");

            const updatedSkill = await prismaClient.skill.update({
                where :{
                    id : skillId,
                },
                data : {
                    name : name,
                },
            });

            return res
            .status(200)
            .json(apiResponse(200,"Skill Updated SuccessFully",updatedSkill));
        } catch (error:any) {
            console.log("Error in Updating Skill : ",error);
            return res
            .status(200)
            .json(apiResponse(500,error.message,null));
        }
    }

    async removeSkill(req : Request, res : Response){
        try {
            if(!req.user) throw new Error("User not Authenticated");

            const userId = req.user.id;
            const {skillId} = req.params;

            if(!skillId) throw new Error("SkillId is Required");

            const existingSkill = await prismaClient.skill.findFirst({
                where:{
                    id:skillId,
                    userId,
                },
            });

            if(!existingSkill) throw new Error("Skill not found or Unauthorized Access");

            await prismaClient.skill.delete({
                where:{
                    id:skillId,
                },
            });

            return res
            .status(200)
            .json(apiResponse(200,"Skill is Removed SuccessFully",null));
        } catch (error:any) {
            console.log("Error in Removing Skill : ",error);
            return res
            .status(200)
            .json(apiResponse(500,error.message,null));
        }
    }
}

export default new SkillController();