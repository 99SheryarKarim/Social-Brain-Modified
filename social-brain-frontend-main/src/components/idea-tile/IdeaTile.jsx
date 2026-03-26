import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addIdea, removeIdea, updateIdea } from '../../features/SelectedIdeas/selectedIdeasSlice'; // ✅ Make sure this path is correct
import styles from './IdeaTile.module.css';
import PrimaryButton from '../primary-button/PrimaryButton';

const IdeaTile = ({ text: initialText, number, onSelect, onEdit }) => {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(false);
  const [text, setText] = useState(initialText);
  const [editValue, setEditValue] = useState(initialText);
  const textareaRef = useRef(null);

  const toggleSelection = () => {
    const newState = !selected;
    setSelected(newState);

    if (newState) {
      dispatch(addIdea(text));
    } else {
      dispatch(removeIdea(text));
    }

    if (onSelect) onSelect(newState);
  };

  const openEditModal = (e) => {
    e.stopPropagation();
    setEditValue(text);

    const modalId = `editModal-${number}`;
    const modal = new window.bootstrap.Modal(document.getElementById(modalId));
    modal.show();

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = textareaRef.current.value.length;
      }
    }, 300);
  };

  const handleSave = () => {
    if (text !== editValue) {
      if (selected) {
        dispatch(updateIdea({ oldText: text, newText: editValue }));
      }
      setText(editValue);
      if (onEdit) onEdit(editValue);
    }
    const modal = window.bootstrap.Modal.getInstance(document.getElementById(`editModal-${number}`));
    modal.hide();
  };

  return (
    <>
      <div
        className={`position-relative d-flex justify-content-between align-items-center w-100 ${styles.tile} ${selected ? styles.selected : ''}`}
        onClick={toggleSelection}
      >
        {number !== undefined && <div className={styles.badge}>#{number}</div>}
        <span className={styles.labelText}>{text}</span>

        <div className="icons d-flex gap-2">
          <a className="text-secondary fs-6 me-2" onClick={openEditModal}>
            <i className="fas fa-edit"></i>
          </a>
          <input
            type="checkbox"
            checked={selected}
            onChange={toggleSelection}
            onClick={(e) => e.stopPropagation()}
            className={styles.checkbox}
          />
        </div>
      </div>

      {/* Bootstrap Modal */}
      <div
        className="modal fade"
        id={`editModal-${number}`}
        tabIndex="-1"
        aria-labelledby={`editModalLabel-${number}`}
        aria-hidden="false"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className={`modal-content ${styles.modalContentStyle}`}>
            <div className="modal-header border-0">
              <h4 className="modal-title">Edit Idea</h4>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body px-4">
              <div className="inputField mb-4">
                <input
                  className={`form-control rounded-pill ${styles.modelInput}`}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Enter your idea here..."
                  ref={textareaRef}
                />
              </div>
              <div className="saveBtn d-flex justify-content-end">
                <PrimaryButton className="rounded-pill" onClick={handleSave}>Save</PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IdeaTile;
