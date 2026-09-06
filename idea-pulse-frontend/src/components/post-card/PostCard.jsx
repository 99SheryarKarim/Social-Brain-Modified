import { useState, useEffect } from 'react';
import styles from './PostCard.module.css';

const PostCard = ({ post, onEdit, onUpload, number, uploading }) => {
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    // 1. Determine best query: prefer AI generated imagePrompt if present
    let query = post.imagePrompt || post.image_prompt || '';
    
    if (!query) {
      const rawText = post.originalTopic || post.prompt || post.content || '';
      const stopWords = new Set(['ideas', 'idea', 'post', 'posts', 'for', 'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'with', 'beginners', 'beginner', 'casual', 'professional', 'creative', 'friendly', 'witty', 'how', 'what', 'why', 'top', 'best', 'guide', 'tips', 'tricks', 'about']);
      const words = rawText.replace(/[^\w\s]/gi, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w.toLowerCase()));
      query = words.length > 0 ? words.slice(0, 3).join(' ') : 'social media';
    }

    const aiFallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}?width=600&height=300&nologo=true`;
    const apiKey = import.meta.env.VITE_PEXELS_API_KEY;

    if (apiKey) {
      fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
        headers: { Authorization: apiKey }
      })
        .then(res => res.json())
        .then(data => {
          if (data.photos && data.photos.length > 0) {
            setImgSrc(data.photos[0].src.landscape);
          } else {
            setImgSrc(aiFallbackUrl);
          }
        })
        .catch(() => setImgSrc(aiFallbackUrl));
    } else {
      setImgSrc(aiFallbackUrl);
    }
  }, [post.originalTopic, post.prompt, post.imagePrompt, post.image_prompt, post.tone]);

  return (
    <div className={`row g-0 mb-4 position-relative ${styles.cardWrapper}`}>
      <div className={styles.badge}>#{number}</div>

      <div className={`col-md-5 ${styles.imageWrapper}`}>
        <img
          src={imgSrc || 'https://picsum.photos/600/300'}
          alt={post.prompt || 'Post'}
          onError={() => setImgSrc('https://picsum.photos/600/300')}
          className={styles.postImage}
        />
      </div>

      {/* Content Column */}
      <div className="col-md-7 p-4 d-flex flex-column justify-content-between">
        <div>
          <h5 className={styles.postTitle}>{post.title}</h5>
          <p className={styles.postText}>{post.content}</p>
        </div>
        <div className="mt-3">
          <button className={styles.editBtn} onClick={onEdit}>Edit</button>
          <button className={styles.uploadBtn} onClick={onUpload} disabled={uploading}>
            {uploading ? <><i className="fas fa-spinner fa-spin me-1" />Publishing...</> : <><i className="fab fa-facebook me-1" /> Publish to Facebook</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
