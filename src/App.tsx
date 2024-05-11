import React from "react";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchShippingCost = async (weight: number) => {
  await wait(1000);
  return weight * 0.5;
};

type State = {
  weight: number;
  shippingCost: number;
  effect?: any;
};

type Action =
  | {
      type: "setWeight";
      weight: number;
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
          effect: () => {
            async function fetchNewShippingCost(weight: number) {
              const shippingCost = await fetchShippingCost(weight);

              dispatch({
                type: "setShippingCost",
                shippingCost,
              });
            }

            fetchNewShippingCost(action.weight);
          },
        };
      }

      if (action.type === "setShippingCost") {
        return {
          ...state,
          shippingCost: action.shippingCost,
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
          dispatch({ type: "setWeight", weight: Number(e.target.value) })
        }
      />

      <p>Shipping cost: {currentState.shippingCost} 💵</p>
    </main>
  );
}
