import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API_URL from './config';

// const API_URL = process.env.REACT_APP_API_URL

const App = () => {

    const [categories, setDataCategories] = useState([]); // Состояние для хранения данных
    const [cities, setDataCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null); // Состояние для выбранного города
    const [error, setError] = useState(null); // Состояние для хранения ошибок
    const [loading, setLoading] = useState(true); // Состояние для отображения загрузки
    

    // Асинхронная функция для получения данных
    const fetchDataCategories = async () => {
        try {
            const response = await axios.get(`${API_URL}`,
            {headers: {'ngrok-skip-browser-warning': 6024}}); // Ваш эндпоинт
            setDataCategories(response.data); // Сохранение данных в состоянии
        } catch (err) {
            setError(err.message); // Сохранение ошибки
        } finally {
            setLoading(false); // Окончание загрузки
        }
    };

        // Функция для получения городов
    const fetchDataCities = async () => {
        try {
            const response = await axios.get(`${API_URL}cities/`,
            {headers: {'ngrok-skip-browser-warning': 6024}}); // Эндпоинт для городов
            setDataCities(response.data);
        } catch (err) {
            setError(err.message);
        }
    };

    // Вызов fetchData при монтировании компонента
    useEffect(() => {
        fetchDataCategories();
        fetchDataCities();
    }, []); // Пустой массив зависимостей указывает, что эффект выполнится только один раз
        // Обработчик изменения города
    const handleCityChange = (event) => {
        const cityId = event.target.value;
        setSelectedCity(cityId); // Обновляем выбранный город
    };

    const generateLink = (categoryId, cityId) => {
        if (categoryId === 1 && cityId) {
            return `/catalog/${categoryId}/${cityId}`;
        }
        return `/catalog/${categoryId}`;
    };
    // Отображение данных, ошибки или статуса загрузки
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

  return (
    <div>
        <form>
            <label htmlFor="cities">Выберите город:</label>
            <select id="cities" name="cities" onChange={handleCityChange}>
                <option value="">Выберите город</option>
                {cities.map(city => (
                    <option key={city.id} value={city.id}>
                        {city.name}
                    </option>
                ))}
            </select>
            </form>
                {categories.map(category => (
                <div key={category.id}>
                    <h3>{category.name}</h3>
                    <Link to={generateLink(category.id, selectedCity)}>   
                    <img src={category.photo} alt={category.name} style={{ width: '200px', height: 'auto' }} />
                    </Link> 
                </div>
            ))}
    </div>
  )
}

export default App
