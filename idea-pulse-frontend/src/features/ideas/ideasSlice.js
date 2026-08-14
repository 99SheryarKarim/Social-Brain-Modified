import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchIdeasFromAPI } from "./ideasAPI"; // Import the API function

export const fetchIdeas = createAsyncThunk(
  "ideas/fetchIdeas",
  async ({ prompt, num, tone, words, model }, thunkAPI) => {
    console.log(
      "Fetching ideas with prompt:",
      prompt,
      "num:",
      num,
      "tone:",
      tone
    );
    try {
      const result = await fetchIdeasFromAPI(prompt, num, tone, words, model);
      return result; // Return { ideas, recommendations, isMockData, dataSource }
    } catch (error) {
      console.log("Error fetching ideas:", error);
      return thunkAPI.rejectWithValue("Failed to fetch ideas.");
    }
  }
);

const ideasSlice = createSlice({
  name: "ideas",
  initialState: {
    items: [],
    recommendations: [],
    loading: false,
    error: null,
    isMockData: false,
    dataSource: "api",
  },
  reducers: {
    updateIdea: (state, action) => {
      const { index, newText } = action.payload;
      if (state.items[index] !== undefined) {
        state.items[index] = newText;
      }
    },
    clearIdeas: (state) => {
      state.items = [];
      state.recommendations = [];
      state.loading = false;
      state.error = null;
      state.isMockData = false;
      state.dataSource = "api";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIdeas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIdeas.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload now has { ideas, recommendations, isMockData, dataSource }
        state.items = action.payload.ideas || [];
        state.recommendations = action.payload.recommendations || [];
        state.isMockData = action.payload.isMockData || false;
        state.dataSource = action.payload.dataSource || "api";
      })
      .addCase(fetchIdeas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateIdea, clearIdeas } = ideasSlice.actions;
export default ideasSlice.reducer;
