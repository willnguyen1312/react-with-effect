import React from "react";
import { fetchShippingCost } from "./api";

type State = {
  message: string;
  weight: number;
  shippingCost: number;
  loadShippingCost?: boolean;
  shippingEffect?: () => () => any;
};

type Action =
  | {
      type: "setMessage";
      message: string;
      debouncedTime?: number;
    }
  | {
      type: "setWeight";
      weight: number;
      debouncedTime?: number;
    }
  | {
      type: "setShippingCost";
      shippingCost: number;
    };

const createShippingEffect =
  (dispatch: React.Dispatch<Action>, weight: number, debouncedTime = 0) =>
  () => {
    let cancelFunction: () => void = () => {};

    const id = setTimeout(() => {
      cancelFunction = fetchShippingCost(weight, (shippingCost) => {
        dispatch({
          type: "setShippingCost",
          shippingCost,
        });
      });
    }, debouncedTime);

    return () => {
      cancelFunction();
      clearTimeout(id);
    };
  };

export function AppWithoutStore() {
  const [currentState, dispatch] = React.useReducer(
    (state: State, action: Action): State => {
      if (action.type === "setWeight") {
        return {
          ...state,
          weight: action.weight,
          loadShippingCost: true,
          shippingEffect: createShippingEffect(
            dispatch,
            action.weight,
            action.debouncedTime
          ),
        };
      }

      if (action.type === "setShippingCost") {
        return {
          ...state,
          shippingCost: action.shippingCost,
          loadShippingCost: false,
          shippingEffect: undefined,
        };
      }

      if (action.type === "setMessage") {
        return {
          ...state,
          message: action.message,
          loadShippingCost: true,
          shippingEffect: createShippingEffect(
            dispatch,
            state.weight,
            action.debouncedTime
          ),
        };
      }

      return state;
    },
    {
      message: "",
      weight: 0,
      shippingCost: 0,
      loadShippingCost: false,
    }
  );

  React.useEffect(() => {
    if (currentState.shippingEffect) {
      return currentState.shippingEffect();
    }
  }, [currentState.shippingEffect]);

  return (
    <>
      <h1>App built with useReducer and useEffect 🤘</h1>
      <h2>Please enter weight and I will give ya a shipping cost 😊</h2>

      <label htmlFor="message">
        Message:{" "}
        <input
          type="text"
          value={currentState.message}
          onChange={(e) =>
            dispatch({
              type: "setMessage",
              message: e.target.value,
              debouncedTime: 5000,
            })
          }
        />
      </label>

      <label htmlFor="weight">
        Weight:{" "}
        <input
          type="number"
          value={currentState.weight}
          onChange={(e) =>
            dispatch({
              type: "setWeight",
              weight: Number(e.target.value),
              debouncedTime: 2000,
            })
          }
        />
      </label>

      <p>Shipping cost: {currentState.shippingCost} 💵</p>
      {currentState.loadShippingCost && <p>Loading shipping cost...</p>}
    </>
  );
}
