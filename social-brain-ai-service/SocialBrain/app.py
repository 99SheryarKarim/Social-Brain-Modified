import streamlit as st
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate, load_prompt
import generate_post
import image_generation
import os

load_dotenv()

# Page configuration
st.set_page_config(
    page_title="Social Brain",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom styling
st.markdown("""
    <style>
    .stButton>button {
        background-color: #4CAF50;
        color: white;
        padding: 10px 24px;
        font-size: 16px;
        border-radius: 10px;
    }
    .post-card {
        border:1px solid #ddd;
        padding:16px;
        border-radius:10px;
        margin-bottom:16px;
        background-color:#ffffff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    </style>
""", unsafe_allow_html=True)

# Sidebar
with st.sidebar:
    st.image("https://cdn-icons-png.flaticon.com/512/4221/4221401.png", width=120)
    st.markdown("### 🧠 Social Brain")
    st.markdown("AI-powered social media content generator.")
    st.markdown("---")
    st.markdown("Created with 💚 using Streamlit and LangChain.")

# App header
st.title("🧠 SOCIAL BRAIN")
st.subheader("Social Media Post Generator")
st.write("Generate engaging social media posts with trending keywords and hashtags.")

# User input layout
col1, col2 = st.columns(2)
with col1:
    user_prompt = st.text_input("Enter your prompt")
with col2:
    num_posts = st.number_input("Number of posts", min_value=1, value=1, step=1)

col3, col4 = st.columns(2)
with col3:
    tone = st.selectbox("Select tone", ["professional", "casual", "humorous", "informative"])
with col4:
    num_words = st.number_input("Words per post", min_value=10, value=50, step=10)

# Initialize the LLM
# Must be a model ID that supports `generateContent` for your API key.
model = ChatGoogleGenerativeAI(temperature=0.7, model="models/gemini-flash-latest")

if st.button("🚀 Generate Posts"):
    if user_prompt:
        with st.spinner("Generating content... Please wait."):
            # Get trending keywords
            keywords = generate_post.get_trending_keywords(user_prompt)
            if keywords:
                st.success("✅ Trending keywords fetched successfully!")
                st.markdown(f"**Trending Keywords:** {', '.join(keywords)}")

                # Generate prompts
                post_prompts = generate_post.generate_post_prompts(user_prompt, keywords, tone, num_posts)

                with st.expander("🔍 View Generated Prompts"):
                    for i, prompt in enumerate(post_prompts):
                        st.markdown(f"**Prompt {i + 1}:** {prompt}")

                generated_posts = []

                for i, prompt in enumerate(post_prompts):
                    title, post, hashtags, image_prompt = generate_post.post_generation(prompt, num_words, tone)

                    st.markdown(f"<div class='post-card'>", unsafe_allow_html=True)
                    st.subheader(f"📝 {title}")
                    st.markdown(f"**{post}**")
                    st.markdown(f"🔖 {hashtags}")
                    st.markdown(f"*🎨 Image Prompt:* `{image_prompt}`")

                    # Generate image
                    img_url = image_generation.generate_image(image_prompt, size="1024x1024", quality="standard", n=1)
                    st.image(img_url, use_container_width=True)
                    st.markdown("</div>", unsafe_allow_html=True)

                    generated_posts.append(f"{title}\n{post}\n{hashtags}\nImage Prompt: {image_prompt}")

                # Download button
                final_text = "\n\n---\n\n".join(generated_posts)
                st.download_button("💾 Download Posts", final_text, file_name="generated_posts.txt")
            else:
                st.error("⚠️ Failed to retrieve trending keywords.")
    else:
        st.error("⚠️ Please enter a prompt to generate content.")
