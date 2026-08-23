import { Link, useNavigate } from "react-router-dom";

// The top navigation bar. Shown on every page after login.
function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  }

  return (
    <div className="navbar">
      <div className="container navbar-inner">
        <Link to="/library" className="brand">
          <span className="gradient-bar"></span>
          Folio
        </Link>

        <ul className="nav-links">
          <li>
            <Link to="/library">Library</Link>
          </li>
          <li>
            <button onClick={handleLogout}>Log out</button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
