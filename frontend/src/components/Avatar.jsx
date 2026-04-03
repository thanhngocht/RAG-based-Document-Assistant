import PropTypes from "prop-types";

const Avatar = ({ name }) => {
    return (
        <figure className="avatar">
            <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`}
                alt={name}
                width={48}
                height={48} 
            />

        </figure>
    );
};

Avatar.propTypes = {
    name: PropTypes.string,


};
export default Avatar;