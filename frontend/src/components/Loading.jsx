import React from 'react';
import '../styles/Loading.css';

const Loading = () => {
   return(
    <>
        <div id="loading-overlay">
            <div className="spinner"></div>
        </div>
    </>
   )
}

export default Loading;