import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    correo: '',
    foto: null,
  });

  const [registros, setRegistros] = useState([]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Subir foto a S3
    const formDataS3 = new FormData();
    formDataS3.append('file', formData.foto);
    const s3Response = await axios.post('URL_DE_SU_API_DE_SUBIDA_A_S3', formDataS3);

    // Guardar datos en DynamoDB
    const item = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      cedula: formData.cedula,
      correo: formData.correo,
      fotoUrl: s3Response.data.location,
    };

    const response = await axios.post('URL_DE_SU_LAMBDA', {
      tableName: 'NombreDeLaTabla',
      item: item,
    });

    if (response.status === 200) {
      alert('Registro exitoso');
      setFormData({
        nombre: '',
        apellido: '',
        cedula: '',
        correo: '',
        foto: null,
      });
      fetchRegistros();
    } else {
      alert('Error en el registro');
    }
  };

  const fetchRegistros = async () => {
    const response = await axios.get('URL_DE_SU_LAMBDA_PARA_OBTENER_REGISTROS');
    setRegistros(response.data.Items);
  };

  useEffect(() => {
    fetchRegistros();
  }, []);

  return (
    <div>
      <h1>Registro para Evento</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" required />
        <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Apellido" required />
        <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} placeholder="Número de Cédula" required />
        <input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="Correo" required />
        <input type="file" name="foto" onChange={handleChange} required />
        <button type="submit">Registrar</button>
      </form>

      <h2>Lista de Registros</h2>
      <ul>
        {registros.map((registro) => (
          <li key={registro.cedula}>
            {registro.nombre} {registro.apellido} - {registro.correo} - <a href={registro.fotoUrl} target="_blank" rel="noopener noreferrer">Foto</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
