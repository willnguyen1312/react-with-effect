import React from "react";

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
      // Ignore errors for now since it's just a cancelation 😄
    });
  return () => controller.abort("Operation was aborted by the user");
};

type State = {
  weight: number;
  shippingCost: number;
  loadShippingCost?: boolean;
  effect?: any;
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

export default function App() {
  const [currentState, dispatch] = React.useReducer(
    (state: State, action: Action): State => {
      if (action.type === "setWeight") {
        return {
          ...state,
          weight: action.weight,
          loadShippingCost: true,
          effect: () => {
            let cancelFunction: () => void = () => {};

            const id = setTimeout(() => {
              cancelFunction = fetchShippingCost(
                action.weight,
                (shippingCost) => {
                  dispatch({
                    type: "setShippingCost",
                    shippingCost,
                  });
                }
              );
            }, action.debouncedTime);

            return () => {
              cancelFunction();
              clearTimeout(id);
            };
          },
        };
      }

      if (action.type === "setShippingCost") {
        console.log({ state });
        return {
          ...state,
          shippingCost: action.shippingCost,
          loadShippingCost: false,
        };
      }

      return state;
    },
    {
      weight: 0,
      shippingCost: 0,
    }
  );

  React.useEffect(() => {
    if (currentState.effect) {
      const effect = currentState.effect;
      delete currentState.effect; // Mark as completed
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
          dispatch({
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
