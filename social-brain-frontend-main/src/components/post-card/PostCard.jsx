import styles from './PostCard.module.css';

const PostCard = ({ post, onEdit, onUpload,number }) => {
  return (
    <div className={`row g-0 mb-4 position-relative ${styles.cardWrapper}`}>
      {/* Number Badge */}
      <div className={styles.badge}>#{number}</div>

      {/* Image Column */}
      <div className="col-md-5">
        <img
          src="https://picsum.photos/600/300"
          alt="Post"
          className={`img-fluid h-100 w-100 ${styles.postImage}`}
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
          <button className={styles.uploadBtn} onClick={onUpload}>Upload</button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
