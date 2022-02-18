import clsx from 'clsx';
import { useCallback, useEffect } from 'react';

import Button from 'ZeroComponents/button/button';

/**
 * @typedef {Object} ModalProps
 * @prop {string} [className]
 * @prop { [boolean, React.Dispatch<React.SetStateAction<boolean>>] } modalState
 * @prop {boolean} [showCloseButton]
 * @prop {React.ReactNode} [closeIcon]
 * @prop {() => void} [onClose]
 * @prop {import('react').ReactNode | string} children
 */

/**
 *
 * @param {ModalProps} props
 */
const Modal = ({ className, modalState, showCloseButton, closeIcon, children, onClose }) => {
  const [isOpen, setModalOpen] = modalState;

  const closeModal = useCallback(() => {
    setModalOpen(false);
    onClose?.();
  }, [setModalOpen, onClose]);

  const keydownHandler = useCallback(
    e => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    },
    [closeModal, isOpen]
  );

  useEffect(() => {
    document.addEventListener('keydown', keydownHandler, false);
    return () => {
      document.removeEventListener('keydown', keydownHandler, false);
    };
  }, [keydownHandler]);

  return (
    <div className={clsx(className, isOpen ? 'modal--open' : 'modal--close', 'Modal')}>
      <div className="modalBackground" onClick={closeModal} role="presentation"></div>
      <div className="modalContainer" onClick={e => e.stopPropagation()} role="presentation">
        <div className="modalInner">
          {children}
          {showCloseButton && (
            <Button onClick={closeModal} className="modalClose">
              {closeIcon && <span>&times;</span>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

Modal.defaultProps = {
  modalState: null,
  showCloseButton: true,
};

export default Modal;
