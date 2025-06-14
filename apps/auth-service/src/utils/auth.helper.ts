import crypto from "crypto";
import { validationError } from "../../../../packages/error-handler";
import { NextFunction } from "express";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegisterationData=(data:any,userType:"user"|"seller"){
    const {name , email , password , phone_number , country}=data;

    if(!name || !email || !password || (userType=== "seller"&&(!phone_number || !country))){
    throw new validationError("Missing Required Fields!");
    }
    if(!emailRegex.test(email)){
   throw new validationError("Invalid email format!")
    }

export const checkotpRestictions=(email:string, next:NextFunction){

}
export const sendOtp=async(name:string,email:string,template:string)=>{
    const otp = crypto.randomInt(1000,9999).toString(); 
}

}