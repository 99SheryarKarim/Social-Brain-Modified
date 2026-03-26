// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import ideasReducer from "../features/ideas/ideasSlice.js";
import postsReducer from "../features/posts/postsSlice.js";
import selectedIdeasReducer from "../features/SelectedIdeas/selectedIdeasSlice.js";

const store = configureStore({
  reducer: {
    ideas: ideasReducer,
    posts: postsReducer,
    selectedIdeas: selectedIdeasReducer,
  },
});

export default store;
