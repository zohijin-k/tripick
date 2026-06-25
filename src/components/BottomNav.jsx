import { Home, Map, PlusCircle, Trophy } from 'lucide-react';
import { NavLink } from 'react-router-dom';

function BottomNav() {
  const getNavClassName = ({ isActive }) =>
    isActive ? 'bottom-nav__item active' : 'bottom-nav__item';

  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={getNavClassName}>
        <Home size={18} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/" className={getNavClassName}>
        <Trophy size={18} />
        <span>Ranking</span>
      </NavLink>
      <NavLink to="/create" className={getNavClassName}>
        <PlusCircle size={18} />
        <span>Create</span>
      </NavLink>
      <NavLink to="/" className={getNavClassName}>
        <Map size={18} />
        <span>Trace</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;
