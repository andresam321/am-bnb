import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import logo from "/favicon.ico"
import ProfileButton from './ProfileButton-bonus';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);
  // console.log("🚀 ~ Navigation ~ sessionUser:", sessionUser)

  return (
    <header className='header-container'>
      <div>
        <NavLink to="/" className="home-nav">
          <div className='home-button'>
            <img src={logo} className='logo'/>
            <h3>WELCOME TO WORLD OF GAS</h3>
          </div>
        </NavLink>
      </div>
      <section className='top-right-buttons'>
      {sessionUser && (
        <div>
          <NavLink className="create-new-spot-nav" to='/spots/new'>
            Add a New Spot
          </NavLink>
        </div>
      )}
      {isLoaded && (
        <div>
          <ProfileButton user={sessionUser} />
        </div>
      )}
      </section>
    </header>
  );
}

export default Navigation;
