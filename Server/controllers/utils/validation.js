
  
 const validatePassword = (password) => {
    // Password must contain at least 8 characters, 1 number, and 1 special character
    const errors = [];
    const passwordChecking = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (password.length < 8) {
        errors.push('Password should be 8 characters or more.');
    }
    if (!passwordChecking.test(password)) {
        errors.push('Password must have uppercase, lowercase, and a symbol.');
    }
    return {
        isValid: errors.length === 0,
        errors: errors,
    };
  };


  module.exports = { validatePassword}