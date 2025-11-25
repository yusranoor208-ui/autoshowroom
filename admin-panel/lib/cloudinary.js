export const uploadImageToCloudinary = async (file) => {
  const CLOUD_NAME = "dtis8klmt";
  const UPLOAD_PRESET = "react_native_uploads";

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to upload image');
    }

    const result = await res.json();
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed", error);
    throw error;
  }
};
