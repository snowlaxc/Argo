import React from 'react';

const IconUserImage = ({size}) => {
    return (
        <div className='circle' style={{borderRadius: "50%", width: size, height: size, overflow:'hidden', position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)"}}>
            <img src="/userImageBase.png" alt="My Image" style={{width: "100%", height: "100%"}}></img>
        </div>

    )
}
  
export default IconUserImage;

