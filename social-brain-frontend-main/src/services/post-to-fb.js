import axios from "axios";

export const postToFacebookPage = async (title, message) => {
  console.log("posting to FB");

  const PAGE_ID = "108980617483320";

  const PAGE_ACCESS_TOKEN =
    "EAAJXYNvY8g4BO0A4rJW0T8RHsyhxnL1VlpfmjYHmkcztxzUDX1pRyvJXHF1S9JPEQk96b4kSgkdTMliB4x80qr6bF4i17KTOZCvWY9HlbiyAuHb5qrCnqGXyqnye20zHiGA2unLhV5WnbzFU8HLKVqRNr44qLIAfHKMbNiYZA5y4jAEFZAK8m42fjhtyKPraA05C2Gke7JcQMrt075dhllOELsKTXfCJyo6eiAZD";

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${PAGE_ID}/feed`,
      null,
      {
        params: {
          message: title + "\n" + message,
          access_token: PAGE_ACCESS_TOKEN,
        },
      }
    );

    console.log("✅ Post Success:", response);
  } catch (error) {
    console.error("❌ Post Error:", error.response?.data || error.message);
  }
};

export const uploadPhotoToFacebookPage = async (imageFile, caption = "") => {

  const PAGE_ID = "108980617483320";
  const PAGE_ACCESS_TOKEN =
    "EAAJXYNvY8g4BO0A4rJW0T8RHsyhxnL1VlpfmjYHmkcztxzUDX1pRyvJXHF1S9JPEQk96b4kSgkdTMliB4x80qr6bF4i17KTOZCvWY9HlbiyAuHb5qrCnqGXyqnye20zHiGA2unLhV5WnbzFU8HLKVqRNr44qLIAfHKMbNiYZA5y4jAEFZAK8m42fjhtyKPraA05C2Gke7JcQMrt075dhllOELsKTXfCJyo6eiAZD";

  const formData = new FormData();
  formData.append("source", imageFile); // local file object
  formData.append("caption", caption);
  formData.append("access_token", PAGE_ACCESS_TOKEN);

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${PAGE_ID}/photos`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("photo Upload Success:", response.data);
  } catch (error) {
    console.error("Upload Error:", error.response?.data || error.message);
  }
};
