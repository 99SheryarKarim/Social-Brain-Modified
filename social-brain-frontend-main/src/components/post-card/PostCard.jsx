import { useState, useEffect } from 'react';
import styles from './PostCard.module.css';

const PostCard = ({ post, onEdit, onUpload, number, uploading }) => {
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    const topic = post.originalTopic || post.prompt || 'social media';
    const tone = post.tone || '';
    const query = tone ? `${topic} ${tone}` : topic;
    const apiKey = import.meta.env.VITE_PEXELS_API_KEY;

    fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
      headers: { Authorization: apiKey }
    })
      .then(res => res.json())
      .then(data => {
        if (data.photos && data.photos.length > 0) {
          setImgSrc(data.photos[0].src.landscape);
        } else {
          setImgSrc(`https://picsum.photos/seed/${encodeURIComponent(topic)}/600/300`);
        }
      })
      .catch(() => setImgSrc('https://picsum.photos/600/300'));
  }, [post.originalTopic, post.prompt, post.tone]);

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
            {uploading ? <><i className="fas fa-spinner fa-spin me-1" />Publishing...</> : '🚀 Publish to Facebook'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
