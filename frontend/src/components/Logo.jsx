import { Link } from 'react-router-dom'
import PropTypes from "prop-types";
const Logo = ({classes = ''}) => {
  return (
    <Link to='/'
    className={`min-w-max max-w-max h-[20px] flex items-center ${classes}`}>
        <img src="/logo.png" alt="logo" width={48} height={20} className="object-contain" />
    </Link>
);
};
Logo.PropTypes={
    classes: PropTypes.string,
};

export default Logo
