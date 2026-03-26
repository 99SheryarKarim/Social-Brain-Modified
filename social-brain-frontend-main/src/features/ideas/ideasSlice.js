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
      const titles = await fetchIdeasFromAPI(prompt, num, tone, words); // Use the API function
      return titles;
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
        // items are expected to be strings (idea prompts)
        state.items = action.payload;
      })
      .addCase(fetchIdeas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateIdea } = ideasSlice.actions;
export default ideasSlice.reducer;
