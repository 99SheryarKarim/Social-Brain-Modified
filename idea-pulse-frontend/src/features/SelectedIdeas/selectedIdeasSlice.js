import { createSlice } from '@reduxjs/toolkit';

const selectedIdeasSlice = createSlice({
  name: 'selectedIdeas',
  initialState: [],
  reducers: {
    addIdea: (state, action) => {
      if (!state.includes(action.payload)) {
        state.push(action.payload);
      }
    },
    removeIdea: (state, action) => {
      return state.filter((idea) => idea !== action.payload);
    },
    updateIdea: (state, action) => {
      const { oldText, newText } = action.payload;
      const index = state.indexOf(oldText);
      if (index !== -1) {
        state[index] = newText;
      }
    },
  },
});

export const { addIdea, removeIdea, updateIdea } = selectedIdeasSlice.actions;
export default selectedIdeasSlice.reducer;
