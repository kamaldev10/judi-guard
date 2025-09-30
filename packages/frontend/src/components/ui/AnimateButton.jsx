import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

// const AnimateButton = ({
//   text = "Click Me",
//   bgColor = "#6225e6",
//   hoverColor = "#fbc638",
// }) => {
//   return (
//     <StyledWrapper $bgColor={bgColor} $hoverColor={hoverColor}>
//       <button className="cta">
//         <span className="span">{text}</span>
//         <span className="second">{/* svg arrow */}</span>
//       </button>
//     </StyledWrapper>
//   );
// };

// AnimateButton.propTypes = {
//   text: PropTypes.string.isRequired,
//   bgColor: PropTypes.string.isRequired,
//   hoverColor: PropTypes.string.isRequired,
// };

// // gunakan $ prefix untuk transient props
// const StyledWrapper = styled.div`
//   .cta {
//     display: flex;
//     padding: 11px 33px;
//     text-decoration: none;
//     font-size: 20px;
//     color: white;
//     background: ${(props) => props.$bgColor || "#6225e6"};
//     transition: 1s;
//     box-shadow: 6px 6px 0 black;
//     transform: skewX(-15deg);
//     border: none;
//     cursor: pointer;
//   }

//   .cta:focus {
//     outline: none;
//   }

//   .cta:hover {
//     transition: 0.5s;
//     box-shadow: 10px 10px 0 ${(props) => props.$hoverColor || "#fbc638"};
//   }

//   .cta .second {
//     transition: 0.5s;
//     margin-right: 0px;
//   }

//   .cta:hover .second {
//     margin-right: 45px;
//   }

//   .span {
//     transform: skewX(15deg);
//   }

//   .second {
//     width: 20px;
//     margin-left: 30px;
//     position: relative;
//     top: 12%;
//   }

//   .one {
//     transition: 0.4s;
//     transform: translateX(-60%);
//   }

//   .two {
//     transition: 0.5s;
//     transform: translateX(-30%);
//   }

//   .cta:hover .three {
//     animation: color_anim 1s infinite 0.2s;
//   }

//   .cta:hover .one {
//     transform: translateX(0%);
//     animation: color_anim 1s infinite 0.6s;
//   }

//   .cta:hover .two {
//     transform: translateX(0%);
//     animation: color_anim 1s infinite 0.4s;
//   }

//   @keyframes color_anim {
//     0% {
//       fill: white;
//     }
//     50% {
//       fill: ${(props) => props.$hoverColor || "#fbc638"};
//     }
//     100% {
//       fill: white;
//     }
//   }
// `;

// export default AnimateButton;

const AnimateButton = ({ text = "Click Me" }) => {
  return (
    <StyledWrapper>
      <button>
        <svg
          height={24}
          width={24}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            d="M5 13c0-5.088 2.903-9.436 7-11.182C16.097 3.564 19 7.912 19 13c0 .823-.076 1.626-.22 2.403l1.94 1.832a.5.5 0 0 1 .095.603l-2.495 4.575a.5.5 0 0 1-.793.114l-2.234-2.234a1 1 0 0 0-.707-.293H9.414a1 1 0 0 0-.707.293l-2.234 2.234a.5.5 0 0 1-.793-.114l-2.495-4.575a.5.5 0 0 1 .095-.603l1.94-1.832C5.077 14.626 5 13.823 5 13zm1.476 6.696l.817-.817A3 3 0 0 1 9.414 18h5.172a3 3 0 0 1 2.121.879l.817.817.982-1.8-1.1-1.04a2 2 0 0 1-.593-1.82c.124-.664.187-1.345.187-2.036 0-3.87-1.995-7.3-5-8.96C8.995 5.7 7 9.13 7 13c0 .691.063 1.372.187 2.037a2 2 0 0 1-.593 1.82l-1.1 1.039.982 1.8zM12 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
            fill="currentColor"
          />
        </svg>
        <span>{text}</span>
      </button>
    </StyledWrapper>
  );
};
AnimateButton.propTypes = {
  text: PropTypes.string.isRequired,
  bgColor: PropTypes.string.isRequired,
  hoverColor: PropTypes.string.isRequired,
};

const StyledWrapper = styled.div`
  button {
    display: flex;
    align-items: center;
    font-family: inherit;
    cursor: pointer;
    font-weight: 500;
    font-size: 17px;
    padding: 0.8em 1.3em 0.8em 0.9em;
    color: white;
    background: linear-gradient(to right, #10b981, #0f766e, #0e7490);
    border: none;
    letter-spacing: 0.05em;
    border-radius: 16px;
  }

  button svg {
    margin-right: 3px;
    transform: rotate(30deg);
    transition: transform 0.5s cubic-bezier(0.76, 0, 0.24, 1);
  }

  button span {
    transition: transform 0.5s cubic-bezier(0.76, 0, 0.24, 1);
  }

  button:hover svg {
    transform: translateX(5px) rotate(90deg);
  }

  button:hover span {
    transform: translateX(7px);
  }
`;

export default AnimateButton;
