import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import API_URL from '../config';


const Cart = () => {
  const { state } = useLocation();
  const [goodsItems, setGoodsItems] = useState([]); // Товары для покупки
  const [arendaItems, setArendaItems] = useState([]); // Товары для аренды
  const [clientData, setClientData] = useState(null);
  const [comment, setComment] = useState("");
  const [showOrderForm, setShowOrderForm] = useState(false);
  const userId = state?.userId;

  // Функция для получения данных корзины
  const fetchCart = async () => {
    try {
      let endpoint = `${API_URL}cart/get_carts/${userId}/`;

      // Убираем :8000, если браузер добавил его
    endpoint = endpoint.replace(":8000", "");
      const response = await axios.get(endpoint);

      const { goods, arenda_goods } = response.data;
      setGoodsItems(goods || []);
      setArendaItems(arenda_goods || []);
    } catch (error) {
      console.error("Ошибка загрузки корзины:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Обработка изменения количества товара
  const handleQuantityChange = async (item, quantity) => {
    const updatedTotalPrice =
      item.good.price * quantity * (item.arenda_time || 1);

    const payload = {
      user_id: userId,
      good_id: item.good_id,
      quantity,
      arenda_time: item.arenda_time,
      is_arenda: item.is_arenda,
      is_delivery: item.is_delivery,
      is_contract: item.is_contract,
      total_price: updatedTotalPrice,
    };

    try {
      await axios.patch(`${API_URL}cart/update/`, payload);

      setGoodsItems((prevGoods) =>
        prevGoods.map((prevItem) =>
          prevItem.good_id === item.good_id
            ? { ...prevItem, quantity, total_price: updatedTotalPrice }
            : prevItem
        )
      );

      setArendaItems((prevArenda) =>
      prevArenda.map((prevItem) =>
        prevItem.good_id === item.good_id
          ? { ...prevItem, quantity, total_price: updatedTotalPrice }
          : prevItem
      )
    );
    } catch (error) {
      console.error("Ошибка обновления количества:", error);
    }
  };

  // Обработка изменения времени аренды
  const handleArendaTimeChange = async (item, arendaTime) => {
    const updatedTotalPrice = item.good.price * item.quantity * arendaTime;

    const payload = {
      user_id: userId,
      good_id: item.good_id,
      quantity: item.quantity,
      arenda_time: arendaTime,
      is_arenda: item.is_arenda,
      is_delivery: item.is_delivery,
      is_contract: item.is_contract,
      total_price: updatedTotalPrice,
    };

    try {
      await axios.patch(`${API_URL}cart/update/`, payload);

      setArendaItems((prevArenda) =>
        prevArenda.map((prevItem) =>
          prevItem.good_id === item.good_id
            ? { ...prevItem, arenda_time: arendaTime, total_price: updatedTotalPrice }
            : prevItem
        )
      );
    } catch (error) {
      console.error("Ошибка обновления времени аренды:", error);
    }
  };

  // Обработка включения/выключения доставки
  const handleDeliveryToggle = async (item, isDelivery) => {
    
    const updatedTotalPrice = isDelivery
      ? (item.good.price + item.good.delivery_price) * item.quantity
      : item.good.price * item.quantity;

    const payload = {
      user_id: userId,
      good_id: item.good_id,
      quantity: item.quantity,
      arenda_time: item.arenda_time,
      is_arenda: item.is_arenda,
      is_delivery: isDelivery,
      is_contract: item.is_contract,
      total_price: updatedTotalPrice,
    };

    try {
      await axios.patch(`${API_URL}cart/update/`, payload);

      setGoodsItems((prevGoods) =>
        prevGoods.map((prevItem) =>
          prevItem.good_id === item.good_id
            ? { ...prevItem, is_delivery: isDelivery, total_price: updatedTotalPrice }
            : prevItem
        )
      );
    } catch (error) {
      console.error("Ошибка обновления доставки:", error);
    }
  };

  // Обработка включения/выключения договора аренды
  const handleContractToggle = async (item, isContract) => {
    const updatedTotalPrice = isContract
      ? (item.good.price - item.good.arenda_contract)*item.quantity*item.arenda_time
      : item.good.price * item.quantity*item.arenda_time;

    const payload = {
      user_id: userId,
      good_id: item.good_id,
      quantity: item.quantity,
      arenda_time: item.arenda_time,
      is_arenda: item.is_arenda,
      is_delivery: item.is_delivery,
      is_contract: isContract,
      total_price: updatedTotalPrice,
    };

    try {
      await axios.patch(`${API_URL}cart/update/`, payload);

      setArendaItems((prevArenda) =>
        prevArenda.map((prevItem) =>
          prevItem.good_id === item.good_id
            ? { ...prevItem, is_contract: isContract, total_price: updatedTotalPrice }
            : prevItem
        )
      );
    } catch (error) {
      console.error("Ошибка обновления договора:", error);
    }
  };

  // Удаление товара из корзины
  const handleDeleteCart = async (item) => {
    const payload = {
      user_id: userId,
      good_id: item.good_id,
    };

    try {
      await axios.delete(`${API_URL}cart/delete/`, {
        data: payload,
        headers: { "Content-Type": "application/json" },
      });

      setGoodsItems((prevGoods) =>
        prevGoods.filter((prevItem) => prevItem.good_id !== item.good_id)
      );
      setArendaItems((prevArenda) =>
        prevArenda.filter((prevItem) => prevItem.good_id !== item.good_id)
      );
    } catch (error) {
      console.error("Ошибка удаления из корзины:", error);
    }
  };

  // Расчет итоговой суммы
  const grandTotal =
    goodsItems.reduce((acc, item) => acc + item.total_price, 0) +
    arendaItems.reduce((acc, item) => acc + item.total_price, 0);

  // if (!goodsItems.length && !arendaItems.length) return <p>Корзина пуста</p>;

  const handleOrderClick = async () => {
    try {
      const response = await axios.get(`${API_URL}client/get/${userId}/`);
      setClientData(response.data);
      setShowOrderForm(true);
    } catch (error) {
      console.error("Ошибка загрузки данных клиента:", error);
    }
  };

  const handlePlaceOrder = async () => {
    const { org_name, client_city, address, phone } = clientData;
    let orderText = `Заказ от ${org_name || "Не указано"} из ${client_city || "Не указано"}:
`;
    orderText += `Организация: ${org_name || "Не указано"}\nАдрес: ${address || "Не указан"}\nТелефон: ${phone || "Не указан"}\n`;
    orderText += "--------------------------------------------\n";

    goodsItems.forEach((item) => {
      orderText += `${item.good.name} ${item.is_delivery ? "с доставкой" : ""}\n`;
      orderText += `в количестве ${item.quantity} шт.\n`;
      orderText += `по цене ${item.good.price} тенге\n`;
      orderText += `на сумму ${item.total_price} тенге\n`;
      orderText += `Склад: ${item.good.city}\n`;
      orderText += "--------------------------------------------\n";
    });

    arendaItems.forEach((item) => {
      orderText += `Аренда ${item.good.name}\n`;
      orderText += `в количестве ${item.quantity} шт. на ${item.arenda_time} месяцев\n`;
      orderText += `по цене ${item.good.price} тенге\n`;
      orderText += `на сумму ${item.total_price} тенге\n`;
      orderText += `Склад: ${item.good.city}\n`;
      orderText += "--------------------------------------------\n";
    });

    orderText += `Общая сумма Вашего заказа ${goodsItems.concat(arendaItems).reduce((acc, item) => acc + item.total_price, 0)} тенге\n`;
    orderText += `Комментарий: ${comment || "Нет комментария"}`;

    const payloadOrder = { user_id: userId, order_text: orderText };

    const payloadClient = {
      user_id: userId,
      org_name,
      client_city,
      address,
      phone,
      is_contract: false
    }

    try {
      await axios.patch(`${API_URL}client/update/`, payloadClient);

    } catch (error) {
      console.error("Ошибка оформления заказа:", error);
    }

    try {
      await axios.post(`${API_URL}order/add/`, payloadOrder);
      alert("Заказ успешно оформлен!");
      setShowOrderForm(false);
    } catch (error) {
      console.error("Ошибка оформления заказа:", error);
    }
    await fetchCart()
  };

  return (
    <div>
      <h2>Ваша корзина</h2>
      {goodsItems.length === 0 && arendaItems.length === 0 && <p>Корзина пуста</p>}
      {/* Блок для покупок */}
      {goodsItems.length > 0 && (
        <div>
          <h3>Покупки</h3>
          <table>
            <thead>
              <tr>
                <th>Название</th>
                <th>Цена</th>
                <th>Количество</th>
                <th>Включить доставку</th>
                <th>Условия доставки</th>
                <th>Сумма</th>
                <th>Удалить</th>
              </tr>
            </thead>
            <tbody>
              {goodsItems.map((item) => (
                <tr key={item.good.id}>
                  <td>{item.good.name}</td>
                  <td>{item.good.price}</td>
                  <td>
                    <button onClick={() => handleQuantityChange(item, item.quantity - 1)}>-</button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item, Number(e.target.value))}
                    />
                    <button onClick={() => handleQuantityChange(item, item.quantity + 1)}>+</button>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.is_delivery}
                      onChange={(e) => handleDeliveryToggle(item, e.target.checked)}
                    />
                  </td>
                  <td>{item.good.delivery_terms}</td>
                  <td>{item.total_price}</td>
                  <td>
                    <button onClick={() => handleDeleteCart(item)}>Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Блок для аренды */}
      {arendaItems.length > 0 && (
        <div>
          <h3>Аренда</h3>
          <table>
            <thead>
              <tr>
                <th>Название</th>
                <th>Цена за единицу</th>
                <th>Количество</th>
                <th>Время аренды (мес.)</th>
                <th>Заключить договор</th>
                <th>Условия договора</th>
                <th>Сумма</th>
                <th>Удалить</th>
              </tr>
            </thead>
            <tbody>
              {arendaItems.map((item) => (
                <tr key={item.good.id}>
                  <td>{item.good.name}</td>
                  <td>{item.good.price}</td>
                  <td>
                    <button onClick={() => handleQuantityChange(item, item.quantity - 1)}>-</button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item, Number(e.target.value))}
                    />
                    <button onClick={() => handleQuantityChange(item, item.quantity + 1)}>+</button>
                  </td>
                  <td>
                    <button onClick={() => handleArendaTimeChange(item, item.arenda_time - 1)}>-</button>
                    <input
                      type="number"
                      value={item.arenda_time}
                      onChange={(e) =>
                        handleArendaTimeChange(item, Number(e.target.value))
                      }
                    />
                    <button onClick={() => handleArendaTimeChange(item, item.arenda_time + 1)}>+</button>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.is_contract}
                      onChange={(e) => handleContractToggle(item, e.target.checked)}
                    />
                  </td>
                  <td>{item.good.arenda_terms}</td>
                  <td>{item.total_price}</td>
                  <td>
                    <button onClick={() => handleDeleteCart(item)}>Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Итоговая сумма */}
      <div>
        <h3>Итоговая сумма: {grandTotal} тнг</h3>
      </div>
      {goodsItems.length > 0 || arendaItems.length > 0 ? (
        <button onClick={handleOrderClick}>Оформить заказ</button>
      ) : null}
      {showOrderForm && clientData && (
        <div>
          <h3>Заполните данные</h3>
          <input
            type="text"
            placeholder="Название организации"
            value={clientData.org_name || ""}
            onChange={(e) => setClientData({ ...clientData, org_name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Город"
            value={clientData.client_city || ""}
            onChange={(e) => setClientData({ ...clientData, client_city: e.target.value })}
          />
          <input
            type="text"
            placeholder="Адрес"
            value={clientData.address || ""}
            onChange={(e) => setClientData({ ...clientData, address: e.target.value })}
          />
          <input
            type="text"
            placeholder="Телефон"
            value={clientData.phone || ""}
            onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
          />
          <textarea
            placeholder="Комментарий к заказу"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button onClick={handlePlaceOrder}>Заказать</button>
        </div>
      )}
    </div>
  );
};

export default Cart;

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useLocation } from 'react-router-dom';

// const Cart = () => {
//   const { state } = useLocation();
//   const [goodsItems, setGoodsItems] = useState([]); // Товары для покупки
//   const [arendaItems, setArendaItems] = useState([]); // Товары для аренды
//   const [grandTotal, setGrandTotal] = useState(0); // Итоговая сумма
//   const userId = state?.userId;

//   // Функция для получения данных корзины
//   const fetchCart = async () => {
//     try {
//       const response = await axios.get(`http://127.0.0.1:8000/cart/get_carts/${userId}/`);

//       const { goods, arenda_goods } = response.data;
//       setGoodsItems(goods || []);
//       setArendaItems(arenda_goods || []);
//       calculateGrandTotal(goods || [], arenda_goods || []);
//     } catch (error) {
//       console.error('Ошибка загрузки корзины:', error);
//     }
//   };

//   // Рассчитать итоговую сумму
//   const calculateGrandTotal = (goods, arenda) => {
//     const goodsTotal = goods.reduce((acc, item) => acc + item.total_price, 0);
//     const arendaTotal = arenda.reduce((acc, item) => acc + item.total_price, 0);
//     setGrandTotal(goodsTotal + arendaTotal);
//   };

//   // Обновить товар в корзине
//   const updateCartItem = async (item, updates) => {
//     const payload = {
//       user_id: userId,
//       good_id: item.good.id,
//       quantity: updates.quantity || item.quantity,
//       arenda_time: updates.arenda_time || item.arenda_time,
//       is_arenda: item.good.is_arenda,
//       is_delivery: updates.is_delivery ?? item.is_delivery,
//       is_contract: updates.is_contract ?? item.is_contract,
//       total_price: updates.total_price,
//     };

//     try {
//       await axios.patch('http://127.0.0.1:8000/cart/update/', payload);
//       fetchCart();
//     } catch (error) {
//       console.error('Ошибка обновления корзины:', error);
//     }
//   };

//   // Удалить товар из корзины
//   const handleDeleteCart = async (item) => {
//     const payload = {
//       user_id: userId,
//       good_id: item.good.id,
//     };
//     try {
//       await axios.delete('http://127.0.0.1:8000/cart/delete/', {
//         data: payload,
//         headers: { 'Content-Type': 'application/json' },
//       });
//       fetchCart();
//     } catch (error) {
//       console.error('Ошибка удаления товара из корзины:', error);
//     }
//   };

//   useEffect(() => {
//     fetchCart();
//   }, []);

//   if (!goodsItems.length && !arendaItems.length) return <p>Корзина пуста</p>;

//   return (
//     <div>
//       <h2>Ваша корзина</h2>

//       {/* Блок для покупок */}
//       {goodsItems.length > 0 && (
//         <div>
//           <h3>Покупки</h3>
//           <table>
//             <thead>
//               <tr>
//                 <th>Название</th>
//                 <th>Цена</th>
//                 <th>Количество</th>
//                 <th>Включить доставку</th>
//                 <th>Условия доставки</th>
//                 <th>Сумма</th>
//                 <th>Удалить</th>
//               </tr>
//             </thead>
//             <tbody>
//               {goodsItems.map((item) => (
//                 <tr key={item.good_id}>
//                   <td>{item.good.name}</td>
//                   <td>{item.good.price}</td>
//                   <td>
//                     <button onClick={() => {
//                       const quantity = Math.max(item.quantity - 1, 1);
//                       const total_price = item.good.price * quantity;
//                       updateCartItem(item, { quantity, total_price });
//                     }}>-</button>
//                     <input
//                       type="number"
//                       value={item.quantity}
//                       onChange={(e) => {
//                         const quantity = Math.max(parseInt(e.target.value, 10), 1);
//                         const total_price = item.good.price * quantity;
//                         updateCartItem(item, { quantity, total_price });
//                       }}
//                     />
//                     <button onClick={() => {
//                       const quantity = item.quantity + 1;
//                       const total_price = item.good.price * quantity;
//                       updateCartItem(item, { quantity, total_price });
//                     }}>+</button>
//                   </td>
//                   <td>
//                     <input
//                       type="checkbox"
//                       checked={item.is_delivery}
//                       onChange={(e) => {
//                         const is_delivery = e.target.checked;
//                         const total_price = is_delivery
//                           ? item.good.price + item.good.delivery_price
//                           : item.good.price;
//                         updateCartItem(item, { is_delivery, total_price });
//                       }}
//                     />
//                   </td>
//                   <td>{item.good.delivery_terms}</td>
//                   <td>{item.total_price}</td>
//                   <td><button onClick={() => handleDeleteCart(item)}>Удалить</button></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Блок для аренды */}
//       {arendaItems.length > 0 && (
//         <div>
//           <h3>Аренда</h3>
//           <table>
//             <thead>
//               <tr>
//                 <th>Название</th>
//                 <th>Цена за единицу</th>
//                 <th>Количество</th>
//                 <th>Время аренды (мес.)</th>
//                 <th>Заключить договор</th>
//                 <th>Условия договора</th>
//                 <th>Сумма</th>
//                 <th>Удалить</th>
//               </tr>
//             </thead>
//             <tbody>
//               {arendaItems.map((item) => (
//                 <tr key={item.good_id}>
//                   <td>{item.good.name}</td>
//                   <td>{item.good.price}</td>
//                   <td>
//                     <button onClick={() => {
//                       const quantity = Math.max(item.quantity - 1, 1);
//                       const total_price = item.good.price * quantity * item.arenda_time;
//                       updateCartItem(item, { quantity, total_price });
//                     }}>-</button>
//                     <input
//                       type="number"
//                       value={item.quantity}
//                       onChange={(e) => {
//                         const quantity = Math.max(parseInt(e.target.value, 10), 1);
//                         const total_price = item.good.price * quantity * item.arenda_time;
//                         updateCartItem(item, { quantity, total_price });
//                       }}
//                     />
//                     <button onClick={() => {
//                       const quantity = item.quantity + 1;
//                       const total_price = item.good.price * quantity * item.arenda_time;
//                       updateCartItem(item, { quantity, total_price });
//                     }}>+</button>
//                   </td>
//                   <td>
//                     <button onClick={() => {
//                       const arenda_time = Math.max(item.arenda_time - 1, 1);
//                       const total_price = item.good.price * item.quantity * arenda_time;
//                       updateCartItem(item, { arenda_time, total_price });
//                     }}>-</button>
//                     <input
//                       type="number"
//                       value={item.arenda_time}
//                       onChange={(e) => {
//                         const arenda_time = Math.max(parseInt(e.target.value, 10), 1);
//                         const total_price = item.good.price * item.quantity * arenda_time;
//                         updateCartItem(item, { arenda_time, total_price });
//                       }}
//                     />
//                     <button onClick={() => {
//                       const arenda_time = item.arenda_time + 1;
//                       const total_price = item.good.price * item.quantity * arenda_time;
//                       updateCartItem(item, { arenda_time, total_price });
//                     }}>+</button>
//                   </td>
//                   <td>
//                     <input
//                       type="checkbox"
//                       checked={item.is_contract}
//                       onChange={(e) => {
//                         const is_contract = e.target.checked;
//                         const total_price = is_contract
//                           ? item.good.price * item.quantity * item.arenda_time - item.good.arenda_contract
//                           : item.good.price * item.quantity * item.arenda_time;
//                         updateCartItem(item, { is_contract, total_price });
//                       }}
//                     />
//                   </td>
//                   <td>{item.good.arenda_terms}</td>
//                   <td>{item.total_price}</td>
//                   <td><button onClick={() => handleDeleteCart(item)}>Удалить</button></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       <div>
//         <h3>Итоговая сумма: {grandTotal} ₽</h3>
//       </div>
//     </div>
//   );
// };

// export default Cart;

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useLocation } from 'react-router-dom';

// const Cart = () => {
//   const { state } = useLocation();
//   const [goodsItems, setGoodsItems] = useState([]); // Товары для покупки
//   const [arendaItems, setArendaItems] = useState([]); // Товары для аренды
//   const userId = state?.userId;

//   // Функция для получения данных корзины
//   const fetchCart = async () => {
//     try {
//       const response = await axios.get(`http://127.0.0.1:8000/cart/get_carts/${userId}/`);
      
//       // Разделяем товары на покупки и аренду
//       const { goods, arenda_goods } = response.data;
//       setGoodsItems(goods || []);
//       setArendaItems(arenda_goods || []);
//     } catch (error) {
//       console.error('Ошибка загрузки корзины:', error);
//     }
//   };

//   useEffect(() => {
//     fetchCart();
//   }, []);

//   if (!goodsItems.length && !arendaItems.length) return <p>Корзина пуста</p>;

//   return (
//     <div>
//       <h2>Ваша корзина</h2>

//       {/* Блок для покупок */}
//       {goodsItems.length > 0 && (
//         <div>
//           <h3>Покупки</h3>
//           <table>
//             <thead>
//               <tr>
//                 <th>Название</th>
//                 <th>Цена</th>
//                 <th>Количество</th>
//                 <th>Включить доставку</th>
//                 <th>Условия доставки</th>
//                 <th>Сумма</th>
//                 <th>Удалить</th>
//               </tr>
//             </thead>
//             <tbody>
//               {goodsItems.map((item) => (
//                 <tr key={item.good_id}>
//                   <td>{item.good.name}</td>
//                   <td>{item.good.price}</td>
//                   <td>{item.quantity}</td>
//                   <td><input type="checkbox"></input></td>
//                   <td>{item.good.delivery_terms}</td>
//                   <td>{item.total_price}</td>
//                   <td><button>Удалить</button></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Блок для аренды */}
//       {arendaItems.length > 0 && (
//         <div>
//           <h3>Аренда</h3>
//           <table>
//             <thead>
//               <tr>
//                 <th>Название</th>
//                 <th>Цена за единицу</th>
//                 <th>Количество</th>
//                 <th>Время аренды (мес.)</th>
//                 <th>Заключить договор</th>
//                 <th>Условия договора</th>
//                 <th>Сумма</th>
//                 <th>Удалить</th>
//               </tr>
//             </thead>
//             <tbody>
//               {arendaItems.map((item) => (
//                 <tr key={item.good_id}>
//                   <td>{item.good.name}</td>
//                   <td>{item.good.price}</td>
//                   <td>{item.quantity}</td>
//                   <td>{item.arenda_time}</td>
//                   <td><input type="checkbox"></input></td>
//                   <td>{item.good.arenda_terms}</td>
//                   <td>{item.total_price}</td>
//                   <td><button>Удалить</button></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Cart;

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useLocation } from 'react-router-dom';

// const Cart = () => {
//   const { state } = useLocation();
//   const [cartItems, setCartItems] = useState([]);
//   const userId = state?.userId;

//   const fetchCart = async () => {
//     try {
//       const response = await axios.get(`http://127.0.0.1:8000/cart/get/${userId}/`);
//       setCartItems(response.data);
//     } catch (error) {
//       console.error('Ошибка загрузки корзины:', error);
//     }
//   };

//   useEffect(() => {
//     fetchCart();
//   }, []);

//   if (!cartItems.length) return <p>Корзина пуста</p>;

//   return (
//     <div>
//       <h2>Ваша корзина</h2>
//       <table>
//         <thead>
//           <tr>
//             <th>Название</th>
//             <th>Цена</th>
//             <th>Количество</th>
//             {/* <th>Доставка</th> */}
//             <th>Сумма</th>
//           </tr>
//         </thead>
//         <tbody>
//         {cartItems.map((item) => (
//           <tr key={item.good_id}>
//             <td>{item.good["name"]}</td>
//             <td>{item.good["price"]}</td>
//             <td>{item.quantity}</td>
//             <td>{item.total_price}</td>
//           </tr>
//         ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default Cart;
// import React, { useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';


// const Cart = () => {
//   const { state } = useLocation();
//   const [cart, setCart] = useState(state.cart || {});
//   const navigate = useNavigate();

//   const handleChangeQuantity = (id, quantity) => {
//     if (quantity <= 0) {
//       const updatedCart = { ...cart };
//       delete updatedCart[id];
//       setCart(updatedCart);
//     } else {
//       setCart({ ...cart, [id]: quantity });
//     }
//   };

//   const handleRemoveItem = (id) => {
//     const updatedCart = { ...cart };
//     delete updatedCart[id];
//     setCart(updatedCart);
//   };

//   const totalPrice = Object.keys(cart).reduce(
//     (sum, id) => sum + cart[id] * goods.find((good) => good.id === parseInt(id)).price,
//     0
//   );

//   return (
//     <div>
//       <h1>Ваш заказ</h1>
//       <table>
//         <thead>
//           <tr>
//             <th>Название</th>
//             <th>Количество</th>
//             <th>Цена</th>
//             <th>Действия</th>
//           </tr>
//         </thead>
//         <tbody>
//           {Object.keys(cart).map((id) => {
//             const good = goods.find((item) => item.id === parseInt(id));
//             return (
//               <tr key={id}>
//                 <td>{good.name}</td>
//                 <td>
//                   <button onClick={() => handleChangeQuantity(id, cart[id] - 1)}>-</button>
//                   <input
//                     type="number"
//                     value={cart[id]}
//                     onChange={(e) => handleChangeQuantity(id, Math.max(0, parseInt(e.target.value) || 0))}
//                   />
//                   <button onClick={() => handleChangeQuantity(id, cart[id] + 1)}>+</button>
//                 </td>
//                 <td>{good.price * cart[id]}</td>
//                 <td>
//                   <button onClick={() => handleRemoveItem(id)}>Удалить</button>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//       <h3>Итоговая цена: {totalPrice}</h3>
//       <button onClick={() => navigate(-1)}>Назад</button>
//     </div>
//   );
// };

// export default Cart;
