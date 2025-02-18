import Config from './models/configModel.js';
import db from './db.js';

const updateWhatsapp = async (phone) => {
    try {
        let existingConfig = await Config.findOne({ name: 'default' });

        if (!existingConfig) {
            const newConfig = new Config({
                name: 'default',
                whatsapp: phone,
            });
            await newConfig.save();
            console.log('Config creado exitosamente:', newConfig);
            return newConfig;
        } else {
            existingConfig.whatsapp = phone;
            await existingConfig.save();
            console.log('Config actualizado exitosamente:', existingConfig);
            return existingConfig;
        }
    } catch (error) {
        console.error('Error al crear o actualizar config:', error.message);
        throw new Error('No se pudo crear o actualizar la configuración');
    }
};

const getDefaultConfig = async () => {
    try {
        const config = await Config.findOne({ name: 'default' });
        if (!config) {
            console.log('No se encontró la configuración por defecto.');
            return null;
        }
        console.log('Configuración por defecto obtenida:', config);
        return config;
    } catch (error) {
        console.error('Error al obtener la configuración por defecto:', error.message);
        throw new Error('No se pudo obtener la configuración');
    }
};


export { updateWhatsapp, getDefaultConfig };