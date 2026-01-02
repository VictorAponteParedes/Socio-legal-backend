const axios = require('axios');
const specializations = require('./specializations.json');

// URL del backend en Render
const API_URL = 'https://socio-legal-backend.onrender.com/api';

async function createSpecializations() {
    console.log('🚀 Creando especialidades en Render...\n');

    for (const spec of specializations) {
        try {
            const response = await axios.post(`${API_URL}/specializations`, spec);
            console.log(`✅ Creada: ${spec.name}`);
        } catch (error) {
            if (error.response?.status === 409) {
                console.log(`⚠️  Ya existe: ${spec.name}`);
            } else {
                console.error(`❌ Error creando ${spec.name}:`, error.response?.data?.message || error.message);
            }
        }
    }

    console.log('\n✨ Proceso completado!');
}

createSpecializations();
