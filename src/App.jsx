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
// {/* </table> */}
//             {/* Модальное окно выбора города */}
//             {/* {isModalOpen && (
//                 <div className='modal'>
//                     <div>
//                         <p>Выберите город:</p>
//                         {cities
//                             .filter(city => city.id !== 5) // Исключаем город с id = 5
//                             .map(city => (
//                                 <label key={city.id}>
//                                     <input 
//                                         type="radio" 
//                                         name="city" 
//                                         value={city.id} 
//                                         checked={selectedCity === String(city.id)} 
//                                         onChange={(e) => setSelectedCity(e.target.value)}
//                                     />
//                                     {city.name}
//                                 </label>
//                             ))
//                         }
                        
//                         <button onClick={handleConfirmCity} disabled={!selectedCity}>OK</button>
//                         <button onClick={closeModal}>Закрыть</button>
                        
//                     </div>
//                 </div>
//             )} */}
// {/* </div> */}
// {/* <h2>Выберите город</h2>
//                         <select 
//                             value={selectedCity} 
//                             onChange={(e) => setSelectedCity(e.target.value)}
//                         >
//                             <option value="" disabled>Выберите город</option>
//                             {cities.filter(city => city.id !== 5).map(city => (
//                                 <option key={city.id} value={city.id}>{city.name}</option>
//                             ))}
//                         </select> */}
//                         {/* <div> */}

// Стили для модального окна
// const modalStyles = {
//     overlay: {
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         width: '100vw',
//         height: '100vh',
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     modal: {
//         backgroundColor: '#008000',
//         padding: '20px',
//         borderRadius: '10px',
//         textAlign: 'center',
//         width: '300px',
//     }
// };


// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import API_URL from './config';

// // const API_URL = process.env.REACT_APP_API_URL
// export const tg = window.Telegram.WebApp;
// tg.expand();

// const App = () => {

//     const [categories, setDataCategories] = useState([]); // Состояние для хранения данных
//     const [cities, setDataCities] = useState([]);
//     const [selectedCity, setSelectedCity] = useState(null); // Состояние для выбранного города
//     const [error, setError] = useState(null); // Состояние для хранения ошибок
//     const [loading, setLoading] = useState(true); // Состояние для отображения загрузки

//     // Асинхронная функция для получения данных
//     const fetchDataCategories = async () => {
//         try {
//             const response = await axios.get(`${API_URL}`); // Ваш эндпоинт
//             setDataCategories(response.data); // Сохранение данных в состоянии
//         } catch (err) {
//             setError(err.message); // Сохранение ошибки
//         } finally {
//             setLoading(false); // Окончание загрузки
//         }
//     };

//         // Функция для получения городов
//     const fetchDataCities = async () => {
//         try {
//             const response = await axios.get(`${API_URL}cities/`); // Эндпоинт для городов
//             setDataCities(response.data);
//         } catch (err) {
//             setError(err.message);
//         }
//     };

//     // Вызов fetchData при монтировании компонента
//     useEffect(() => {
//         fetchDataCategories();
//         fetchDataCities();
//     }, []); // Пустой массив зависимостей указывает, что эффект выполнится только один раз
//         // Обработчик изменения города
//     const handleCityChange = (event) => {
//         const cityId = event.target.value;
//         setSelectedCity(cityId); // Обновляем выбранный город
//     };

//     const generateLink = (categoryId, cityId) => {
//         if (categoryId === 1 && cityId) {
//             return `/catalog/${categoryId}/${cityId}`;
//         }
//         return `/catalog/${categoryId}`;
//     };
//     // Отображение данных, ошибки или статуса загрузки
//     if (loading) return <p>Loading...</p>;
//     if (error) return <p>Error: {error}</p>;

//   return (
//     <div>
//         <form>
//             <label htmlFor="cities">Выберите город:</label>
//             <select id="cities" name="cities" onChange={handleCityChange}>
//                 <option value="">Выберите город</option>
//                 {cities.map(city => (
//                     <option key={city.id} value={city.id}>
//                         {city.name}
//                     </option>
//                 ))}
//             </select>
//             </form>
//                 {categories.map(category => (
//                 <div key={category.id}>
//                     <h3>{category.name}</h3>
//                     <Link to={generateLink(category.id, selectedCity)}>   
//                     <img src={category.photo} alt={category.name} style={{ width: '200px', height: 'auto' }} />
//                     </Link> 
//                 </div>
//             ))}
//     </div>
//   )
// }

// export default App;
