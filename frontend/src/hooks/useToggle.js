import { useState, useCallback } from 'react';

/**
 * Custom hook toggle boolean
 * @returns {[boolean, Function]}
 */


const useToggle = () => {
    const [isOpen, setToggle] = useState(false);
    const toggle = useCallback(()=>{
        setToggle((prev) => !prev);
        
    },[])
    return [isOpen,toggle];
};
export { useToggle };