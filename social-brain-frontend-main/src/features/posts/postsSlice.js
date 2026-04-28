import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { generateSocialPostAPI, fetchLibraryAPI, deletePostAPI } from "./postSliceAPI";

export const generateSocialPost = createAsyncThunk(
  "socialPosts/generateSocialPost",
  async ({ input, selectedIdeas }, thunkAPI) => {
    try {
      return await generateSocialPostAPI({ input, selectedIdeas });
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const fetchLibrary = createAsyncThunk(
  "socialPosts/fetchLibrary",
  async (_, thunkAPI) => {
    try {
      return await fetchLibraryAPI();
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const deletePost = createAsyncThunk(
  "socialPosts/deletePost",
  async (postId, thunkAPI) => {
    try {
      await deletePostAPI(postId);
      return postId;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

const postsSlice = createSlice({
  name: "socialPosts",
  initialState: {
    posts: [],        // newly generated posts (current session)
    library: [],      // all saved posts from DB
    loading: false,
    libraryLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Generate
      .addCase(generateSocialPost.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(generateSocialPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload?.data || [];
      })
      .addCase(generateSocialPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Failed to generate posts";
      })
      // Fetch library
      .addCase(fetchLibrary.pending, (state) => { state.libraryLoading = true; })
      .addCase(fetchLibrary.fulfilled, (state, action) => {
        state.libraryLoading = false;
        state.library = action.payload || [];
      })
      .addCase(fetchLibrary.rejected, (state) => { state.libraryLoading = false; })
      // Delete
      .addCase(deletePost.fulfilled, (state, action) => {
        state.library = state.library.filter(p => p.id !== action.payload);
      });
  },
});

export default postsSlice.reducer;
