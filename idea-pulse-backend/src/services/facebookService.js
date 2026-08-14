const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { PAGE_ID, PAGE_ACCESS_TOKEN } = require('../config/facebook');

exports.uploadContentToFacebook = async ({ caption = '', files = [] }) => {
  if (!files || files.length === 0) throw new Error("No media uploaded.");

  const mediaResponses = [];

  for (const file of files) {
    const isVideo = file.mimetype.startsWith('video/');
    const isImage = file.mimetype.startsWith('image/');

    if (!isVideo && !isImage) continue;

    const formData = new FormData();
    formData.append(isVideo ? 'file' : 'source', fs.createReadStream(file.path));
    formData.append('published', false); // so you can attach media first
    formData.append('access_token', PAGE_ACCESS_TOKEN);

    const url = `https://graph.facebook.com/v19.0/${PAGE_ID}/${isVideo ? 'videos' : 'photos'}`;
    const response = await axios.post(url, formData, { headers: formData.getHeaders() });

    mediaResponses.push({
      media_fbid: response.data.id,
      type: isVideo ? 'video' : 'photo'
    });
  }

  // Now post them together in a single post
  const attached_media = mediaResponses.map(item => ({ media_fbid: item.media_fbid }));
  const postForm = new URLSearchParams();
  postForm.append('access_token', PAGE_ACCESS_TOKEN);
  postForm.append('message', caption);
  attached_media.forEach((item, idx) =>
    postForm.append(`attached_media[${idx}]`, JSON.stringify(item))
  );

  const postResponse = await axios.post(
    `https://graph.facebook.com/v19.0/${PAGE_ID}/feed`,
    postForm
  );

  return postResponse.data;
};
