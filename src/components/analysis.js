import { API_AI } from "../services/api";

const analysis = async (uri) => {
  try {
    const uriParts = uri.split(".");
    const fileType = uriParts[uriParts.length - 1];

    const Api = `${API_AI}/image`;

    const formData = new FormData();
    formData.append("file", {
      uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    });

    const response = await fetch(Api, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const json = await response.json();
    console.log("AI response:", json);

    // ✅ ใช้ค่าที่ backend คำนวณให้แล้ว (ดีที่สุด)
    return {
      goodRice: json.good_rice,
      brokenRice: json.broken_rice,
      total: json.total,
      percentage: json.percentage
    };

  } catch (error) {
    console.error("Error uploading image:", error.message);
    return null;
  }
};

export default analysis;
