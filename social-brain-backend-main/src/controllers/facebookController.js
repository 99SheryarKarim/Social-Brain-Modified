const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const PAGE_ID = "108980617483320";
const PAGE_ACCESS_TOKEN =
  "EAAJXYNvY8g4BO4lgOIDgu7sHAOn8wPNbZC60agnfZAhwoGEkl6FWqzhcx78B9lNNvex3ZAWNQHFUfyWZC9RRZBo2yhUh6ZBXSyZBU7XIApfeYGx88DKUnT3DRjll8Eqeq7ZANMai1Vl9CQnkFOUZC72Gl2vPQjsMtuer6nbJJZAmxVS92XAhw7ZBPHRH3AqDxav8at8kHmYZCUOQKbuCUCpONPINm8ZAPFSFXYAqf91X67eqAcqZBpAuIZD";
exports.uploadToFacebook = async (req, res) => {
  const files = req.files || [];
  const caption = req.body.caption || "";
  const imageFbids = [];
  const videoFiles = [];

  console.log(`🟡 Incoming request`);
  console.log(`Files received: ${files.length}`);
  console.log(`Caption: "${caption}"`);

  try {
    // Categorize files
    for (const file of files) {
      console.log(
        `🔍 Processing file: ${file.originalname}, type: ${file.mimetype}`
      );

      if (file.mimetype.startsWith("image/")) {
        console.log(`📸 Uploading image: ${file.originalname}`);
        const fileStream = fs.createReadStream(file.path);
        const form = new FormData();
        form.append("access_token", PAGE_ACCESS_TOKEN);
        form.append("source", fileStream);
        form.append("published", "false");

        const { data } = await axios.post(
          `https://graph.facebook.com/${PAGE_ID}/photos`,
          form,
          { headers: form.getHeaders() }
        );

        console.log(`✅ Image uploaded: ${data.id}`);
        imageFbids.push({ media_fbid: data.id });
      } else if (file.mimetype.startsWith("video/")) {
        console.log(`🎞️ Found video: ${file.originalname}`);
        videoFiles.push(file);
      }
    }

    // 🧠 Logic Branches
    if (imageFbids.length > 0 && videoFiles.length > 0) {
      console.log("🛑 Cannot post images and videos together. Splitting post.");

      const imgPost = await axios.post(
        `https://graph.facebook.com/${PAGE_ID}/feed`,
        {
          message: caption,
          attached_media: imageFbids,
          access_token: PAGE_ACCESS_TOKEN,
        }
      );
      console.log(`📝 Image post created: ${imgPost.data.id}`);

      const videoFile = videoFiles[0];
      const form = new FormData();
      form.append("access_token", PAGE_ACCESS_TOKEN);
      form.append("file", fs.createReadStream(videoFile.path));
      form.append("description", caption);

      const videoRes = await axios.post(
        `https://graph.facebook.com/${PAGE_ID}/videos`,
        form,
        { headers: form.getHeaders() }
      );

      console.log(`🎬 Video uploaded: ${videoRes.data.id}`);

      return res.json({
        success: true,
        posted: "image and video (separate posts)",
        videoId: videoRes.data.id,
      });
    }

    if (imageFbids.length > 0) {
      console.log("🟢 Posting image(s) only");
      const imgPost = await axios.post(
        `https://graph.facebook.com/${PAGE_ID}/feed`,
        {
          message: caption,
          attached_media: imageFbids,
          access_token: PAGE_ACCESS_TOKEN,
        }
      );

      console.log(`📝 Image post created: ${imgPost.data.id}`);
      return res.json({ success: true, postId: imgPost.data.id });
    }

    if (videoFiles.length > 0) {
      console.log("🟢 Posting video only");
      const videoFile = videoFiles[0];
      const form = new FormData();
      form.append("access_token", PAGE_ACCESS_TOKEN);
      form.append("file", fs.createReadStream(videoFile.path));
      form.append("description", caption);

      const videoRes = await axios.post(
        `https://graph.facebook.com/${PAGE_ID}/videos`,
        form,
        { headers: form.getHeaders() }
      );

      console.log(`🎬 Video uploaded: ${videoRes.data.id}`);
      return res.json({ success: true, videoId: videoRes.data.id });
    }

    if (files.length === 0 && caption) {
      console.log("✍️ Posting text only");
      const textPost = await axios.post(
        `https://graph.facebook.com/${PAGE_ID}/feed`,
        {
          message: caption,
          access_token: PAGE_ACCESS_TOKEN,
        }
      );

      console.log(`📝 Text post created: ${textPost.data.id}`);
      return res.json({ success: true, postId: textPost.data.id });
    }

    console.log("⚠️ Nothing to post");
    return res.status(400).json({ error: "Nothing to post" });
  } catch (error) {
    console.error("❌ FB upload error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  } finally {
    // Cleanup
    files.forEach((f) => fs.unlinkSync(f.path));
  }
};
