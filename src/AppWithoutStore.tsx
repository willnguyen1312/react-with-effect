import { useReducer, useEffect, Dispatch } from "react";
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

const runShippingEffect = (
  dispatch: Dispatch<Action>,
  weight: number,
  debouncedTime = 0,
) => {
  let cancelFetchShippingCost: () => void = () => {};

  const id = setTimeout(() => {
    cancelFetchShippingCost = fetchShippingCost(weight, (shippingCost) => {
      dispatch({
        type: "setShippingCost",
        shippingCost,
      });
    });
  }, debouncedTime);

  return () => {
    cancelFetchShippingCost();
    clearTimeout(id);
  };
};

export function AppWithoutStore() {
  const [currentState, dispatch] = useReducer(
    (state: State, action: Action): State => {
      if (action.type === "setWeight") {
        return {
          ...state,
          weight: action.weight,
          loadShippingCost: true,
          shippingEffect: () =>
            // Due to how closure works in JavaScript, we need have to pass the dispatch function into the runShippingEffect function
            // instead of createShippingEffect(dispatch, action.weight, action.debouncedTime) like the another example
            // At this point, the inner function has access to the dispatch function returned by useReducer 🤘
            runShippingEffect(dispatch, action.weight, action.debouncedTime),
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
          shippingEffect: () =>
            runShippingEffect(dispatch, state.weight, action.debouncedTime),
        };
      }

      return state;
    },
    {
      message: "",
      weight: 0,
      shippingCost: 0,
      loadShippingCost: false,
    },
  );

  useEffect(() => {
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
