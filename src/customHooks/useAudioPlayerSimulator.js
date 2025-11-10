// import { useReducer, useEffect, useRef } from "react";
// import roundUpToDecimal from "../utils/roundUpToDecimal";

// const initialState = {
//   isRunning: false,
//   time: 0,
// };

// function reducer(state, action) {
//   switch (action.type) {
//     case "play":
//       return { ...state, isRunning: true };
//     case "pause":
//       return { ...state, isRunning: false };
//     case "stop":
//       return { isRunning: false, time: 0 };
//     case "seek":
//       return { ...state, time: +action.payload };
//     case "tick":
//       return { ...state, time: roundUpToDecimal(action.payload) };
//     default:
//       throw new Error();
//   }
// }

// export default function useAudioPlayerSimulator() {
//   const [state, dispatch] = useReducer(reducer, initialState);
//   const lastTimestampRef = useRef(null);
//   const animationFrameIdRef = useRef(null);

//   useEffect(() => {
//     const update = (timestamp) => {
//       if (!lastTimestampRef.current) {
//         lastTimestampRef.current = timestamp;
//       }

//       const elapsed = (timestamp - lastTimestampRef.current) / 1000; // Convert to seconds
//       lastTimestampRef.current = timestamp;

//       if (state.isRunning) {
//         dispatch({
//           type: "tick",
//           payload: state.time + elapsed,
//         });
//         animationFrameIdRef.current = requestAnimationFrame(update);
//       }
//     };

//     if (state.isRunning) {
//       animationFrameIdRef.current = requestAnimationFrame(update);
//     }

//     return () => {
//       cancelAnimationFrame(animationFrameIdRef.current);
//       lastTimestampRef.current = null;
//     };
//   }, [state.isRunning, state.time]);

//   return { state, dispatch };
// }

import { useReducer, useEffect, useRef } from "react";
import roundUpToDecimal from "../utils/roundUpToDecimal";

const initialState = {
  isRunning: false,
  time: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case "play":
      return { ...state, isRunning: true };
    case "pause":
      return { ...state, isRunning: false };
    case "stop":
      return { isRunning: false, time: 0 };
    case "tick":
      return { ...state, time: roundUpToDecimal(+state.time + 0.1) };
    case "seek":
      return { ...state, time: +action.payload };
    default:
      throw new Error();
  }
}

export default function useAudioPlayerSimulator() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const idRef = useRef(0);

  useEffect(() => {
    if (!state.isRunning) {
      return;
    }
    idRef.current = setInterval(() => dispatch({ type: "tick" }), 100);
    return () => {
      clearInterval(idRef.current);
      idRef.current = 0;
    };
  }, [state.isRunning]);

  return { state, dispatch };
}
