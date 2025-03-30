import '../styles/Goods.css';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import API_URL from '../config';
import { tg } from '../App'; // Импортируем Telegram WebApp

const Goods = () => {
  const { categoryId, selectedCity } = useParams();
  const [goods, setGoods] = useState([]);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null); // Храним userId в state

  useEffect(() => {
    if (tg.initDataUnsafe?.user?.id) {
      setUserId(tg.initDataUnsafe.user.id);
    } else {
      console.error('Ошибка: Не удалось получить userId из Telegram');
    }
  }, []);

  useEffect(() => {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      navigate('/');
    });

    return () => {
      tg.BackButton.hide();
    };
  }, [navigate]);
  

  // Получение списка товаров
  const fetchGoods = async () => {
    try {
      const endpoint = selectedCity
        ? `${API_URL}catalog/${categoryId}/${selectedCity}`
        : `${API_URL}catalog/${categoryId}/`;
      const response = await axios.get(endpoint);
      setGoods(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCart = async () => {
    try {
      let endpoint = `${API_URL}cart/get/${userId}/`;

      const response = await axios.get(endpoint);
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
      await axios.post(`${API_URL}cart/add/`, payload);

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
        headers: { 'Content-Type': 'application/json' },
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

  useEffect(() => {
    fetchGoods();
    if (userId) {
      fetchUserCart();
    }
  }, [categoryId, selectedCity, userId]);

  useEffect(() => {
    if (userId) {
      tg.MainButton.setText('🛒 Посмотреть заказ');
      tg.MainButton.show();
      tg.MainButton.onClick(() => {
        navigate('/cart', { state: { userId } });
      });

      return () => {
        tg.MainButton.hide();
      };
    }
  }, [navigate, userId]);

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
                <button onClick={() => alert(good.description)}>Описание</button>
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
    </div>
  );
};

export default Goods;
