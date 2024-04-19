import { useState, useEffect } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginForm.css';

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  // const [buttonDisable, setButtonDisable] = useState(true)
  const [errors, setErrors] = useState([]);
  const [buttonDisable, setButtonDisable] = useState(true);
  const { closeModal } = useModal();
  const buttonClass = buttonDisable ? "log-in-modal-button-disabled" : "log-in-modal-button"
  const errorText = errors === "Invalid credentials" ? "The provided credentials were invalid" : null

  useEffect(() => {
    // Enable or disable the login button based on input lengths
    if (credential.length < 4 || password.length < 6) {
      setButtonDisable(true);
    } else {
      setButtonDisable(false);
    }
  }, [credential, password]);

  // const resetState = () => {
  //   setCredential("");
  //   setPassword("");
  //   setErrors({});
  //   setButtonDisable(true);
  // };


  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        }
      });
  };
  const demoUserLogIn = async () => {
    const response = await dispatch(sessionActions.login({"credential": 'Demo-lition', "password": 'password'}))
    if(response.ok){
      closeModal();
    }
  }

// const handleCloseModal = () => {
//     resetState();
//     closeModal();
//   };


  return (
    <>
      <h1>Log In</h1>
      {errors && <p className="log-in-modal-error">{errorText || errors}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Username or Email
          <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.credential && <p>{errors.credential}</p>}
        <button type="submit"
        disabled={buttonDisable} className={buttonClass}
        >Log In</button>
        <button type="demoUser" className="log-in-modal-button cursor" onClick={demoUserLogIn}>Log In as Demo User</button>
      </form>
    </>
  );
}

export default LoginFormModal;
