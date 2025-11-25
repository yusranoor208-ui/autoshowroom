import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import HomeDataSlice from "../Slices/HomeDataSlice.js";

// Persist configuration
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  blacklist:[] // Add slices you don't want to persist here
};

// Combine reducers
const rootReducer = combineReducers({
  home: HomeDataSlice,

});

// Wrap the rootReducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable checks for serializable actions due to persist
    }),
});

// Create persistor
const persistor = persistStore(store);

export { persistor, store };



