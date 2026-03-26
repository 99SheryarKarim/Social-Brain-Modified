// src/hooks/useIdeaGenerator.js
import { useState } from "react";
import { fetchIdeas } from "../services/ai-generationapi";

const useIdeaGenerator = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateIdeas = async () => {
    setLoading(true);
    setError(null);
    setIdeas([]);

    const result = await fetchIdeas();
    if (result.success) {
      setIdeas(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  console.log("Result from generateSocialPost:", ideas);


  return { ideas, loading, error, generateIdeas };
};

export default useIdeaGenerator;
