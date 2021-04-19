import React from 'react';
import { NavLink } from "react-router-dom";
import './Nav.scss';

const Nav = () => {
    return (
        <div className="settings--nav-container">
            <ul className="settings--nav-group">
                <li className="settings--nav-item">
                    <NavLink to="/settings/profile" activeClassName="settings--nav-active">Profile</NavLink>
                </li>
                <li className="settings--nav-item">
                    <NavLink to="/settings/messenger" activeClassName="settings--nav-active">Messenger</NavLink>
                </li>
                <li className="settings--nav-item">
                    <NavLink to="/settings/privacy" activeClassName="settings--nav-active">Privacy</NavLink>
                </li>
                <li className="settings--nav-item">
                    <NavLink to="/settings/other" activeClassName="settings--nav-active">Other</NavLink>
                </li>
            </ul>
        </div>
    );
};

export default Nav;