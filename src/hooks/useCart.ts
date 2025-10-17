import { useState, useEffect } from 'react'
import { useMemo } from "react";
import { db } from '../data/db'

export const useCart = () => {
    // State (es ASINCRONO)
    // No se puede tener hooks en forma condicional (dentro de un if). Ni dentro de funciones

    const initialCart = () => {
        const localStorageCart = localStorage.getItem('cart');
        return localStorageCart ? JSON.parse(localStorageCart) : [];
    }

    const [auth, setAuth] = useState(false);
    const [data, setData] = useState([]); // Puede mterse db aca tambien
    const [cart, setCart] = useState(initialCart);

    const MAX_ITEMS = 5;
    const MIN_ITEMS = 1;

    useEffect(() => {
        saveLocalStorage()
    }, [cart]);

    // Ejecutar cierto codigo cuando un state cambia o cuando el componente carga
    useEffect(() => {
        setData(db)
        console.log(db)
    }, [auth]); // Arreglo de dependencias (arreglo = vacio sin dependencias)

    
    function addToCart(item) {
        // Evitar registros duplicados (Nota: Si muta el state el original)
        const itemExists = cart.findIndex((guitar) => guitar.id === item.id);

        if (itemExists >= 0) {
            console.log('Ya existe en el carrito', item);
            //cart[itemExists].quantity += 1; // Modifica el state direcatemnte, ojo. Recordar, state es inmutable
            const updatedCart = [...cart];

            updatedCart[itemExists].quantity += 1;

            setCart(updatedCart);
        } else {
            console.log('Agregando al carrito', item);
            item.quantity = 1;

            //setCart((prevCart) => [...prevCart, item]) // Forma recomendada para evitar problemas de asincronía
            setCart([...cart, item])
        }

        //aveLocalStorage()
    }

    function removeFromCart(id) {
        console.log('Eliminando del carrito', id);

        // Arreglo con los elementos que no coincidan con el id (Elimina directamente de nuestro arreglo)
        setCart(prevCart => prevCart.filter(item => item.id !== id));
    }

    function increaseQuantity(id) {
        console.log('Aumentando cantidad', id);
        //const index = cart.findIndex ((guitar) => guitar.id === id);

        //const updatedCart = [...cart];
        const updatedCart = cart.map(item => {
            if (item.id === id && item.quantity < MAX_ITEMS) {
                return {
                    ...item,
                    quantity: item.quantity + 1
                }
            }

            return item;
        });

        //updatedCart[index].quantity += 1;

        setCart(updatedCart);
    }

    function decreaseQuantity(id) {
        console.log('Decrease quantity');

        const updatedCart = cart.map(item => {
            if (item.id === id && item.quantity > MIN_ITEMS) {
                return {
                    ...item,
                    quantity: item.quantity - 1
                }
            }

            return item;
        });

        setCart(updatedCart);
    }

    function clearCart() {
        setCart([]);
    }

    function saveLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // State derivado
    // Use memo para memorizar valores calculados (no se ejecuta hasta que cambie la dependencia)
    // Este codigo se ejecuta solamente cuando carrito ha sido ejecutado (cacheado, ojo escenario)
    const isEmpty = useMemo(() => cart.length === 0, [cart]);
    const cartTotal = useMemo(() => cart.reduce((total, item) => total + (item.quantity * item.price), 0), [cart]) ;

    return {
        data,
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        isEmpty,
        cartTotal
    }
}
