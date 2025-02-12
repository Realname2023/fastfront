import '../styles/Goods.css';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import API_URL from '../config';

const Goods = () => {
  const { categoryId, selectedCity } = useParams();
  const [goods, setGoods] = useState([]);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const userId = 2006308022; // Тестовый user_id

  // Получение списка товаров
  const fetchGoods = async () => {
    try {
      const endpoint = selectedCity
        ? `${API_URL}catalog/${categoryId}/${selectedCity}`
        : `${API_URL}catalog/${categoryId}/`;
      const response = await axios.get(endpoint,
        {headers: {'ngrok-skip-browser-warning': 6024}});
      setGoods(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCart = async () => {
    try {
      const response = await axios.get(`${API_URL}cart/get/${userId}/`,
      {headers: {'ngrok-skip-browser-warning': true}});
      const userCart = response.data;

      // Преобразуем данные в объект, где ключ — good_id
      const updatedCart = userCart.reduce((acc, item) => {
        acc[item.good_id] = {
          quantity: item.quantity,
          arenda_time: item.arenda_time || 1,
          inCart: true,
        };
        return acc;
      }, {});

      setCart(updatedCart);
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
    }
  };

  // Добавление товара в корзину
  const handleAddToCart = async (good) => {
    const quantity = cart[good.id]?.quantity || 1;
    const arenda_time = cart[good.id]?.arenda_time || 1;
    const total_price = good.is_arenda
      ? good.price * quantity * arenda_time
      : good.price * quantity;
    
    const payload = {
      user_id: userId,
      good_id: good.id,
      quantity,
      arenda_time,
      is_arenda: good.is_arenda,
      is_delivery: false,
      is_contract: false,
      total_price,
    };

    try {
      await axios.post(`${API_URL}cart/add/`, payload,
      {headers: {'ngrok-skip-browser-warning': 6024}});

      // Обновляем состояние корзины
      setCart((prevCart) => ({
        ...prevCart,
        [good.id]: { quantity, arenda_time, inCart: true },
      }));
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
    }
  };

  const handleDeleteCart = async (good) => {
    const payload = {
      user_id: userId,
      good_id: good.id,
    };
    try {
      await axios.delete(`${API_URL}cart/delete/`, {
        data: payload,
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 6024 },
      });

      setCart((prevCart) => {
        const updatedCart = { ...prevCart };
        delete updatedCart[good.id];
        return updatedCart;
      });
    } catch (error) {
      console.error('Ошибка удаления корзины:', error);
    }
  };

  // Изменение количества
  const handleChangeQuantity = (id, value) => {
    setCart((prevCart) => ({
      ...prevCart,
      [id]: {
        ...prevCart[id],
        quantity: Math.max(1, value),
      },
    }));
  };

  // Изменение времени аренды
  const handleChangeArendaTime = (id, value) => {
    setCart((prevCart) => ({
      ...prevCart,
      [id]: {
        ...prevCart[id],
        arenda_time: Math.max(1, value),
      },
    }));
  };

  // Переход к корзине
  const handleViewCart = () => {
    navigate('/cart', { state: { userId } });
  };

  useEffect(() => {
    fetchGoods();
    fetchUserCart();
  }, [categoryId, selectedCity]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error}</p>;

  return (
    <div>
      <table className="responsive-table">
        <tbody>
          {goods.map((good) => (
            <tr key={good.id}>
              <td>
                <p>
                  <img
                    src={good.photo}
                    alt={good.name}
                    style={{ width: '100px', height: 'auto' }}
                  />
                </p>
                <p>{good.name}</p>
                <p>{good.unit}</p>
                <p>Цена: {good.price}</p>
                <p>Город: {good.city['name']}</p>
                <p>
                  {cart[good.id]?.inCart ? (
                    <button onClick={() => handleDeleteCart(good)}>
                      В корзине {cart[good.id].quantity} шт{' '}
                      {good.is_arenda && `на ${cart[good.id].arenda_time} мес`}
                    </button>
                  ) : (
                    <div>
                      <button
                        onClick={() =>
                          handleChangeQuantity(
                            good.id,
                            (cart[good.id]?.quantity || 1) - 1
                          )
                        }
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={cart[good.id]?.quantity || 1}
                        onChange={(e) =>
                          handleChangeQuantity(
                            good.id,
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        style={{ width: '50px', textAlign: 'center' }}
                      />
                      <button
                        onClick={() =>
                          handleChangeQuantity(
                            good.id,
                            (cart[good.id]?.quantity || 1) + 1
                          )
                        }
                      >
                        +
                      </button>
                      {good.is_arenda && (
                        <div>
                          <p>Время аренды (мес):</p>
                          <button
                            onClick={() =>
                              handleChangeArendaTime(
                                good.id,
                                (cart[good.id]?.arenda_time || 1) - 1
                              )
                            }
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={cart[good.id]?.arenda_time || 1}
                            onChange={(e) =>
                              handleChangeArendaTime(
                                good.id,
                                Math.max(1, parseInt(e.target.value) || 1)
                              )
                            }
                            style={{ width: '50px', textAlign: 'center' }}
                          />
                          <button
                            onClick={() =>
                              handleChangeArendaTime(
                                good.id,
                                (cart[good.id]?.arenda_time || 1) + 1
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      )}
                      <button
                        className="add-to-order"
                        onClick={() => handleAddToCart(good)}
                      >
                        Добавить в заказ
                      </button>
                    </div>
                  )}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="view-cart"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
        onClick={handleViewCart}
      >
        Посмотреть заказ
      </button>
    </div>
  );
};

export default Goods;

// import '../styles/Goods.css';
// import { useParams, useNavigate, data } from 'react-router-dom';
// import axios from 'axios';
// import React, { useEffect, useState } from 'react';

// const Goods = () => {
//   const { categoryId, selectedCity } = useParams();
//   const [goods, setGoods] = useState([]);
//   const [error, setError] = useState(null);
//   const [cart, setCart] = useState({});
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);

//   const userId = 1234; // Тестовый user_id

//   // Получение списка товаров
//   const fetchGoods = async () => {
//     try {
//       const endpoint = selectedCity
//         ? `http://127.0.0.1:8000/catalog/${categoryId}/${selectedCity}`
//         : `http://127.0.0.1:8000/catalog/${categoryId}/`;
//       const response = await axios.get(endpoint);
//       setGoods(response.data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchUserCart = async () => {
//     try {
//       const response = await axios.get(`http://127.0.0.1:8000/cart/get/${userId}/`);
//       const userCart = response.data;

//       // Преобразуем данные в объект, где ключ — good_id
//       const updatedCart = userCart.reduce((acc, item) => {
//         acc[item.good_id] = { quantity: item.quantity, inCart: true };
//         return acc;
//       }, {});
  
//       setCart(updatedCart); // Обновляем состояние корзины
    
//     } catch (error) {
//       console.error('Ошибка загрузки корзины:', error);
//     }
//   };

//   // Добавление товара в корзину
//   const handleAddToCart = async (good) => {
//     const quantity = cart[good.id]?.quantity || 1;
//     const total_price = good.price * quantity;

//     const payload = {
//       user_id: userId,
//       good_id: good.id,
//       quantity,
//       arenda_time: 0,
//       is_arenda: good.is_arenda,
//       is_delivery: false,
//       is_contract: false,
//       total_price,
//     };

//     try {
//       await axios.post('http://127.0.0.1:8000/cart/add/', payload);

//       // Обновляем состояние корзины
//       setCart((prevCart) => ({
//         ...prevCart,
//         [good.id]: { quantity, inCart: true },
//       }));
//     } catch (error) {
//       console.error('Ошибка добавления в корзину:', error);
//     }
//   };
//   const handleDeleteCart = async (good) => {
//     const payload = {
//       user_id: userId,
//       good_id: good.id
//     }
//     try {
//       await axios.delete(`http://127.0.0.1:8000/cart/delete/`,
//       { data: payload, headers: { 'Content-Type': 'application/json' }})

//       setCart((prevCart) => {
//         const updatedCart = { ...prevCart };
//         delete updatedCart[good.id];
//         return updatedCart;
//       });
//     } catch (error) {
//       console.error('Ошибка удаления корзины:', error);
//     }
//   };
//   // Изменение количества
//   const handleChangeQuantity = (id, value) => {
//     setCart((prevCart) => ({
//       ...prevCart,
//       [id]: { quantity: Math.max(1, value), inCart: false },
//     }));
//   };

//   // Переход к корзине
//   const handleViewCart = () => {
//     navigate('/cart', { state: { userId } });
//   };

//   // const hasItemsInCart = Object.values(cart).some((item) => item.inCart);

//   useEffect(() => {
//     fetchGoods();
//     fetchUserCart();
//   }, [categoryId, selectedCity]);

//   if (loading) return <p>Загрузка...</p>;
//   if (error) return <p>Ошибка: {error}</p>;

//   return (
//     <div>
//       <table className="responsive-table">
//         <tbody>
//           {goods.map((good) => (
//             <tr key={good.id}>
//               <td>
//                 <p>
//                   <img
//                     src={good.photo}
//                     alt={good.name}
//                     style={{ width: '100px', height: 'auto' }}
//                   />
//                 </p>
//                 <p>{good.name}</p>
//                 <p>{good.unit}</p>
//                 <p>Цена: {good.price}</p>
//                 <p>Город: {good.city['name']}</p>
//                 <p>
//                   {cart[good.id]?.inCart ? (
              
//                     // hasItemsInCart && (
//                     <button onClick={() => handleDeleteCart(good)}>
//                       В корзине {cart[good.id].quantity} шт
//                     </button>
//                   ) : (
//                     // Элементы для изменения количества и добавления
//                     <div>
//                       <button
//                         onClick={() =>
//                           handleChangeQuantity(
//                             good.id,
//                             (cart[good.id]?.quantity || 1) - 1
//                           )
//                         }
//                       >
//                         -
//                       </button>
//                       <input
//                         type="number"
//                         value={cart[good.id]?.quantity || 1}
//                         onChange={(e) =>
//                           handleChangeQuantity(
//                             good.id,
//                             Math.max(1, parseInt(e.target.value) || 1)
//                           )
//                         }
//                         style={{ width: '50px', textAlign: 'center' }}
//                       />
//                       <button
//                         onClick={() =>
//                           handleChangeQuantity(
//                             good.id,
//                             (cart[good.id]?.quantity || 1) + 1
//                           )
//                         }
//                       >
//                         +
//                       </button>
//                       <button
//                         className="add-to-order"
//                         onClick={() => handleAddToCart(good)}
//                       >
//                         Добавить в заказ
//                       </button>
//                     </div>
//                   )}
//                 </p>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//         <button
//           className="view-cart"
//           style={{
//             position: 'fixed',
//             bottom: '20px',
//             right: '20px',
//             padding: '10px 20px',
//             backgroundColor: '#007bff',
//             color: 'white',
//             border: 'none',
//             borderRadius: '5px',
//             cursor: 'pointer',
//           }}
//           onClick={handleViewCart}
//         >
//           Посмотреть заказ
//         </button>
//     </div>
//   );
// };

// export default Goods;

// import '../styles/Goods.css';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import React, { useEffect, useState } from 'react';

// const Goods = () => {
//   const { categoryId, selectedCity } = useParams();
//   const [goods, setGoods] = useState([]);
//   const [error, setError] = useState(null);
//   const [cart, setCart] = useState({});
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);

//   const userId = 1234; // Тестовый user_id

//   // Получение товаров
//   const fetchGoods = async () => {
//     try {
//       const endpoint = selectedCity
//         ? `http://127.0.0.1:8000/catalog/${categoryId}/${selectedCity}`
//         : `http://127.0.0.1:8000/catalog/${categoryId}/`;
//       const response = await axios.get(endpoint);
//       setGoods(response.data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Добавление товара в корзину
//   const handleAddToCart = async (good) => {
//     const quantity = cart[good.id] || 1;
//     const total_price = good.price * quantity;

//     try {
//       await axios.post('http://127.0.0.1:8000/cart/add/', {
//         user_id: userId,
//         good_id: good.id,
//         quantity,
//         arenda_time: 0,
//         is_delivery: false,
//         total_price,
//       });

//       setCart((prevCart) => ({
//         ...prevCart,
//         [good.id]: { quantity, inCart: true },
//       }));
//     } catch (error) {
//       console.error('Ошибка добавления в корзину:', error);
//     }
//   };

//   // Изменение количества
//   const handleChangeQuantity = (id, value) => {
//     setCart((prevCart) => ({
//       ...prevCart,
//       [id]: { quantity: Math.max(1, value), inCart: false },
//     }));
//   };

//   // Переход к корзине
//   const handleViewCart = () => {
//     navigate('/cart', { state: { userId } });
//   };

//   useEffect(() => {
//     fetchGoods();
//   }, [categoryId, selectedCity]);

//   if (loading) return <p>Загрузка...</p>;
//   if (error) return <p>Ошибка: {error}</p>;

//   return (
//     <div>
//       <table className="responsive-table">
//         <tbody>
//           {goods.map((good) => (
//             <tr key={good.id}>
//               <td>
//                 <p>
//                   <img
//                     src={good.photo}
//                     alt={good.name}
//                     style={{ width: '100px', height: 'auto' }}
//                   />
//                 </p>
//                 <p>{good.name}</p>
//                 <p>{good.unit}</p>
//                 <p>Цена: {good.price}</p>
//                 <p>Город: {good.city['name']}</p>
//                 <p>
//                   {cart[good.id]?.inCart ? (
//                     <button
//                       onClick={() =>
//                         setCart((prevCart) => ({
//                           ...prevCart,
//                           [good.id]: { ...prevCart[good.id], inCart: false },
//                         }))
//                       }
//                     >
//                       В корзине {cart[good.id].quantity} шт
//                     </button>
//                   ) : (
//                     <div>
//                       <button
//                         onClick={() =>
//                           handleChangeQuantity(
//                             good.id,
//                             cart[good.id]?.quantity - 1 || 1
//                           )
//                         }
//                       >
//                         -
//                       </button>
//                       <input
//                         type="number"
//                         value={cart[good.id]?.quantity || 1}
//                         onChange={(e) =>
//                           handleChangeQuantity(
//                             good.id,
//                             Math.max(1, parseInt(e.target.value) || 1)
//                           )
//                         }
//                         style={{ width: '50px', textAlign: 'center' }}
//                       />
//                       <button
//                         onClick={() =>
//                           handleChangeQuantity(
//                             good.id,
//                             (cart[good.id]?.quantity || 1) + 1
//                           )
//                         }
//                       >
//                         +
//                       </button>
//                       <button
//                         className="add-to-order"
//                         onClick={() => handleAddToCart(good)}
//                       >
//                         Добавить в заказ
//                       </button>
//                     </div>
//                   )}
//                 </p>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       {Object.keys(cart).length > 0 && (
//         <button
//           className="view-cart"
//           style={{
//             position: 'fixed',
//             bottom: '20px',
//             right: '20px',
//             padding: '10px 20px',
//             backgroundColor: '#007bff',
//             color: 'white',
//             border: 'none',
//             borderRadius: '5px',
//             cursor: 'pointer',
//           }}
//           onClick={handleViewCart}
//         >
//           Посмотреть заказ
//         </button>
//       )}
//     </div>
//   );
// };

// export default Goods;

// import '../styles/Goods.css';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// // import { useTelegramWebApp } from '../context/TelegramContext';


// const Goods = () => {
//   const { categoryId, selectedCity } = useParams(); // Получаем параметры из URL
//   const [goods, setGoods] = useState([]); // Состояние для товаров
//   const [error, setError] = useState(null); // Состояние для ошибок
//   const [cart, setCart] = useState({});
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true); // Состояние для загрузки
//   const userId = 1234; // Тестовый user_id

//   const fetchGoods = async () => {
//     try {
//       const endpoint = selectedCity
//         ? `http://127.0.0.1:8000/catalog/${categoryId}/${selectedCity}`
//         : `http://127.0.0.1:8000/catalog/${categoryId}/`;
//       const response = await axios.get(endpoint);
//       setGoods(response.data); // Сохранение данных
//     } catch (err) {
//       setError(err.message); // Сохранение ошибки
//     } finally {
//       setLoading(false); // Завершение загрузки
//     }
//   };

//   // const handleAddToCart = (id) => {
//   //   setCart((prevCart) => ({ ...prevCart, [id]: 1 })); // Добавляем товар с количеством 1
//   // };

//   // const handleChangeQuantity = (id, value) => {
//   //   setCart((prevCart) => {
//   //     const updatedCart = { ...prevCart };
//   //     if (value <= 0) {
//   //       delete updatedCart[id]; // Удаляем товар, если количество <= 0
//   //     } else {
//   //       updatedCart[id] = value;
//   //     }
//   //     return updatedCart;
//   //   });
//   // };

//   // Добавление товара в корзину
//   const handleAddToCart = async (good) => {
//     const quantity = cart[good.id] || 1;
//     const total_price = good.price * quantity;

//     try {
//       await axios.post('http://127.0.0.1:8000/cart/add/', {
//         user_id: userId,
//         good_id: good.id,
//         quantity,
//         arenda_time: 0,
//         is_delivery: false,
//         total_price,
//       });

//       setCart((prevCart) => ({
//         ...prevCart,
//         [good.id]: { quantity, inCart: true },
//       }));
//     } catch (error) {
//       console.error('Ошибка добавления в корзину:', error);
//     }
//   };

//   // Изменение количества
//   const handleChangeQuantity = (id, value) => {
//     setCart((prevCart) => ({
//       ...prevCart,
//       [id]: { quantity: Math.max(1, value), inCart: false },
//     }));
//   };

//   // const handleViewCart = () => {
//   //   navigate('/cart', { state: { cart } }); // Переходим на страницу корзины
//   // };
//   // Переход к корзине
//   const handleViewCart = () => {
//     navigate('/cart', { state: { userId } });
//   };
  
//   useEffect(() => {
//     fetchGoods();
//   }, [categoryId, selectedCity]);

//   if (loading) return <p>Загрузка...</p>;
//   if (error) return <p>Ошибка: {error}</p>;

//   return (
//     <div>
//       <table className="responsive-table">
//         <tbody>
//           {goods.map((good) => (
//             <tr key={good.id}>
//               <td>
//                 <p>
//                 <img
//                   src={good.photo}
//                   alt={good.name}
//                   style={{ width: '100px', height: 'auto' }}
//                   onClick={() => alert(good.description)} // Вызов функции для просмотра деталей
//                 /></p>
              
//                 <p onClick={() => alert(good.description)}>{good.name}</p>
//                 {/* <p>{good.description}</p> */}
//                 <p>{good.unit}</p>
//                 <p>Цена: {good.price}</p>
//                 <p>Город: {good.city["name"]}</p>
//                 <p>
//                 {/* {cart[good.id] ? (
//                     <div>
//                       <button onClick={() => handleChangeQuantity(good.id, cart[good.id] - 1)}>-</button>
//                       <input
//                         type="number"
//                         value={cart[good.id]}
//                         onChange={(e) => handleChangeQuantity(good.id, Math.max(0, parseInt(e.target.value) || 0))}
//                         style={{ width: "50px", textAlign: "center" }}
//                       />
//                       <button onClick={() => handleChangeQuantity(good.id, cart[good.id] + 1)}>+</button>
//                     </div>
//                   ) : (
//                     <button className="add-to-order" onClick={() => handleAddToCart(good.id)}>
//                       Добавить в заказ
//                     </button>
//                   )} */}
              
//                   {cart[good.id]?.inCart ? (
//                     <button
//                       onClick={() =>
//                         setCart((prevCart) => ({
//                           ...prevCart,
//                           [good.id]: { ...prevCart[good.id], inCart: false },
//                         }))
//                       }
//                     >
//                       В корзине {cart[good.id].quantity} шт
//                     </button>
//                   ) : (
//                     <div>
//                       <button
//                         onClick={() =>
//                           handleChangeQuantity(
//                             good.id,
//                             cart[good.id]?.quantity - 1 || 1
//                           )
//                         }
//                       >
//                         -
//                       </button>
//                       <input
//                         type="number"
//                         value={cart[good.id]?.quantity || 1}
//                         onChange={(e) =>
//                           handleChangeQuantity(
//                             good.id,
//                             Math.max(1, parseInt(e.target.value) || 1)
//                           )
//                         }
//                         style={{ width: '50px', textAlign: 'center' }}
//                       />
//                       <button
//                         onClick={() =>
//                           handleChangeQuantity(
//                             good.id,
//                             (cart[good.id]?.quantity || 1) + 1
//                           )
//                         }
//                       >
//                         +
//                       </button>
//                       <button
//                         className="add-to-order"
//                         onClick={() => handleAddToCart(good)}
//                       >
//                         Добавить в заказ
//                       </button>
//                     </div>
//                   )}
//                 </p>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       {Object.keys(cart).length > 0 && (
//         <button
//           className="view-cart"
//           style={{
//             position: 'fixed',
//             bottom: '20px',
//             right: '20px',
//             padding: '10px 20px',
//             backgroundColor: '#007bff',
//             color: 'white',
//             border: 'none',
//             borderRadius: '5px',
//             cursor: 'pointer',
//           }}
//           onClick={handleViewCart}
//         >
//           Посмотреть заказ
//         </button>
//       )}
//       {/* {Object.keys(cart).length > 0 && ( // Показываем кнопку, если есть товары в корзине
//         <button
//           className="view-cart"
//           style={{
//             position: 'fixed',
//             bottom: '20px',
//             right: '20px',
//             padding: '10px 20px',
//             backgroundColor: '#007bff',
//             color: 'white',
//             border: 'none',
//             borderRadius: '5px',
//             cursor: 'pointer',
//           }}
//           onClick={handleViewCart}
//         >
//           Посмотреть заказ
//         </button>
//       )} */}
//     </div>
//   );
// }

// export default Goods
