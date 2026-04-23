import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchIdeasFromAPI } from "./ideasAPI"; // Import the API function

export const fetchIdeas = createAsyncThunk(
  "ideas/fetchIdeas",
  async ({ prompt, num, tone, words }, thunkAPI) => {
    console.log(
      "Fetching ideas with prompt:",
      prompt,
      "num:",
      num,
      "tone:",
      tone
    );
    try {
      const result = await fetchIdeasFromAPI(prompt, num, tone, words);
      return result; // Return { ideas, isMockData, dataSource }
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIdeas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIdeas.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload now has { ideas, isMockData, dataSource }
        state.items = action.payload.ideas || [];
        state.isMockData = action.payload.isMockData || false;
        state.dataSource = action.payload.dataSource || "api";
      })
      .addCase(fetchIdeas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateIdea } = ideasSlice.actions;
export default ideasSlice.reducer;
