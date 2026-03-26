// src/features/socialPosts/socialPostsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { generateSocialPostAPI } from "./postSliceAPI";

// Redux Thunk for generating social posts
export const generateSocialPost = createAsyncThunk(
  "socialPosts/generateSocialPost", // Action type
  async ({ input, selectedIdeas }, thunkAPI) => {
    try {
      const result = await generateSocialPostAPI({
        input,
        selectedIdeas,
      });
      return result;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        success: false,
        error: error.message,
        data: null,
      });
    }
  }
);

// Social posts slice
const postsSlice = createSlice({
  name: "socialPosts",
  initialState: {
    posts: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(generateSocialPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateSocialPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.data; // Store the generated posts
      })
      .addCase(generateSocialPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error; // Store error message
      });
  },
});

export default postsSlice.reducer;
