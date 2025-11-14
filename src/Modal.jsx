import React from "react";
import './styles/App.scss';

function Modal() {
    return (
        <div className="overlay-modal">
            <div className="modal-window">
                <h2>🎉 Wow! 🎉</h2>
                <p>You did all your tasks, congrats!</p>
            </div>
        </div>
    );
}

export default Modal;