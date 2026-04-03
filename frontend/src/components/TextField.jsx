import PropTypes from "prop-types";


const TextField = ({        
    classes='',
    helpText,
    label,
    name,
    placeholder='',
    fieldClasses='',
    ...rest
}) => {
    return (
        <div className={`text-field-wrapper ${classes}`}>
            <label htmlFor={name} className="label-text">
                {label}
            </label>
            <input
                className={`text-field ${fieldClasses}`}
                id={name}
                name={name}
                placeholder={placeholder}
                {...rest}
            />
            {helpText && <p className="help-text">{helpText}</p>}
        </div>
    );
};
TextField.propTypes = {
    classes: PropTypes.string,
    helpText: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string,
    placeholder: PropTypes.string,
    fieldClasses: PropTypes.string,
};
export default TextField;