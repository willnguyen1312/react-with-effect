import React from "react";
import { createDevtools } from "./devtools";

const fetchShippingCost = (
  weight: number,
  callBack: (value: number) => void
) => {
  const controller = new AbortController();
  fetch(`https://jsonplaceholder.typicode.com/photos/${weight}`, {
    signal: controller.signal,
  })
    .then((response) => response.json())
    .then((data) => callBack(data.id))
    .catch(() => {
      // Ignore errors for now since it's just a intentional request cancelation 😄
    });
  return () => controller.abort("Operation was aborted by the user");
};

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
  (
    dispatch: ReturnType<typeof createStore>["dispatch"],
    weight: number,
    debouncedTime = 0
  ) =>
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

const reducer = (
  state: State,
  action: Action,
  dispatch: ReturnType<typeof createStore>["dispatch"]
): State => {
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
};

type Subscriber = () => void;
const createStore = () => {
  let state: State = {
    message: "",
    weight: 0,
    shippingCost: 0,
    loadShippingCost: false,
  };
  const listeners: Set<Subscriber> = new Set();

  const getState = () => state;

  const setState = (newState: Partial<State>) => {
    state = { ...state, ...newState };
    listeners.forEach((listener) => listener());
  };

  let devtools: ReturnType<typeof createDevtools>;

  const dispatch = (action: Action) => {
    state = reducer(state, action, dispatch);
    devtools?.dispatch(action);
    listeners.forEach((listener) => listener());
  };

  devtools = createDevtools({
    getState,
    setState,
    dispatch,
  });

  return {
    dispatch,
    getState,
    setState,
    subscribe: (subscriber: Subscriber) => {
      listeners.add(subscriber);
      return () => {
        listeners.delete(subscriber);
      };
    },
  };
};

export function AppWithoutStore() {
  const storeRef = React.useRef<ReturnType<typeof createStore>>();

  if (!storeRef.current) {
    storeRef.current = createStore();
  }

  const currentState = React.useSyncExternalStore(
    storeRef.current.subscribe,
    storeRef.current.getState
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
            storeRef.current?.dispatch({
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
            storeRef.current?.dispatch({
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
