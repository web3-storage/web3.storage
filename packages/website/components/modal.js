import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

/**
 * @typedef {Object} ModalProps
 * @prop {boolean} [show]
 * @prop {function} [onClose]
 * @prop {JSX.Element | string} [children]
 */

/**
 * Modal Component
 *
 * @param {ModalProps} param0
 * @returns
 */
export default function Modal({
    show,
    onClose = () => {},
    children
}) {
  const [isBrowser, setIsBrowser] = useState(false);
  const modalWrapperRef = useRef(null);

  const backDropHandler = useCallback((e) => {
    // @ts-ignore
    if (show && !modalWrapperRef?.current?.contains(e.target)) {
        onClose();
    }
  }, [onClose, show]);

  useEffect(() => {
    setIsBrowser(true);

    window.addEventListener('click', backDropHandler);
    return () => window.removeEventListener('click', backDropHandler);
  }, [backDropHandler]);

  useEffect(() => {
    const bodyElement = document.querySelector('body');

    if (show) {
      bodyElement?.classList.add('overflow-hidden')
    } else {
      bodyElement?.classList.remove('overflow-hidden')
    }
  }, [show]);

  const handleCloseClick = () => {
    onClose();
  };

  const modalContent = show ? (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
      <div
        ref={modalWrapperRef}
        role="dialog"
        aria-modal="true"
        className="flex flex-col relative bg-white w-96 h-80 p-8 border border-black rounded-md">
        <div className="absolute top-0 right-2">
          <button type="button" className="bg-black text-white w-6 h-6 border rounded-xl text-sm leading-5" onClick={handleCloseClick}>
            X
          </button>
        </div>
        {children}
      </div>
    </div>
  ) : null

  if (isBrowser) {
    const modalDiv = document.getElementById("modal-root");
    return modalDiv ? ReactDOM.createPortal(modalContent, modalDiv) : null;
  } else {
    return null;
  }
};
