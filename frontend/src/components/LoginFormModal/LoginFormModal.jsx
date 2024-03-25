import { useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginForm.css';

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  // const [buttonDisable, setButtonDisable] = useState(true)
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
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

  // useEffect(() => {
  //   if(credential.length < 4 || password.length < 6){
  //     setButtonDisable(true)
  //   } else {
  //     setButtonDisable(false)
  //   }
  // }, [credential, password])


  return (
    <>
      <h1>Log In</h1>
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
        <button type="submit">Log In</button>
        <button type="demoUser" className="log-in-modal-button cursor" onClick={demoUserLogIn}>Log In as Demo User</button>
      </form>
    </>
  );
}

export default LoginFormModal;
