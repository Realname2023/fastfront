import React, { useEffect, useState } from "react";
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
      alert("Заказ успешно оформлен! Если остались какие либо вопросы, то напишите оператору");
      setShowOrderForm(false);
    } catch (error) {
      console.error("Ошибка оформления заказа:", error);
    }
    await fetchCart()
    tg.close()
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

