import React, { useState } from 'react';
import { GoChevronDown, GoChevronUp, GoBug } from "react-icons/go";
import { IoFileTrayStackedOutline } from "react-icons/io5";
import { RiPagesFill } from "react-icons/ri";
import '../../styles/Navbar.css';

const Navbar = () => {
    const[openSections, setIsOpen] = useState({
        apiDebugger: false,
        utility: false,
        //Aggiungi altre sezioni qui
    });
    const toggleDropdown = (section) => {
        setIsOpen((prev)=>({
            ...prev,
            [section]: !prev[section],
        }));
    };
    return (
        <nav className="navbar">
            <div className='section'>
                <div className="section-label">
                    <RiPagesFill />
                    Page
                </div>
                <div className="section-content open">
                    <a href="/docdashboard">Doc Dashboard</a>
                    <a href="/studentdashboard">Studente Dashboard</a>
                </div>
            </div>
            <div className='section'>
                <div 
                    className="section-label"
                    onClick={()=>toggleDropdown('utility')}
                    >
                    <IoFileTrayStackedOutline />
                    Utility 
                    {openSections.utility? <GoChevronUp /> : <GoChevronDown />}                
                </div>
                <div 
                    className={`section-content
                        ${openSections.utility? 'open' : 'closed'}
                    `}
                >
                    <a href="/view">File Manager</a>
                    <a href="/upload">File Transfer</a>
                </div>
            </div>
            <div className='section'>
                <div 
                    className="section-label"
                    onClick={()=>toggleDropdown('apiDebugger')}
                    >
                    <GoBug/>
                    API Debugger
                    {openSections.apiDebugger? <GoChevronUp /> : <GoChevronDown />}  
                </div>
                <div
                    className={`section-content ${
                        openSections.apiDebugger? 'open' : 'closed'
                    }`}
                >
                    <a href="/sessions">Sessions Debugger</a>
                    <a href="/api/debug-session">Current Session Debugger</a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;