import { Provider, useSelector, useDispatch } from "react-redux";
import {
  configureStore,
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { useEffect, useState } from "react";

const updateStateAndFetchNewShippingCost = createAsyncThunk(
  "shippingLabels/fetchShippingCost",
  async (action: any, { signal, dispatch, getState }) => {
    dispatch(action);

    let id: number | undefined;

    signal.addEventListener("abort", () => {
      clearTimeout(id);
    });

    // @ts-ignore
    const { promise, resolve } = Promise.withResolvers();
    const { weight } = getState() as State;

    id = setTimeout(() => {
      fetch(`https://jsonplaceholder.typicode.com/photos/${weight}`, {
        signal,
      })
        .then((response) => response.json())
        .then((data) => resolve(data.id as any))
        .catch(() => {
          // Ignore errors for now since it's just a intentional request cancelation 😄
        });
    }, action.payload.debouncedTime);

    return await promise;
  }
) as any;

type State = {
  message: string;
  weight: number;
  shippingCost: number;
  loadShippingCost?: boolean;
};

const shippingLabelsSlice = createSlice({
  name: "shippingLabels",
  initialState: {
    message: "",
    weight: 0,
    shippingCost: 0,
    loadShippingCost: false,
  } as State,
  reducers: {
    setMessage: (state, action) => {
      state.message = action.payload.message;
    },
    setWeight: (state, action) => {
      state.weight = action.payload.weight;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateStateAndFetchNewShippingCost.pending, (state) => {
      state.loadShippingCost = true;
    });
    builder.addCase(
      updateStateAndFetchNewShippingCost.fulfilled,
      (state, action) => {
        state.shippingCost = action.payload;
        state.loadShippingCost = false;
      }
    );
  },
});

const { setMessage, setWeight } = shippingLabelsSlice.actions;

const store = configureStore({
  reducer: shippingLabelsSlice.reducer,
});

export default function AppWithRedux() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

const useDispatchWithAutoPromiseAbort = () => {
  const [promise, setPromise] = useState<any>();
  const originalDispatch = useDispatch();

  useEffect(() => {
    return () => {
      promise?.abort("Bye bye 👋");
    };
  }, [promise]);

  const dispatch = (arg: any) => {
    setPromise(originalDispatch(arg));
  };

  return dispatch;
};

function App() {
  const currentState = useSelector((state) => state) as State;
  const dispatch = useDispatchWithAutoPromiseAbort();

  return (
    <>
      <h1>App built with Redux Toolkit 🤘</h1>
      <h2>Please enter weight and I will give ya a shipping cost 😊</h2>
      <label htmlFor="message">
        Message:{" "}
        <input
          type="text"
          value={currentState.message}
          onChange={(e) => {
            dispatch(
              updateStateAndFetchNewShippingCost(
                setMessage({ message: e.target.value, debouncedTime: 5000 })
              )
            );
          }}
        />
      </label>
      <label htmlFor="weight">
        Weight:{" "}
        <input
          type="number"
          value={currentState.weight}
          onChange={(e) => {
            dispatch(
              updateStateAndFetchNewShippingCost(
                setWeight({
                  weight: Number(e.target.value),
                  debouncedTime: 2000,
                })
              )
            );
          }}
        />
      </label>
      <p>Shipping cost: {currentState.shippingCost} 💵</p>
      {currentState.loadShippingCost && <p>Loading shipping cost...</p>}
    </>
  );
}
