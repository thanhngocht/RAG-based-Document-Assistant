import { motion } from 'framer-motion';
import { useRef, useCallback, useState } from 'react';
import { IconBtn } from './Button';

const PromptField = ({ onSubmit, disabled = false, placeholder = 'Nhập câu hỏi của bạn...' }) => {
  const inputField = useRef();
  const inputFieldContainer = useRef();

  const [placeholderShown, setPlaceholderShown] = useState(true);
  const [isMultiline, setMultiline] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = useCallback(() => {
    if (inputField.current.innerText === '\n')
      inputField.current.innerHTML = '';
    setPlaceholderShown(!inputField.current.innerText);
    setMultiline(inputFieldContainer.current.clientHeight > 64);
    setInputValue(inputField.current.innerText.trim());
  }, []);

  const moveCursorToEnd = useCallback(() => {
    const editableElem = inputField.current;
    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(editableElem);
    range.collapse(false);

    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    inputField.current.innerText += e.clipboardData.getData('text');
    handleInputChange();
    moveCursorToEnd();
  }, [handleInputChange, moveCursorToEnd]);

  const handleSubmit = useCallback(() => {
    if (!inputValue || disabled) return;

    // Call parent's onSubmit handler
    if (onSubmit) {
      onSubmit(inputValue);
    }

    // Clear input field
    inputField.current.innerHTML = '';
    handleInputChange();
  }, [handleInputChange, inputValue, disabled, onSubmit]);

  const promptFieldVariant = {
    hidden: {},
    visible: {
      scaleX: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.2,
        duration: 0.4,
        delay: 0.4,
        ease: [0.05, 0.7, 0.1, 1],
      }
    },
  };
  
  const promptFieldChildrenVariant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <motion.div 
      className={`prompt-field-container ${isMultiline ? 'rounded-large' : ''}`}
      variants={promptFieldVariant}
      initial="hidden"
      animate='visible'
      ref={inputFieldContainer}
    >
      <motion.div 
        className={`prompt-field ${placeholderShown ? '' : 'after:hidden'}`}
        contentEditable={!disabled}
        role='textbox'
        aria-multiline={true}
        aria-label={placeholder}
        data-placeholder={placeholder}
        variants={promptFieldChildrenVariant}
        ref={inputField}
        onInput={handleInputChange}
        onPaste={handlePaste}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />

      <IconBtn
        icon='send'
        title='Submit'
        size='large'
        classes='ms-auto'
        variants={promptFieldChildrenVariant}
        onClick={handleSubmit}
        disabled={disabled || !inputValue}
      />

      <div className="state-layer"></div>
    </motion.div>
  );
};

export default PromptField;
