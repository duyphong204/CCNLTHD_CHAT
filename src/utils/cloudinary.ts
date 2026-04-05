import { v2 as cloudinary } from "cloudinary";
import { Env } from "../config/env.config";
import { BadRequestException } from "./app-error";

cloudinary.config({
  cloud_name: Env.CLOUDINARY_CLOUD_NAME,
  api_key: Env.CLOUDINARY_API_KEY,
  api_secret: Env.CLOUDINARY_API_SECRET,
});

export const uploadImageToCloudinary = async (
  image: string,
  folder: string,
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(image, {
      folder,
      resource_type: "image",
    });

    return result.secure_url;
  } catch (error) {
    throw new BadRequestException("Upload ảnh lên Cloudinary thất bại");
  }
};
