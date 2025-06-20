import './styles/App.css';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from './config';

export const tg = window.Telegram.WebApp;
tg.expand();

const App = () => {
    const [categories, setDataCategories] = useState([]);
    const [cities, setDataCities] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedCity, setSelectedCity] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDataCategories = async () => {
            try {
                const response = await axios.get(`${API_URL}`);
                setDataCategories(response.data);
            } catch (err) {
                console.error(err.message);
            }
        };

        const fetchDataCities = async () => {
            try {
                const response = await axios.get(`${API_URL}cities/`);
                setDataCities(response.data);
            } catch (err) {
                console.error(err.message);
            }
        };

        fetchDataCategories();
        fetchDataCities();
    }, []);

    const openModal = (categoryId) => {
        if (categoryId === 1) {
            setSelectedCategory(categoryId);
            setIsModalOpen(true);
        } else {
            navigate(`/catalog/${categoryId}`);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
        setSelectedCity('');
    };

    const handleConfirmCity = () => {
        if (selectedCategory && selectedCity) {
            navigate(`/catalog/${selectedCategory}/${selectedCity}`);
            closeModal();
        }
    };

    return (
        <div>
            {categories.map(category => (
                <div className='category' key={category.id}>
                    <img 
                        src={category.photo} 
                        alt={category.name} 
                        onClick={() => openModal(category.id)} 
                    />
                    <div onClick={() => openModal(category.id)}>{category.name}</div>
                    <button className='cat-button' onClick={() => openModal(category.id)}>Заказать</button>
                </div>
            ))}
            {isModalOpen && (
            <div className="modal">
                <div className="modal-content">
                <button className="modal-close" onClick={closeModal}>×</button>

                <p>Выберите город:</p>
                <div className="city-list">
                    {cities
                    .filter(city => city.id !== 5)
                    .map(city => (
                        <label key={city.id}>
                        <input
                            type="radio"
                            name="city"
                            value={city.id}
                            checked={selectedCity === String(city.id)}
                            onChange={(e) => setSelectedCity(e.target.value)}
                        />
                        {city.name}
                        </label>
                    ))}
                </div>

                <button onClick={handleConfirmCity} disabled={!selectedCity}>OK</button>
                </div>
            </div>
            )}
        </div>
    );
};

export default App;
