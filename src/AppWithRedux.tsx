import { Provider, useSelector, useDispatch } from "react-redux";
import {
  configureStore,
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

const updateStateAndFetchNewShippingCost = createAsyncThunk(
  "shippingLabels/fetchShippingCost",
  async (action: any, { signal, dispatch, getState }) => {
    dispatch(action);

    const { weight } = getState() as State;
    console.log(getState());
    const result = await fetch(
      `https://jsonplaceholder.typicode.com/photos/${weight}`,
      {
        signal,
      },
    ).then((response) => response.json());

    return result.id as number;
  },
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
      },
    );
  },
});

const { setMessage, setWeight } = shippingLabelsSlice.actions;

const store = configureStore({
  reducer: shippingLabelsSlice.reducer,
});

export function AppWithRedux() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

function App() {
  const currentState = useSelector((state) => state) as State;
  const dispatch = useDispatch();

  return (
    <>
      <h1>App built with useReducer and useEffect 🤘</h1>
      <h2>Please enter weight and I will give ya a shipping cost 😊</h2>
      <label htmlFor="message">
        Message:{" "}
        <input
          type="text"
          value={currentState.message}
          onChange={(e) => {
            dispatch(
              updateStateAndFetchNewShippingCost(
                dispatch(setMessage({ message: e.target.value })),
              ),
            );
          }}
        />
      </label>
      <label htmlFor="weight">
        Weight:{" "}
        <input
          type="number"
          value={currentState.weight}
          onChange={(e) =>
            dispatch(
              updateStateAndFetchNewShippingCost(
                setWeight({ weight: Number(e.target.value) }),
              ),
            )
          }
        />
      </label>
      <p>Shipping cost: {currentState.shippingCost} 💵</p>
      {currentState.loadShippingCost && <p>Loading shipping cost...</p>}
    </>
  );
}
