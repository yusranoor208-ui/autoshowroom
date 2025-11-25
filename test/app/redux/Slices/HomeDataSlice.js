
import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    user: {},
    name: "",
    role: "",
    cartCount: 0,
    wishlist: [],
    cartItems: []
};

const homeSlice = createSlice({
    name: "home",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
        },
        setName: (state, action) => {
            state.name = action.payload
        },
        setRole: (state, action) => {
            state.role = action.payload
        },
        incrementCart: (state) => {
            state.cartCount = state.cartCount + 1;
        },
        decrementCart: (state) => {
            state.cartCount = Math.max(0, state.cartCount - 1);
        },
        clearCart: (state) => {
            state.cartCount = 0;
        },
        addToWishlist: (state, action) => {
            const exists = state.wishlist.find(item => item.id === action.payload.id);
            if (!exists) {
                state.wishlist.push(action.payload);
            }
        },
        removeFromWishlist: (state, action) => {
            state.wishlist = state.wishlist.filter(item => item.id !== action.payload);
        },
        clearWishlist: (state) => {
            state.wishlist = [];
        },
        addToCart: (state, action) => {
            const existingItem = state.cartItems.find(item => item.id === action.payload.id);
            if (existingItem) {
                existingItem.quantity += action.payload.quantity || 1;
            } else {
                state.cartItems.push({
                    ...action.payload,
                    quantity: action.payload.quantity || 1
                });
            }
            state.cartCount = state.cartItems.reduce((total, item) => total + item.quantity, 0);
        },
        updateCartItemQuantity: (state, action) => {
            const item = state.cartItems.find(item => item.id === action.payload.id);
            if (item) {
                item.quantity = action.payload.quantity;
                if (item.quantity <= 0) {
                    state.cartItems = state.cartItems.filter(i => i.id !== action.payload.id);
                }
            }
            state.cartCount = state.cartItems.reduce((total, item) => total + item.quantity, 0);
        },
        removeFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter(item => item.id !== action.payload);
            state.cartCount = state.cartItems.reduce((total, item) => total + item.quantity, 0);
        },
        clearCartItems: (state) => {
            state.cartItems = [];
            state.cartCount = 0;
        },

    },
});

export const {
    setUser,
    setName,
    setRole,
    incrementCart,
    decrementCart,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCartItems

} = homeSlice.actions;

export default homeSlice.reducer;
