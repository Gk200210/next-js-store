import { createClient } from "@supabase/supabase-js";

const bucket = "main-bucket";

export const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);

export const uploadImage = async (image: File) => {
  const timestamp = Date.now();
  const newName = `${timestamp}-${image.name}`;

  const { data } = await supabase.storage
    .from(bucket)
    .upload(newName, image, { cacheControl: "4000" });

  if (!data) throw new Error("Image upload failed");

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(newName);

  return publicUrl; // ✅ returns string
};


export const deleteImage = async(url:string)=>{
const imageName = url.split('/').pop();
if (!imageName) throw new Error('Invalid URL');
return supabase.storage.from(bucket).remove([imageName]);
};