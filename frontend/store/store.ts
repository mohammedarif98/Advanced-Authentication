import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from "./authSlice";
import {
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
  } from 'redux-persist'
import storage from "redux-persist/lib/storage";



const rootReducer = combineReducers({ auth: authReducer });
// Configuration for redux-persist
const persistConfig = {
    key: 'root',                  // The key to store the persisted data in local storage
    version: 1,                   // Version of the persisted store (used for migrations)
    storage,                      // The storage engine used (localStorage in this case)
}

// Create the persisted reducer using redux-persist
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Configure the store with persistedReducer and middleware setup
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})


// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>; // Type of the entire state object
export type AppDispatch = typeof store.dispatch;           // Type of the dispatch function


export default store;