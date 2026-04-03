
import { IconBtn } from './Button'
import { Link, useNavigation, useNavigate } from 'react-router-dom'
//Custom hooks
import { useToggle } from '../hooks/useToggle';
// Actions
import { logoutUser, getCurrentUser } from '../actions/loginActions';

import Avatar from './Avatar'
import Menu from './Menu';
import MenuItem from './MenuItem';
import { LinearProgress } from './Progress';
import Logo from './Logo';
import { AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const TopAppBar = ({ toggleSidebar }) => {
    const navigation = useNavigation();
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useToggle();
    const isNormalLoad = navigation.state === 'loading' && !navigation.formData;    
    
    // Lấy thông tin user từ localStorage
    const currentUser = getCurrentUser();
    const userName = currentUser?.username || currentUser?.full_name || 'User';

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

  return (
    <div>
      <header className="relative flex justify-between items-center h-16 px-4">
        <div className='flex items-center gap-1'>
            <IconBtn 
            icon='menu' 
            title='Menu'
            classes = 'lg:hidden'
            onClick={toggleSidebar}
   
            />
            <Logo classes='lg:hidden' />


        </div>
        <div className="menu-wrapper">
            <IconBtn onClick={setShowMenu}>
                <Avatar name={userName}   />
            </IconBtn>
            <Menu classes={showMenu ? 'active' : ''}>
                <MenuItem labelText="Log out" onClick={handleLogout} />
            </Menu>
        </div>

        <AnimatePresence>{isNormalLoad && <LinearProgress/>}
        </AnimatePresence>
      </header>
    </div>
  )
};
TopAppBar.protoTypes = {
  toggleSidebar: PropTypes.func,
};

export default TopAppBar;
