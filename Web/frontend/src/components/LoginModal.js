import React from 'react';
import "./LoginModal.css"

const Modal = ({ isOpen, onClose, children }) => {
  return (
    isOpen && (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className='modal_children'>{children}<br/></div>
          <button onClick={onClose}>확인</button>
        </div>
      </div>
    )
  );
};

export default Modal;