import PropTypes from "prop-types";
import { motion, scale } from "framer-motion";

const CircularProgress = ({ classes ='', size = ''}) => {
    console.log("🎯 CircularProgress rendered with size:", size);
    return (
        <div 
            role="progressbar" 
            className={`circular-progress ${size} ${classes}`}
        >
        </div>
    );
};
CircularProgress.propTypes = {
    classes: PropTypes.string,
    size: PropTypes.string,
};

const LinearProgress = ({classes = ''}) => {
    const progressVariants = {
        start: { scaleY: 0},
        end: { 
            scaleY: 1,
            trasition: {
                when: 'beforeChildren',
                duration: 0.2,
                ease: 'easeOut',
                delay: 0.5,
            },
            exit:{
                scaleY: 0,
                transition: {
                    duration: 0.1,
                    ease: 'easeOut',
                },
            },
        },
    };
    const activeIndicatorVariants = {
        start: { x: '-100%'},
        end: {
            x: '100%',
        },
    };
    return (
        <motion.div role="progressbar" variants = {progressVariants} initial = "start" animate = "end" exit = "exit" className={`linear-progress ${classes}`}>
            <motion.div
             variants={activeIndicatorVariants}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: [0.2, 0, 0, 1]
                }}
             className="active-indicator"></motion.div>
        </motion.div>
    );
};
LinearProgress.propTypes = {
    classes: PropTypes.string,
};

export { CircularProgress, LinearProgress };