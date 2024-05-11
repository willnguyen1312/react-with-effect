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
  weight: number;
  shippingCost: number;
  loadShippingCost?: boolean;
  shippingEffect?: () => () => any;
};

type Action =
  | {
      type: "setWeight";
      weight: number;
      debouncedTime?: number;
    }
  | {
      type: "setShippingCost";
      shippingCost: number;
    };

const reducer = (state: State, action: Action, dispatch: Function): State => {
  if (action.type === "setWeight") {
    return {
      ...state,
      weight: action.weight,
      loadShippingCost: true,
      shippingEffect: () => {
        let cancelFunction: () => void = () => {};

        const id = setTimeout(() => {
          cancelFunction = fetchShippingCost(action.weight, (shippingCost) => {
            dispatch({
              type: "setShippingCost",
              shippingCost,
            });
          });
        }, action.debouncedTime);

        return () => {
          cancelFunction();
          clearTimeout(id);
        };
      },
    };
  }

  if (action.type === "setShippingCost") {
    return {
      ...state,
      shippingCost: action.shippingCost,
      loadShippingCost: false,
    };
  }

  return state;
};

type Subscriber = () => void;
const createStore = () => {
  let state: State = {
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

export default function App() {
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
      const effect = currentState.shippingEffect;
      delete currentState.shippingEffect; // Mark as completed
      return effect();
    }
  }, [currentState]);

  return (
    <main>
      <h1>Please enter weight and I will give ya a shipping cost 😊</h1>

      <input
        type="number"
        value={currentState.weight}
        onChange={(e) =>
          storeRef.current?.dispatch({
            type: "setWeight",
            weight: Number(e.target.value),
            debouncedTime: 500,
          })
        }
      />

      <p>Shipping cost: {currentState.shippingCost} 💵</p>
      {currentState.loadShippingCost && <p>Loading shipping cost...</p>}
    </main>
  );
}
