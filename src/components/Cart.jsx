import '../styles/Cart.css';
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import API_URL from '../config';
import { tg } from '../App';

const Cart = () => {
  const { state } = useLocation();
  const [goodsItems, setGoodsItems] = useState([]); // Товары для покупки
  const [arendaItems, setArendaItems] = useState([]); // Товары для аренды
  const [clientData, setClientData] = useState(null);
  const [comment, setComment] = useState("");
  const [showOrderForm, setShowOrderForm] = useState(false);
  const navigate = useNavigate();
  const userId = state?.userId;
  const orderFormRef = useRef(null);

  tg.expand();

  useEffect(() => {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      navigate('/');
    });

    return () => {
      tg.BackButton.hide();
    };
  }, [navigate]);

  // Функция для получения данных корзины
  const fetchCart = async () => {
    try {
      let endpoint = `${API_URL}cart/get_carts/${userId}/`;

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
    (item.good.price + (item.is_delivery ? item.good.delivery_price : 0)- (item.is_contract ? item.good.arenda_contract : 0)) *
    quantity *(item.arenda_time || 1);
      // item.good.price * quantity * (item.arenda_time || 1);

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
    const updatedTotalPrice = 
    (item.good.price - (item.is_contract ? item.good.arenda_contract : 0)) *item.quantity *arendaTime;
    // item.good.price * item.quantity * arendaTime;

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
      setTimeout(() => {
        orderFormRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
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
      alert("Заказ успешно оформлен! Если остались какие либо вопросы, то напишите оператору");
      setShowOrderForm(false);
    } catch (error) {
      console.error("Ошибка оформления заказа:", error);
    }
    await fetchCart()
    tg.close()
  };

  useEffect(() => {
    if (goodsItems.length === 0 && arendaItems.length === 0) {
      setShowOrderForm(false);
    }
  }, [goodsItems, arendaItems]);  

  return (
    <div>
      <h2>Ваша корзина</h2>
      {goodsItems.length === 0 && arendaItems.length === 0 && <p>Корзина пуста</p>}
      {/* Блок для покупок */}
      {goodsItems.length > 0 && (
        <div>
          {/* <h3>Товары</h3> */}
          {goodsItems.map((item) => (
          <table className='cart' key={item.good.id}>
            <thead>
              <tr>
                <th colSpan={3} className='itemname'>
                  <div className="itemname-wrapper">
                    {item.good.name}
                    <button className="closebtn" onClick={() => handleDeleteCart(item)}>×</button>
                  </div>
		            </th>
	            </tr>
	            <tr>
                <th>Цена</th>
                <th>Количество</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{item.good.price}</td>
                <td>
                  <button onClick={() => handleQuantityChange(item, item.quantity - 1)}>-</button>
                <input className='changenum'
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item, Number(e.target.value))}
                />
                <button onClick={() => handleQuantityChange(item, item.quantity + 1)}>+</button>
                </td>
                <td>{item.total_price}</td>
              </tr >
              <tr >
                <td colSpan={3}>Включить доставку 
                  <input
                    type="checkbox"
                    checked={item.is_delivery}
                    onChange={(e) => handleDeliveryToggle(item, e.target.checked)}
                  />
                  <button className='therm' onClick={() => alert(item.good.delivery_terms)}>Условия доставки</button>
                </td>
              </tr >
            </tbody>
          </table>))}
        </div>
      )}

      {/* Блок для аренды */}
      {arendaItems.length > 0 && (
        <div>
          {/* <h3>Аренда</h3> */}
          {arendaItems.map((item) => (
          <table className='cart' key={item.good.id}>
            <thead>
              <tr>
                <th colSpan={4} className='itemname'>
                <div className="itemname-wrapper">
                  {item.good.name}
                  <button className="closebtn" onClick={() => handleDeleteCart(item)}>×</button>
                </div>
                </th>
              </tr>
              <tr>
                <th>Цена</th>
                <th>Количество</th>
                <th>Аренда (мес.)</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{item.good.price}</td>
                <td> 
                  <button onClick={() => handleQuantityChange(item, item.quantity - 1)}>-</button>
                  <input className='changenum'
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item, Number(e.target.value))}
                  />
                  <button onClick={() => handleQuantityChange(item, item.quantity + 1)}>+</button>
                </td>
                <td> 
                  <button onClick={() => handleArendaTimeChange(item, item.arenda_time - 1)}>-</button>
                  <input className='changenum'
                    type="number"
                    value={item.arenda_time}
                    onChange={(e) =>
                      handleArendaTimeChange(item, Number(e.target.value))
                    }
                  />
                  <button onClick={() => handleArendaTimeChange(item, item.arenda_time + 1)}>+</button>
                </td>
                <td>{item.total_price}</td>
              </tr>
              <tr>
                <td colSpan={4}>Заключить договор: 
                  <input
                    type="checkbox"
                    checked={item.is_contract}
                    onChange={(e) => handleContractToggle(item, e.target.checked)}
                  />
                  <button className='therm' onClick={() => alert(item.good.arenda_terms)}>Условия договора</button>
                </td>
              </tr>
            </tbody>
          </table>))}
        </div>
      )}

      {/* Итоговая сумма */}
      <div>
        <h3>Итоговая сумма: {grandTotal} тнг</h3>
      </div>
      <div className='to-order'>
        {goodsItems.length > 0 || arendaItems.length > 0 ? (
          <button className='form-order' onClick={handleOrderClick}>Оформить заказ</button>
        ) : null}
        {showOrderForm && clientData && (
          <div ref={orderFormRef} className="order-form">
          <h3>Заполните данные</h3>
          <table>
            <tbody>
              <tr>
                <td>Название организации:</td>
                <td>
                  <input
                    type="text"
                    value={clientData.org_name || ""}
                    onChange={(e) =>
                      setClientData({ ...clientData, org_name: e.target.value })
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>Город:</td>
                <td>
                  <input
                    type="text"
                    value={clientData.client_city || ""}
                    onChange={(e) =>
                      setClientData({ ...clientData, client_city: e.target.value })
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>Адрес:</td>
                <td>
                  <input
                    type="text"
                    value={clientData.address || ""}
                    onChange={(e) =>
                      setClientData({ ...clientData, address: e.target.value })
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>Телефон:</td>
                <td>
                  <input
                    type="text"
                    value={clientData.phone || ""}
                    onChange={(e) =>
                      setClientData({ ...clientData, phone: e.target.value })
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>Комментарий:</td>
                <td>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td colSpan={2} id='ordering'>
                  <button className='form-order' onClick={handlePlaceOrder}>Заказать</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        )}
        {/* <button className='form-order' onClick={handlePlaceOrder}>Заказать</button> */}
      </div>
    </div>
  );
};

export default Cart;
