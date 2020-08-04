import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import './styles.css';
import logo from '../../assets/logo.svg';
import { Link, Redirect, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';
import { LeafletMouseEvent } from 'leaflet';
import Swal from 'sweetalert2';
import Dropzone from '../../components/Dropzone';


const CreatePoint = () => {

    // estado = armazena informações dentro do componente
    // sempre que cria um estado para array ou objeto, precisamos informar o tipo da variável
    
    let history = useHistory();

    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedFile, setSelectedFile] = useState<File>();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        celular: '',
        city: '',
        uf: ''
    })

    interface Item {
        id: number;
        title: string;
        image_url: string;
    }

    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => { // assim que o componente aparecer, essa função vai rodar apenas 1 vez
        api.get('/items').then(response => {
            setItems(response.data);
        });
    }, []);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setInitialPosition([latitude, longitude]);
        });
    }, [])

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setFormData({ ...formData, [name] : value})
    }

    function handleSelectedItem(id: number) {
        const alreadySelected = selectedItems.findIndex(item => item === id) // se já tiver dentro do array
        if(alreadySelected >= 0) {
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const { name, email, celular, city, uf } = formData;
        const [ latitude, longitude ] = selectedPosition;
        const items = selectedItems;

        const data = new FormData();

        data.append('name', name);
        data.append('email', email);
        data.append('celular', celular);
        data.append('city', city);
        data.append('uf', uf);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items.join(','));

        if(selectedFile) {
            data.append('image', selectedFile);
        }

        await api.post('/points', data);

        Swal.fire({
            title: 'Sucesso!',
            text: 'O ponto de coleta foi cadastrado com sucesso.',
            icon: 'success',
            confirmButtonColor: "#34CB79",
            confirmButtonText: 'Voltar para a Home'
        }).then(() => {
            history.push('/');
        });
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt=""/>
                <Link to = "/">
                    <FiArrowLeft/>
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>

                <h1>Cadastro do Ponto de Coleta</h1>
                <Dropzone onFileUploaded={setSelectedFile}/>
                <fieldset>

                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                        type="text"
                        name="name"
                        id="name"
                        onChange={handleInputChange}/>
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                            type="email"
                            name="email"
                            id="email"
                            onChange={handleInputChange}/>
                        </div>

                        <div className="field">
                            <label htmlFor="name">Celular</label>
                            <input 
                            type="text"
                            name="celular"
                            id="celular"
                            onChange={handleInputChange}/>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={[-22.3182848, -49.0962944]} zoom={15} onClick={handleMapClick}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                        />
                    <Marker position={selectedPosition}/>
                    </Map>


                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <input type="text" name="uf" id="uf" 
                            placeholder="Digite seu estado"
                            onChange={handleInputChange}/>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade (UF)</label>
                            <input type="text" name="city" id="city" 
                            placeholder="Digite sua cidade"
                            onChange={handleInputChange}/>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id} onClick={() => handleSelectedItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}>
                                <img src={item.image_url} alt=""/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
};

export default CreatePoint;