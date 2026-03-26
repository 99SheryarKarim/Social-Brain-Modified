import { useState, useRef } from 'react';
import styles from '../post-genie/PostGeniePage.module.css';
import PrimaryButton from '../../components/primary-button/PrimaryButton';
import { uploadPhotoToFacebookPage } from '../../services/post-to-fb';

const tones = ['Professional', 'Creative', 'Friendly', 'Casual', 'Witty', 'Sarcastic', 'Motivational', 'Empowering'];
const words = [10, 20, 50, 100, 150, 200];

const QuickPost = () => {
    const textareaRef = useRef(null);

    const [prompt, setPrompt] = useState('');
    const [postText, setPostText] = useState('');
    const [isGenerated, setIsGenerated] = useState(false);

    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const [selectedTone, setSelectedTone] = useState('');
    const [numWords, setNumWords] = useState(50);
    const [isUploading, setIsUploading] = useState(false); // 🔹 New state

    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const handleImageChange = (e) => {
        const newFiles = Array.from(e.target.files);
        const updatedFiles = [...imageFiles, ...newFiles];
        setImageFiles(updatedFiles);

        const newPreviews = newFiles.map((file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(newPreviews).then((newImages) => {
            setImagePreviews((prevPreviews) => [...prevPreviews, ...newImages]);
        });

        e.target.value = null;
    };

    const handleRemoveImage = (index) => {
        setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
        setImagePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
    };

    const handleGenerate = () => {
        setPostText(`This is a ${selectedTone || 'Casual'} tone post with about ${numWords} words.`);
        setIsGenerated(true);
    };

    const handleToneSelect = (tone) => {
        setSelectedTone(tone === selectedTone ? '' : tone);
    };

    const handleUploadPost = async () => {
        try {
            if (!postText.trim()) {
                alert("Post text is empty!");
                return;
            }

            setIsUploading(true); // 🔹 Start loading

            if (imageFiles.length > 0) {
                await uploadPhotoToFacebookPage(imageFiles[0], postText);
            } else {
                alert("No image selected. Text-only post requires a separate implementation.");
            }

            alert("✅ Post uploaded to Facebook!");
        } catch (err) {
            console.error("❌ Failed to upload post:", err.message);
            alert("Something went wrong. Check the console for details.");
        } finally {
            setIsUploading(false); // 🔹 Stop loading
        }
    };

    console.log("Image files:", imageFiles);

    return (
        <div className="container py-5">
            <div className="text-center mb-4">
                <h2 className="fw-bold text-dark">✨ Create a Custom Post</h2>
                <p className="text-muted">Generate, edit, and upload a single post</p>
            </div>

            {/* Prompt Textarea */}
            <div className="mb-3">
                <label className="form-label fw-semibold">Write a Prompt to generate post with AI</label>
                <div className="position-relative w-100">
                    <textarea
                        rows="1"
                        ref={textareaRef}
                        value={prompt}
                        onInput={handlePromptChange}
                        className={`form-control px-5 py-3 ${styles.textarea}`}
                        placeholder="Type your prompt here..."
                    />
                    <button
                        className={`btn btn-dark position-absolute d-flex align-items-center gap-2 ${styles.generateBtn}`}
                        onClick={handleGenerate}
                        disabled={!prompt.trim()}
                    >
                        <i className="fas fa-arrow-up text-white" />
                    </button>
                </div>
            </div>

            {/* Tone buttons + Word Limit */}
            <div className="mb-5 px-1 d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div className="d-flex flex-wrap gap-2">
                    {tones.map((tone) => (
                        <button
                            key={tone}
                            className={`btn rounded-pill px-3 py-2 ${styles.toneBtn} ${selectedTone === tone ? styles.selected : ''}`}
                            onClick={() => handleToneSelect(tone)}
                        >
                            {tone}
                        </button>
                    ))}
                </div>

                <div className="dropdown">
                    <button
                        className={`btn ${styles.toneBtn} px-3 py-2 dropdown-toggle rounded-pill`}
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        {numWords} Words
                    </button>
                    <ul className="dropdown-menu rounded pt-2">
                        {words.map((num) => (
                            <li key={num}>
                                <button
                                    className="dropdown-item"
                                    onClick={() => setNumWords(num)}
                                >
                                    {num} Words
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <hr className='mt-5 mb-5' style={{ color: 'teal' }} />

            <div className="body">
                {/* Generated Post */}
                <div className="mb-4">
                    <label className="form-label fw-semibold">Edit Post</label>
                    <textarea
                        className="form-control"
                        rows={4}
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                    />
                </div>

                {/* Image Upload */}
                <div className="mb-5 pt-4">
                    <label className="form-label fw-semibold">Attach an Image (optional)</label>
                    <input type="file" className="form-control mb-5" onChange={handleImageChange} multiple />

                    {imagePreviews.length > 0 && (
                        <div className="mt-3 d-flex flex-wrap justify-content-center gap-3">
                            {imagePreviews.map((src, index) => (
                                <div key={index} className="position-relative">
                                    <img
                                        src={src}
                                        alt={`Preview ${index + 1}`}
                                        style={{ maxHeight: '200px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                                    />
                                    <button
                                        className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle"
                                        style={{ transform: 'translate(50%, -50%)' }}
                                        onClick={() => handleRemoveImage(index)}
                                    >
                                        <i className='fas fa-close'></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center mt-4">
                <PrimaryButton className="rounded-pill d-flex align-items-center justify-content-center gap-2" onClick={handleUploadPost} disabled={isUploading}>
                    {isUploading ? (
                        <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Uploading...
                        </>
                    ) : (
                        'Upload Post'
                    )}
                </PrimaryButton>
            </div>
        </div>
    );
};

export default QuickPost;
